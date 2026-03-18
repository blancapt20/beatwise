# Arquitectura técnica – Beatwise Assistant

Índice de documentación de arquitectura por fase.

---

## Documentos por fase

| Fase | Documento | Descripción |
|------|-----------|-------------|
| **Fase 0** | [ARQUITECTURA-FASE-0.md](ARQUITECTURA-FASE-0.md) | Validación / Proof of Concept. Sin auth. Subir → procesar → descargar. |
| **Fase 1** | [ARQUITECTURA-FASE-1.md](ARQUITECTURA-FASE-1.md) | MVP Web con usuarios. Auth, organización, export para Rekordbox/VirtualDJ. |
| **Fase 2** | [ARQUITECTURA-FASE-2.md](ARQUITECTURA-FASE-2.md) | Desktop. AI Recommendation, AI Mix, integración local con software DJ. |

---

## Principio general de almacenamiento

**No guardar archivos de audio de forma persistente en servidor.**

| Fase | Archivos de audio | Auth | Persistencia |
|------|-------------------|------|--------------|
| 0 | Temp, borrar tras procesar | No | Ninguna |
| 1 | Temp, borrar tras procesar | Sí | Analytics, usuarios |
| 2 | Local (filesystem del usuario) | Sí | Config local, Rekordbox |

En Fase 0 y 1: procesar en disco temporal y permitir descarga. En Fase 2, la app accede directo al filesystem del usuario.
