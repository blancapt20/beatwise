from pathlib import Path
from typing import List

from app.shared.audio.formats import detect_format, is_format_supported
from app.shared.audio.properties import extract_properties
from app.features.processing.schemas import AudioProperties, ValidationResult

FAKE_BITRATE_THRESHOLD = 0.20


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

    if _is_fake_bitrate(raw_props.bitrate_declared, raw_props.bitrate_real):
        issues.append("fake_bitrate")

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
    results: List[ValidationResult] = []
    if not session_dir.exists():
        return results

    for file_path in sorted(session_dir.iterdir()):
        if file_path.is_file() and file_path.suffix.lower() in (".mp3", ".wav", ".flac"):
            results.append(validate_file(file_path))

    return results


def _is_fake_bitrate(declared: int, real: int) -> bool:
    """Detect >20% discrepancy between declared and real bitrate.
    Only meaningful for lossy formats where declared bitrate is reported.
    """
    if declared <= 0 or real <= 0:
        return False
    diff = abs(declared - real) / declared
    return diff > FAKE_BITRATE_THRESHOLD
