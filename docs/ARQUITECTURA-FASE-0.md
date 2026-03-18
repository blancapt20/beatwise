# Architecture – Phase 0 (Validation / Proof of Concept)

Minimal web app to validate that the product provides value. No auth, no persistence.

---

## Objective

Validate adoption with minimum effort: upload → process → download.

**Features**: 1 (Upload), 2 (Quality verification), 3 (Normalization), 4 (Tagging).

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Web App)                        │
│  • Drag & drop upload (no login)                                 │
│  • Processing progress view                                      │
│  • ZIP download (processed files + quality report)               │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP (REST)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (API Server)                      │
│                                                                  │
│  Upload → Validation → Normalization → Tagging → ZIP → Delete   │
│                                                                  │
│  All in temp disk. No persistence.                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                            │
│  • LLM API (OpenAI / Anthropic) – automatic tagging             │
│  • Local disk – temp folder, delete after download              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
1. User uploads files
       ↓
2. Backend writes to /tmp/beatwise-{session-id}/
       ↓
3. Quality validation (bitrate, clipping, artifacts, RMS)
       ↓
4. Volume normalization (optional)
       ↓
5. Tagging (extract ID3, complete with LLM if missing)
       ↓
6. Generate ZIP with processed files + report
       ↓
7. Serve download
       ↓
8. Delete temp folder (immediate or after 1h)
```

---

## Storage

| Aspect | Decision |
|---------|----------|
| **Audio files** | Temp disk, delete after processing |
| **Auth** | No |
| **Database** | No |
| **Cloud (S3, AWS)** | No. Local disk sufficient. |

**Temporary implementation**:
- Path: `/tmp/beatwise-{uuid}/` or equivalent
- Lifecycle: delete after download or scheduled job every X minutes
- Recommended limit: 2 GB per session, N max files

---

## Suggested API (minimal)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Receives multipart/form-data, returns `session_id` |
| GET | `/api/status/{session_id}` | Processing status (pending, processing, ready, error) |
| GET | `/api/download/{session_id}` | Download ZIP (when status = ready) |

Alternative: synchronous processing in a single POST that returns the ZIP when finished (for very simple MVP).

---

## Security and Performance

### Security

- Upload size limit (e.g. 2 GB)
- File count limit (e.g. 200)
- Filename sanitization
- Optional cookie: session ID for rate limiting or anonymous analytics

### Performance

- Async processing recommended (job queue) to avoid timeout on large uploads
- Polling or WebSocket to show progress
- Process files in parallel batches if backend allows
