import uuid
from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel


class SessionStatus(BaseModel):
    """Session status information."""
    session_id: str
    status: str  # uploaded, processing, ready, error
    files_count: int
    created_at: datetime
    error: Optional[str] = None


def generate_session_id() -> str:
    """Generate a unique session ID."""
    return str(uuid.uuid4())


# In-memory session store (will be replaced with DB in Phase 1)
_sessions: Dict[str, SessionStatus] = {}


def create_session(session_id: str, files_count: int, status: str = "uploaded") -> SessionStatus:
    """Create a new session."""
    session = SessionStatus(
        session_id=session_id,
        status=status,
        files_count=files_count,
        created_at=datetime.now()
    )
    _sessions[session_id] = session
    return session


def get_session(session_id: str) -> Optional[SessionStatus]:
    """Get session by ID."""
    return _sessions.get(session_id)


def update_session_status(session_id: str, status: str, error: Optional[str] = None):
    """Update session status."""
    if session_id in _sessions:
        _sessions[session_id].status = status
        if error:
            _sessions[session_id].error = error


def delete_session(session_id: str):
    """Delete session from memory."""
    if session_id in _sessions:
        del _sessions[session_id]
