# Arquitectura – Fase 0 (Validación / Proof of Concept)

Web app mínima para validar que el producto aporta valor. Sin auth, sin persistencia.

---

## Objetivo

Validar adopción con el mínimo esfuerzo: subir → procesar → descargar.

**Funcionalidades**: 1 (Subida), 2 (Verificación de calidad), 3 (Normalización), 4 (Etiquetado).

---

## Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Web App)                        │
│  • Drag & drop subida (sin login)                                │
│  • Vista de progreso del procesamiento                           │
│  • Descarga ZIP (archivos procesados + reporte de calidad)       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP (REST)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (API Server)                      │
│                                                                  │
│  Upload → Validación → Normalización → Etiquetado → ZIP → Borrar │
│                                                                  │
│  Todo en disco temporal. Sin persistencia.                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICIOS EXTERNOS                           │
│  • LLM API (OpenAI / Anthropic) – etiquetado automático          │
│  • Disco local – carpeta temporal, borrar tras descarga          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo de datos

```
1. Usuario sube archivos
       ↓
2. Backend escribe en /tmp/beatwise-{session-id}/
       ↓
3. Validación de calidad (bitrate, clipping, artefactos, RMS)
       ↓
4. Normalización de volumen (opcional)
       ↓
5. Etiquetado (extraer ID3, completar con LLM si falta)
       ↓
6. Generar ZIP con archivos procesados + reporte
       ↓
7. Servir descarga
       ↓
8. Borrar carpeta temporal (inmediato o tras 1h)
```

---

## Almacenamiento

| Aspecto | Decisión |
|---------|----------|
| **Archivos de audio** | Disco temporal, borrar tras procesar |
| **Auth** | No |
| **Base de datos** | No |
| **Cloud (S3, AWS)** | No. Disco local suficiente. |

**Implementación temporal**:
- Path: `/tmp/beatwise-{uuid}/` o equivalente
- Lifecycle: borrar tras descarga o job programado cada X minutos
- Límite recomendado: 2 GB por sesión, N archivos máximo

---

## API sugerida (mínima)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/upload` | Recibe multipart/form-data, devuelve `session_id` |
| GET | `/api/status/{session_id}` | Estado del procesamiento (pending, processing, ready, error) |
| GET | `/api/download/{session_id}` | Descarga ZIP (cuando status = ready) |

Alternativa: procesamiento síncrono en un único POST que devuelve el ZIP al terminar (para MVP muy simple).

---

## Seguridad y rendimiento

### Seguridad

- Límite de tamaño por subida (ej. 2 GB)
- Límite de archivos (ej. 200)
- Sanitización de nombres de archivo
- Cookie opcional: session ID para rate limiting o analytics anónimos

### Rendimiento

- Procesamiento async recomendado (cola de jobs) para no timeout en subidas grandes
- Polling o WebSocket para mostrar progreso
- Procesar archivos en lotes paralelos si el backend lo permite
