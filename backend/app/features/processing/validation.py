from pathlib import Path
from typing import List
from concurrent.futures import ThreadPoolExecutor, as_completed

from app.shared.audio.formats import detect_format, is_format_supported
from app.shared.audio.properties import extract_properties
from app.features.processing.schemas import AudioProperties, ValidationResult
from app.core.config import settings

FAKE_BITRATE_THRESHOLD = 0.20
FAKE_BITRATE_SEVERE_THRESHOLD = 0.50
MP3_EXTREME_LOW_BITRATE_THRESHOLD = 96
MP3_LOW_BITRATE_THRESHOLD = 192


def validate_file(file_path: Path) -> ValidationResult:
    """Run all validation checks on a single audio file."""
    file_name = file_path.name
    issues: List[str] = []

    if not file_path.exists():
        return ValidationResult(file_name=file_name, is_valid=False, issues=["file_not_found"])

    if not is_format_supported(file_path):
        return ValidationResult(file_name=file_name, is_valid=False, issues=["unsupported_format"])

    audio_format = detect_format(file_path)
    if audio_format is None:
        return ValidationResult(file_name=file_name, is_valid=False, issues=["corrupted"])

    raw_props = extract_properties(file_path, audio_format)
    if raw_props is None:
        return ValidationResult(file_name=file_name, is_valid=False, issues=["corrupted"])

    fake_issue = _classify_fake_bitrate_issue(
        audio_format=raw_props.format,
        declared=raw_props.bitrate_declared,
        real=raw_props.bitrate_real,
    )
    if fake_issue:
        issues.append(fake_issue)
    elif _is_fake_bitrate(raw_props.bitrate_declared, raw_props.bitrate_real):
        issues.append("fake_bitrate")
    if _is_low_bitrate(raw_props.format, raw_props.bitrate_real, raw_props.bitrate_declared):
        issues.append("low_bitrate")

    properties = AudioProperties(
        duration=raw_props.duration,
        sample_rate=raw_props.sample_rate,
        channels=raw_props.channels,
        bitrate_declared=raw_props.bitrate_declared,
        bitrate_real=raw_props.bitrate_real,
        format=raw_props.format,
    )

    return ValidationResult(
        file_name=file_name,
        is_valid=True,
        properties=properties,
        issues=issues,
    )


def validate_session_files(session_dir: Path) -> List[ValidationResult]:
    """Validate all audio files in a session directory."""
    if not session_dir.exists():
        return []

    files = [
        file_path
        for file_path in sorted(session_dir.iterdir())
        if file_path.is_file() and file_path.suffix.lower() in (".mp3", ".wav", ".flac")
    ]
    if not files:
        return []

    workers = max(1, min(settings.processing_workers, len(files)))
    if workers == 1:
        return [validate_file(file_path) for file_path in files]

    results: List[ValidationResult] = []
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(validate_file, file_path): file_path for file_path in files}
        for future in as_completed(futures):
            results.append(future.result())
    results.sort(key=lambda item: item.file_name)
    return results


def _is_fake_bitrate(declared: int, real: int) -> bool:
    """Detect >20% discrepancy between declared and real bitrate.
    Only meaningful for lossy formats where declared bitrate is reported.
    """
    if declared <= 0 or real <= 0:
        return False
    diff = abs(declared - real) / declared
    return diff > FAKE_BITRATE_THRESHOLD


def _classify_fake_bitrate_issue(audio_format: str, declared: int, real: int) -> str | None:
    """Return severe fake-bitrate issue for extreme discrepancies."""
    if audio_format != "mp3":
        return None
    if declared <= 0 or real <= 0:
        return None
    discrepancy = abs(declared - real) / declared
    if discrepancy >= FAKE_BITRATE_SEVERE_THRESHOLD:
        return "fake_bitrate_severe"
    if real < MP3_EXTREME_LOW_BITRATE_THRESHOLD:
        return "fake_bitrate_severe"
    return None


def _is_low_bitrate(audio_format: str, bitrate_real: int, bitrate_declared: int) -> bool:
    """Flag low-quality MP3 files for DJ library hygiene."""
    if audio_format != "mp3":
        return False
    bitrate = bitrate_real if bitrate_real > 0 else bitrate_declared
    return 0 < bitrate <= MP3_LOW_BITRATE_THRESHOLD
