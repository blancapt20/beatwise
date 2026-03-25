from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from app.features.processing.schemas import QualityReport, ValidationResult


class UploadResponse(BaseModel):
    """Response for file upload."""
    session_id: str
    files_count: int
    status: str
    message: str


class RemoveFileResponse(BaseModel):
    """Response for removing an uploaded file from session."""
    session_id: str
    file_name: str
    files_count: int
    session_deleted: bool = False
    message: str


class StatusResponse(BaseModel):
    """Response for status check."""
    session_id: str
    status: str
    files_count: int
    created_at: datetime
    error: Optional[str] = None
    validation_results: Optional[List[ValidationResult]] = None
    quality_report: Optional[QualityReport] = None
