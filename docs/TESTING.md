# Testing – Beatwise

Estrategia de pruebas para frontend y backend.

---

## Principios

- **Tests unitarios** para lógica de negocio y utils
- **Tests de integración** para API y pipeline
- **Tests E2E** (opcional Fase 0) para flujo crítico: subir → descargar

---

## Frontend (Vitest)

### Estructura

```
frontend/src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx
├── hooks/
│   └── useUpload.test.ts
└── __tests__/
    └── setup.ts
```

### Qué probar

- Componentes: render, interacciones, estados
- Hooks: lógica de estado, llamadas API
- Utils: pureza, casos borde
- Integración: flujo de subida con mock del backend

### Ejemplo

```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Upload</Button>)
    expect(screen.getByText('Upload')).toBeInTheDocument()
  })
})
```

### Comandos

```bash
npm run test          # run
npm run test:watch    # watch mode
npm run test:coverage # coverage
```

---

## Backend (pytest)

### Estructura

```
backend/
├── app/
│   ├── services/
│   │   ├── validation.py
│   │   └── validation_test.py  # o tests/services/test_validation.py
│   └── api/
└── tests/
    ├── conftest.py       # fixtures
    ├── test_api.py       # endpoints
    └── test_pipeline.py  # pipeline integration
```

### Qué probar

- **Units**: `validation`, `normalization`, `tagging` – inputs/salidas, mocks de LLM
- **API**: FastAPI TestClient, status codes, respuesta de upload/status/download
- **Pipeline**: flujo completo con archivos de prueba pequeños (fixtures)

### Fixtures

```python
# tests/conftest.py
@pytest.fixture
def sample_mp3(tmp_path):
    # Crear o copiar un MP3 de prueba pequeño
    return tmp_path / "test.mp3"

@pytest.fixture
def mock_llm(monkeypatch):
    # Mock de LLM para no gastar API
    ...
```

### Comandos

```bash
pytest
pytest -v
pytest --cov=app
pytest -k "test_validation"
```

---

## Tests de integración API

### Endpoints a cubrir

| Endpoint | Test |
|----------|------|
| `POST /api/upload` | 200, session_id; 413 si excede límite |
| `GET /api/status/{id}` | 200, estados pending/processing/ready |
| `GET /api/download/{id}` | 200, zip; 404 si no existe |

### Ejemplo

```python
def test_upload_returns_session_id(client, sample_mp3):
    with open(sample_mp3, "rb") as f:
        response = client.post("/api/upload", files={"file": f})
    assert response.status_code == 200
    assert "session_id" in response.json()
```

---

## Tests E2E (opcional)

- **Herramienta**: Playwright o Cypress
- **Scope**: subir archivo → esperar procesamiento → descargar ZIP
- **Ambiente**: requiere backend y frontend levantados (Docker Compose o CI)

---

## Cobertura objetivo

- **Fase 0**: >60% en services críticos (validation, tagging)
- **Fase 1+**: >70%, incluir API y componentes clave

---

## Archivos de prueba

- Guardar MP3/WAV de prueba pequeños en `backend/tests/fixtures/` (o comprimidos)
- No commitear archivos grandes. Usar `git lfs` si hace falta para fixtures.
