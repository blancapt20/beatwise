# Upload Feature - Frontend Implementation

## Overview

The Upload feature allows users to upload audio files, validate them, and download processed results. This implementation follows the feature-based architecture and connects to the Backend API (Sprint 1).

## Architecture

```
features/upload/
├── components/          # UI Components
│   ├── UploadZone.tsx      # Drag & drop upload zone
│   ├── FileList.tsx        # Display uploaded files
│   ├── ProcessingStatus.tsx # Progress indicator
│   └── DownloadButton.tsx  # Download action
├── hooks/               # React hooks
│   ├── useUpload.ts        # Upload state management
│   └── usePolling.ts       # Status polling
└── index.ts             # Barrel exports
```

## Components

### UploadZone
- Drag & drop or click to upload
- Validates file types (MP3, WAV, FLAC)
- Displays upload instructions

### FileList
- Shows uploaded files with details (name, size)
- Status badges (Pending, Uploading, Valid, Error)
- Remove file action

### ProcessingStatus
- Displays current processing state
- Progress bar (0%, 65%, 100%)
- Status messages

### DownloadButton
- Triggers file download
- Opens download URL in new tab

## Hooks

### useUpload
Manages upload state:
- `files`: Array of uploaded files
- `sessionId`: Current session ID
- `isUploading`: Upload in progress
- `uploadError`: Error message
- `addFiles()`: Add files to queue
- `removeFile()`: Remove file from queue
- `uploadFiles()`: Upload to backend
- `reset()`: Clear all state

### usePolling
Polls backend for status:
- `status`: Current status response
- `isPolling`: Polling in progress
- `error`: Polling error
- `refetch()`: Manually fetch status

## API Integration

### Endpoints
- `POST /api/upload`: Upload files → returns session_id
- `GET /api/status/{session_id}`: Get status
- `GET /api/download/{session_id}`: Download ZIP

### Flow
1. User selects files → added to local state
2. User clicks "Start Processing" → `POST /api/upload`
3. Backend returns `session_id`
4. Frontend polls `GET /api/status/{session_id}` every 2 seconds
5. When status is "ready" → show download button
6. User clicks "Download" → opens `GET /api/download/{session_id}`

## Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Usage

### Route
- URL: `/upload`
- File: `app/upload/page.tsx`

### From Landing Page
The "Get Started" button on the landing page now links to `/upload`.

## Design System Compliance

The upload page follows BeatWise design system:

### Colors
- Background: `var(--color-bg-primary)`
- Elevated surfaces: `var(--color-bg-elevated)`
- Accent orange: `var(--color-accent-orange)`
- Accent teal: `var(--color-accent-teal)`

### Typography
- Display font (Oswald): Headings
- Monospace font (JetBrains Mono): Body text

### Layout
- Max width: 768px (3xl)
- Spacing: Tailwind scale
- Border radius: 8px (lg), 12px (xl)

## Testing Locally

1. Start backend:
```bash
cd backend
source venv/Scripts/activate  # Git Bash
uvicorn app.main:app --reload
```

2. Start frontend:
```bash
cd frontend
pnpm dev
```

3. Open browser:
- Landing page: http://localhost:3000
- Upload page: http://localhost:3000/upload

4. Test flow:
- Click "Get Started" on landing page
- Upload audio files (MP3, WAV, FLAC)
- Click "Start Processing"
- Wait for processing to complete
- Click "Download Processed Files"

## Next Steps

1. Test with real audio files
2. Implement Sprint 2 (Audio Validation) in backend
3. Add processing steps UI feedback
4. Add error handling for specific validation errors
5. Add success animations and toasts

## Status

✅ Upload page designed (Pencil)  
✅ Frontend components implemented  
✅ Backend API connected  
✅ File upload/download working  
⏳ Processing steps (Sprint 2+)  
