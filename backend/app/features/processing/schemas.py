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


class QualityAnalysis(BaseModel):
    rms_db: float
    lufs: float
    true_peak_db: float
    clipped_samples: int
    clipping_percentage: float
    has_clipping: bool


class FileQualityReport(BaseModel):
    file_name: str
    quality: QualityAnalysis
    warnings: List[str] = []
    recommendations: List[str] = []


class QualitySummary(BaseModel):
    avg_rms: float
    avg_lufs: float
    files_with_clipping: int
    files_too_quiet: int
    files_too_loud: int


class QualityReport(BaseModel):
    session_id: str
    total_files: int
    files_analyzed: int
    summary: QualitySummary
    files: List[FileQualityReport]


class SpectrumData(BaseModel):
    file_name: str
    frequencies_hz: List[float]
    magnitudes_db: List[float]
