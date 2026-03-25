from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import tempfile

from app.core.config import settings
from app.features.upload.router import router as upload_router


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Audio processing pipeline for DJs - Phase 0: Upload, validate, and normalize audio files",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router)


@app.on_event("startup")
async def configure_runtime_temp_dirs():
    """
    Ensure upload temp directory exists and use it as process temp.
    This helps avoid multipart parsing failures when OS temp is full.
    """
    temp_root = Path(settings.temp_dir)
    temp_root.mkdir(parents=True, exist_ok=True)
    tempfile.tempdir = str(temp_root)


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
