# Beatwise Assistant – Documentación del MVP

## Resumen ejecutivo

**Beatwise Assistant** es una capa intermedia que ayuda a DJs a ahorrar tiempo en la preparación de su librería: validación y organización de ficheros y sets usando IA y workflows automáticos. Automatiza todo el proceso entre la descarga de las canciones y el inicio de la sesión.

---

## Objetivo principal

> Ayudar a DJs a ahorrar tiempo en la preparación de su librería, validación y organización de ficheros y de sets usando IA y workflows automáticos.

Beatwise es una capa intermedia que automatiza:
- La descarga de canciones → Validación → Organización → Preparación del Set

---

## Funcionalidades

### 1. Subida

El usuario sube la carpeta donde ha descargado música durante el día.

- **Reconocimiento de formatos** soportados (MP3, WAV, FLAC, etc.)
- **Validación básica** para ver si el archivo se puede procesar
- **Detección de archivos corruptos** o que no son legibles

### 2. Verificación de calidad

Control de calidad del audio para garantizar estándares mínimos:

| Verificación | Descripción |
|--------------|-------------|
| **Fakin' the Funk** | Detectar si el bitrate real corresponde al indicado en metadatos |
| **Artefactos** | Defectos de audio por compresiones muy agresivas |
| **Clipping** | Si supera el límite de volumen máximo representable en el archivo digital |
| **Alertas** | Para archivos que no cumplen el estándar mínimo |

### 3. Normalización de volumen

- **Cálculo de RMS** general de cada pista
- **Ajuste automático** para que todas las pistas estén dentro de un rango uniforme
- **Consideración**: subir volumen en una pista con nivel bajo puede afectar a la calidad; debe evaluarse caso por caso

### 4. Etiquetado automático

Completar metadatos ID3 (IA):

- **Básicos**: artista, título, género
- **DJ**: BPM, key
- **Extracción**: usar metadatos existentes cuando ya existen
- **IA**: generar vía LLM cuando falta información
- **Etiquetas internas** para sesiones: "intensidad", "mood", etc.

### 5. Organización *(Fase 1 y 2)*

Inspirado en el modelo de Soulseek: acceso a carpetas y la IA las organiza según las tags.

**Requisito**: las tags deben estar muy bien definidas.

**Criterios de organización**:
- Género
- Subgénero
- Intensidad
- Criterio definido por el usuario

### 6. AI Recommendation para crear sesiones *(Fase 2)*

Chatbot que recibe indicaciones del usuario, por ejemplo:

> *"Quiero hacer una sesión de 3 horas de X tipo de música que vaya incrementando la intensidad. Créame tres carpetas de canciones donde haya: 20 de warmup, 20 para empezar a mover el culo, 20 para el momento en que todo el mundo ya está borracho y dándolo todo, y 10 para el cierre."*

### 7. AI Mix Recommendation *(Fase 2)*

Análisis de dos canciones concretas para proponer cómo mezclarlas:

- **Análisis de compatibilidad**
- **Propuestas** de tipo de mix
- **Pasos** para ejecutarlos
- **UI de pasos** para guiar al DJ

---

## Fases de desarrollo

### Fase 0 (Validación / Proof of Concept) – Web

**Objetivo**: validar que el producto aporta valor con el mínimo esfuerzo posible.

**Plataforma**: Web app.

**Funcionalidades incluidas**: 1, 2, 3 y 4 (subida, verificación, normalización, etiquetado).

**Características**:
- **Sin usuarios ni autenticación**
- **Sin persistencia**: subir → procesar en memoria/disco temporal → descargar resultado
- **Cookie opcional** para sesión anónima, analytics básicos o rate limiting
- **Sin AWS**: disco local del servidor suficiente

**Flujo de uso**:
1. Subir carpetas/archivos
2. Análisis de calidad + normalización + etiquetado
3. **Descarga** del resultado (archivos procesados con tags, reporte de calidad)

**Criterio de éxito**: si hay adopción y uso repetido → evolucionar a Fase 1.

---

### Fase 1 (MVP con usuarios) – Web

**Objetivo**: producto con seguimiento de usuarios y funcionalidad completa del pipeline web.

**Plataforma**: Web app.

**Funcionalidades incluidas**: 1, 2, 3, 4 y 5 (añade organización).

**Características**:
- **Auth** simple (registro/login)
- **Tracking/analytics** de uso por usuario (no se guardan archivos de audio)
- **Organización** de carpetas y playlists para Rekordbox/VirtualDJ

**Flujo de uso**:
1. Subir carpetas/archivos
2. Análisis de calidad + normalización
3. Etiquetado y organización
4. **Descarga** de la librería organizada lista para Rekordbox / VirtualDJ

---

### Fase 2 (IA avanzada) – Desktop

**Objetivo**: diferenciación con inteligencia creativa e integración total.

**Plataforma**: Launcher / Desktop App (usuarios avanzados).

**Funcionalidades incluidas**: 6 y 7 + todas las de Fase 1.

**Características adicionales**:
- IA para generar sets
- Recomendaciones de mezcla
- Integración total con carpetas locales y Rekordbox

---

## Almacenamiento

| Aspecto | Fase 0 | Fase 1 | Fase 2 |
|---------|--------|--------|--------|
| **Archivos de audio** | Temp, borrar tras procesar | Temp, borrar tras procesar | Local (filesystem del usuario) |
| **Auth / Usuarios** | No | Sí | Sí |
| **Persistencia** | Ninguna | Analytics y métricas de uso | Local + integración Rekordbox |
| **Cloud (S3, etc.)** | No | No necesario | No |

**Principio**: no guardar archivos de audio de forma persistente. Solo procesar en temporal y permitir descarga. En Fase 2, el usuario tiene sus archivos locales y la app accede directamente al filesystem.

---

## Arquitectura

### Fase 0 – Flujo Web (validación)

```
Usuario (anónimo) → Web App → Backend (Server)
          │
          ▼
  1. Subida de carpetas/archivos
          │
          ▼
  2. Validación de calidad
  3. Normalización de volumen (opcional)
  4. Etiquetado automático
          │
          ▼
  5. Descarga ZIP con archivos procesados + reporte
          │
          ▼
  [Borrado de archivos temporales]
```

### Fase 1 – Flujo Web (MVP completo)

```
Usuario → Web App → Backend (Server)
          │
          ▼
  1. Subida de carpetas/archivos
          │
          ▼
  2. Validación de calidad
     • Bitrate real
     • Clipping
     • Artefactos
     • Volumen/RMS
          │
          ▼
  3. Normalización de volumen (opcional)
          │
          ▼
  4. Etiquetado automático
     • Extrae metadatos si existen
     • Llama a LLM para completar tags
       (Artista, Título, Género, BPM, Key, Mood/Intensidad)
          │
          ▼
  5. Organización de carpetas y playlists
     • Basado en tags
     • Genera estructura lista para Rekordbox/VirtualDJ
          │
          ▼
  6. Export
     • Descarga ZIP o carpeta final organizada
```

### Fase 2 – Flujo Desktop

```
Usuario → Launcher/Desktop App
          │
          ▼
  1. Acceso directo a carpetas locales
          │
          ▼
  2. Procesamiento local:
     • Validación (clipping, artefactos, RMS)
     • Normalización de volumen
          │
          ▼
  3. Etiquetado automático
     • LLM (API o modelo local)
          │
          ▼
  4. Organización
     • Reescribe carpetas y playlists directamente en filesystem
          │
          ▼
  5. Integración con Rekordbox/VirtualDJ
     • Lectura de DB o playlists
          │
          ▼
  6. AI Recommendation / Mix Suggestion
     • IA analiza librería y genera sets
     • Sugerencias de crossfade, key match, BPM match
          │
          ▼
  7. Export / Aplicación directa de cambios en software DJ
```

---

## Decisiones técnicas por fase

| Funcionalidad | Fase 0 (Validación) | Fase 1 (Web MVP) | Fase 2 (Desktop) |
|---------------|:-------:|:-----------------:|:-----------------:|
| Subida / descarga | ✅ | ✅ | ✅ (directo) |
| Auth / usuarios | ❌ | ✅ | ✅ |
| Acceso a carpetas locales | ❌ | ❌ | ✅ |
| Validación de calidad | ✅ | ✅ | ✅ |
| Normalización de volumen | ✅ | ✅ | ✅ |
| Etiquetado automático | ✅ | ✅ (LLM API) | ✅ (API o local) |
| Organización de carpetas | ❌ | ✅ (export) | ✅ (directo FS) |
| AI Recommendations / Mix | ❌ | ❌ | ✅ |
| Integración Rekordbox/VirtualDJ | ❌ | ❌ | ✅ |
| Cloud (S3, etc.) | No | No necesario | No |

---

## Stack tecnológico sugerido (referencia)

Para Fase 0 y Fase 1 (Web):

- **Frontend**: SPA (React/Vue/Svelte) con drag-and-drop para subida
- **Backend**: API REST o similar para procesamiento
- **Procesamiento de audio**: bibliotecas como `librosa`, `essentia`, `mutagen` (Python) o `audiowaveform`, `ffmpeg`
- **LLM**: API (OpenAI, Anthropic, etc.) para etiquetado automático
- **Almacenamiento temporal**: disco local del servidor (`/tmp` o carpeta dedicada). Sin S3 ni cloud para el MVP.
- **Export**: generación de ZIP (archivos procesados en Fase 0; estructura organizada en Fase 1)

Para la app Desktop (Fase 2):

- **Electron** o **Tauri** para app multiplataforma
- **Acceso directo al filesystem**
- **Integración**: lectura de bases de datos de Rekordbox (SQLite) y formatos de playlist estándar

---

## Glosario

| Término | Significado |
|---------|-------------|
| **Fakin' the Funk** | Archivo que declara un bitrate superior al real (ej. 320kbps cuando es 128kbps) |
| **Clipping** | Distorsión por superar el rango dinámico del formato digital |
| **RMS** | Root Mean Square – medida de nivel promedio de audio |
| **ID3** | Estándar de metadatos en archivos MP3 |
| **Key** | Tonalidad musical de una pista (ej. Am, Cmaj) |

---

## Próximos pasos

**Fase 0**:
1. Implementar pipeline: subida → validación → normalización → etiquetado → descarga
2. Procesamiento en disco temporal, borrado tras descarga
3. Cookie opcional para analytics anónimos
4. Desplegar y validar con usuarios reales

**Fase 1** (cuando Fase 0 valide):
1. Añadir auth y modelo de usuario
2. Implementar organización de carpetas (funcionalidad 5)
3. Persistir analytics de uso (sin archivos de audio)
4. Diseño de UX para subida, progreso y descarga

**Fase 2** (cuando Fase 1 esté consolidada):
1. Desarrollo de app Desktop (Electron/Tauri)
2. Integración Rekordbox/VirtualDJ
3. AI Recommendation para sets
4. AI Mix Suggestion
