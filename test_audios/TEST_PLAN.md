# BeatWise Test Audios Plan

This file defines the audio pack needed to test all validation and quality checks currently implemented in BeatWise (Phase 0 + Sprint 3).

---

## 1) What the platform currently checks

### Validation checks
- Supported format by extension: `.mp3`, `.wav`, `.flac`
- Readability/decoding
- Corruption detection (`corrupted`)
- Fake bitrate detection (`fake_bitrate`) when declared vs real bitrate differs by more than 20%

### Quality checks
- LUFS:
  - `too_quiet` if `< -18`
  - `too_loud` if `> -8`
- Clipping percentage:
  - No issue: `0%` to `0.01%`
  - `minor_clipping`: `>0.01%` to `0.1%`
  - `moderate_clipping`: `>0.1%` to `0.5%`
  - `major_clipping`: `>0.5%`
- True peak:
  - No issue: `<= -1.0 dBTP`
  - `low_headroom`: `>-1.0` to `-0.3 dBTP`
  - `very_hot_signal`: `>-0.3` to `0.0 dBTP`
  - `tp_overs`: `>0.0 dBTP`

---

## 2) Audio pack to prepare

Use 3 clean files as source masters, then derive all other cases from them.

| ID | File Name | Purpose | Expected Result |
|---|---|---|---|
| A1 | `clean_mp3_44k_stereo.mp3` | Clean baseline MP3 | Valid, no issues |
| A2 | `clean_wav_44k_stereo.wav` | Clean baseline WAV | Valid, no issues |
| A3 | `clean_flac_44k_stereo.flac` | Clean baseline FLAC | Valid, no issues |
| B1 | `corrupted_mp3_truncated.mp3` | Corruption by truncation | `corrupted` |
| B2 | `corrupted_wav_header.wav` | Corruption by header damage | `corrupted` |
| B3 | `corrupted_flac_truncated.flac` | Corruption by truncation | `corrupted` |
| B4 | `zero_byte.mp3` | Empty file case | `corrupted` |
| C1 | `fake_bitrate_padded.mp3` | Fake bitrate mismatch | `fake_bitrate` |
| D1 | `too_quiet_lufs_lt_-18.wav` | Quiet loudness case | `too_quiet` |
| D2 | `too_loud_lufs_gt_-8.wav` | Loudness too high | `too_loud` |
| E1 | `headroom_low_-0.8dbtp.wav` | True peak low headroom | `low_headroom` |
| E2 | `very_hot_-0.1dbtp.wav` | Very hot true peak | `very_hot_signal` |
| E3 | `tp_overs_+0.2dbtp.wav` | True peak over 0 dBTP | `tp_overs` |
| F1 | `clip_minor_0.05pct.wav` | Clipping minor band | `minor_clipping` |
| F2 | `clip_moderate_0.2pct.wav` | Clipping moderate band | `moderate_clipping` |
| F3 | `clip_major_1.0pct.wav` | Clipping major band | `major_clipping` |

---

## 3) How to transform a clean file into each case

### Corruption-oriented transformations

#### B1: `corrupted_mp3_truncated.mp3`
- Start from `clean_mp3_44k_stereo.mp3`.
- Copy file and remove the last 60-80% of bytes.
- Why it works: decoder cannot read full stream consistently.

#### B2: `corrupted_wav_header.wav`
- Start from `clean_wav_44k_stereo.wav`.
- Copy file and overwrite the first 64-128 bytes (RIFF/WAVE header) with random bytes.
- Why it works: parser fails to read container header.

#### B3: `corrupted_flac_truncated.flac`
- Start from `clean_flac_44k_stereo.flac`.
- Copy file and truncate aggressively (remove large tail chunk).
- Why it works: FLAC frame/index becomes incomplete.

#### B4: `zero_byte.mp3`
- Create an empty file with `.mp3` extension.
- Why it works: extension passes, decoding fails.

### Validation/quality transformations (non-corruption)

#### C1: `fake_bitrate_padded.mp3`
- Start from `clean_mp3_44k_stereo.mp3`.
- Append random bytes at the end (do not alter metadata tags).
- Why it works: declared bitrate stays similar while size-based real bitrate inflates.

#### D1: `too_quiet_lufs_lt_-18.wav`
- Start from `clean_wav_44k_stereo.wav`.
- Reduce gain strongly (e.g. -12 dB to -20 dB).
- Target: measured LUFS below -18.

#### D2: `too_loud_lufs_gt_-8.wav`
- Start from `clean_wav_44k_stereo.wav`.
- Raise gain and limit to avoid full digital clipping.
- Target: measured LUFS above -8.

#### E1: `headroom_low_-0.8dbtp.wav`
- Start from clean WAV.
- Peak-normalize near -0.8 dBTP.
- Target: true peak in `(-1.0, -0.3]`.

#### E2: `very_hot_-0.1dbtp.wav`
- Start from clean WAV.
- Normalize near -0.1 dBTP.
- Target: true peak in `(-0.3, 0.0]`.

#### E3: `tp_overs_+0.2dbtp.wav`
- Start from clean WAV.
- Add gain/soft clip to push true peak above 0 dBTP.
- Target: true peak `> 0.0`.

#### F1/F2/F3: controlled clipping-percentage files
- Start from clean WAV.
- Inject clipped samples (set samples to +1.0/-1.0) for a controlled percentage of total samples.
- Targets:
  - F1: ~0.05%
  - F2: ~0.2%
  - F3: ~1.0%

---

## 4) Notes for reliable testing

- Keep each test file short (15s-60s) to speed up upload/analysis.
- Only one intended condition per file when possible.
- For combined-case testing, create additional files explicitly named by both conditions.
- Re-run tests after threshold changes and keep expected outcomes updated in this file.

---

## 5) Optional combined stress files (advanced)

These are useful once single-condition tests are stable:
- `combo_too_loud_tp_overs.wav` -> `too_loud` + `tp_overs`
- `combo_fake_bitrate_minor_clipping.mp3` -> `fake_bitrate` + `minor_clipping`
- `combo_too_quiet_low_headroom.wav` -> edge-condition sanity check

