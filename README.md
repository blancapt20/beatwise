# BeatWise

**Know your beats, prep your sets.**

BeatWise ayuda a DJs a ahorrar tiempo preparando su librería: validación de calidad, organización de archivos y sets con IA y workflows automáticos. Automatiza todo lo que hay entre la descarga de canciones y el inicio de la sesión.

---

## Qué hace BeatWise

- **Sube** tus carpetas de descargas
- **Valida** calidad real (bitrate, clipping, artefactos)
- **Normaliza** volumen entre pistas
- **Etiqueta** con IA: artista, título, género, BPM, key, mood
- **Organiza** por género, subgénero e intensidad (Fase 1+)
- **Descarga** librería lista para Rekordbox / VirtualDJ

---

## Estado del proyecto

| Fase | Estado | Descripción |
|------|--------|-------------|
| **Fase 0** | En desarrollo | Web: subir → procesar → descargar. Sin auth. Validar valor. |
| **Fase 1** | Planificada | Auth, organización, tracking. Librería lista para software DJ. |
| **Fase 2** | Planificada | App Desktop, AI Recommendation, AI Mix, integración Rekordbox. |

---

## Stack

- **Frontend**: React + Vite
- **Backend**: Python + FastAPI
- **Procesamiento audio**: librosa, mutagen, ffmpeg
- **Etiquetado**: LLM (OpenAI / Anthropic)

---

## Cómo empezar

### Requisitos

- Node.js 18+
- Python 3.10+
- ffmpeg

### Instalación

```bash
# Clonar
git clone https://github.com/YOUR_ORG/beatwise.git
cd beatwise

# Frontend
cd frontend && npm install

# Backend
cd ../backend && pip install -r requirements.txt
```

### Desarrollo

```bash
# Terminal 1: Backend
cd backend && uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Variables de entorno

Copia `.env.example` a `.env` y configura:

- `LLM_API_KEY` – API key para etiquetado automático
- `TEMP_STORAGE_PATH` – Ruta para archivos temporales (opcional)
- `MAX_UPLOAD_SIZE` – Límite de subida en bytes (opcional)

---

## Estructura

```
beatwise/
├── frontend/          # SPA React
├── backend/           # API FastAPI + pipeline de audio
├── docs/              # Documentación del proyecto
└── .cursor/rules/     # Reglas para desarrollo
```

---

## Documentación

- [Proyecto y funcionalidades](docs/PROYECTO.md)
- [Marca y UI](docs/MARCA.md)
- [CI/CD](docs/CI-CD.md)
- [Testing](docs/TESTING.md)
- [Arquitectura – Fase 0](docs/ARQUITECTURA-FASE-0.md)
- [Arquitectura – Fase 1](docs/ARQUITECTURA-FASE-1.md)
- [Arquitectura – Fase 2](docs/ARQUITECTURA-FASE-2.md)

---

## Licencia

Por definir.
