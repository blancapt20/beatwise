# Sprint 6: ZIP Packaging & Polish

**Goal**: Package everything into a professional ZIP, add async processing, error handling, and cleanup.

**Duration**: ~3-4 days

---

## Objectives

1. ✅ Package processed files + reports into professional ZIP
2. ✅ Implement async processing with background tasks
3. ✅ Add comprehensive error handling & logging
4. ✅ Implement session cleanup (after download or timeout)
5. ✅ Add API documentation (Swagger/OpenAPI)
6. ✅ Polish user experience

---

## Implementation Steps

### Step 1: Professional ZIP Structure
- [ ] Create well-organized ZIP layout
- [ ] Add README.txt with session info
- [ ] Include quality report (JSON + human-readable)
- [ ] Include metadata files
- [ ] Add BeatWise branding

### Step 2: Async Processing
- [ ] Move processing to background task (FastAPI BackgroundTasks)
- [ ] Update status in real-time during processing
- [ ] Handle processing errors gracefully
- [ ] Add processing timeout (10 min max)

### Step 3: Error Handling
- [ ] Catch file upload errors
- [ ] Handle corrupted audio files
- [ ] Handle processing failures
- [ ] Return meaningful error messages
- [ ] Log all errors for debugging

### Step 4: Session Cleanup
- [ ] Implement automatic cleanup after download
- [ ] Add scheduled cleanup for abandoned sessions (1h timeout)
- [ ] Add manual cleanup endpoint (admin)
- [ ] Log cleanup actions

### Step 5: Logging & Monitoring
- [ ] Add structured logging (loguru or structlog)
- [ ] Log all API requests
- [ ] Log processing steps
- [ ] Add performance timing
- [ ] Add error tracking

### Step 6: API Documentation
- [ ] Add docstrings to all endpoints
- [ ] Add request/response examples
- [ ] Configure Swagger UI
- [ ] Add error response documentation

---

## ZIP Structure

```
beatwise-{session-id}.zip
├── README.txt                      # Session info, instructions
├── processed/                      # Normalized audio files
│   ├── track1.mp3
│   ├── track2.mp3
│   └── track3.mp3
├── reports/
│   ├── quality-report.json         # Technical report
│   ├── quality-report.txt          # Human-readable
│   ├── metadata-report.json
│   └── summary.txt                 # Executive summary
└── metadata/                       # Per-file metadata
    ├── track1.json
    ├── track2.json
    └── track3.json
```

### README.txt Example
```
╔══════════════════════════════════════════════════════════╗
║                      BeatWise                            ║
║               Know your beats, prep your sets            ║
╚══════════════════════════════════════════════════════════╝

Session ID: 12345678-1234-1234-1234-123456789abc
Processed: 2026-03-18 16:52:00 UTC
Total Files: 3
Processing Time: 45.2 seconds

📁 FOLDER STRUCTURE:
─────────────────────
• processed/      → Your normalized audio files
• reports/        → Quality analysis & metadata
• metadata/       → Individual file metadata (JSON)

📊 SUMMARY:
───────────
• Files Processed: 3/3
• Quality Issues: 1 file with minor clipping
• Normalization: All files normalized to -14 LUFS
• Metadata: 85% complete on average

⚠️  WARNINGS:
─────────────
• track1.mp3: Minor clipping detected (0.02%)
• track2.mp3: Low bitrate (128 kbps, claimed 320 kbps)

💡 NEXT STEPS:
──────────────
1. Import processed files into Rekordbox/VirtualDJ
2. Review quality-report.txt for details
3. Check metadata/ for individual file info

Questions? Visit: https://beatwise.com/support
```

---

## Background Processing

### Current Flow (Synchronous - Bad)
```
POST /upload → Save files → Process → Return response (SLOW!)
```

### New Flow (Asynchronous - Good)
```
POST /upload → Save files → Return session_id (FAST!)
              → Background: Process files
GET /status → Check progress
GET /download → Download when ready
```

### Implementation
```python
from fastapi import BackgroundTasks

@router.post("/upload")
async def upload_files(
    files: List[UploadFile],
    background_tasks: BackgroundTasks
):
    session_id = generate_session_id()
    await save_files(session_id, files)
    
    # Process in background
    background_tasks.add_task(process_session, session_id)
    
    return {"session_id": session_id, "status": "processing"}
```

---

## Error Handling

### Error Categories
1. **Upload Errors**: File too large, invalid format
2. **Processing Errors**: Corrupted file, analysis failed
3. **System Errors**: Disk full, timeout

### Error Response Format
```json
{
  "error": true,
  "error_type": "validation_error",
  "message": "File 'track1.mp3' is corrupted and cannot be processed",
  "details": {
    "file": "track1.mp3",
    "reason": "Unable to read audio data"
  },
  "session_id": "uuid"
}
```

---

## Session Cleanup

### Cleanup Triggers
1. **After download**: Immediate cleanup (optional delay)
2. **Timeout**: Delete sessions older than 1 hour
3. **Manual**: Admin endpoint for cleanup

### Implementation
```python
import asyncio
from datetime import datetime, timedelta

async def cleanup_old_sessions():
    """Run every 5 minutes, delete sessions > 1 hour old"""
    while True:
        cutoff = datetime.now() - timedelta(hours=1)
        old_sessions = get_sessions_before(cutoff)
        for session_id in old_sessions:
            cleanup_session(session_id)
        await asyncio.sleep(300)  # 5 minutes
```

---

## Logging Setup

```python
import logging
from loguru import logger

# Configure logger
logger.add(
    "logs/beatwise-{time:YYYY-MM-DD}.log",
    rotation="1 day",
    retention="30 days",
    level="INFO"
)

# Log example
logger.info(
    "Processing session",
    session_id=session_id,
    files_count=files_count,
    duration_ms=duration
)
```

---

## API Documentation

### Swagger UI
- Available at: `/docs`
- Interactive API testing
- Request/response schemas
- Error documentation

### Example Endpoint Doc
```python
@router.post(
    "/upload",
    response_model=UploadResponse,
    summary="Upload audio files for processing",
    description="""
    Upload one or more audio files (MP3, WAV, FLAC) for validation,
    quality analysis, and normalization.
    
    The files are processed asynchronously. Use the returned session_id
    to check status and download results.
    
    **Limits:**
    - Max file size: 50 MB per file
    - Max files: 200 per session
    - Supported formats: MP3, WAV, FLAC
    """,
    responses={
        200: {"description": "Files uploaded successfully"},
        400: {"description": "Invalid file format or size"},
        413: {"description": "File too large"},
        500: {"description": "Server error during upload"}
    }
)
async def upload_files(...):
    pass
```

---

## Testing

### Integration Tests
1. Full pipeline: upload → process → download
2. Error scenarios: corrupted file, timeout
3. Cleanup: verify files deleted after download
4. Concurrent uploads: multiple sessions

---

## Success Criteria

- [x] ZIP contains all files + reports
- [x] Processing is asynchronous
- [x] Errors are handled gracefully
- [x] Sessions are cleaned up automatically
- [x] API is well-documented
- [x] Logging is comprehensive
- [x] User experience is polished

---

## Dependencies

```txt
loguru==0.7.2                  # Logging
APScheduler==3.10.4            # Scheduled cleanup (optional)
```

---

## Performance Targets

- Upload response: < 2 seconds (for 10 files, 50 MB total)
- Processing time: < 30 seconds per file
- Download response: < 1 second (ZIP generation)
- Session cleanup: < 100ms per session

---

## Next Steps (Future Sprints)

- **Phase 0 Complete!** 🎉
- Add LLM for missing metadata (optional upgrade)
- Frontend integration
- Analytics tracking
- Rate limiting
