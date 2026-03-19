from typing import List
from fastapi import UploadFile, HTTPException

from app.shared.utils.session import generate_session_id, create_session
from app.shared.utils.file_manager import save_uploaded_files, validate_file_extension
from app.core.config import settings


class UploadService:
    """Service for handling file uploads."""
    
    async def process_upload(self, files: List[UploadFile]) -> dict:
        """Process uploaded files."""
        
        # Validate file count
        if len(files) > settings.max_files_per_session:
            raise HTTPException(
                status_code=400,
                detail=f"Too many files. Maximum is {settings.max_files_per_session}"
            )
        
        # Validate file extensions
        for file in files:
            if not validate_file_extension(file.filename):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type: {file.filename}. Allowed: {', '.join(settings.allowed_extensions)}"
                )
        
        # Generate session ID
        session_id = generate_session_id()
        
        # Save files
        saved_files = await save_uploaded_files(session_id, files)
        
        # Create session record with "ready" status (Sprint 1: no processing yet)
        session = create_session(session_id, len(saved_files), status="ready")
        
        return {
            "session_id": session_id,
            "files_count": len(saved_files),
            "status": session.status,
            "message": f"Successfully uploaded {len(saved_files)} file(s)"
        }


# Service instance
upload_service = UploadService()
