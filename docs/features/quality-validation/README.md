# Quality Validation Feature

This document describes the complete quality-validation logic used by BeatWise for each uploaded audio file.

It consolidates:
- validation tags (file-level integrity and source quality),
- quality-analysis tags (loudness, true peak, clipping, content),
- threshold definitions,
- severity and priority mapping,
- root-cause vs symptom relationships used to reduce UI noise,
- output payload shape,
- test coverage (`B` to `F` families).

## 1) Scope and Source of Truth

Primary implementation:
- `backend/app/features/processing/validation.py`
- `backend/app/features/processing/quality.py`
- `backend/app/features/processing/issue_taxonomy.py`
- `backend/app/features/upload/service.py`

Frontend consumers:
- `frontend/features/upload/components/ValidationResultsTable.tsx`
- `frontend/features/upload/components/ValidationDetailDialog.tsx`

## 2) Processing Pipeline Per File

1. **Validation phase** (`validation.py`)
   - File existence and supported format checks.
   - Decode/property extraction checks.
   - Source quality checks (fake bitrate, low bitrate).

2. **Quality analysis phase** (`quality.py`)
   - RMS, LUFS, true-peak, clipping metrics.
   - Additional content/risk checks (upscale suspicion, low low-end, overcompression, truncation signals).

3. **Merge phase** (`upload/service.py`)
   - Final `issues` used by frontend are:
     - `validation issues UNION quality warnings`

## 3) Tag Families

### File Integrity
- `corrupted`
- `unsupported_format`
- `file_not_found`
- `truncated_content`
- `metadata_inconsistency`

### Source Quality
- `fake_bitrate_severe`
- `fake_bitrate`
- `low_bitrate`
- `possible_upscale`

### Playback Risk (Club)
- `tp_hard_overs`
- `very_hot_signal`
- `low_headroom`
- `too_quiet`
- `too_loud`

### Mastering / Content
- `major_clipping`
- `moderate_clipping`
- `minor_clipping`
- `long_clipping_runs`
- `overcompressed_master`
- `low_frequency_content`

## 4) Thresholds and Emission Rules

## 4.1 Validation tags

- `file_not_found`
  - Emitted when file path does not exist.
  - No threshold.

- `unsupported_format`
  - Emitted when extension/format is not supported (`mp3`, `wav`, `flac` expected).
  - No threshold.

- `corrupted`
  - Emitted when format or properties cannot be decoded/extracted.
  - No threshold.

- `fake_bitrate_severe` (MP3 only)
  - Emitted when:
    - `abs(declared - real) / declared >= 0.50`, or
    - `real bitrate < 96 kbps`.

- `fake_bitrate` (MP3 only)
  - Emitted when:
    - `abs(declared - real) / declared > 0.20`
  - Not emitted if already severe.

- `low_bitrate` (MP3 only)
  - Emitted when effective bitrate (`real` else `declared`) is `> 0` and `<= 192 kbps`.

## 4.2 Quality-analysis tags

### Loudness (LUFS)
- `too_quiet` if `lufs < -12.0`
- `too_loud` if `lufs > -5.0`

### True Peak
- no TP issue if `true_peak_db <= -0.5`
- `low_headroom` if `-0.5 < true_peak_db <= -0.3`
- `very_hot_signal` if `-0.3 < true_peak_db <= 0.0`
- `tp_soft_overs` if `0.0 < true_peak_db <= 2.5`
  - advisory only (recommendation path), not shown as an issue tag
- `tp_hard_overs` if `true_peak_db > 2.5`

### Clipping (% and consecutive runs)
- no clipping issue if:
  - `clipping_percentage <= 0.2` and
  - `max_consecutive_clipped_samples < 80`
- `long_clipping_runs` if `max_consecutive_clipped_samples >= 80`
- otherwise percentage buckets:
  - `minor_clipping` if `0.2 < clipping_percentage <= 0.6`
  - `moderate_clipping` if `0.6 < clipping_percentage <= 1.5`
  - `major_clipping` if `clipping_percentage > 1.5`

### Additional checks
- `possible_upscale` (MP3)
  - declared bitrate `>= 300`,
  - real bitrate `<= 256`,
  - estimated spectral cutoff `< 15000 Hz`.

- `metadata_inconsistency`
  - duration mismatch ratio `>= 0.25`.

- `truncated_content`
  - decoded duration ratio `< 0.70`, or
  - unusually long near-silent tail (`>= 25%` frames below threshold), or
  - metadata mismatch + very low real bitrate path.

- `low_frequency_content`
  - low-band energy ratio `< 0.12`.

- `overcompressed_master`
  - derived from LUFS/crest and clipping behavior, including major sustained clipping conditions.

## 5) Severity Model

Taxonomy severity computed in backend (`issue_taxonomy.py`):

### Error
- `file_not_found`
- `unsupported_format`
- `corrupted`
- `truncated_content`
- `fake_bitrate_severe`
- `tp_hard_overs`
- `long_clipping_runs`
- `major_clipping`
- `low_bitrate` escalates to error when effective bitrate `< 96 kbps`

### Warning
- all remaining tags listed in this document.

### Advisory-only (not issue tags)
- `tp_soft_overs` influences recommendations/status copy, not issue chips.

## 6) Priority and "What to Show First"

The backend taxonomy applies numeric priority so UI can show the most important reason first.

High-level order:
1. **File Integrity hard failures** (not playable/reliable)
2. **Severe source-quality failures** (bad/fake source)
3. **Hard playback distortion risk**
4. **Mastering defects**
5. **Warnings/advisories**

Example top-priority tags:
- `file_not_found` > `unsupported_format` > `corrupted`
- `fake_bitrate_severe`
- `tp_hard_overs`
- `long_clipping_runs`
- `major_clipping`

## 7) Root-Cause vs Symptom Suppression

To avoid noisy UI, lower-signal tags are hidden when a stronger root cause exists.
This suppression is computed in backend (`issue_taxonomy.py`) before the API response is sent.

Current suppression examples:
- `file_not_found` suppresses almost all others.
- `unsupported_format` suppresses decode/quality-derived tags.
- `corrupted` suppresses weaker structural/source symptoms.
- `fake_bitrate_severe` suppresses `fake_bitrate`, `low_bitrate`, `possible_upscale`.
- `truncated_content` suppresses `metadata_inconsistency`.
- `long_clipping_runs` suppresses clipping percentage variants.
- `major_clipping` suppresses `moderate_clipping` and `minor_clipping`.
- `tp_hard_overs` suppresses `very_hot_signal`, `low_headroom`, `too_loud`.
- `overcompressed_master` suppresses `too_loud`.

Display behavior:
- backend computes list of visible+hidden candidates (max 4 payload items by default),
- table shows top `2`, detail shows top `4`,
- UI shows `+N more` using backend-provided hidden count.

## 8) Backend and Frontend Outputs

Per-file backend output includes:
- technical metrics (`rms_db`, `lufs`, `true_peak_db`, `clipping_percentage`, etc.),
- `warnings` (quality-analysis tags),
- `recommendations`.

Merged file output exposed to UI:
- `issues` = validation issues + quality warnings

Backend-enriched per-file output fields in `validation_results`:
- `display_issues[]` (each item includes `tag`, `label`, `category`, `severity`, `priority`, `worry`, `explanation`)
- `hidden_issues_count`
- `issue_overall_severity` (`error`, `warning`, `none`)
- `issue_primary_tag`
- `issue_primary_label`

Frontend responsibility after refactor:
- render backend-provided fields,
- avoid duplicating severity/priority/suppression business logic.

## 9) Test Assets and Expected Outcomes (B to F)

Reference families from `test_audios/TEST_PLAN.md` and audit notes:

### B) Corruption / Integrity
- `B1 corrupted_mp3_truncated.mp3` -> usually `corrupted` (decoder tolerance can vary)
- `B2 corrupted_wav_header.wav` -> `corrupted`
- `B3 corrupted_flac_truncated.flac` -> `corrupted`
- `B4 zero_byte.mp3` -> `corrupted`

### C) Source Quality
- `C1 fake_bitrate_padded.mp3` -> `fake_bitrate` (or severe depending on discrepancy)

### D) Loudness
- `D1 too_quiet_lufs_lt_-12.wav` -> `too_quiet`
- `D2 too_loud_lufs_gt_-5.wav` -> `too_loud`

### E) True Peak
- `E1 headroom_low_-0.4dbtp.wav` -> `low_headroom`
- `E2 very_hot_-0.1dbtp.wav` -> `very_hot_signal`
- `E3 tp_soft_overs_+1.0dbtp.wav` -> advisory (may not show issue tag)
- `E4 tp_hard_overs_+2.8dbtp.wav` -> `tp_hard_overs`

### F) Clipping
- `F1 clip_minor_0.4pct.wav` -> `minor_clipping`
- `F2 clip_moderate_1.0pct.wav` -> `moderate_clipping`
- `F3 clip_major_2.0pct.wav` -> `major_clipping`
- Note: if consecutive clipped run reaches `>= 80`, expect `long_clipping_runs` override behavior.

## 10) Practical Interpretation for Users

- **Error**: high concern, replace/fix file before club use.
- **Warning**: playable with caution; monitor gain/headroom and context.
- **Advisory**: informational optimization (not a hard blocker).

This policy keeps UI concise while still exposing technical truth and risk level.
