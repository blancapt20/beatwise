# Architecture – Phase 1 (MVP with Users)

Web app with auth, tracking and folder organization. Complete pipeline for Rekordbox/VirtualDJ.

---

## Objective

Product with identified users and complete web pipeline functionality: upload, validate, normalize, tag, organize and download library ready for DJ software.

**Features**: 1, 2, 3, 4 and 5 (adds Organization).

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Web App)                        │
│  • Auth (login/registration)                                     │
│  • Drag & drop upload folders/files                              │
│  • Progress view (validation, tagging, organization)             │
│  • Tag preview and quality alerts                                │
│  • Download organized library (ZIP)                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP / WebSocket (progress)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (API Server)                      │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Upload       │  │ Quality      │  │ Volume               │   │
│  │ Handler      │→ │ Validation   │→ │ Normalization        │   │
│  └──────────────┘  └──────────────┘  └──────────┬───────────┘   │
│                                                  │               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────▼───────────┐   │
│  │ Export       │  │ Organization │  │ Tagging              │   │
│  │ (ZIP)        │← │ (folders)    │← │ (LLM + metadata)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES / PERSISTENCE                  │
│  • LLM API (OpenAI / Anthropic) – missing tags                  │
│  • Local disk (temp) – files during proc., delete after use     │
│  • DB (SQLite/Postgres) – users, sessions, analytics            │
└─────────────────────────────────────────────────────────────────┘
```

**Note**: DB stores users and usage metrics, **never** audio files.

---

## Data Flow

```
1. Authenticated user uploads files
       ↓
2. Backend writes to temp, associates session_id to user_id
       ↓
3. Quality validation
       ↓
4. Volume normalization
       ↓
5. Tagging (ID3 + LLM)
       ↓
6. Organization: create structure genre > subgenre > intensity
       ↓
7. Generate playlists (M3U) per folder
       ↓
8. Package in ZIP, serve download
       ↓
9. Record analytics (processed files, time, etc.)
       ↓
10. Delete temp folder
```

---

## Storage

| Aspect | Decision |
|---------|----------|
| **Audio files** | Temp, delete after processing. Do not persist. |
| **Auth** | Yes. JWT or sessions. |
| **Database** | Users, processing sessions, analytics (counts, timestamps). |
| **Cloud (S3)** | Optional. Not necessary for MVP. |

**Suggested data model**:

- `users`: id, email, created_at
- `sessions`: id, user_id, started_at, status, files_count, completed_at
- `analytics`: user_id, event_type, metadata (aggregates for dashboards)

---

## Folder Structure (export)

```
organized-library/
├── Electronic/
│   ├── House/
│   │   ├── Low/
│   │   │   ├── track1.mp3
│   │   │   └── ...
│   │   ├── Medium/
│   │   └── High/
│   └── Techno/
│       └── ...
├── Hip-Hop/
│   └── ...
└── playlists/
    ├── warmup.m3u
    ├── peak.m3u
    └── ...
```

Organization based on tags: genre → subgenre → intensity.

---

## Detailed Data Flow by Step

### Upload
- Validate extension, MIME type, readable file
- Reject or mark corrupted files

### Quality Validation
- Real vs declared bitrate (Fakin' the Funk)
- Spectral analysis (artifacts)
- Peak level (clipping)
- RMS

### Normalization
- Target RMS (e.g. -14 dB LUFS)
- Gain per track, limit if would degrade quality

### Tagging
- Read existing ID3/Vorbis
- LLM for: artist, title, genre, BPM, key, intensity, mood

### Organization
- Create folders according to rules
- Copy files to paths
- Generate M3U playlists

---

## Security and Performance

### Security
- Auth required
- Per-user limits (usage quota if applicable)
- Path and name sanitization
- Rate limiting per IP / user

### Performance
- Async processing with queue (Redis, Bull, etc.)
- WebSocket or polling for progress
- Cache LLM results by file hash (optional)
