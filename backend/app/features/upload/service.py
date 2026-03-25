import logging
from copy import deepcopy
from typing import List
from fastapi import UploadFile, HTTPException

from app.shared.utils.session import (
    create_session,
    get_session,
    set_quality_report,
    set_validation_results,
    update_session_status,
    generate_session_id,
)
from app.shared.utils.file_manager import save_uploaded_files, validate_file_extension, get_session_dir
from app.features.processing.quality import generate_quality_report
from app.features.processing.issue_taxonomy import build_display_issue_payload
from app.features.processing.validation import validate_session_files
from app.core.config import settings

logger = logging.getLogger(__name__)


class UploadService:
    """Service for handling file uploads and validation."""

    async def upload_only(self, files: List[UploadFile]) -> dict:
        """Upload files and create a session without processing."""

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
        create_session(session_id, len(saved_files), status="uploaded")

        return {
            "session_id": session_id,
            "files_count": len(saved_files),
            "status": "uploaded",
            "message": f"Successfully uploaded {len(saved_files)} file(s). Ready to process.",
        }

    async def process_session(self, session_id: str) -> None:
        """Process an existing uploaded session (validation + quality analysis)."""
        session = get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # If already mid-pipeline beyond validation kickoff, avoid duplicate processing.
        if session.status in ("analyzing", "processing"):
            raise HTTPException(status_code=409, detail="Session is already processing")

        if session.status in ("analyzed", "validated", "ready"):
            return

        # Accept either "uploaded" (normal start) or "validating" (primed by router).
        if session.status in ("uploaded", "error"):
            update_session_status(session_id, "validating", error=None)
        try:
            session_dir = get_session_dir(session_id)
            results = validate_session_files(session_dir)
            serialized_results = [r.model_dump() for r in results]
            set_validation_results(session_id, serialized_results)

            update_session_status(session_id, "analyzing")
            quality_report = generate_quality_report(session_id, session_dir)
            serialized_report = quality_report.model_dump()
            set_quality_report(session_id, serialized_report)

            merged_results = self._merge_quality_warnings(serialized_results, serialized_report)
            set_validation_results(session_id, merged_results)
            update_session_status(session_id, "analyzed")
        except Exception as e:
            logger.exception("Validation/analysis failed for session %s", session_id)
            update_session_status(session_id, "error", error=str(e))
            raise

    @staticmethod
    def _merge_quality_warnings(validation_results: List[dict], quality_report: dict) -> List[dict]:
        """Merge quality warnings and attach backend issue display metadata."""
        merged = deepcopy(validation_results)
        quality_by_file = {
            item["file_name"]: item.get("warnings", [])
            for item in quality_report.get("files", [])
        }
        for item in merged:
            current = set(item.get("issues", []))
            warnings = quality_by_file.get(item.get("file_name"), [])
            combined_issues = sorted(current.union(warnings))
            item["issues"] = combined_issues
            display_payload = build_display_issue_payload(
                issues=combined_issues,
                properties=item.get("properties"),
                max_visible=4,
            )
            item.update(display_payload)
        return merged


upload_service = UploadService()
