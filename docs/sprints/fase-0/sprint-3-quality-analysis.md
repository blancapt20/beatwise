# Sprint 3: Quality Analysis

**Goal**: Analyze audio quality (RMS, clipping detection) and generate quality reports.

**Duration**: ~4-5 days

---

## Objectives

1. ✅ Calculate RMS (Root Mean Square) level for each track
2. ✅ Detect clipping (peaks > 0 dBFS)
3. ✅ Generate quality report JSON
4. ✅ Add quality warnings to validation results

---

## Architecture

```
backend/
├── app/
│   ├── features/
│   │   └── processing/
│   │       ├── validation.py          # Updated with quality checks
│   │       ├── quality.py             # NEW: Quality analysis
│   │       └── schemas.py             # Updated with quality models
```

---

## Implementation Steps

### Step 1: Audio Analysis Library
- [ ] Add dependency: `librosa` (audio analysis), `numpy`
- [ ] Create `features/processing/quality.py`

### Step 2: RMS Calculation
- [ ] Implement `calculate_rms(file_path)` → RMS in dB
- [ ] Implement `calculate_lufs(file_path)` → LUFS (Loudness Units)
- [ ] Add RMS to audio properties

### Step 3: Clipping Detection
- [ ] Implement `detect_clipping(file_path)` → count of clipped samples
- [ ] Implement `calculate_true_peak(file_path)` → max peak level
- [ ] Flag clipping/headroom using tiered thresholds (clipping % + true peak dBTP)

### Step 4: Quality Report Generation
- [ ] Create `QualityReport` model
- [ ] Implement `generate_quality_report(session_id)` → JSON report
- [ ] Include per-file analysis and summary statistics

### Step 5: Integration
- [ ] Update validation service to run quality analysis
- [ ] Store quality data in session metadata
- [ ] Add quality warnings to validation results

---

## Data Models

### QualityAnalysis
```python
class QualityAnalysis(BaseModel):
    rms_db: float                    # RMS level in dB
    lufs: float                      # Loudness in LUFS
    true_peak_db: float              # Max peak in dB
    clipped_samples: int             # Count of clipped samples
    clipping_percentage: float       # % of samples clipped
    has_clipping: bool               # True if clipping detected
```

### QualityReport
```python
class QualityReport(BaseModel):
    session_id: str
    total_files: int
    files_analyzed: int
    summary: dict                    # avg RMS, files with clipping, etc.
    files: List[FileQualityReport]
```

### FileQualityReport
```python
class FileQualityReport(BaseModel):
    file_name: str
    quality: QualityAnalysis
    warnings: List[str]              # ["clipping", "low_quality", etc.]
    recommendations: List[str]       # ["normalize", "check_source", etc.]
```

---

## Quality Thresholds

### RMS Levels
- **Optimal**: -14 to -10 LUFS
- **Acceptable**: -18 to -8 LUFS
- **Too Quiet**: < -18 LUFS → Warning
- **Too Loud**: > -8 LUFS → Warning

### Clipping
- **No Clipping**: 0% to 0.01% clipped samples
- **Minor**: >0.01% to 0.1% clipped → Warning (`minor_clipping`)
- **Moderate**: >0.1% to 0.5% clipped → Warning (`moderate_clipping`)
- **Major**: >0.5% clipped → Error (`major_clipping`)

### True Peak
- **Safe**: <= -1.0 dBTP
- **Borderline**: >-1.0 to -0.3 dBTP → Warning (`low_headroom`)
- **Very Hot**: >-0.3 to 0.0 dBTP → Warning (`very_hot_signal`)
- **Clipping**: >0.0 dBTP → Error (`tp_overs`)

---

## API Response Updates

### GET /api/status/{session_id}
```json
{
  "session_id": "uuid-string",
  "status": "analyzed",
  "files_count": 3,
  "quality_report": {
    "summary": {
      "avg_rms": -12.5,
      "files_with_clipping": 1,
      "files_too_quiet": 0
    },
    "files": [
      {
        "file_name": "track1.mp3",
        "quality": {
          "rms_db": -14.2,
          "lufs": -13.8,
          "true_peak_db": -0.2,
          "clipped_samples": 245,
          "clipping_percentage": 0.12,
          "has_clipping": true
        },
        "warnings": ["moderate_clipping", "very_hot_signal"],
        "recommendations": ["use_limiter", "increase_headroom"]
      }
    ]
  }
}
```

---

## Testing

### Test Cases
1. Clean audio → no warnings
2. Clipped audio (>0 dBFS) → clipping warning
3. Very quiet audio (<-18 LUFS) → too_quiet warning
4. Very loud audio (>-8 LUFS) → too_loud warning
5. Mixed quality files → summary statistics correct

---

## Success Criteria

- [x] Can calculate RMS/LUFS accurately
- [x] Can detect clipping
- [x] Quality report generated for all files
- [x] Warnings and recommendations provided
- [x] Summary statistics calculated

---

## Dependencies

```txt
librosa==0.10.2                # Audio analysis
numpy==1.26.4                  # Required by librosa
soundfile==0.12.1              # Audio file I/O
```

---

## Frontend – Frequency Spectrum Dialog

Sprint 2 builds the `ValidationDetailDialog` with a placeholder section for the spectrum. In Sprint 3 we wire it up:

### Spectrum Visualization

- **Backend**: new endpoint `GET /api/spectrum/{session_id}/{file_name}` that returns spectral data (frequency bins + magnitudes) computed via `librosa.stft` / `librosa.amplitude_to_db`.
- **Frontend**: render a frequency spectrum chart inside `ValidationDetailDialog` using a lightweight canvas/SVG library (e.g. `recharts` or raw `<canvas>`).
- **Display**: frequency (Hz) on X-axis, amplitude (dB) on Y-axis. Dark theme matching BeatWise palette. Show peaks, average line.
- **Interaction**: hover to see exact frequency/amplitude values. Optional toggle between spectrum and waveform views.

### Implementation Steps (Frontend)

- [ ] Add spectrum data fetching to detail dialog
- [ ] Create `SpectrumChart` component (canvas or recharts)
- [ ] Replace Sprint 2 placeholder with live spectrum
- [ ] Add loading state while spectrum data is fetched

---

## Notes

- RMS vs LUFS: LUFS is perceptual loudness, RMS is mathematical
- Use LUFS for recommendations, RMS for technical analysis
- Clipping detection: check both true peak and sample clipping
- Don't fix issues yet - just report them
- Frequency spectrum visualization carries over from Sprint 2 placeholder
