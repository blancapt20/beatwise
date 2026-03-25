# Sprint 4: Audio Normalization

**Goal**: Normalize audio volume to consistent levels across all tracks.

**Duration**: ~3-4 days

---

## Objectives

1. ✅ Calculate target RMS (-14 LUFS standard)
2. ✅ Apply gain adjustment to normalize volume
3. ✅ Write normalized audio files
4. ✅ Preserve original files (optional backup)
5. ✅ Update processing pipeline

---

## Architecture

```
backend/
├── app/
│   ├── features/
│   │   └── processing/
│   │       ├── normalization.py       # NEW: Normalization logic
│   │       ├── pipeline.py            # NEW: Orchestration
│   │       └── schemas.py             # Updated models
```

---

## Implementation Steps

### Step 1: Normalization Logic
- [ ] Create `features/processing/normalization.py`
- [ ] Implement `calculate_gain(current_rms, target_rms)` → gain in dB
- [ ] Implement `apply_gain(file_path, gain_db)` → creates normalized file
- [ ] Implement `normalize_audio(file_path, target_lufs)` → full process

### Step 2: Safe Normalization
- [ ] Check if gain increase would cause clipping
- [ ] Limit max gain to prevent quality degradation
- [ ] Skip normalization if file is already in target range
- [ ] Add safety headroom (-1 dB) to prevent clipping

### Step 3: Processing Pipeline
- [ ] Create `features/processing/pipeline.py`
- [ ] Implement `process_session(session_id)` orchestrator
- [ ] Pipeline: validate → analyze → normalize → report
- [ ] Run pipeline asynchronously (background task)

### Step 4: File Management
- [ ] Create `original/` and `processed/` subdirectories in session folder
- [ ] Keep originals in `original/`
- [ ] Save normalized files in `processed/`
- [ ] ZIP only contains processed files

### Step 5: Status Updates
- [ ] Update session status during processing
- [ ] Add progress tracking (x/n files processed)
- [ ] Store processing errors per file

---

## Data Models

### NormalizationResult
```python
class NormalizationResult(BaseModel):
    file_name: str
    original_rms: float
    target_rms: float
    gain_applied: float              # dB
    normalized: bool
    reason: Optional[str]            # If not normalized: "already_optimal", "would_clip", etc.
```

### ProcessingStatus
```python
class ProcessingStatus(BaseModel):
    status: str                      # "uploaded", "processing", "ready", "error"
    progress: int                    # 0-100
    current_step: str                # "validating", "analyzing", "normalizing"
    files_processed: int
    total_files: int
```

---

## Normalization Strategy

### Target Level
- **Default**: -14 LUFS (streaming standard)
- **Alternative**: -16 LUFS (more conservative)
- Configurable per session (future)

### Gain Limits
- **Max Increase**: +6 dB (prevents quality loss from amplifying noise)
- **Max Decrease**: -10 dB (prevents over-compression)
- **Safety Headroom**: -1 dB (prevents clipping after normalization)

### Decision Tree
```
1. If already in target range (-16 to -12 LUFS) → Skip
2. If gain needed >+6 dB → Apply +6 dB max, warn user
3. If would cause clipping → Reduce gain, add headroom
4. Otherwise → Apply calculated gain
```

---

## Processing Pipeline

```
1. Upload → Save to /tmp/beatwise-{session-id}/original/
2. Validation → Check format, readability
3. Quality Analysis → RMS, clipping, bitrate
4. Normalization → Apply gain, save to /processed/
5. ZIP Creation → Package processed files + report.json
6. Ready for Download
```

---

## API Response Updates

### GET /api/status/{session_id}
```json
{
  "session_id": "uuid-string",
  "status": "processing",
  "progress": 66,
  "current_step": "normalizing",
  "files_processed": 2,
  "total_files": 3,
  "normalization_results": [
    {
      "file_name": "track1.mp3",
      "original_rms": -18.2,
      "target_rms": -14.0,
      "gain_applied": 4.2,
      "normalized": true
    },
    {
      "file_name": "track2.mp3",
      "original_rms": -13.5,
      "target_rms": -14.0,
      "gain_applied": 0.0,
      "normalized": false,
      "reason": "already_optimal"
    }
  ]
}
```

---

## Testing

### Test Cases
1. Quiet track (-20 LUFS) → Gain applied (+6 dB)
2. Loud track (-8 LUFS) → Gain reduced (-6 dB)
3. Optimal track (-14 LUFS) → No change
4. Near-clipping track → Gain limited to prevent clipping
5. Very quiet track → Max gain applied, warning issued

---

## Success Criteria

- [x] Can normalize audio to target LUFS
- [x] Prevents clipping after normalization
- [x] Preserves original files
- [x] Processed files have consistent volume
- [x] Processing pipeline runs asynchronously
- [x] Status updates during processing

---

## Dependencies

```txt
pydub==0.25.1                  # Audio manipulation
librosa==0.10.2                # Audio analysis
soundfile==0.12.1              # Audio file I/O
numpy==1.26.4                  # Audio processing
pyloudnorm==0.1.1              # LUFS normalization
```

---

## Notes

- Use `pyloudnorm` for accurate LUFS-based normalization
- Keep originals in case user wants to re-process
- Background task using FastAPI BackgroundTasks or Celery
- Add processing timeout (e.g., 10 min per session)
