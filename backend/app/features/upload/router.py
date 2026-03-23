from pathlib import Path
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from app.features.upload.schemas import UploadResponse, StatusResponse
from app.features.processing.schemas import SpectrumData
from app.features.processing.quality import generate_spectrum
from app.features.upload.service import upload_service
from app.shared.utils.session import get_session, delete_session
from app.shared.utils.file_manager import create_zip, cleanup_session, get_session_dir


router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_files(files: List[UploadFile] = File(...)):
    """
    Upload audio files for processing.
    
    - **files**: Multiple audio files (MP3, WAV, FLAC)
    - Returns session_id for tracking
    """
    result = await upload_service.process_upload(files)
    return UploadResponse(**result)


@router.get("/status/{session_id}", response_model=StatusResponse)
async def get_status(session_id: str):
    """
    Get processing status for a session.
    
    - **session_id**: Session ID from upload
    - Returns current status and file count
    """
    session = get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return StatusResponse(
        session_id=session.session_id,
        status=session.status,
        files_count=session.files_count,
        created_at=session.created_at,
        error=session.error,
        validation_results=session.validation_results,
        quality_report=session.quality_report,
    )


@router.get("/download/{session_id}")
async def download_files(session_id: str):
    """
    Download processed files as ZIP.
    
    - **session_id**: Session ID from upload
    - Returns ZIP file with processed audio
    """
    session = get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status not in ("ready", "validated", "analyzed"):
        raise HTTPException(status_code=400, detail=f"Session status is {session.status}, cannot download yet")
    
    # Create ZIP
    try:
        zip_path = create_zip(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating ZIP: {str(e)}")
    
    # Return ZIP file
    return FileResponse(
        path=zip_path,
        filename=f"beatwise-{session_id}.zip",
        media_type="application/zip"
    )


@router.get("/spectrum/{session_id}/{file_name:path}", response_model=SpectrumData)
async def get_spectrum(session_id: str, file_name: str):
    """
    Get frequency spectrum data for a file in session.

    - **session_id**: Session ID from upload
    - **file_name**: Audio filename from validation results
    """
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session_dir = get_session_dir(session_id).resolve()
    requested_path = (session_dir / file_name).resolve()

    # Prevent path traversal by forcing requested file inside session directory.
    if not str(requested_path).startswith(str(session_dir)):
        raise HTTPException(status_code=400, detail="Invalid file path")

    if not requested_path.exists() or not requested_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    if requested_path.suffix.lower() not in (".mp3", ".wav", ".flac"):
        raise HTTPException(status_code=400, detail="Unsupported file format")

    try:
        frequencies_hz, magnitudes_db = generate_spectrum(requested_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate spectrum: {exc}") from exc

    return SpectrumData(
        file_name=Path(file_name).name,
        frequencies_hz=frequencies_hz,
        magnitudes_db=magnitudes_db,
    )


@router.delete("/session/{session_id}")
async def delete_session_endpoint(session_id: str):
    """
    Delete a session and cleanup files (admin endpoint).
    
    - **session_id**: Session ID to delete
    """
    session = get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Cleanup files
    cleanup_session(session_id)
    
    # Delete from memory
    delete_session(session_id)
    
    return {"message": f"Session {session_id} deleted successfully"}
