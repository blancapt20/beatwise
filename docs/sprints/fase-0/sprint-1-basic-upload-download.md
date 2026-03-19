# Sprint 1: Basic Upload & Download

**Goal**: Create the foundation for file upload, session management, and file download.

**Duration**: ~3-5 days

---

## Objectives

1. ✅ Setup FastAPI project structure
2. ✅ Implement file upload endpoint (`POST /api/upload`)
3. ✅ Basic temp file management (create, cleanup)
4. ✅ Implement status endpoint (`GET /api/status/{session_id}`)
5. ✅ Implement download endpoint (`GET /api/download/{session_id}`)

---

## Architecture

```
backend/
├── app/
│   ├── main.py                           # FastAPI app initialization
│   ├── core/
│   │   └── config.py                     # Configuration settings
│   ├── features/
│   │   └── upload/
│   │       ├── router.py                 # API endpoints
│   │       ├── service.py                # Business logic
│   │       └── schemas.py                # Pydantic models
│   └── shared/
│       └── utils/
│           ├── file_manager.py           # Temp file operations
│           └── session.py                # Session ID generation
└── requirements.txt
```

---

## API Endpoints

### 1. POST /api/upload
**Request**:
```
Content-Type: multipart/form-data
Body: files (multiple audio files)
```

**Response**:
```json
{
  "session_id": "uuid-string",
  "files_count": 3,
  "status": "uploaded"
}
```

### 2. GET /api/status/{session_id}
**Response**:
```json
{
  "session_id": "uuid-string",
  "status": "uploaded" | "processing" | "ready" | "error",
  "files_count": 3,
  "created_at": "2026-03-18T16:52:00Z"
}
```

### 3. GET /api/download/{session_id}
**Response**:
```
Content-Type: application/zip
Body: binary ZIP file
```

---

## Implementation Steps

### Step 1: Project Setup
- [ ] Create `requirements.txt` with FastAPI, uvicorn, python-multipart
- [ ] Create `main.py` with basic FastAPI app
- [ ] Create `core/config.py` with settings (temp directory, max file size)
- [ ] Add CORS middleware for frontend development

### Step 2: Session Management
- [ ] Create `shared/utils/session.py`
- [ ] Implement `generate_session_id()` → UUID
- [ ] Create session status model (uploaded, processing, ready, error)

### Step 3: File Management
- [ ] Create `shared/utils/file_manager.py`
- [ ] Implement `create_session_dir(session_id)` → creates `/tmp/beatwise-{session_id}/`
- [ ] Implement `save_uploaded_files(session_id, files)` → saves files to temp
- [ ] Implement `cleanup_session(session_id)` → deletes temp directory
- [ ] Implement `create_zip(session_id)` → creates ZIP from session files

### Step 4: Upload Endpoint
- [ ] Create `features/upload/schemas.py` with request/response models
- [ ] Create `features/upload/service.py` with upload logic
- [ ] Create `features/upload/router.py` with POST endpoint
- [ ] Validate file types (MP3, WAV, FLAC)
- [ ] Store session metadata in memory (simple dict for now)

### Step 5: Status Endpoint
- [ ] Add GET `/api/status/{session_id}` to router
- [ ] Return session status from memory store
- [ ] Handle session not found (404)

### Step 6: Download Endpoint
- [ ] Add GET `/api/download/{session_id}` to router
- [ ] Create ZIP from session files
- [ ] Stream ZIP file to client
- [ ] Cleanup session after download (optional: delay 1h)

---

## Testing

### Manual Testing
1. Start server: `uvicorn app.main:app --reload`
2. Upload files via Postman/curl
3. Check status endpoint
4. Download ZIP
5. Verify files are in ZIP

### Unit Tests (Optional for Sprint 1)
- Test session ID generation
- Test file saving
- Test ZIP creation

---

## Success Criteria

- [x] Can upload multiple audio files
- [x] Receives a session_id
- [x] Can check upload status
- [x] Can download a ZIP file with uploaded files
- [x] Temp files are cleaned up after download

---

## Dependencies

```txt
fastapi==0.115.0
uvicorn[standard]==0.32.0
python-multipart==0.0.12
pydantic==2.10.0
python-dotenv==1.0.1
```

---

## Notes

- No audio processing yet - just upload and download
- No database - session data in memory
- Simple validation (file extension only)
- No authentication
- Files stored in `/tmp/beatwise-{session-id}/`
