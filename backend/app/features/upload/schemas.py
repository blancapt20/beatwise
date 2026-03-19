from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class UploadResponse(BaseModel):
    """Response for file upload."""
    session_id: str
    files_count: int
    status: str
    message: str


class StatusResponse(BaseModel):
    """Response for status check."""
    session_id: str
    status: str
    files_count: int
    created_at: datetime
    error: Optional[str] = None
