import os
import shutil
import zipfile
from pathlib import Path
from typing import List
from fastapi import UploadFile

from app.core.config import settings


def get_session_dir(session_id: str) -> Path:
    """Get the directory path for a session."""
    return Path(settings.temp_dir) / session_id


def create_session_dir(session_id: str) -> Path:
    """Create a directory for the session."""
    session_dir = get_session_dir(session_id)
    session_dir.mkdir(parents=True, exist_ok=True)
    return session_dir


async def save_uploaded_files(session_id: str, files: List[UploadFile]) -> List[str]:
    """Save uploaded files to session directory."""
    session_dir = create_session_dir(session_id)
    saved_files = []
    
    for file in files:
        file_path = session_dir / file.filename
        
        # Save file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        saved_files.append(file.filename)
    
    return saved_files


def create_zip(session_id: str, output_name: str = "beatwise-processed.zip") -> Path:
    """Create a ZIP file from session directory."""
    session_dir = get_session_dir(session_id)
    zip_path = session_dir / output_name
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in session_dir.iterdir():
            if file_path.is_file() and file_path.suffix != '.zip':
                zipf.write(file_path, file_path.name)
    
    return zip_path


def cleanup_session(session_id: str):
    """Delete all files for a session."""
    session_dir = get_session_dir(session_id)
    if session_dir.exists():
        shutil.rmtree(session_dir)


def validate_file_extension(filename: str) -> bool:
    """Check if file has an allowed extension."""
    ext = Path(filename).suffix.lower()
    return ext in settings.allowed_extensions
