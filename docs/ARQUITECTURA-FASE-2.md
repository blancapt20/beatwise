# Arquitectura – Fase 2 (IA avanzada – Desktop)

App de escritorio con acceso local al filesystem, integración con Rekordbox/VirtualDJ e IA para recomendaciones de sets y mezcla.

---

## Objetivo

Diferenciación con inteligencia creativa: generar sets, recomendar mezclas y trabajar directamente sobre el filesystem y software DJ del usuario.

**Funcionalidades**: 6 (AI Recommendation), 7 (AI Mix) + todas las de Fase 1.

---

## Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                   DESKTOP APP (Electron / Tauri)                 │
│                                                                  │
│  • Acceso directo a carpetas locales                             │
│  • Procesamiento local (validación, normalización, etiquetado)    │
│  • Organización: reescribe carpetas en filesystem                │
│  • Integración Rekordbox/VirtualDJ (lectura DB, playlists)      │
│  • AI Recommendation: chatbot para generar sets                 │
│  • AI Mix: análisis de 2 canciones, propuesta de mezcla          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│ Filesystem   │  │ Rekordbox /      │  │ LLM API (o modelo    │
│ local        │  │ VirtualDJ        │  │ local)                │
│              │  │ (SQLite, M3U)    │  │                       │
│ Carpetas     │  │ Lectura/escritura│  │ Tags, sets, mix recs  │
│ del usuario  │  │ de playlists      │  │                       │
└──────────────┘  └──────────────────┘  └──────────────────────┘
```

---

## Flujo de datos

```
1. Usuario apunta a carpetas locales
       ↓
2. Procesamiento local:
   - Validación (clipping, artefactos, RMS)
   - Normalización
   - Etiquetado (LLM vía API o modelo local)
       ↓
3. Organización: reescribe carpetas y playlists en filesystem
       ↓
4. Integración con Rekordbox/VirtualDJ:
   - Sincronizar estructura
   - Actualizar DB si aplica
       ↓
5. AI Recommendation:
   - Usuario indica: "3h de X música, warmup → peak → cierre"
   - IA analiza librería, genera carpetas/playlists
       ↓
6. AI Mix Suggestion:
   - Usuario selecciona 2 canciones
   - IA analiza compatibilidad (key, BPM, estructura)
   - Propone tipo de mix y pasos (UI guiada)
       ↓
7. Export / aplicación directa en software DJ
```

---

## Almacenamiento

| Aspecto | Decisión |
|---------|----------|
| **Archivos de audio** | Local. App accede al filesystem del usuario. No subir a cloud. |
| **Auth** | Sí (cuenta para sync opcional, licencia, etc.) |
| **Base de datos** | Local (config, caché). Servidor solo para auth/analytics si aplica. |
| **Cloud** | Solo para LLM API y posible sync de preferencias. |

**Principio**: Los archivos viven en el disco del usuario. La app los procesa y modifica in-place o en carpetas que el usuario controle.

---

## Integración Rekordbox / VirtualDJ

### Rekordbox
- **DB**: SQLite en `~/Library/Pioneer/rekordbox/` (Mac) o ruta equivalente (Windows)
- **Estructura**: tablas para tracks, playlists, carpetas
- **Acción**: leer playlists existentes, actualizar rutas, añadir/ordenar tracks
- Documentación oficial de Pioneer para schema de DB

### VirtualDJ
- **Playlists**: formato M3U, estructura de carpetas
- **Acción**: generar/actualizar playlists en rutas conocidas

### Flujo de integración
1. Detectar instalación de Rekordbox/VirtualDJ
2. Leer DB o playlists para conocer librería actual
3. Tras organización: actualizar rutas, crear nuevas playlists
4. Opcional: respaldar DB antes de modificar

---

## AI Recommendation (sets)

**Input del usuario** (ej. chat):
> "Sesión de 3h de house, incrementando intensidad. 20 warmup, 20 mover, 20 peak, 10 cierre."

**Proceso**:
1. IA recibe librería (metadata ya etiquetada: género, intensidad, BPM, key)
2. Filtra por criterios
3. Ordena por intensidad y compatibilidad (key match)
4. Genera carpetas/playlists con las canciones seleccionadas
5. Opcional: sugiere crossfades, puntos de mix

**Output**: 4 carpetas (warmup, mover, peak, cierre) con canciones listas para importar.

---

## AI Mix Suggestion

**Input**: 2 canciones seleccionadas por el usuario.

**Proceso**:
1. Analizar: BPM, key, estructura (intro, drop, outro), duración
2. Evaluar compatibilidad (Camelot wheel, rango BPM)
3. LLM o reglas: proponer tipo de mix (blend, drop swap, etc.)
4. Generar pasos concretos: "En el minuto X de A, entra el minuto Y de B..."
5. UI de pasos para guiar al DJ

**Output**: Lista de pasos + tipo de transición sugerido.

---

## Stack tecnológico sugerido

- **Electron** o **Tauri** (Rust) para app multiplataforma
- **Node/Python** para procesamiento de audio (igual que web)
- **SQLite** local para config y caché
- **LLM**: API remota (OpenAI, etc.) o modelo local (Ollama, llama.cpp) para privacidad
- **FFmpeg** / **librosa** para análisis de audio

---

## Consideraciones

- **Privacidad**: Procesar localmente cuando sea posible. Solo enviar a LLM lo mínimo (metadata, no audio crudo, salvo que el usuario acepte).
- **Permisos**: La app necesita acceso a carpetas de música y a la DB de Rekordbox.
- **Robustez**: Backup de DB antes de modificar. Permitir rollback.
