# Arquitectura – Fase 1 (MVP con usuarios)

Web app con auth, tracking y organización de carpetas. Pipeline completo para Rekordbox/VirtualDJ.

---

## Objetivo

Producto con usuarios identificados y funcionalidad completa del pipeline web: subir, validar, normalizar, etiquetar, organizar y descargar librería lista para software DJ.

**Funcionalidades**: 1, 2, 3, 4 y 5 (añade Organización).

---

## Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Web App)                        │
│  • Auth (login/registro)                                         │
│  • Drag & drop subida carpetas/archivos                          │
│  • Vista de progreso (validación, etiquetado, organización)      │
│  • Previsualización de tags y alertas de calidad                 │
│  • Descarga de librería organizada (ZIP)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP / WebSocket (progreso)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (API Server)                      │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Upload       │  │ Validación   │  │ Normalización        │   │
│  │ Handler      │→ │ de Calidad   │→ │ de Volumen           │   │
│  └──────────────┘  └──────────────┘  └──────────┬───────────┘   │
│                                                  │               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────▼───────────┐   │
│  │ Export       │  │ Organización │  │ Etiquetado           │   │
│  │ (ZIP)        │← │ (carpetas)   │← │ (LLM + metadata)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICIOS EXTERNOS / PERSISTENCIA            │
│  • LLM API (OpenAI / Anthropic) – tags faltantes                │
│  • Disco local (temp) – archivos durante proc., borrar tras uso  │
│  • DB (SQLite/Postgres) – usuarios, sesiones, analytics         │
└─────────────────────────────────────────────────────────────────┘
```

**Nota**: La DB guarda usuarios y métricas de uso, **nunca** archivos de audio.

---

## Flujo de datos

```
1. Usuario autenticado sube archivos
       ↓
2. Backend escribe en temp, asocia session_id al user_id
       ↓
3. Validación de calidad
       ↓
4. Normalización de volumen
       ↓
5. Etiquetado (ID3 + LLM)
       ↓
6. Organización: crear estructura género > subgénero > intensidad
       ↓
7. Generar playlists (M3U) por carpeta
       ↓
8. Empaquetar en ZIP, servir descarga
       ↓
9. Registrar analytics (archivos procesados, tiempo, etc.)
       ↓
10. Borrar carpeta temporal
```

---

## Almacenamiento

| Aspecto | Decisión |
|---------|----------|
| **Archivos de audio** | Temp, borrar tras procesar. No persistir. |
| **Auth** | Sí. JWT o sesiones. |
| **Base de datos** | Usuarios, sesiones de procesamiento, analytics (counts, timestamps). |
| **Cloud (S3)** | Opcional. No necesario para MVP. |

**Modelo de datos (sugerido)**:

- `users`: id, email, created_at
- `sessions`: id, user_id, started_at, status, files_count, completed_at
- `analytics`: user_id, event_type, metadata (agregados para dashboards)

---

## Estructura de carpetas (export)

```
libreria-organizada/
├── Electronic/
│   ├── House/
│   │   ├── Low/
│   │   │   ├── track1.mp3
│   │   │   └── ...
│   │   ├── Medium/
│   │   └── High/
│   └── Techno/
│       └── ...
├── Hip-Hop/
│   └── ...
└── playlists/
    ├── warmup.m3u
    ├── peak.m3u
    └── ...
```

Organización basada en tags: género → subgénero → intensidad.

---

## Flujo de datos detallado por paso

### Subida
- Validar extensión, MIME type, archivo readable
- Rechazar o marcar corruptos

### Validación de calidad
- Bitrate real vs declarado (Fakin' the Funk)
- Análisis espectral (artefactos)
- Nivel peak (clipping)
- RMS

### Normalización
- Target RMS (ej. -14 dB LUFS)
- Gain por pista, limitar si degradaría calidad

### Etiquetado
- Leer ID3/Vorbis existentes
- LLM para: artista, título, género, BPM, key, intensidad, mood

### Organización
- Crear carpetas según reglas
- Copiar archivos a rutas
- Generar playlists M3U

---

## Seguridad y rendimiento

### Seguridad
- Auth obligatoria
- Límites por usuario (cuota de uso si aplica)
- Sanitización de rutas y nombres
- Rate limiting por IP / usuario

### Rendimiento
- Procesamiento async con cola (Redis, Bull, etc.)
- WebSocket o polling para progreso
- Cache de resultados LLM por hash de archivo (opcional)
