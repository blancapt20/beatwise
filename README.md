# BeatWise

**Know your beats, prep your sets.**

BeatWise helps DJs save time preparing their library: quality validation, file organization, and AI-powered automated workflows. Automates everything between downloading tracks and starting your session.

---

## What BeatWise Does

- **Upload** your download folders
- **Validate** real quality (bitrate, clipping, artifacts)
- **Normalize** volume across tracks
- **Tag** with AI: artist, title, genre, BPM, key, mood
- **Organize** by genre, subgenre, and intensity (Phase 1+)
- **Download** library ready for Rekordbox / VirtualDJ

---

## Project Status

| Phase | Status | Description |
|------|--------|-------------|
| **Phase 0** | In Development | Web: upload → process → download. No auth. Value validation. |
| **Phase 1** | Planned | Auth, organization, tracking. Library ready for DJ software. |
| **Phase 2** | Planned | Desktop App, AI Recommendation, AI Mix, Rekordbox integration. |

---

## Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS v4
- **Backend**: Python + FastAPI
- **Audio Processing**: librosa, mutagen, ffmpeg
- **Tagging**: LLM (OpenAI / Anthropic)

---

## Getting Started

### Requirements

- Node.js 20+
- pnpm 9+ (package manager)
- Python 3.10+ (for backend, coming soon)
- ffmpeg (for backend, coming soon)

### Installation

```bash
# Clone
git clone https://github.com/YOUR_ORG/beatwise.git
cd beatwise

# Frontend (Next.js 15)
cd frontend && pnpm install

# Backend (when available)
cd ../backend && pip install -r requirements.txt
```

### Development

```bash
# Terminal 1: Frontend (Next.js - available now)
cd frontend && pnpm dev
# Open http://localhost:3000

# Terminal 2: Backend (coming soon)
cd backend && uvicorn main:app --reload
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `LLM_API_KEY` – API key for automatic tagging
- `TEMP_STORAGE_PATH` – Path for temporary files (optional)
- `MAX_UPLOAD_SIZE` – Upload limit in bytes (optional)

---

## Structure

```
beatwise/
├── frontend/          # Next.js 15 + React 19 + TypeScript + Tailwind v4
│   ├── app/          # App Router (pages & layouts)
│   ├── features/     # Feature modules (modular architecture)
│   │   └── landing/  # Landing page feature
│   ├── components/   # Shared UI components only
│   │   ├── ui/       # UI primitives (Button, Input)
│   │   └── layout/   # Layout components (Header, Footer)
│   ├── lib/          # Utilities and shared code
│   ├── hooks/        # Shared hooks
│   └── public/       # Static assets
├── backend/           # FastAPI API + audio pipeline (coming soon)
├── docs/              # Project documentation
└── .cursor/rules/     # Development rules
```

**Frontend Architecture**: Feature-based modular structure for scalability
- See: `frontend/ARCHITECTURE.md` for complete guide
- See: `frontend/ARCHITECTURE-QUICK.md` for quick reference

---

## Documentation

- [Project and Features](docs/PROYECTO.md)
- [Brand and UI](docs/MARCA.md)
- [CI/CD](docs/CI-CD.md)
- [Testing](docs/TESTING.md)
- [Theme Toggle Implementation](docs/THEME-TOGGLE.md)
- [Architecture – Phase 0](docs/ARQUITECTURA-FASE-0.md)
- [Architecture – Phase 1](docs/ARQUITECTURA-FASE-1.md)
- [Architecture – Phase 2](docs/ARQUITECTURA-FASE-2.md)

---

## License

To be defined.
