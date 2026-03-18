# CI/CD – Beatwise

Estrategia de integración continua y despliegue.

---

## Objetivos

- **Lint y format**: código consistente en cada push
- **Tests**: unitarios y de integración antes de merge
- **Build**: verificar que frontend y backend compilan
- **Deploy**: automático a staging/preview; manual a producción (Fase 0)

---

## Pipeline propuesto (GitHub Actions)

### On push / PR a `main` o `develop`

```
1. Lint
   - Frontend: ESLint, Prettier
   - Backend: Ruff, Black o Ruff format

2. Tests
   - Frontend: Vitest (unit)
   - Backend: pytest

3. Build
   - Frontend: npm run build
   - Backend: verificar imports (no build en Python)
```

### On merge a `main`

```
4. Deploy staging (opcional)
   - Vercel / Netlify para frontend
   - Railway / Fly.io / Render para backend
```

---

## Workflows sugeridos

### `.github/workflows/ci.yml`

- Triggers: push, pull_request a main/develop
- Jobs: lint, test, build
- Matriz: Node 18, 20; Python 3.10, 3.11

### `.github/workflows/deploy.yml` (Fase 1+)

- Trigger: push a main
- Deploy frontend y backend a staging
- Opcional: aprobación manual para producción

---

## Ramas

| Rama | Uso |
|------|-----|
| `main` | Código estable, listo para producción |
| `develop` | Integración de features |
| `feature/*` | Nuevas funcionalidades |
| `fix/*` | Correcciones |

---

## Checklist para PRs

- [ ] Tests pasan
- [ ] Lint sin errores
- [ ] Build OK
- [ ] Sin secrets en código
- [ ] Documentación actualizada si aplica

---

## Secretos y variables

### GitHub Secrets (no commitear)

- `OPENAI_API_KEY` o equivalente – etiquetado LLM
- `VERCEL_TOKEN` / `NETLIFY_TOKEN` – deploy frontend
- `RAILWAY_TOKEN` o similar – deploy backend

### Variables de entorno (non-secret)

- `NODE_VERSION`
- `PYTHON_VERSION`
- URLs de staging/producción

---

## Comandos locales (pre-commit)

Ejecutar antes de push:

```bash
# Frontend
cd frontend && npm run lint && npm run test

# Backend
cd backend && ruff check . && pytest
```

Considerar pre-commit hooks (husky + lint-staged) para validar antes de commit.
