# Sprint 2: Audio Validation

**Goal**: Validate uploaded audio files and detect basic quality issues.

**Duration**: ~4-6 days

---

## Objectives

1. ✅ Validate file format (MP3, WAV, FLAC)
2. ✅ Check if file is readable/not corrupted
3. ✅ Extract basic audio properties (duration, sample rate, channels)
4. ✅ Detect bitrate (real vs declared - "Fakin' the Funk")
5. ✅ Update status endpoint to include validation results

---

## Architecture

```
backend/
├── app/
│   ├── features/
│   │   └── processing/
│   │       ├── validation.py          # Validation logic
│   │       └── schemas.py             # Validation result models
│   └── shared/
│       └── audio/
│           ├── formats.py             # Format detection
│           └── properties.py          # Audio property extraction
```

---

## Implementation Steps

### Step 1: Audio Library Setup
- [ ] Add dependencies: `mutagen`, `pydub`, `soundfile`
- [ ] Create `shared/audio/formats.py` for format detection
- [ ] Create `shared/audio/properties.py` for audio info extraction

### Step 2: Basic Validation
- [ ] Create `features/processing/validation.py`
- [ ] Implement `validate_file_format(file_path)` → checks extension
- [ ] Implement `is_audio_file_valid(file_path)` → tries to load file
- [ ] Implement `get_audio_properties(file_path)` → duration, sample_rate, channels

### Step 3: Bitrate Detection
- [ ] Implement `get_declared_bitrate(file_path)` → reads metadata
- [ ] Implement `estimate_real_bitrate(file_path)` → file_size / duration
- [ ] Implement `detect_fake_bitrate(file_path)` → compares declared vs real
- [ ] Flag files with >20% discrepancy as "Fakin' the Funk"

### Step 4: Validation Service
- [ ] Update `features/upload/service.py` to run validation after upload
- [ ] Store validation results in session metadata
- [ ] Update status endpoint to return validation results

### Step 5: Validation Schemas
- [ ] Create `features/processing/schemas.py`
- [ ] Define `AudioProperties` model
- [ ] Define `ValidationResult` model
- [ ] Update `UploadResponse` to include validation summary

---

## Data Models

### AudioProperties
```python
class AudioProperties(BaseModel):
    duration: float              # seconds
    sample_rate: int             # Hz (e.g., 44100)
    channels: int                # 1 (mono) or 2 (stereo)
    bitrate_declared: int        # kbps (from metadata)
    bitrate_real: int            # kbps (calculated)
    format: str                  # mp3, wav, flac
```

### ValidationResult
```python
class ValidationResult(BaseModel):
    file_name: str
    is_valid: bool
    properties: Optional[AudioProperties]
    issues: List[str]            # ["fake_bitrate", "corrupted", etc.]
```

---

## API Response Updates

### GET /api/status/{session_id}
```json
{
  "session_id": "uuid-string",
  "status": "validated",
  "files_count": 3,
  "validation_results": [
    {
      "file_name": "track1.mp3",
      "is_valid": true,
      "properties": {
        "duration": 245.5,
        "sample_rate": 44100,
        "channels": 2,
        "bitrate_declared": 320,
        "bitrate_real": 128,
        "format": "mp3"
      },
      "issues": ["fake_bitrate"]
    }
  ]
}
```

---

## Testing

### Test Cases
1. Valid MP3 file → is_valid: true
2. Corrupted MP3 → is_valid: false
3. Non-audio file (e.g., .txt) → is_valid: false
4. Fake bitrate (320kbps declared, 128kbps real) → issues: ["fake_bitrate"]
5. Low bitrate MP3 (<=192 kbps real) → issues include: ["low_bitrate"]
6. WAV file → correctly identified
7. FLAC file → correctly identified

---

## Success Criteria

- [x] Can detect file format correctly
- [x] Can identify corrupted files
- [x] Can extract audio properties (duration, sample rate, channels)
- [x] Can detect fake bitrates
- [x] Validation results are returned in status endpoint

---

## Dependencies

```txt
mutagen==1.47.0                # Audio metadata
pydub==0.25.1                  # Audio manipulation
soundfile==0.12.1              # Audio file I/O
```

---

## Frontend – Validation Results UI

After processing completes, replace the simple file list with a **results table** inspired by Fakin' The Funk.

### Results Table (`ValidationResultsTable`)

A dark-themed data table that replaces the current `FileList` once the session status is `"validated"`.

| Column | Content | Notes |
|---|---|---|
| **Status** | Icon per file: green check (valid), orange warning (valid + issues), red X (invalid/corrupted) | Visually scannable at a glance |
| **File Name** | Original filename, mono font, truncated with tooltip | Primary identifier |
| **Format** | Badge: `MP3` / `WAV` / `FLAC` | Color-coded: MP3 orange, WAV teal, FLAC white |
| **Duration** | `mm:ss` format | Right-aligned |
| **Sample Rate** | e.g. `44.1 kHz` | Right-aligned |
| **Bitrate (declared)** | e.g. `320 kbps` | Right-aligned |
| **Bitrate (real)** | e.g. `128 kbps` | Red text if fake_bitrate detected |
| **Issues** | Tags/badges: `FAKE BITRATE`, `CORRUPTED`, or empty | Warning/error color per tag |

#### Visual Details

- **Table style**: dark background (`--color-bg-elevated`), rows with subtle `border-bottom`, hover highlight.
- **Row states**: rows with issues get a subtle left-border accent (orange for warnings, red for errors).
- **Header row**: uppercase mono text, `--color-text-secondary`, sticky on scroll.
- **Fake Bitrate highlight**: when `bitrate_real` differs from `bitrate_declared` by >20%, show the real value in red (`#E53935`) and add a `FAKE BITRATE` badge in the Issues column.
- **Bottom summary bar**: below the table, a bar showing: `"X files validated · Y warnings · Z errors"`.
- **Sortable columns**: click column header to sort (at minimum by name, format, bitrate). Visual sort indicator arrow.
- **Empty state**: if no files, show "No files processed yet."

#### Row Click Behavior (Sprint 2)

Clicking a row opens a **detail panel / dialog** showing:
- Full file properties (all `AudioProperties` fields).
- A list of issues with explanations (e.g. "Declared bitrate is 320 kbps but real bitrate is 128 kbps").
- A placeholder section labeled "Frequency Spectrum" with text: _"Available after quality analysis (Sprint 3)"_.

> **Frequency Spectrum → Sprint 3**: The spectral visualization requires `librosa` and spectral analysis which are quality-analysis concerns. Sprint 2 focuses on structural validation (format, corruption, bitrate). The detail dialog is built in Sprint 2 with a placeholder, and the spectrum is wired in Sprint 3 when `librosa` is added and the backend generates spectral data. This keeps Sprint 2 focused and avoids pulling in heavy audio-analysis dependencies prematurely.

### Frontend Architecture (new files)

```
frontend/features/upload/
├── components/
│   ├── FileList.tsx                    # Existing (pre-processing list)
│   ├── ValidationResultsTable.tsx      # NEW: post-processing results table
│   ├── ValidationDetailDialog.tsx      # NEW: detail dialog on row click
│   └── ...
├── types.ts                            # NEW: ValidationResult, AudioProperties types
└── index.ts                            # Updated barrel exports
```

### Frontend Implementation Steps

- [ ] Create `types.ts` with `AudioProperties` and `ValidationResult` types (mirror backend schemas)
- [ ] Create `ValidationResultsTable` component (table with all columns described above)
- [ ] Create `ValidationDetailDialog` component (modal/dialog with full detail + spectrum placeholder)
- [ ] Update `upload/page.tsx` to show `ValidationResultsTable` when status is `"validated"`
- [ ] Update `usePolling` hook to parse `validation_results` from the status response
- [ ] Add sort functionality to table columns

---

## Notes

- Focus on detection, not fixing issues
- "Fakin' the Funk" is a heuristic (file size vs duration)
- Don't process corrupted files further
- Simple validation - no spectral analysis yet
- Frequency spectrum visualization is deferred to Sprint 3 (requires librosa + spectral data from backend)
