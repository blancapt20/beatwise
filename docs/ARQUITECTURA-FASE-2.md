# Architecture – Phase 2 (Advanced AI – Desktop)

Desktop app with local filesystem access, Rekordbox/VirtualDJ integration and AI for set and mix recommendations.

---

## Objective

Differentiation with creative intelligence: generate sets, recommend mixes and work directly on user's filesystem and DJ software.

**Features**: 6 (AI Recommendation), 7 (AI Mix) + all from Phase 1.

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   DESKTOP APP (Electron / Tauri)                 │
│                                                                  │
│  • Direct access to local folders                                │
│  • Local processing (validation, normalization, tagging)         │
│  • Organization: rewrites folders in filesystem                  │
│  • Rekordbox/VirtualDJ Integration (read DB, playlists)         │
│  • AI Recommendation: chatbot to generate sets                   │
│  • AI Mix: analysis of 2 songs, mix proposal                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│ Local        │  │ Rekordbox /      │  │ LLM API (or local    │
│ Filesystem   │  │ VirtualDJ        │  │ model)               │
│              │  │ (SQLite, M3U)    │  │                      │
│ User         │  │ Read/write       │  │ Tags, sets, mix recs │
│ folders      │  │ playlists        │  │                      │
└──────────────┘  └──────────────────┘  └──────────────────────┘
```

---

## Data Flow

```
1. User points to local folders
       ↓
2. Local processing:
   - Validation (clipping, artifacts, RMS)
   - Normalization
   - Tagging (LLM via API or local model)
       ↓
3. Organization: rewrite folders and playlists in filesystem
       ↓
4. Rekordbox/VirtualDJ Integration:
   - Sync structure
   - Update DB if applicable
       ↓
5. AI Recommendation:
   - User specifies: "3h of X music, warmup → peak → closing"
   - AI analyzes library, generates folders/playlists
       ↓
6. AI Mix Suggestion:
   - User selects 2 songs
   - AI analyzes compatibility (key, BPM, structure)
   - Proposes mix type and steps (guided UI)
       ↓
7. Export / direct application in DJ software
```

---

## Storage

| Aspect | Decision |
|---------|----------|
| **Audio files** | Local. App accesses user's filesystem. No cloud upload. |
| **Auth** | Yes (account for optional sync, license, etc.) |
| **Database** | Local (config, cache). Server only for auth/analytics if applicable. |
| **Cloud** | Only for LLM API and possible preference sync. |

**Principle**: Files live on user's disk. App processes and modifies them in-place or in user-controlled folders.

---

## Rekordbox / VirtualDJ Integration

### Rekordbox
- **DB**: SQLite in `~/Library/Pioneer/rekordbox/` (Mac) or equivalent path (Windows)
- **Structure**: tables for tracks, playlists, folders
- **Action**: read existing playlists, update paths, add/sort tracks
- Pioneer official documentation for DB schema

### VirtualDJ
- **Playlists**: M3U format, folder structure
- **Action**: generate/update playlists in known paths

### Integration Flow
1. Detect Rekordbox/VirtualDJ installation
2. Read DB or playlists to know current library
3. After organization: update paths, create new playlists
4. Optional: backup DB before modifying

---

## AI Recommendation (sets)

**User input** (e.g. chat):
> "3h house session, increasing intensity. 20 warmup, 20 moving, 20 peak, 10 closing."

**Process**:
1. AI receives library (already tagged metadata: genre, intensity, BPM, key)
2. Filters by criteria
3. Sorts by intensity and compatibility (key match)
4. Generates folders/playlists with selected songs
5. Optional: suggests crossfades, mix points

**Output**: 4 folders (warmup, moving, peak, closing) with songs ready to import.

---

## AI Mix Suggestion

**Input**: 2 songs selected by user.

**Process**:
1. Analyze: BPM, key, structure (intro, drop, outro), duration
2. Evaluate compatibility (Camelot wheel, BPM range)
3. LLM or rules: propose mix type (blend, drop swap, etc.)
4. Generate concrete steps: "At minute X of A, bring in minute Y of B..."
5. Step-by-step UI to guide DJ

**Output**: Step list + suggested transition type.

---

## Adaptive Quality Profiles (Next Scope)

To make quality analysis context-aware, BeatWise can apply thresholds dynamically based on intended playback environment.

### UX Approaches

1. **Preset mode** (explicit profile selected by user):
   - `Streaming Safe`
   - `Club Standard`
   - `Festival / Aggressive`
   - `Custom`

2. **Intent mode** (task-oriented input in set workflow):
   - Ask: **"Where will you play this?"**
   - Options: `Club`, `Festival`, `Streaming`, `Radio`
   - Internally map each option to a quality profile

Recommended rollout: start with intent mode in set creation (simpler UX), then expose advanced preset/custom controls.

### Architecture Impact

- Add `quality_profile` to session/set metadata.
- Resolve effective thresholds per session before quality analysis starts.
- Store both:
  - raw metrics (`true_peak_db`, `clipping_percentage`, LUFS, etc.)
  - profile-specific evaluation (`warnings`, `severity`, recommendations)
- Keep analysis deterministic by saving profile version used for each session.

### Example Mapping (Initial)

| Play Context | Internal Profile | Goal |
|--------------|------------------|------|
| Streaming | Streaming Safe | Conservative headroom and clipping tolerance |
| Club | Club Standard | Balanced loudness with safety margins |
| Festival | Festival / Aggressive | Higher loudness tolerance with explicit risk warnings |
| Radio | Streaming Safe (v1) | Clean/transmission-friendly output |

This extension preserves current Phase 2 capabilities while improving practical relevance for real-world DJ workflows.

---

## Suggested Tech Stack

- **Electron** or **Tauri** (Rust) for cross-platform app
- **Node/Python** for audio processing (same as web)
- **SQLite** local for config and cache
- **LLM**: Remote API (OpenAI, etc.) or local model (Ollama, llama.cpp) for privacy
- **FFmpeg** / **librosa** for audio analysis

---

## Considerations

- **Privacy**: Process locally when possible. Only send minimum to LLM (metadata, not raw audio, unless user accepts).
- **Permissions**: App needs access to music folders and Rekordbox DB.
- **Robustness**: DB backup before modifying. Allow rollback.
