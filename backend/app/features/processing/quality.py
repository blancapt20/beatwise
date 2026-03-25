from pathlib import Path
from typing import List, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

import librosa
import numpy as np
try:
    import pyloudnorm as pyln
except Exception:  # pragma: no cover - optional dependency fallback
    pyln = None

from app.features.processing.schemas import (
    FileQualityReport,
    QualityAnalysis,
    QualityReport,
    QualitySummary,
)
from app.shared.audio.formats import detect_format
from app.shared.audio.properties import extract_properties
from app.core.config import settings

SUPPORTED_EXTENSIONS = {".mp3", ".wav", ".flac"}
SILENCE_FLOOR_DB = -80.0
CLIPPING_MINOR_THRESHOLD = 0.6
CLIPPING_MODERATE_THRESHOLD = 1.5
CLIPPING_SAMPLE_THRESHOLD = 0.995
CONSECUTIVE_CLIPPING_MAJOR_THRESHOLD = 80
DJ_TOO_QUIET_LUFS = -12.0
DJ_TOO_LOUD_LUFS = -5.0
TRUE_PEAK_CLUB_SAFE = -0.5
TRUE_PEAK_BORDERLINE = -0.3
TRUE_PEAK_CLIP = 0.0
TRUE_PEAK_SOFT_OVERS = 2.5
MP3_LOW_BITRATE_THRESHOLD = 192
UPSCALE_DECLARED_BITRATE_THRESHOLD = 300
UPSCALE_CUTOFF_HZ_THRESHOLD = 15000.0
UPSCALE_REAL_BITRATE_THRESHOLD = 256
LOW_BAND_MIN_HZ = 20.0
LOW_BAND_MAX_HZ = 120.0
FULL_BAND_MIN_HZ = 20.0
FULL_BAND_MAX_HZ = 8000.0
LOW_FREQUENCY_CONTENT_RATIO_THRESHOLD = 0.12
OVERCOMPRESSED_CREST_FACTOR_DB = 5.0
OVERCOMPRESSED_LUFS_THRESHOLD = -6.0
DURATION_MISMATCH_WARNING_THRESHOLD = 0.25
DECODED_TO_METADATA_MIN_RATIO = 0.70
SILENCE_TAIL_DBFS_THRESHOLD = -48.0
SILENCE_TAIL_MIN_RATIO = 0.25


def calculate_rms(audio: np.ndarray) -> float:
    """Return RMS level in dBFS for a normalized waveform."""
    if audio.size == 0:
        return SILENCE_FLOOR_DB
    rms = float(np.sqrt(np.mean(np.square(audio))))
    if rms <= 1e-12:
        return SILENCE_FLOOR_DB
    return float(round(20 * np.log10(rms), 2))


def calculate_lufs(audio: np.ndarray, sr: int) -> float:
    """Calculate integrated loudness (LUFS) using ITU-R BS.1770."""
    if audio.size == 0 or sr <= 0:
        return SILENCE_FLOOR_DB
    if pyln is None:
        return _calculate_lufs_proxy(audio)
    meter = pyln.Meter(sr)
    try:
        lufs = float(meter.integrated_loudness(audio.astype(np.float64)))
        if not np.isfinite(lufs):
            return _calculate_lufs_proxy(audio)
        return float(round(lufs, 2))
    except Exception:
        # Fallback keeps analysis running for short or unusual files.
        return _calculate_lufs_proxy(audio)


def detect_clipping(audio: np.ndarray, threshold: float = CLIPPING_SAMPLE_THRESHOLD) -> Tuple[int, float, int]:
    """Return clipped sample count, percentage, and max consecutive clipped run."""
    if audio.size == 0:
        return 0, 0.0, 0
    clipped_mask = np.abs(audio) >= threshold
    clipped_samples = int(np.sum(clipped_mask))
    clipping_percentage = (clipped_samples / audio.size) * 100
    max_consecutive_clipped_samples = _max_true_run_length(clipped_mask)
    return clipped_samples, round(float(clipping_percentage), 4), max_consecutive_clipped_samples


def calculate_true_peak(audio: np.ndarray, sr: int, oversample_factor: int = 4) -> float:
    """Estimate true peak in dBFS using oversampling."""
    if audio.size == 0 or sr <= 0:
        return SILENCE_FLOOR_DB
    target_sr = sr * max(1, oversample_factor)
    try:
        oversampled = librosa.resample(
            audio.astype(np.float32),
            orig_sr=sr,
            target_sr=target_sr,
            res_type="soxr_hq",
        )
        peak = float(np.max(np.abs(oversampled)))
    except Exception:
        peak = float(np.max(np.abs(audio)))
    if peak <= 1e-12:
        return SILENCE_FLOOR_DB
    return float(round(20 * np.log10(peak), 2))


def analyze_file_quality(file_path: Path) -> FileQualityReport:
    """Analyze quality metrics and emit warnings/recommendations."""
    audio, sr = librosa.load(str(file_path), sr=None, mono=True)
    audio_format = detect_format(file_path) or file_path.suffix.lower().lstrip(".")
    raw_props = extract_properties(file_path, audio_format) if audio_format in {"mp3", "wav", "flac"} else None

    rms_db = calculate_rms(audio)
    lufs = calculate_lufs(audio, sr)
    true_peak_db = calculate_true_peak(audio, sr)
    clipped_samples, clipping_percentage, max_consecutive_clipped_samples = detect_clipping(audio)
    spectral_cutoff_hz = 0.0
    real_bitrate = 0
    decoded_duration = _decoded_duration_seconds(audio, sr)
    metadata_duration = raw_props.duration if raw_props else 0.0

    warnings: List[str] = []
    recommendations: List[str] = []

    if lufs < DJ_TOO_QUIET_LUFS:
        warnings.append("too_quiet")
        recommendations.append("normalize")
    elif lufs > DJ_TOO_LOUD_LUFS:
        warnings.append("too_loud")
        recommendations.append("reduce_gain")

    clipping_issue = _classify_clipping_percentage(clipping_percentage, max_consecutive_clipped_samples)
    true_peak_issue = _classify_true_peak(true_peak_db)

    if clipping_issue:
        warnings.append(clipping_issue)
    if true_peak_issue and true_peak_issue != "tp_soft_overs":
        warnings.append(true_peak_issue)

    if clipping_issue == "major_clipping":
        recommendations.append("check_source")
    elif clipping_issue == "moderate_clipping":
        recommendations.append("use_limiter")
    elif clipping_issue == "minor_clipping":
        recommendations.append("monitor_transients")
    elif clipping_issue == "long_clipping_runs":
        recommendations.append("check_source")

    if true_peak_issue == "tp_hard_overs":
        recommendations.append("reduce_gain")
        recommendations.append("check_source")
    elif true_peak_issue == "tp_soft_overs":
        recommendations.append("increase_headroom")
    elif true_peak_issue == "very_hot_signal":
        recommendations.append("increase_headroom")
    elif true_peak_issue == "low_headroom":
        recommendations.append("watch_master_limiter")

    if raw_props and raw_props.format == "mp3":
        real_bitrate = raw_props.bitrate_real if raw_props.bitrate_real > 0 else raw_props.bitrate_declared
        if real_bitrate > 0 and real_bitrate <= MP3_LOW_BITRATE_THRESHOLD:
            warnings.append("low_bitrate")
            recommendations.append("replace_source")

        if (
            raw_props.bitrate_declared >= UPSCALE_DECLARED_BITRATE_THRESHOLD
            and real_bitrate > 0
            and real_bitrate <= UPSCALE_REAL_BITRATE_THRESHOLD
        ):
            spectral_cutoff_hz = _estimate_spectral_cutoff_hz(audio, sr)
            if 0.0 < spectral_cutoff_hz < UPSCALE_CUTOFF_HZ_THRESHOLD:
                warnings.append("possible_upscale")
                recommendations.append("verify_source_quality")

    has_metadata_mismatch = _has_duration_mismatch(metadata_duration, decoded_duration)
    if has_metadata_mismatch:
        warnings.append("metadata_inconsistency")
        recommendations.append("verify_source_quality")

    has_truncated_content = (
        _is_decoded_content_incomplete(metadata_duration, decoded_duration)
        or _has_large_silence_tail(audio, sr)
        or (has_metadata_mismatch and real_bitrate > 0 and real_bitrate < 96)
    )
    if has_truncated_content:
        warnings.append("truncated_content")
        recommendations.append("replace_source")

    if _has_low_frequency_content_issue(audio, sr):
        warnings.append("low_frequency_content")
        recommendations.append("check_eq_or_source")

    if _is_overcompressed_master(
        lufs=lufs,
        true_peak_db=true_peak_db,
        rms_db=rms_db,
        clipping_percentage=clipping_percentage,
        max_consecutive_clipped_samples=max_consecutive_clipped_samples,
    ):
        warnings.append("overcompressed_master")
        recommendations.append("use_less_limiting")

    quality = QualityAnalysis(
        rms_db=rms_db,
        lufs=lufs,
        true_peak_db=true_peak_db,
        clipped_samples=clipped_samples,
        clipping_percentage=clipping_percentage,
        has_clipping=(
            clipping_percentage > 0.2
            or true_peak_db > TRUE_PEAK_SOFT_OVERS
            or max_consecutive_clipped_samples >= CONSECUTIVE_CLIPPING_MAJOR_THRESHOLD
        ),
    )
    return FileQualityReport(
        file_name=file_path.name,
        quality=quality,
        warnings=sorted(set(warnings)),
        recommendations=sorted(set(recommendations)),
    )


def generate_quality_report(session_id: str, session_dir: Path) -> QualityReport:
    """Generate full report for all supported files in a session directory."""
    files = [
        path
        for path in sorted(session_dir.iterdir())
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    analyzed_files: List[FileQualityReport] = []
    if files:
        workers = max(1, min(settings.processing_workers, len(files)))
        if workers == 1:
            for file_path in files:
                try:
                    analyzed_files.append(analyze_file_quality(file_path))
                except Exception:
                    continue
        else:
            with ThreadPoolExecutor(max_workers=workers) as executor:
                futures = {executor.submit(analyze_file_quality, file_path): file_path for file_path in files}
                for future in as_completed(futures):
                    try:
                        analyzed_files.append(future.result())
                    except Exception:
                        continue
        analyzed_files.sort(key=lambda item: item.file_name)

    summary = _build_summary(analyzed_files)
    return QualityReport(
        session_id=session_id,
        total_files=len(files),
        files_analyzed=len(analyzed_files),
        summary=summary,
        files=analyzed_files,
    )


def _build_summary(files: List[FileQualityReport]) -> QualitySummary:
    if not files:
        return QualitySummary(
            avg_rms=SILENCE_FLOOR_DB,
            avg_lufs=SILENCE_FLOOR_DB,
            files_with_clipping=0,
            files_too_quiet=0,
            files_too_loud=0,
        )

    avg_rms = round(sum(f.quality.rms_db for f in files) / len(files), 2)
    avg_lufs = round(sum(f.quality.lufs for f in files) / len(files), 2)
    files_with_clipping = sum(1 for f in files if f.quality.has_clipping)
    files_too_quiet = sum(1 for f in files if "too_quiet" in f.warnings)
    files_too_loud = sum(1 for f in files if "too_loud" in f.warnings)
    return QualitySummary(
        avg_rms=avg_rms,
        avg_lufs=avg_lufs,
        files_with_clipping=files_with_clipping,
        files_too_quiet=files_too_quiet,
        files_too_loud=files_too_loud,
    )


def generate_spectrum(file_path: Path, target_points: int = 256) -> Tuple[List[float], List[float]]:
    """Generate averaged spectrum bins for chart rendering."""
    audio, sr = librosa.load(str(file_path), sr=None, mono=True)
    if audio.size == 0:
        return [], []

    n_fft = 2048
    stft = librosa.stft(audio, n_fft=n_fft, hop_length=512)
    magnitude = np.abs(stft)
    magnitude_db = librosa.amplitude_to_db(magnitude, ref=np.max)
    averaged_db = np.mean(magnitude_db, axis=1)

    frequencies = librosa.fft_frequencies(sr=sr, n_fft=n_fft)
    if target_points > 0 and len(frequencies) > target_points:
        indices = np.linspace(0, len(frequencies) - 1, target_points, dtype=int)
        frequencies = frequencies[indices]
        averaged_db = averaged_db[indices]

    return (
        [round(float(f), 2) for f in frequencies.tolist()],
        [round(float(m), 2) for m in averaged_db.tolist()],
    )


def _classify_clipping_percentage(clipping_percentage: float, max_consecutive_clipped_samples: int) -> str | None:
    """Classify clipping severity by clipped percentage and consecutive runs."""
    if (
        clipping_percentage <= 0.2
        and max_consecutive_clipped_samples < CONSECUTIVE_CLIPPING_MAJOR_THRESHOLD
    ):
        return None
    if max_consecutive_clipped_samples >= CONSECUTIVE_CLIPPING_MAJOR_THRESHOLD:
        return "long_clipping_runs"
    if clipping_percentage <= CLIPPING_MINOR_THRESHOLD:
        return "minor_clipping"
    if clipping_percentage <= CLIPPING_MODERATE_THRESHOLD:
        return "moderate_clipping"
    return "major_clipping"


def _classify_true_peak(true_peak_db: float) -> str | None:
    """Classify true-peak headroom and clipping risk."""
    if true_peak_db <= TRUE_PEAK_CLUB_SAFE:
        return None
    if true_peak_db <= TRUE_PEAK_BORDERLINE:
        return "low_headroom"
    if true_peak_db <= TRUE_PEAK_CLIP:
        return "very_hot_signal"
    if true_peak_db <= TRUE_PEAK_SOFT_OVERS:
        return "tp_soft_overs"
    return "tp_hard_overs"


def _calculate_lufs_proxy(audio: np.ndarray) -> float:
    """Fallback loudness estimate for edge cases where LUFS integration fails."""
    frame_rms = librosa.feature.rms(y=audio, frame_length=2048, hop_length=512)[0]
    if frame_rms.size == 0:
        return SILENCE_FLOOR_DB
    loudness = np.maximum(frame_rms, 1e-12)
    lufs = 20 * np.log10(np.mean(loudness))
    return float(round(float(lufs), 2))


def _max_true_run_length(mask: np.ndarray) -> int:
    """Return maximum consecutive True run length in a boolean array."""
    if mask.size == 0 or not np.any(mask):
        return 0
    padded = np.concatenate(([False], mask, [False]))
    changes = np.diff(padded.astype(np.int8))
    starts = np.where(changes == 1)[0]
    ends = np.where(changes == -1)[0]
    return int(np.max(ends - starts))


def _estimate_spectral_cutoff_hz(audio: np.ndarray, sr: int) -> float:
    """Estimate upper usable frequency band for lossy-upscale detection."""
    if audio.size == 0 or sr <= 0:
        return 0.0
    stft = librosa.stft(audio, n_fft=4096, hop_length=1024)
    avg_magnitude = np.mean(np.abs(stft), axis=1)
    if avg_magnitude.size == 0 or np.max(avg_magnitude) <= 0:
        return 0.0

    avg_db = librosa.amplitude_to_db(avg_magnitude, ref=np.max)
    freqs = librosa.fft_frequencies(sr=sr, n_fft=4096)
    active = np.where(avg_db > -45.0)[0]
    if active.size == 0:
        return 0.0
    return float(freqs[int(active[-1])])


def _has_low_frequency_content_issue(audio: np.ndarray, sr: int) -> bool:
    """Flag tracks with unusually weak low-end energy."""
    if audio.size == 0 or sr <= 0:
        return False
    stft = librosa.stft(audio, n_fft=4096, hop_length=1024)
    power = np.square(np.abs(stft))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=4096)

    low_mask = (freqs >= LOW_BAND_MIN_HZ) & (freqs <= LOW_BAND_MAX_HZ)
    full_mask = (freqs >= FULL_BAND_MIN_HZ) & (freqs <= FULL_BAND_MAX_HZ)
    if not np.any(low_mask) or not np.any(full_mask):
        return False

    low_energy = float(np.mean(power[low_mask, :]))
    full_energy = float(np.mean(power[full_mask, :]))
    if full_energy <= 1e-12:
        return False
    low_ratio = low_energy / full_energy
    return low_ratio < LOW_FREQUENCY_CONTENT_RATIO_THRESHOLD


def _is_overcompressed_master(
    lufs: float,
    true_peak_db: float,
    rms_db: float,
    clipping_percentage: float,
    max_consecutive_clipped_samples: int,
) -> bool:
    """Detect likely over-compression from loudness and crest behavior."""
    crest_factor_db = true_peak_db - rms_db
    if lufs >= OVERCOMPRESSED_LUFS_THRESHOLD and crest_factor_db < OVERCOMPRESSED_CREST_FACTOR_DB:
        return True
    if clipping_percentage > CLIPPING_MODERATE_THRESHOLD and crest_factor_db < OVERCOMPRESSED_CREST_FACTOR_DB + 1.0:
        return True
    return max_consecutive_clipped_samples >= CONSECUTIVE_CLIPPING_MAJOR_THRESHOLD


def _decoded_duration_seconds(audio: np.ndarray, sr: int) -> float:
    if audio.size == 0 or sr <= 0:
        return 0.0
    return float(audio.shape[0] / sr)


def _has_duration_mismatch(metadata_duration: float, decoded_duration: float) -> bool:
    """Warn when metadata duration diverges significantly from decoded audio length."""
    if metadata_duration <= 0 or decoded_duration <= 0:
        return False
    reference = max(metadata_duration, decoded_duration)
    if reference <= 1e-6:
        return False
    mismatch_ratio = abs(metadata_duration - decoded_duration) / reference
    return mismatch_ratio >= DURATION_MISMATCH_WARNING_THRESHOLD


def _is_decoded_content_incomplete(metadata_duration: float, decoded_duration: float) -> bool:
    """Flag files where decoded timeline is clearly shorter than metadata timeline."""
    if metadata_duration <= 0 or decoded_duration <= 0:
        return False
    return (decoded_duration / metadata_duration) < DECODED_TO_METADATA_MIN_RATIO


def _has_large_silence_tail(audio: np.ndarray, sr: int) -> bool:
    """Detect unusually long near-silent tail after audible content."""
    if audio.size == 0 or sr <= 0:
        return False
    frame_rms = librosa.feature.rms(y=audio, frame_length=2048, hop_length=512)[0]
    if frame_rms.size == 0:
        return False
    frame_db = 20 * np.log10(np.maximum(frame_rms, 1e-12))
    non_silent_indices = np.where(frame_db > SILENCE_TAIL_DBFS_THRESHOLD)[0]
    if non_silent_indices.size == 0:
        return False
    last_non_silent = int(non_silent_indices[-1])
    tail_frames = frame_db.size - (last_non_silent + 1)
    if tail_frames <= 0:
        return False
    tail_ratio = tail_frames / frame_db.size
    return tail_ratio >= SILENCE_TAIL_MIN_RATIO
