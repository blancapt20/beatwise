# BeatWise Backend - Phase 0

Audio processing pipeline for DJs.

## Requirements

- **Python 3.11+** (recommended: Python 3.11 or 3.12)

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Run the server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py                      # FastAPI app
│   ├── core/
│   │   └── config.py                # Settings
│   ├── features/
│   │   └── upload/                  # Upload feature
│   │       ├── router.py            # API endpoints
│   │       ├── service.py           # Business logic
│   │       └── schemas.py           # Data models
│   └── shared/
│       └── utils/                   # Shared utilities
│           ├── file_manager.py
│           └── session.py
└── requirements.txt
```

## Endpoints

### POST /api/upload
Upload audio files (MP3, WAV, FLAC) and create a session (status: `uploaded`)

### POST /api/process/{session_id}
Start validation + quality analysis for a previously uploaded session

### GET /api/status/{session_id}
Check processing status

### GET /api/download/{session_id}
Download processed files as ZIP

### DELETE /api/session/{session_id}
Delete session and cleanup files

## Sprint 1 Status

✅ Basic project structure
✅ File upload endpoint
✅ Session management
✅ Status endpoint
✅ Download endpoint
✅ File cleanup

## Next Steps

- Sprint 2: Audio validation
- Sprint 3: Quality analysis
- Sprint 4: Audio normalization
- Sprint 5: Metadata extraction
- Sprint 6: ZIP packaging & polish
