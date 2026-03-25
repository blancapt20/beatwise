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
  - `too_quiet` if `< -12`
  - `too_loud` if `> -5`
- Clipping percentage:
  - No issue: `0%` to `0.2%` (if no long clipping run)
  - `minor_clipping`: `>0.2%` to `0.6%`
  - `moderate_clipping`: `>0.6%` to `1.5%`
  - `major_clipping`: `>1.5%`
  - `long_clipping_runs`: if max consecutive clipped samples `>= 80`
- True peak:
  - No issue: `<= -0.5 dBTP`
  - `low_headroom`: `>-0.5` to `-0.3 dBTP`
  - `very_hot_signal`: `>-0.3` to `0.0 dBTP`
  - `tp_soft_overs`: `>0.0` to `2.5 dBTP` (advisory; not always emitted as issue tag)
  - `tp_hard_overs`: `>2.5 dBTP`

---

## 2) Audio pack to prepare

Use 3 clean files as source masters, then derive all other cases from them.


| ID  | File Name                       | Purpose                     | Expected Result                                                           |
| --- | ------------------------------- | --------------------------- | ------------------------------------------------------------------------- |
| A1  | `clean_mp3_44k_stereo.mp3`      | Clean baseline MP3          | Valid, no issues                                                          |
| A2  | `clean_wav_44k_stereo.wav`      | Clean baseline WAV          | Valid, no issues                                                          |
| A3  | `clean_flac_44k_stereo.flac`    | Clean baseline FLAC         | Valid, no issues                                                          |
| B1  | `corrupted_mp3_truncated.mp3`   | Corruption by truncation    | `corrupted`                                                               |
| B2  | `corrupted_wav_header.wav`      | Corruption by header damage | `corrupted`                                                               |
| B3  | `corrupted_flac_truncated.flac` | Corruption by truncation    | `corrupted`                                                               |
| B4  | `zero_byte.mp3`                 | Empty file case             | `corrupted`                                                               |
| C1  | `fake_bitrate_warn_padded.mp3`  | Fake bitrate mismatch (moderate) | `fake_bitrate` (warning)                                              |
| C2  | `fake_bitrate_severe_padded.mp3`| Fake bitrate mismatch (severe)   | `fake_bitrate_severe` (error)                                         |
| C3  | `wav_padded_control.wav`        | Non-MP3 bitrate control (WAV)    | Valid, no `fake_bitrate` / `fake_bitrate_severe`                      |
| C4  | `flac_padded_control.flac`      | Non-MP3 bitrate control (FLAC)   | Valid, no `fake_bitrate` / `fake_bitrate_severe`                      |
| D1  | `too_quiet_lufs_lt_-12.wav`     | Quiet loudness case         | `too_quiet`                                                               |
| D2  | `too_loud_lufs_gt_-5.wav`       | Loudness too high           | `too_loud`                                                                |
| E1  | `headroom_low_-0.4dbtp.wav`     | True peak low headroom      | `low_headroom`                                                            |
| E2  | `very_hot_-0.1dbtp.wav`         | Very hot true peak          | `very_hot_signal`                                                         |
| E3  | `tp_soft_overs_+1.0dbtp.wav`    | Soft true peak overs        | Advisory only (`increase_headroom` recommendation; may have no issue tag) |
| E4  | `tp_hard_overs_+2.8dbtp.wav`    | Hard true peak overs        | `tp_hard_overs`                                                           |
| F1  | `clip_minor_0.4pct.wav`         | Clipping minor band         | `minor_clipping`                                                          |
| F2  | `clip_moderate_1.0pct.wav`      | Clipping moderate band      | `moderate_clipping`                                                       |
| F3  | `clip_major_2.0pct.wav`         | Clipping major band         | `major_clipping`                                                          |


---

## 3) How to transform a clean file into each case

### Corruption-oriented transformations

#### B1: `corrupted_mp3_truncated.mp3`

- Start from `clean_mp3_44k_stereo.mp3`.
- Copy file and remove the last 90-95% of bytes.
- Why it works: decoder cannot read full stream consistently.
- Fallback if still decodable: also overwrite the first 64-96 bytes to force parser failure.

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

#### C1: `fake_bitrate_warn_padded.mp3`

- Start from `clean_mp3_44k_stereo.mp3`.
- Append a zero-byte tail (not random) so duration is less likely to change.
- For the current clean baseline (`~204.016s`, `~5,105,095 bytes`), warning band (`>20%` and `<50%`) maps to roughly `0.75MB` to `2.11MB` pad.
- Target: bitrate discrepancy `>20%` but `<50%` and effective bitrate still above severe floor.
- Expected: `fake_bitrate` (warning).

#### C2: `fake_bitrate_severe_padded.mp3`

- Start from `clean_mp3_44k_stereo.mp3`.
- Append a larger zero-byte tail (not random) so duration is less likely to change.
- For the same baseline, severe threshold (`>=50%`) starts around `2.14MB` pad.
- Target: bitrate discrepancy `>=50%` (or effective bitrate `<96` in other severe scenarios).
- Expected: `fake_bitrate_severe` (error).

#### C3: `wav_padded_control.wav`

- Start from `clean_wav_44k_stereo.wav`.
- Append random bytes to the file tail.
- Expected: no fake-bitrate flags because fake-bitrate logic is MP3-specific.

#### C4: `flac_padded_control.flac`

- Start from `clean_flac_44k_stereo.flac`.
- Append random bytes to the file tail.
- Expected: no fake-bitrate flags because fake-bitrate logic is MP3-specific.

#### D1: `too_quiet_lufs_lt_-12.wav`

- Start from `clean_wav_44k_stereo.wav`.
- Reduce gain strongly (e.g. -12 dB to -20 dB).
- Target: measured LUFS below -12.

#### D2: `too_loud_lufs_gt_-5.wav`

- Start from `clean_wav_44k_stereo.wav`.
- Raise gain and limit to avoid full digital clipping.
- Target: measured LUFS above -5.

#### E1: `headroom_low_-0.4dbtp.wav`

- Start from clean WAV.
- Peak-normalize near -0.4 dBTP.
- Target: true peak in `(-0.5, -0.3]`.

#### E2: `very_hot_-0.1dbtp.wav`

- Start from clean WAV.
- Normalize near -0.1 dBTP.
- Target: true peak in `(-0.3, 0.0]`.

#### E3: `tp_soft_overs_+1.0dbtp.wav`

- Start from clean WAV.
- Add gain/soft clip to push true peak above 0 dBTP while staying below 2.5 dBTP.
- Target: true peak in `(0.0, 2.5]` (advisory range).

#### E4: `tp_hard_overs_+2.8dbtp.wav`

- Add strong gain/clip to push true peak clearly above 2.5 dBTP.
- Target: true peak `> 2.5`.

#### F1/F2/F3: controlled clipping-percentage files

- Start from clean WAV.
- Inject clipped samples (set samples to +1.0/-1.0) for a controlled percentage of total samples.
- Targets:
  - F1: ~0.4%
  - F2: ~1.0%
  - F3: ~2.0%

---

## 4) Notes for reliable testing

- Keep each test file short (15s-60s) to speed up upload/analysis.
- Only one intended condition per file when possible.
- For combined-case testing, create additional files explicitly named by both conditions.
- Re-run tests after threshold changes and keep expected outcomes updated in this file.

---

## 5) Optional combined stress files (advanced)

These are useful once single-condition tests are stable:

- `combo_too_loud_tp_hard_overs.wav` -> `too_loud` + `tp_hard_overs`
- `combo_fake_bitrate_minor_clipping.mp3` -> `fake_bitrate` + `minor_clipping`
- `combo_too_quiet_low_headroom.wav` -> edge-condition sanity check

---

## 6) Ready-to-run commands (PowerShell + FFmpeg)

Run everything from `beatwise/test_audios`.

```powershell
Set-Location "C:\Users\blanc\OneDrive\Documentos\10_Beatwise\beatwise\test_audios"
$SRC = ".\bought-files\Anda Suelta (Extended 120Bpm) - Chema Rivas, Juan Magan .mp3"
New-Item -ItemType Directory -Path ".\clean" -Force | Out-Null
New-Item -ItemType Directory -Path ".\corrupted" -Force | Out-Null
```

### A) Clean baselines

#### A1: `clean_mp3_44k_stereo.mp3`

```powershell
ffmpeg -y -i "$SRC" -ar 44100 -ac 2 -c:a libmp3lame -b:a 192k ".\clean\clean_mp3_44k_stereo.mp3"
```

#### A2: `clean_wav_44k_stereo.wav`

```powershell
ffmpeg -y -i "$SRC" -ar 44100 -ac 2 -c:a pcm_s16le ".\clean\clean_wav_44k_stereo.wav"
```

#### A3: `clean_flac_44k_stereo.flac`

```powershell
ffmpeg -y -i "$SRC" -ar 44100 -ac 2 -c:a flac ".\clean\clean_flac_44k_stereo.flac"
```

### B) Corruption files

#### B1: `corrupted_mp3_truncated.mp3`

```powershell
$src = ".\clean\clean_mp3_44k_stereo.mp3"
$dst = ".\corrupted\B1_corrupted_mp3_truncated.mp3"
Copy-Item $src $dst -Force
$b = [System.IO.File]::ReadAllBytes((Resolve-Path $dst))
$keep = [int]($b.Length * 0.05) # keep 5%, remove 95%
[System.IO.File]::WriteAllBytes((Resolve-Path $dst), $b[0..($keep-1)])
```

If `B1` is still decodable and not flagged as `corrupted`, run this extra corruption step:

```powershell
$b = [System.IO.File]::ReadAllBytes((Resolve-Path ".\corrupted\B1_corrupted_mp3_truncated.mp3"))
$rng = [System.Random]::new()
for ($i=0; $i -lt 96 -and $i -lt $b.Length; $i++) { $b[$i] = [byte]$rng.Next(0,256) }
[System.IO.File]::WriteAllBytes((Resolve-Path ".\corrupted\B1_corrupted_mp3_truncated.mp3"), $b)
```

#### B2: `corrupted_wav_header.wav`

```powershell
$src = ".\clean\clean_wav_44k_stereo.wav"
$dst = ".\corrupted\B2_corrupted_wav_header.wav"
Copy-Item $src $dst -Force
$b = [System.IO.File]::ReadAllBytes((Resolve-Path $dst))
$rng = [System.Random]::new()
for ($i=0; $i -lt 96 -and $i -lt $b.Length; $i++) { $b[$i] = [byte]$rng.Next(0,256) }
[System.IO.File]::WriteAllBytes((Resolve-Path $dst), $b)
```

#### B3: `corrupted_flac_truncated.flac`

```powershell
$src = ".\clean\clean_flac_44k_stereo.flac"
$dst = ".\corrupted\B3_corrupted_flac_truncated.flac"
Copy-Item $src $dst -Force
$b = [System.IO.File]::ReadAllBytes((Resolve-Path $dst))
$keep = [int]($b.Length * 0.25) # keep 25%, remove 75%
[System.IO.File]::WriteAllBytes((Resolve-Path $dst), $b[0..($keep-1)])
```

#### B4: `zero_byte.mp3`

```powershell
New-Item -ItemType File -Path ".\corrupted\B4_zero_byte.mp3" -Force | Out-Null
```

### C) Fake bitrate + non-MP3 controls

#### C1: `fake_bitrate_warn_padded.mp3` (warning target)

```powershell


```

#### C2: `fake_bitrate_severe_padded.mp3` (error target)

```powershell
$dst = ".\corrupted\C2_fake_bitrate_severe_padded.mp3"
Copy-Item ".\clean\clean_mp3_44k_stereo.mp3" $dst -Force
$pad = New-Object byte[] (4MB) # above severe threshold for current baseline
$absDst = (Resolve-Path $dst).Path
$fs = [System.IO.File]::Open($absDst,[System.IO.FileMode]::Append,[System.IO.FileAccess]::Write,[System.IO.FileShare]::None)
$fs.Write($pad,0,$pad.Length)
$fs.Close()
```

#### C3: `wav_padded_control.wav` (should NOT trigger fake bitrate)

```powershell
$dst = ".\corrupted\C3_wav_padded_control.wav"
Copy-Item ".\clean\clean_wav_44k_stereo.wav" $dst -Force
$pad = New-Object byte[] (4MB)
[System.Random]::new().NextBytes($pad)
$absDst = (Resolve-Path $dst).Path
$fs = [System.IO.File]::Open($absDst,[System.IO.FileMode]::Append,[System.IO.FileAccess]::Write,[System.IO.FileShare]::None)
$fs.Write($pad,0,$pad.Length)
$fs.Close()
```

#### C4: `flac_padded_control.flac` (should NOT trigger fake bitrate)

```powershell
$dst = ".\corrupted\C4_flac_padded_control.flac"
Copy-Item ".\clean\clean_flac_44k_stereo.flac" $dst -Force
$pad = New-Object byte[] (4MB)
[System.Random]::new().NextBytes($pad)
$absDst = (Resolve-Path $dst).Path
$fs = [System.IO.File]::Open($absDst,[System.IO.FileMode]::Append,[System.IO.FileAccess]::Write,[System.IO.FileShare]::None)
$fs.Write($pad,0,$pad.Length)
$fs.Close()
```

### D) LUFS files

#### D1: `too_quiet_lufs_lt_-12.wav`

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "volume=-12dB" ".\corrupted\D1_too_quiet_lufs_lt_-12.wav"
```

#### D2: `too_loud_lufs_gt_-5.wav`

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "pan=mono|c0=0.5*c0+0.5*c1,volume=11.5dB,asoftclip=type=tanh,pan=stereo|c0=c0|c1=c0" ".\corrupted\D2_too_loud_lufs_gt_-5.wav"
```

### E) True peak files

#### E1: `headroom_low_-0.4dbtp.wav`

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "loudnorm=I=-14:TP=-0.4:LRA=7" ".\corrupted\E1_headroom_low_-0.4dbtp.wav"
```

#### E2: `very_hot_-0.1dbtp.wav`

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "loudnorm=I=-10:TP=-0.1:LRA=7" ".\corrupted\E2_very_hot_-0.1dbtp.wav"
```

#### E3: `tp_soft_overs_+1.0dbtp.wav`

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "loudnorm=I=-9:TP=-0.1:LRA=7" -c:a libmp3lame -b:a 320k ".\_temp_hot.mp3"
ffmpeg -y -i ".\_temp_hot.mp3" -c:a pcm_s16le ".\corrupted\E3_tp_soft_overs_+1.0dbtp.wav"
Remove-Item ".\_temp_hot.mp3" -Force
```

#### E4: `tp_hard_overs_+2.8dbtp.wav`

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "volume=8dB,asoftclip=type=hard" ".\corrupted\E4_tp_hard_overs_+2.8dbtp.wav"
```

### F) Clipping files (approximate targets)

#### F1: `clip_minor_0.4pct.wav`

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "volume=4dB,asoftclip=type=hard" ".\corrupted\F1_clip_minor_0.4pct.wav"
```

#### F2: `clip_moderate_1.0pct.wav`

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "volume=7dB,asoftclip=type=hard" ".\corrupted\F2_clip_moderate_1.0pct.wav"
```

#### F3: `clip_major_2.0pct.wav`

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "volume=11dB,asoftclip=type=hard" ".\corrupted\F3_clip_major_2.0pct.wav"
```

### Quick checks

Check if A1 is 44.1k stereo:

```powershell
ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate,channels -of default=nw=1 ".\clean\clean_mp3_44k_stereo.mp3"
```

Decode check for corruption candidates:

```powershell
ffmpeg -v error -i ".\corrupted\B1_corrupted_mp3_truncated.mp3" -f null NUL
```

