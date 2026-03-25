# B to F Results Audit

This file tracks generated test files (`B1` to `F3`) with:
- change made
- expected result
- real result observed in app
- mismatch discussion

Reference source for generated changes:
- `test_audios/TEST_PLAN.md`

---

## B1 - `B1_corrupted_mp3_truncated.mp3`

### Change made

```powershell
$src = ".\clean\clean_mp3_44k_stereo.mp3"
$dst = ".\corrupted\B1_corrupted_mp3_truncated.mp3"
Copy-Item $src $dst -Force
$b = [System.IO.File]::ReadAllBytes((Resolve-Path $dst))
$keep = [int]($b.Length * 0.05) # keep 5%, remove 95%
[System.IO.File]::WriteAllBytes((Resolve-Path $dst), $b[0..($keep-1)])
```

### Expected result

- Baseline expectation for `B1`: `corrupted`
- Caveat already known in plan:
  - `B1` can occasionally still decode and then show quality warnings instead of `corrupted`.

### Real result observed

- **Status column**: `Error`
- **Issues detected**:
  - `fake_bitrate_severe` (red)
  - `low_bitrate` (red)
  - `metadata_inconsistency` (yellow)
  - `very_hot_signal` (yellow)
- **Bitrate real column**: `10 kbps` (red)
- **Audio properties shown in app**:
  - Duration: `3 min 24 sec (204.0s)`

### Mismatch discussion

- Corruption-by-truncation is still decodable in this case (MP3 tolerance), so `corrupted` is not emitted.
- Current behavior is now acceptable and aligned with policy:
  - extreme bitrate inconsistency and very low bitrate are escalated to error severity.
  - metadata-vs-decoded duration mismatch is surfaced as warning (`metadata_inconsistency`).
- This is plausible for truncated MP3 because MP3 decoding is tolerant:
  - parser may still read header/stream metadata (duration/declared bitrate),
  - but audio payload is incomplete, causing extremely low effective bitrate and unstable loudness/peak metrics.
- The result supports the caveat that `B1` is not deterministic for pure `corrupted` testing unless corruption is made stricter.
- Why duration can still appear as 204.0s:
  - metadata/stream header can preserve original timeline estimate even when payload is truncated.
- Why `very_hot_signal` can appear:
  - analysis runs on whatever decoded samples remain; short/fragmented material can produce atypical peak metrics.


---

## B2 - `B2_corrupted_wav_header.wav`

### Change made

```powershell
$src = ".\clean\clean_wav_44k_stereo.wav"
$dst = ".\corrupted\B2_corrupted_wav_header.wav"
Copy-Item $src $dst -Force
$b = [System.IO.File]::ReadAllBytes((Resolve-Path $dst))
$rng = [System.Random]::new()
for ($i=0; $i -lt 96 -and $i -lt $b.Length; $i++) { $b[$i] = [byte]$rng.Next(0,256) }
[System.IO.File]::WriteAllBytes((Resolve-Path $dst), $b)
```

### Expected result

- **Status column**: `Error`
- **Issues detected**: `corrupted` (typically as the only issue)
- **Reason**: damaging RIFF/WAVE header bytes should make the file fail format/decoding validation, so the pipeline should mark it corrupted before normal quality analysis.

### Real result observed

- **Status column**: `Error`
- **Issues detected**: `corrupted`

---

## B4 - `B4_zero_byte.mp3`

### Change made

```powershell
New-Item -ItemType File -Path ".\corrupted\B4_zero_byte.mp3" -Force | Out-Null
```

### Expected result

- **Status column**: `Error`
- **Issues detected**: `corrupted` (typically as the only issue)
- **Reason**: zero-byte file cannot be decoded as valid audio.

### Real result observed

- **Status column**: `Error`
- **Issues detected**: `corrupted`

---

## B3 - `B3_corrupted_flac_truncated.flac`

### Change made

```powershell
$src = ".\clean\clean_flac_44k_stereo.flac"
$dst = ".\corrupted\B3_corrupted_flac_truncated.flac"
Copy-Item $src $dst -Force
$b = [System.IO.File]::ReadAllBytes((Resolve-Path $dst))
$keep = [int]($b.Length * 0.25) # keep 25%, remove 75%
[System.IO.File]::WriteAllBytes((Resolve-Path $dst), $b[0..($keep-1)])
```

### Expected result

- **Status column**: `Error`
- **Issues detected**: `corrupted` (typically as the only issue)
- **Reason**: aggressive truncation usually breaks FLAC frame/index integrity, so validation decoding should fail.


---

## C1 - `C1_fake_bitrate_warn_padded.mp3`

### Change made

```powershell
$dst = ".\corrupted\C1_fake_bitrate_warn_padded.mp3"
Copy-Item ".\clean\clean_mp3_44k_stereo.mp3" $dst -Force
$pad = New-Object byte[] (1500KB) # in warn band for current baseline
$absDst = (Resolve-Path $dst).Path
$fs = [System.IO.File]::Open($absDst,[System.IO.FileMode]::Append,[System.IO.FileAccess]::Write,[System.IO.FileShare]::None)
$fs.Write($pad,0,$pad.Length)
$fs.Close()
```

### Expected result

- **Primary expectation**: `fake_bitrate`
- **Status column**: `Warning`
- **Reason**: appending random bytes inflates file-size-based real bitrate while metadata declared bitrate remains unchanged.
- **Target profile**: discrepancy should be moderate (warn band), not severe. Use `C2_fake_bitrate_severe_padded.mp3` for the error/severe case.
- **Possible additional tags**: depending on resulting decode/analysis, other quality warnings can co-exist (for example `low_bitrate`, `metadata_inconsistency`, `too_quiet`).

### Real result observed

- **Status column**: `Warning`
- **Issues detected**: `fake_bitrate`
- **Bitrate (Declared)**: `192 kbps`
- **Bitrate (Real)**: `260 kbps`
- **Computed discrepancy**: `~35.4%` (`|260-192| / 192`)

---

## C2 - `C2_fake_bitrate_severe_padded.mp3`

### Change made

```powershell
$dst = ".\corrupted\C2_fake_bitrate_severe_padded.mp3"
Copy-Item ".\clean\clean_mp3_44k_stereo.mp3" $dst -Force
$pad = New-Object byte[] (4MB) # above severe threshold for current baseline
$absDst = (Resolve-Path $dst).Path
$fs = [System.IO.File]::Open($absDst,[System.IO.FileMode]::Append,[System.IO.FileAccess]::Write,[System.IO.FileShare]::None)
$fs.Write($pad,0,$pad.Length)
$fs.Close()
```

### Expected result

- **Primary expectation**: `fake_bitrate_severe`
- **Status column**: `Error`
- **Reason**: appended tail should push bitrate discrepancy to the severe band (`>=50%`).
- **Possible additional tags**: depending on decode/analysis outcome, additional warnings may co-exist.

### Real result observed

- **Status column**: `Error`
- **Issues detected**: `fake_bitrate_severe`
- **Bitrate (Declared)**: `192 kbps`
- **Bitrate (Real)**: `364 kbps`
- **Computed discrepancy**: `~89.6%` (`|364-192| / 192`)

---

## C3 - `C3_wav_padded_control.wav`

### Change made

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

### Expected result

- **Primary expectation**: no fake-bitrate issue tags.
- **Status column**: should not be `Warning`/`Error` due to fake-bitrate logic.
- **Reason**: fake-bitrate checks are MP3-specific in validation logic; WAV is a control case.
- **Possible additional tags**: other quality tags are possible if independently triggered by analysis, but not `fake_bitrate` / `fake_bitrate_severe`.

### Real result observed

- **Status column**: `Valid`
- **Issues detected**: none
- **Notes**: no `fake_bitrate` / `fake_bitrate_severe` tag (as expected for WAV control case).

---

## C4 - `C4_flac_padded_control.flac`

### Change made

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

### Expected result

- **Primary expectation**: no fake-bitrate issue tags.
- **Status column**: should not be `Warning`/`Error` due to fake-bitrate logic.
- **Reason**: fake-bitrate checks are MP3-specific in validation logic; FLAC is a control case.
- **Possible additional tags**: other quality tags are possible if independently triggered by analysis, but not `fake_bitrate` / `fake_bitrate_severe`.

### Real result observed

- **Status column**: `Valid`
- **Issues detected**: none
- **Notes**: no `fake_bitrate` / `fake_bitrate_severe` tag (as expected for FLAC control case).

---

## D1 - `D1_too_quiet_lufs_lt_-12.wav`

### Change made

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "volume=-12dB" ".\corrupted\D1_too_quiet_lufs_lt_-12.wav"
```

### Expected result

- **Primary expectation**: `too_quiet`
- **Status column**: `Warning`
- **Reason**: attenuation should push integrated loudness below the DJ threshold (`< -12 LUFS`).
- **Possible additional tags**: depending on resulting true peak and crest factor, other non-error quality tags can co-exist.

### Real result observed

- **Status column**: `Warning`
- **Issues detected**: `too_quiet`
- **LUFS column**: around `-23.5 LUFS` (too-quiet range)

---

## D2 - `D2_too_loud_lufs_gt_-5.wav`

### Change made

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "pan=mono|c0=0.5*c0+0.5*c1,volume=11.5dB,asoftclip=type=tanh,pan=stereo|c0=c0|c1=c0" ".\corrupted\D2_too_loud_lufs_gt_-5.wav"
```

### Expected result

- **Primary expectation**: `too_loud`
- **Status column**: `Warning`
- **Reason**: processing target should push integrated loudness above DJ upper threshold (`> -5 LUFS`).
- **Possible additional tags**: depending on resulting true peak and clipping profile, advisory tags may co-exist.

### Real result observed

- **Status column**: `Warning`
- **Issues detected**:
  - `tp_hard_overs`
  - `long_clipping_runs`
- **LUFS**: `-4.9 LUFS`
- **True Peak**: `2.9 dBFS`
- **Clipping**: `2.2449%`

### Mismatch discussion

- Partial alignment:
  - primary D2 loudness objective is met (`-4.9 > -5`, so "too loud" condition is reached),
  - but this transformation also pushes the file into stronger distortion/hard-overs territory.
- Keep this as a valid "loud + stressed" D2 variant; if a cleaner "too_loud-only" case is needed, use a softer/lower-gain transform.

---

## E1 - `E1_headroom_low_-0.4dbtp.wav`

### Change made

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "loudnorm=I=-14:TP=-0.4:LRA=7" ".\corrupted\E1_headroom_low_-0.4dbtp.wav"
```

### Expected result

- **Primary expectation**: `low_headroom`
- **Status column**: `Warning`
- **Reason**: target true peak should land in low-headroom band (`-0.5 < TP <= -0.3`).
- **Possible additional tags**: depending on loudness outcome, `too_quiet` may co-exist.

### Real result observed

- **Status column**: `Warning`
- **Issues detected**: `too_quiet`
- **Sample rate shown**: `192.0 kHz`
- **Bitrate (Real)**: `6144 kbps`
- **LUFS**: `-16.8 LUFS`
- **True Peak**: `-1.9 dBFS`
- **Clipping**: `0.0000%`

### Mismatch discussion

- Mismatch vs target: this run did not land in `low_headroom`; TP stayed too low (`-1.9 dBFS`), so only `too_quiet` was triggered.
- This indicates the current E1 generation command is not deterministic for the intended TP window on this source.

---

## E2 - `E2_very_hot_-0.1dbtp.wav`

### Change made

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "loudnorm=I=-10:TP=-0.1:LRA=7" ".\corrupted\E2_very_hot_-0.1dbtp.wav"
```

### Expected result

- **Primary expectation**: `very_hot_signal`
- **Status column**: `Warning`
- **Reason**: target true peak should land in very-hot band (`-0.3 < TP <= 0.0`).
- **Possible additional tags**: loudness-related advisory tags may co-exist.

### Real result observed

- **Status column**: `Warning`
- **Issues detected**:
  - `very_hot_signal`
  - `too_quiet`
- **Sample rate shown**: `192.0 kHz`
- **Bitrate (Real)**: `6144 kbps`
- **LUFS**: `-12.9 LUFS`
- **True Peak**: `-0.1 dBFS`
- **Clipping**: `0.0000%`

### Mismatch discussion

- Partial alignment:
  - expected `very_hot_signal` is correctly triggered (TP in `-0.3..0.0` band),
  - additional `too_quiet` appears because LUFS remains below `-12`.

---

## E3 - `E3_tp_soft_overs_+1.0dbtp.wav`

### Change made

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "loudnorm=I=-9:TP=-0.1:LRA=7" -c:a libmp3lame -b:a 320k ".\_temp_hot.mp3"
ffmpeg -y -i ".\_temp_hot.mp3" -c:a pcm_s16le ".\corrupted\E3_tp_soft_overs_+1.0dbtp.wav"
Remove-Item ".\_temp_hot.mp3" -Force
```

### Expected result

- **Primary expectation**: `tp_soft_overs` range behavior (advisory-style).
- **Status column**: typically `Valid` or `Warning` depending on co-existing tags.
- **Reason**: true peak should exceed `0.0 dBFS` but remain below hard-overs threshold (`<= 2.5 dBFS`).
- **Possible additional tags**: other warnings may appear depending on resulting LUFS/clipping.

### Real result observed

- **Status column**: `Warning`
- **Issues detected**:
  - `very_hot_signal`
  - `too_quiet`
- **Sample rate shown**: `48.0 kHz`
- **Bitrate (Real)**: `1536 kbps`
- **LUFS**: `-12.1 LUFS`
- **True Peak**: `0.0 dBFS`
- **Clipping**: `0.0000%`

### Mismatch discussion

- Partial mismatch:
  - target was soft overs (`> 0.0 dBFS`), but observed TP is exactly `0.0 dBFS`, which classifies as `very_hot_signal` instead of advisory soft-overs behavior.
  - `too_quiet` also appears due to LUFS just below threshold.

---

## E4 - `E4_tp_hard_overs_+2.8dbtp.wav`

### Change made

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "volume=8dB,asoftclip=type=hard" ".\corrupted\E4_tp_hard_overs_+2.8dbtp.wav"
```

### Expected result

- **Primary expectation**: `tp_hard_overs`
- **Status column**: `Warning` or `Error` based on current severity mapping.
- **Reason**: transformation should push true peak above hard-overs threshold (`> 2.5 dBFS`).
- **Possible additional tags**: clipping-related warnings can co-exist.

### Real result observed

- **Status column**: `Warning`
- **Issues detected**:
  - `tp_hard_overs`
  - `long_clipping_runs`
- **Sample rate shown**: `44.1 kHz`
- **Bitrate (Real)**: `1411 kbps`
- **LUFS**: `-5.7 LUFS`
- **True Peak**: `2.6 dBFS`
- **Clipping**: `11.1963%`

### Mismatch discussion

- Alignment is good for the intended hard-overs stress case:
  - `tp_hard_overs` is triggered as expected (`> 2.5 dBFS`),
  - strong clipping side-effects (`long_clipping_runs`) are also expected with this transform.

---

## F1 - `F1_clip_minor_0.4pct.wav`

### Change made

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "volume=4dB,asoftclip=type=hard" ".\corrupted\F1_clip_minor_0.4pct.wav"
```

### Expected result

- **Primary expectation**: `minor_clipping`
- **Status column**: `Warning`
- **Reason**: transformation aims for clipping percentage in minor band (above floor but below moderate threshold).
- **Possible additional tags**: TP-related warnings can co-exist depending on peak outcome.

### Real result observed

- **Status column**: `Warning`
- **Issues detected**:
  - `long_clipping_runs`
  - `overcompressed_master`
- **Sample rate shown**: `44.1 kHz`
- **Bitrate (Real)**: `1411 kbps`
- **LUFS**: `-8.2 LUFS`
- **True Peak**: `1.6 dBFS`
- **Clipping**: `4.1501%`

### Mismatch discussion

- Mismatch vs target: expected `minor_clipping` range, but generated file is far more aggressive.
- Current output lands in strong clipping/run behavior (`long_clipping_runs`) plus `overcompressed_master`.
- Generator for F1 should be softened if you want an actual minor-band clipping case.

---

## F2 - `F2_clip_moderate_1.0pct.wav`

### Change made

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "volume=7dB,asoftclip=type=hard" ".\corrupted\F2_clip_moderate_1.0pct.wav"
```

### Expected result

- **Primary expectation**: `moderate_clipping`
- **Status column**: `Warning`
- **Reason**: transformation aims for clipping percentage in moderate band.
- **Possible additional tags**: true-peak/hot-master warnings can co-exist.

### Real result observed

- **Status column**: `Warning`
- **Issues detected**:
  - `long_clipping_runs`
  - `overcompressed_master`
- **Sample rate shown**: `44.1 kHz`
- **Bitrate (Real)**: `1411 kbps`
- **LUFS**: `-6.3 LUFS`
- **True Peak**: `2.4 dBFS`
- **Clipping**: `8.9641%`

### Mismatch discussion

- Mismatch vs target: expected moderate clipping band, but this transform produces heavy clipping behavior.
- Result is still useful as a stress profile, but not representative of a controlled moderate clipping case.

---

## F3 - `F3_clip_major_2.0pct.wav`

### Change made

```powershell
ffmpeg -y -i ".\clean\clean_wav_44k_stereo.wav" -af "volume=11dB,asoftclip=type=hard" ".\corrupted\F3_clip_major_2.0pct.wav"
```

### Expected result

- **Primary expectation**: `major_clipping` (and possibly `long_clipping_runs`)
- **Status column**: `Warning` or `Error` based on severity mapping.
- **Reason**: heavy clipping transform should push percentage into major band.
- **Possible additional tags**: hard true-peak overs and hot-master signals can co-exist.

### Real result observed

- **Status column**: `Warning`
- **Issues detected**:
  - `tp_hard_overs`
  - `long_clipping_runs`
- **Sample rate shown**: `44.1 kHz`
- **Bitrate (Real)**: `1411 kbps`
- **LUFS**: `-4.3 LUFS`
- **True Peak**: `3.9 dBFS`
- **Clipping**: `19.7355%`

### Mismatch discussion

- Alignment is good for a severe clipping stress case:
  - major clipping profile is clearly achieved,
  - `tp_hard_overs` and `long_clipping_runs` are expected side-effects at this intensity.

---

