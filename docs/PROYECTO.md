# BeatWise Assistant – MVP Documentation

## Executive Summary

**BeatWise Assistant** is a middleware layer that helps DJs save time in library preparation: validation and organization of files and sets using AI and automated workflows. It automates the entire process between downloading tracks and starting a session.

---

## Main Objective

> Help DJs save time in library preparation, file and set validation and organization using AI and automated workflows.

BeatWise is a middleware layer that automates:
- Track download → Validation → Organization → Set Preparation

---

## Features

### 1. Upload

User uploads the folder where they've downloaded music during the day.

- **Format recognition** supported (MP3, WAV, FLAC, etc.)
- **Basic validation** to check if file can be processed
- **Detection of corrupted files** or unreadable files

### 2. Quality Verification

Audio quality control to ensure minimum standards:

| Verification | Description |
|--------------|-------------|
| **Fakin' the Funk** | Detect if real bitrate matches what's indicated in metadata |
| **Artifacts** | Audio defects from aggressive compression |
| **Clipping** | If it exceeds the maximum representable volume limit in the digital file |
| **Alerts** | For files that don't meet minimum standard |

### 3. Volume Normalization

- **RMS calculation** for each track
- **Automatic adjustment** so all tracks are within a uniform range
- **Consideration**: raising volume on a low-level track can affect quality; should be evaluated case by case

### 4. Automatic Tagging

Complete ID3 metadata (AI):

- **Basic**: artist, title, genre
- **DJ**: BPM, key
- **Extraction**: use existing metadata when already present
- **AI**: generate via LLM when information is missing
- **Internal tags** for sessions: "intensity", "mood", etc.

### 5. Organization *(Phase 1 and 2)*

Inspired by Soulseek model: folder access and AI organizes according to tags.

**Requirement**: tags must be very well defined.

**Organization criteria**:
- Genre
- Subgenre
- Intensity
- User-defined criteria

### 6. AI Recommendation for Session Creation *(Phase 2)*

Chatbot that receives user instructions, for example:

> *"I want to make a 3-hour session of X type of music that increases in intensity. Create three folders of songs where there are: 20 for warmup, 20 to start moving, 20 for when everyone is drunk and going all out, and 10 for closing."*

### 7. AI Mix Recommendation *(Phase 2)*

Analysis of two specific tracks to propose how to mix them:

- **Compatibility analysis**
- **Mix type proposals**
- **Steps** to execute them
- **Step-by-step UI** to guide the DJ

---

## Development Phases

### Phase 0 (Validation / Proof of Concept) – Web

**Objective**: validate that the product provides value with minimum effort.

**Platform**: Web app.

**Included features**: 1, 2, 3 and 4 (upload, verification, normalization, tagging).

**Characteristics**:
- **No users or authentication**
- **No persistence**: upload → process in memory/temp disk → download result
- **Optional cookie** for anonymous session, basic analytics or rate limiting
- **No AWS**: local server disk sufficient

**Usage flow**:
1. Upload folders/files
2. Quality analysis + normalization + tagging
3. **Download** result (processed files with tags, quality report)

**Success criterion**: if there's adoption and repeated use → evolve to Phase 1.

---

### Phase 1 (MVP with Users) – Web

**Objective**: product with user tracking and complete web pipeline functionality.

**Platform**: Web app.

**Included features**: 1, 2, 3, 4 and 5 (adds organization).

**Characteristics**:
- **Simple auth** (register/login)
- **Usage tracking/analytics** per user (audio files not stored)
- **Organization** of folders and playlists for Rekordbox/VirtualDJ

**Usage flow**:
1. Upload folders/files
2. Quality analysis + normalization
3. Tagging and organization
4. **Download** organized library ready for Rekordbox / VirtualDJ

---

### Phase 2 (Advanced AI) – Desktop

**Objective**: differentiation with creative intelligence and total integration.

**Platform**: Launcher / Desktop App (advanced users).

**Included features**: 6 and 7 + all from Phase 1.

**Additional characteristics**:
- AI to generate sets
- Mix recommendations
- Total integration with local folders and Rekordbox

---

## Storage

| Aspect | Phase 0 | Phase 1 | Phase 2 |
|---------|--------|--------|--------|
| **Audio files** | Temp, delete after processing | Temp, delete after processing | Local (user filesystem) |
| **Auth / Users** | No | Yes | Yes |
| **Persistence** | None | Analytics and usage metrics | Local + Rekordbox integration |
| **Cloud (S3, etc.)** | No | Not necessary | No |

**Principle**: do not persistently store audio files. Only process in temp and allow download. In Phase 2, user has their local files and app accesses filesystem directly.

---

## Architecture

### Phase 0 – Web Flow (validation)

```
Anonymous User → Web App → Backend (Server)
          │
          ▼
  1. Upload folders/files
          │
          ▼
  2. Quality validation
  3. Volume normalization (optional)
  4. Automatic tagging
          │
          ▼
  5. Download ZIP with processed files + report
          │
          ▼
  [Temp file deletion]
```

### Phase 1 – Web Flow (complete MVP)

```
User → Web App → Backend (Server)
          │
          ▼
  1. Upload folders/files
          │
          ▼
  2. Quality validation
     • Real bitrate
     • Clipping
     • Artifacts
     • Volume/RMS
          │
          ▼
  3. Volume normalization (optional)
          │
          ▼
  4. Automatic tagging
     • Extract metadata if exists
     • Call LLM to complete tags
       (Artist, Title, Genre, BPM, Key, Mood/Intensity)
          │
          ▼
  5. Folder and playlist organization
     • Based on tags
     • Generate structure ready for Rekordbox/VirtualDJ
          │
          ▼
  6. Export
     • Download ZIP or final organized folder
```

### Phase 2 – Desktop Flow

```
User → Launcher/Desktop App
          │
          ▼
  1. Direct access to local folders
          │
          ▼
  2. Local processing:
     • Validation (clipping, artifacts, RMS)
     • Volume normalization
          │
          ▼
  3. Automatic tagging
     • LLM (API or local model)
          │
          ▼
  4. Organization
     • Rewrite folders and playlists directly in filesystem
          │
          ▼
  5. Rekordbox/VirtualDJ Integration
     • Read DB or playlists
          │
          ▼
  6. AI Recommendation / Mix Suggestion
     • AI analyzes library and generates sets
     • Crossfade, key match, BPM match suggestions
          │
          ▼
  7. Export / Direct application of changes in DJ software
```

---

## Technical Decisions by Phase

| Feature | Phase 0 (Validation) | Phase 1 (Web MVP) | Phase 2 (Desktop) |
|---------------|:-------:|:-----------------:|:-----------------:|
| Upload / download | ✅ | ✅ | ✅ (direct) |
| Auth / users | ❌ | ✅ | ✅ |
| Local folder access | ❌ | ❌ | ✅ |
| Quality validation | ✅ | ✅ | ✅ |
| Volume normalization | ✅ | ✅ | ✅ |
| Automatic tagging | ✅ | ✅ (LLM API) | ✅ (API or local) |
| Folder organization | ❌ | ✅ (export) | ✅ (direct FS) |
| AI Recommendations / Mix | ❌ | ❌ | ✅ |
| Rekordbox/VirtualDJ Integration | ❌ | ❌ | ✅ |
| Cloud (S3, etc.) | No | Not necessary | No |

---

## Suggested Tech Stack (reference)

For Phase 0 and Phase 1 (Web):

- **Frontend**: SPA (React/Vue/Svelte) with drag-and-drop for upload
- **Backend**: REST API or similar for processing
- **Audio processing**: libraries like `librosa`, `essentia`, `mutagen` (Python) or `audiowaveform`, `ffmpeg`
- **LLM**: API (OpenAI, Anthropic, etc.) for automatic tagging
- **Temporary storage**: local server disk (`/tmp` or dedicated folder). No S3 or cloud for MVP.
- **Export**: ZIP generation (processed files in Phase 0; organized structure in Phase 1)

For Desktop app (Phase 2):

- **Electron** or **Tauri** for cross-platform app
- **Direct filesystem access**
- **Integration**: reading Rekordbox databases (SQLite) and standard playlist formats

---

## Glossary

| Term | Meaning |
|---------|-------------|
| **Fakin' the Funk** | File that declares higher bitrate than real (e.g. 320kbps when it's 128kbps) |
| **Clipping** | Distortion from exceeding the dynamic range of digital format |
| **RMS** | Root Mean Square – average audio level measurement |
| **ID3** | Metadata standard in MP3 files |
| **Key** | Musical key of a track (e.g. Am, Cmaj) |

---

## Next Steps

**Phase 0**:
1. Implement pipeline: upload → validation → normalization → tagging → download
2. Processing in temp disk, delete after download
3. Optional cookie for anonymous analytics
4. Deploy and validate with real users

**Phase 1** (when Phase 0 validates):
1. Add auth and user model
2. Implement folder organization (feature 5)
3. Persist usage analytics (without audio files)
4. UX design for upload, progress and download

**Phase 2** (when Phase 1 is consolidated):
1. Desktop app development (Electron/Tauri)
2. Rekordbox/VirtualDJ integration
3. AI Recommendation for sets
4. AI Mix Suggestion
