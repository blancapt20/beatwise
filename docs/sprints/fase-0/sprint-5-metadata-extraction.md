# Sprint 5: Metadata Extraction (No LLM)

**Goal**: Extract existing ID3 tags and audio metadata from files.

**Duration**: ~2-3 days

---

## Objectives

1. ✅ Extract existing ID3 tags (artist, title, album, genre)
2. ✅ Extract BPM (if present in tags)
3. ✅ Extract key (if present in tags)
4. ✅ Write extracted metadata to report
5. ✅ Include metadata in ZIP download

---

## Architecture

```
backend/
├── app/
│   ├── features/
│   │   └── processing/
│   │       ├── metadata.py            # NEW: Metadata extraction
│   │       └── schemas.py             # Updated models
```

---

## Implementation Steps

### Step 1: Metadata Extraction
- [ ] Create `features/processing/metadata.py`
- [ ] Implement `extract_id3_tags(file_path)` → dict of tags
- [ ] Implement `extract_audio_metadata(file_path)` → comprehensive metadata
- [ ] Handle missing/incomplete tags gracefully

### Step 2: Tag Parsing
- [ ] Parse standard tags: TIT2 (title), TPE1 (artist), TALB (album), TCON (genre)
- [ ] Parse extended tags: TBPM (BPM), TKEY (key)
- [ ] Parse custom tags: Comment, Year, Track Number
- [ ] Handle different ID3 versions (v2.3, v2.4)

### Step 3: Metadata Enrichment
- [ ] Add extracted metadata to session data
- [ ] Include in quality report
- [ ] Write individual metadata JSON files for each track

### Step 4: Report Generation
- [ ] Update `report.json` to include metadata
- [ ] Create per-file metadata JSONs
- [ ] Include metadata summary (% of files with complete tags)

### Step 5: Integration
- [ ] Add metadata extraction to processing pipeline
- [ ] Run after normalization
- [ ] Include in final ZIP

---

## Data Models

### AudioMetadata
```python
class AudioMetadata(BaseModel):
    file_name: str
    
    # Basic tags
    title: Optional[str]
    artist: Optional[str]
    album: Optional[str]
    genre: Optional[str]
    year: Optional[int]
    track_number: Optional[int]
    
    # DJ-specific tags
    bpm: Optional[float]
    key: Optional[str]               # e.g., "Am", "Cmaj"
    
    # Technical
    duration: float
    sample_rate: int
    channels: int
    bitrate: int
    format: str
    
    # Metadata completeness
    completeness: float              # 0-100% (how many tags are filled)
    missing_tags: List[str]          # ["bpm", "key", etc.]
```

### MetadataReport
```python
class MetadataReport(BaseModel):
    session_id: str
    total_files: int
    summary: dict                    # avg completeness, most common genre, etc.
    files: List[AudioMetadata]
```

---

## Metadata Completeness Score

```python
def calculate_completeness(metadata: AudioMetadata) -> float:
    """
    Calculate metadata completeness (0-100%)
    
    Essential tags (50%):
    - Title: 20%
    - Artist: 20%
    - Genre: 10%
    
    Important tags (30%):
    - BPM: 15%
    - Key: 15%
    
    Nice-to-have (20%):
    - Album: 10%
    - Year: 5%
    - Track Number: 5%
    """
    pass
```

---

## API Response Updates

### GET /api/status/{session_id}
```json
{
  "session_id": "uuid-string",
  "status": "ready",
  "metadata_report": {
    "summary": {
      "avg_completeness": 65.5,
      "files_with_bpm": 2,
      "files_with_key": 1,
      "most_common_genre": "Electronic"
    },
    "files": [
      {
        "file_name": "track1.mp3",
        "title": "Sunset Vibes",
        "artist": "DJ Example",
        "album": null,
        "genre": "House",
        "year": 2023,
        "bpm": 128.0,
        "key": "Am",
        "completeness": 85.0,
        "missing_tags": ["album"]
      }
    ]
  }
}
```

---

## ZIP Contents

```
beatwise-{session-id}.zip
├── processed/
│   ├── track1.mp3                 # Normalized audio
│   ├── track2.mp3
│   └── track3.mp3
├── metadata/
│   ├── track1.json                # Individual metadata
│   ├── track2.json
│   └── track3.json
└── report.json                    # Full quality + metadata report
```

### report.json Structure
```json
{
  "session_id": "uuid",
  "processed_at": "2026-03-18T16:52:00Z",
  "total_files": 3,
  "quality_summary": { ... },
  "metadata_summary": { ... },
  "files": [
    {
      "file_name": "track1.mp3",
      "quality": { ... },
      "metadata": { ... },
      "normalization": { ... }
    }
  ]
}
```

---

## Testing

### Test Cases
1. File with complete tags → 100% completeness
2. File with no tags → 0% completeness
3. File with BPM tag → extracted correctly
4. File with key tag → extracted correctly
5. Mixed files → summary statistics correct
6. Different audio formats (MP3, WAV, FLAC) → all work

---

## Success Criteria

- [x] Can extract all ID3 tags
- [x] Can extract BPM and key when present
- [x] Metadata completeness calculated
- [x] Metadata included in report
- [x] Individual metadata JSON files created
- [x] Works with MP3, WAV, FLAC formats

---

## Dependencies

```txt
mutagen==1.47.0                # Audio metadata (already installed)
```

---

## Notes

- **No LLM in this sprint** - only extracting existing tags
- Sprint 6 will add LLM to complete missing metadata
- Focus on what's already in the files
- Handle missing/corrupt tags gracefully
- Different formats use different tag systems (ID3 vs Vorbis vs APE)
