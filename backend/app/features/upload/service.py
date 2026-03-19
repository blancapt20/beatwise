import logging
from typing import List
from fastapi import UploadFile, HTTPException

from app.shared.utils.session import (
    generate_session_id, create_session, update_session_status, set_validation_results
)
from app.shared.utils.file_manager import save_uploaded_files, validate_file_extension, get_session_dir
from app.features.processing.validation import validate_session_files
from app.core.config import settings

logger = logging.getLogger(__name__)


class UploadService:
    """Service for handling file uploads and validation."""

    async def process_upload(self, files: List[UploadFile]) -> dict:
        """Upload files, then run audio validation."""

        if len(files) > settings.max_files_per_session:
            raise HTTPException(
                status_code=400,
                detail=f"Too many files. Maximum is {settings.max_files_per_session}"
            )

        for file in files:
            if not validate_file_extension(file.filename):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type: {file.filename}. Allowed: {', '.join(settings.allowed_extensions)}"
                )

        session_id = generate_session_id()
        saved_files = await save_uploaded_files(session_id, files)
        create_session(session_id, len(saved_files), status="validating")

        try:
            session_dir = get_session_dir(session_id)
            results = validate_session_files(session_dir)
            set_validation_results(session_id, [r.model_dump() for r in results])
            update_session_status(session_id, "validated")
        except Exception as e:
            logger.exception("Validation failed for session %s", session_id)
            update_session_status(session_id, "error", error=str(e))

        return {
            "session_id": session_id,
            "files_count": len(saved_files),
            "status": "validated",
            "message": f"Successfully uploaded and validated {len(saved_files)} file(s)"
        }


upload_service = UploadService()
