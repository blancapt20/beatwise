# Quick Start — BeatWise

Run the **FastAPI backend** and **Next.js frontend** together. The UI talks to the API at `http://localhost:8000` (set via `NEXT_PUBLIC_API_URL`).

---

## Prerequisites

- **Python 3.11+** (3.12 recommended)
- **Node.js 18+**
- **pnpm** (frontend package manager)

---

## 1. Environment files

From the repo root (`beatwise/`):

**Backend** — copy the example and adjust if needed (especially `TEMP_DIR`; create that folder on your machine):

```bash
cd backend
cp .env.example .env
```

**Frontend** — point the app at the API (default matches local backend):

```bash
cd ../frontend
cp .env.example .env
```

On Windows (PowerShell), use `Copy-Item .env.example .env` instead of `cp` if you prefer.

Variable names and defaults are documented in each folder’s `.env.example`. For a longer overview, see `README.md`.

---

## 2. Install dependencies

**Backend** (virtual environment recommended):

```bash
cd backend
python -m venv venv
```

Activate the venv:

- **Windows (PowerShell):** `.\venv\Scripts\Activate.ps1`
- **Windows (cmd):** `venv\Scripts\activate.bat`
- **macOS / Linux:** `source venv/bin/activate`

Then:

```bash
pip install -r requirements.txt
```

**Frontend:**

```bash
cd ../frontend
pnpm install
```

---

## 3. Run the app (two terminals)

**Terminal 1 — API**

```bash
cd backend
# Windows (PowerShell): .\venv\Scripts\Activate.ps1
# Windows (cmd): venv\Scripts\activate.bat
# macOS / Linux: source venv/bin/activate
uvicorn app.main:app --reload
```

- API: [http://localhost:8000](http://localhost:8000)
- Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)

**Terminal 2 — web**

```bash
cd frontend
pnpm dev
```

- App: [http://localhost:3000](http://localhost:3000)

Ensure `CORS_ORIGINS` in `backend/.env` includes `http://localhost:3000` (default in `.env.example`).

---

## What you get

- **Backend:** Upload, status, download, and session APIs for the Phase 0 pipeline (see `backend/README.md`).
- **Frontend:** Landing page plus upload flow that calls the API; dark/light theme, Tailwind v4 UI.

---

## Production-style run (local)

**Frontend:**

```bash
cd frontend
pnpm build
pnpm start
```

**Backend:** run Uvicorn without `--reload` and set `DEBUG=False` in `.env` when you want production-like behavior (see `backend/README.md`).

---

## Tech stack

| Layer    | Stack |
|----------|--------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS v4 |
| Backend  | Python, FastAPI, Pydantic Settings |

---

## Repo layout (short)

- `backend/app/` — FastAPI app, `main.py`, `core/config.py`, feature routers
- `frontend/app/` — Next.js routes; `frontend/features/` — feature modules
- Shared UI primitives: `frontend/components/ui/`

---

## More documentation

- **Project overview:** `README.md`
- **Backend:** `backend/README.md`
- **Frontend:** `frontend/README.md`, `frontend/ARCHITECTURE.md`, `frontend/ARCHITECTURE-QUICK.md`, `frontend/SETUP.md`
- **Design tokens:** `frontend/app/globals.css`
