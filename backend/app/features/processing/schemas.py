from typing import List, Optional

from pydantic import BaseModel


class AudioProperties(BaseModel):
    duration: float
    sample_rate: int
    channels: int
    bitrate_declared: int
    bitrate_real: int
    format: str


class ValidationResult(BaseModel):
    file_name: str
    is_valid: bool
    properties: Optional[AudioProperties] = None
    issues: List[str] = []
