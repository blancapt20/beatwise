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
| **Phase 0** | 🔨 In Development | Web: upload → process → download. No auth. Value validation. |
| **Phase 1** | 📋 Planned | Auth, organization, tracking. Library ready for DJ software. |
| **Phase 2** | 📋 Planned | Desktop App, AI Recommendation, AI Mix, Rekordbox integration. |

**Current Sprint**: Sprint 1 of 6 (Phase 0) ✅ Complete
- ✅ Backend: Upload/Download API
- ✅ Frontend: Landing Page + Upload Page
- ⏳ Next: Audio Validation (Sprint 2)

---

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS v4
- **Backend**: Python 3.12 + FastAPI
- **Audio Processing**: librosa, mutagen, ffmpeg (coming in Sprint 2+)
- **AI Tagging**: LLM (OpenAI / Anthropic) (coming in Sprint 5)

---

## Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.12+ (for backend)
- pnpm (frontend package manager)

### Environment Setup

**Important**: Both backend and frontend require environment configuration.

```bash
# Backend
cd backend
cp .env.example .env
# Edit backend/.env with your settings

# Frontend
cd frontend
cp .env.example .env.local
# Edit frontend/.env.local with your settings
```

📖 See [docs/ENVIRONMENT-SETUP.md](docs/ENVIRONMENT-SETUP.md) for detailed configuration guide.

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_ORG/beatwise.git
cd beatwise

# Backend setup
cd backend
python -m venv venv
source venv/Scripts/activate  # Git Bash (or venv\Scripts\activate on PowerShell)
pip install -r requirements.txt

# Frontend setup
cd ../frontend
pnpm install
```

### Running the Application

```bash
# Terminal 1: Backend
cd backend
source venv/Scripts/activate  # Git Bash
uvicorn app.main:app --reload
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs

# Terminal 2: Frontend
cd frontend
pnpm dev
# Frontend: http://localhost:3000
```

---

## Project Structure

```
beatwise/
├── frontend/                    # Next.js 15 + React 19
│   ├── app/
│   │   ├── page.tsx            # Landing page ✅
│   │   └── upload/
│   │       └── page.tsx        # Upload page ✅
│   ├── features/               # Feature modules (modular architecture)
│   │   ├── landing/            # Landing page feature ✅
│   │   └── upload/             # Upload feature ✅
│   ├── components/
│   │   ├── ui/                 # UI primitives (Button, Badge, etc.)
│   │   └── layout/             # Layout components (Header, Footer)
│   ├── lib/
│   │   └── api/                # API client for backend
│   ├── hooks/                  # Shared React hooks
│   └── public/                 # Static assets
│
├── backend/                    # FastAPI + Python ✅
│   ├── app/
│   │   ├── main.py            # FastAPI app ✅
│   │   ├── core/              # Core config ✅
│   │   ├── features/          # Feature modules (matches frontend!)
│   │   │   └── upload/        # Upload API ✅
│   │   └── shared/            # Shared utilities ✅
│   ├── tests/                 # Backend tests
│   └── requirements.txt       # Python dependencies
│
├── docs/                      # Project documentation
│   ├── ENVIRONMENT-SETUP.md   # Environment configuration guide
│   ├── CURRENT-STATUS.md      # Current project status
│   ├── UPLOAD-FEATURE.md      # Upload feature documentation
│   └── sprints/fase-0/        # Sprint documentation
│
└── .cursor/rules/             # Development rules and conventions
```

**Architecture**: Feature-based modular structure for scalability
- Frontend and Backend share the same organizational pattern
- Each feature is self-contained with its own routes, services, and components

---

## Documentation

### User Guides
- [Environment Setup](docs/ENVIRONMENT-SETUP.md) - Configure environment variables
- [Upload Feature](docs/UPLOAD-FEATURE.md) - How the upload system works

### Project Documentation
- [Current Status](docs/CURRENT-STATUS.md) - What's completed and what's next
- [Project Overview](docs/PROYECTO.md) - Project goals and phases
- [Brand & UI](docs/MARCA.md) - Design system and branding
- [CI/CD](docs/CI-CD.md) - Continuous integration setup
- [Testing](docs/TESTING.md) - Testing strategy

### Architecture
- [Phase 0 Architecture](docs/ARQUITECTURA-FASE-0.md) - Current implementation
- [Phase 1 Architecture](docs/ARQUITECTURA-FASE-1.md) - Future with auth & DB
- [Phase 2 Architecture](docs/ARQUITECTURA-FASE-2.md) - Desktop app & AI features

### Sprint Documentation
- [Sprint 1: Upload/Download](docs/sprints/fase-0/sprint-1-basic-upload-download.md) ✅ Complete
- [Sprint 2: Audio Validation](docs/sprints/fase-0/sprint-2-audio-validation.md) ⏳ Next
- [Sprint 3: Quality Analysis](docs/sprints/fase-0/sprint-3-quality-analysis.md)
- [Sprint 4: Normalization](docs/sprints/fase-0/sprint-4-normalization.md)
- [Sprint 5: Metadata Extraction](docs/sprints/fase-0/sprint-5-metadata-extraction.md)
- [Sprint 6: Packaging & Polish](docs/sprints/fase-0/sprint-6-packaging-polish.md)

---

## Development Workflow

1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Follow feature-based architecture
3. **Run tests**: `pnpm test` (frontend) or `pytest` (backend)
4. **Lint code**: Auto-checked by CI/CD
5. **Create PR**: To `develop` branch
6. **CI passes**: GitHub Actions runs tests and linting
7. **Merge**: After review

---

## Contributing

Currently in active development. Contribution guidelines coming soon.

---

## License

To be defined.

---

## Contact

For questions or feedback, reach out to [your-email@example.com].
