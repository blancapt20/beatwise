from pathlib import Path
from typing import Optional

import mutagen
from mutagen.mp3 import MP3
from mutagen.flac import FLAC
from mutagen.wave import WAVE

SUPPORTED_FORMATS = {".mp3": "mp3", ".wav": "wav", ".flac": "flac"}


def detect_format(file_path: Path) -> Optional[str]:
    """Detect audio format by trying to parse with mutagen.
    Returns format string ('mp3', 'wav', 'flac') or None if unrecognized.
    """
    ext = file_path.suffix.lower()
    if ext not in SUPPORTED_FORMATS:
        return None

    try:
        audio = mutagen.File(str(file_path))
        if audio is None:
            return None

        if isinstance(audio, MP3):
            return "mp3"
        if isinstance(audio, FLAC):
            return "flac"
        if isinstance(audio, WAVE):
            return "wav"

        return SUPPORTED_FORMATS.get(ext)
    except Exception:
        return None


def is_format_supported(file_path: Path) -> bool:
    return file_path.suffix.lower() in SUPPORTED_FORMATS
