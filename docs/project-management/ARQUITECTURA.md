# Technical Architecture – BeatWise Assistant

Architecture documentation index by phase.

---

## Documents by Phase

| Phase | Document | Description |
|------|-----------|-------------|
| **Phase 0** | [ARQUITECTURA-FASE-0.md](ARQUITECTURA-FASE-0.md) | Validation / Proof of Concept. No auth. Upload → process → download. |
| **Phase 1** | [ARQUITECTURA-FASE-1.md](ARQUITECTURA-FASE-1.md) | Web MVP with users. Auth, organization, export for Rekordbox/VirtualDJ. |
| **Phase 2** | [ARQUITECTURA-FASE-2.md](ARQUITECTURA-FASE-2.md) | Desktop. AI Recommendation, AI Mix, local integration with DJ software. |

---

## General Storage Principle

**Do not persistently store audio files on server.**

| Phase | Audio Files | Auth | Persistence |
|------|-------------------|------|--------------|
| 0 | Temp, delete after processing | No | None |
| 1 | Temp, delete after processing | Yes | Analytics, users |
| 2 | Local (user filesystem) | Yes | Local config, Rekordbox |

In Phase 0 and 1: process in temp disk and allow download. In Phase 2, app directly accesses user filesystem.
