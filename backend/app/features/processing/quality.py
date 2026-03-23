from pathlib import Path
from typing import List, Tuple

import librosa
import numpy as np

from app.features.processing.schemas import (
    FileQualityReport,
    QualityAnalysis,
    QualityReport,
    QualitySummary,
)

SUPPORTED_EXTENSIONS = {".mp3", ".wav", ".flac"}
SILENCE_FLOOR_DB = -80.0
CLIPPING_NO_THRESHOLD = 0.01
CLIPPING_MINOR_THRESHOLD = 0.1
CLIPPING_MODERATE_THRESHOLD = 0.5
TRUE_PEAK_SAFE = -1.0
TRUE_PEAK_BORDERLINE = -0.3
TRUE_PEAK_CLIP = 0.0


def calculate_rms(audio: np.ndarray) -> float:
    """Return RMS level in dBFS for a normalized waveform."""
    if audio.size == 0:
        return SILENCE_FLOOR_DB
    rms = float(np.sqrt(np.mean(np.square(audio))))
    if rms <= 1e-12:
        return SILENCE_FLOOR_DB
    return float(round(20 * np.log10(rms), 2))


def calculate_lufs(audio: np.ndarray, sr: int) -> float:
    """Estimate LUFS from RMS frames as a practical Phase-0 proxy."""
    if audio.size == 0 or sr <= 0:
        return SILENCE_FLOOR_DB
    frame_rms = librosa.feature.rms(y=audio, frame_length=2048, hop_length=512)[0]
    if frame_rms.size == 0:
        return SILENCE_FLOOR_DB
    loudness = np.maximum(frame_rms, 1e-12)
    lufs = 20 * np.log10(np.mean(loudness))
    return float(round(float(lufs), 2))


def detect_clipping(audio: np.ndarray, threshold: float = 0.999) -> Tuple[int, float]:
    """Return number of clipped samples and percentage."""
    if audio.size == 0:
        return 0, 0.0
    clipped_samples = int(np.sum(np.abs(audio) >= threshold))
    clipping_percentage = (clipped_samples / audio.size) * 100
    return clipped_samples, round(float(clipping_percentage), 4)


def calculate_true_peak(audio: np.ndarray) -> float:
    """Return true peak in dBFS."""
    if audio.size == 0:
        return SILENCE_FLOOR_DB
    peak = float(np.max(np.abs(audio)))
    if peak <= 1e-12:
        return SILENCE_FLOOR_DB
    return float(round(20 * np.log10(peak), 2))


def analyze_file_quality(file_path: Path) -> FileQualityReport:
    """Analyze quality metrics and emit warnings/recommendations."""
    audio, sr = librosa.load(str(file_path), sr=None, mono=True)

    rms_db = calculate_rms(audio)
    lufs = calculate_lufs(audio, sr)
    true_peak_db = calculate_true_peak(audio)
    clipped_samples, clipping_percentage = detect_clipping(audio)

    warnings: List[str] = []
    recommendations: List[str] = []

    if lufs < -18:
        warnings.append("too_quiet")
        recommendations.append("normalize")
    elif lufs > -8:
        warnings.append("too_loud")
        recommendations.append("reduce_gain")

    clipping_issue = _classify_clipping_percentage(clipping_percentage)
    true_peak_issue = _classify_true_peak(true_peak_db)

    if clipping_issue:
        warnings.append(clipping_issue)
    if true_peak_issue:
        warnings.append(true_peak_issue)

    if clipping_issue == "major_clipping":
        recommendations.append("check_source")
    elif clipping_issue == "moderate_clipping":
        recommendations.append("use_limiter")
    elif clipping_issue == "minor_clipping":
        recommendations.append("monitor_transients")

    if true_peak_issue == "tp_overs":
        recommendations.append("reduce_gain")
    elif true_peak_issue == "very_hot_signal":
        recommendations.append("increase_headroom")
    elif true_peak_issue == "low_headroom":
        recommendations.append("watch_master_limiter")

    quality = QualityAnalysis(
        rms_db=rms_db,
        lufs=lufs,
        true_peak_db=true_peak_db,
        clipped_samples=clipped_samples,
        clipping_percentage=clipping_percentage,
        has_clipping=clipping_percentage > CLIPPING_NO_THRESHOLD or true_peak_db > TRUE_PEAK_CLIP,
    )
    return FileQualityReport(
        file_name=file_path.name,
        quality=quality,
        warnings=warnings,
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
    for file_path in files:
        try:
            analyzed_files.append(analyze_file_quality(file_path))
        except Exception:
            continue

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


def _classify_clipping_percentage(clipping_percentage: float) -> str | None:
    """Classify sample clipping severity by percentage of clipped samples."""
    if clipping_percentage <= CLIPPING_NO_THRESHOLD:
        return None
    if clipping_percentage <= CLIPPING_MINOR_THRESHOLD:
        return "minor_clipping"
    if clipping_percentage <= CLIPPING_MODERATE_THRESHOLD:
        return "moderate_clipping"
    return "major_clipping"


def _classify_true_peak(true_peak_db: float) -> str | None:
    """Classify true-peak headroom and clipping risk."""
    if true_peak_db <= TRUE_PEAK_SAFE:
        return None
    if true_peak_db <= TRUE_PEAK_BORDERLINE:
        return "low_headroom"
    if true_peak_db <= TRUE_PEAK_CLIP:
        return "very_hot_signal"
    return "tp_overs"
