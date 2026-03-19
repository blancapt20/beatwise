import os
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

import mutagen
import soundfile as sf


@dataclass
class RawAudioProperties:
    duration: float
    sample_rate: int
    channels: int
    bitrate_declared: int
    bitrate_real: int
    format: str


def extract_properties(file_path: Path, audio_format: str) -> Optional[RawAudioProperties]:
    """Extract audio properties from a file. Returns None if the file can't be read."""
    try:
        duration = _get_duration(file_path, audio_format)
        sample_rate, channels = _get_sample_info(file_path, audio_format)
        bitrate_declared = _get_declared_bitrate(file_path)
        bitrate_real = _estimate_real_bitrate(file_path, duration)

        if duration <= 0 or sample_rate <= 0 or channels <= 0:
            return None

        return RawAudioProperties(
            duration=round(duration, 2),
            sample_rate=sample_rate,
            channels=channels,
            bitrate_declared=bitrate_declared,
            bitrate_real=bitrate_real,
            format=audio_format,
        )
    except Exception:
        return None


def _get_duration(file_path: Path, audio_format: str) -> float:
    """Get duration in seconds, trying mutagen first, then soundfile."""
    try:
        audio = mutagen.File(str(file_path))
        if audio and audio.info and audio.info.length:
            return float(audio.info.length)
    except Exception:
        pass

    if audio_format in ("wav", "flac"):
        try:
            info = sf.info(str(file_path))
            return float(info.duration)
        except Exception:
            pass

    return 0.0


def _get_sample_info(file_path: Path, audio_format: str) -> tuple[int, int]:
    """Return (sample_rate, channels)."""
    try:
        audio = mutagen.File(str(file_path))
        if audio and audio.info:
            sr = getattr(audio.info, "sample_rate", 0)
            ch = getattr(audio.info, "channels", 0)
            if sr and ch:
                return int(sr), int(ch)
    except Exception:
        pass

    if audio_format in ("wav", "flac"):
        try:
            info = sf.info(str(file_path))
            return info.samplerate, info.channels
        except Exception:
            pass

    return 0, 0


def _get_declared_bitrate(file_path: Path) -> int:
    """Read the bitrate reported by file metadata, in kbps."""
    try:
        audio = mutagen.File(str(file_path))
        if audio and audio.info:
            bitrate = getattr(audio.info, "bitrate", 0)
            if bitrate:
                return int(bitrate) // 1000
    except Exception:
        pass
    return 0


def _estimate_real_bitrate(file_path: Path, duration: float) -> int:
    """Estimate real bitrate from file size / duration, in kbps."""
    if duration <= 0:
        return 0
    try:
        file_size_bytes = os.path.getsize(file_path)
        return int((file_size_bytes * 8) / duration / 1000)
    except Exception:
        return 0
