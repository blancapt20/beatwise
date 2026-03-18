# Quick Start Guide - BeatWise Frontend

## Getting Started in 3 Steps

### 1. Install Dependencies

```bash
cd frontend
pnpm install
```

### 2. Start Development Server

```bash
pnpm dev
```

### 3. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

---

## What You'll See

A fully functional Next.js landing page with:
- ✅ Header with navigation and dark/light mode toggle
- ✅ Hero section with CTAs
- ✅ Problem statement (3 cards)
- ✅ Solution overview (3 steps)
- ✅ Core features (3 sections with images)
- ✅ Social proof (stats + testimonials)
- ✅ Final CTA section
- ✅ Footer with links

---

## Production Build

To create an optimized production build:

```bash
pnpm build
pnpm start
```

---

## Tech Stack

- **Next.js 15** with App Router
- **React 19**
- **TypeScript 5**
- **Tailwind CSS v4**

---

## File Structure

All components are organized by feature in `frontend/features/`:
- `landing/components/` - Landing page components

Shared components in `frontend/components/`:
- `ui/` - UI primitives (Button, Input)
- `layout/` - Layout components (Header, Footer)

Main page is at `frontend/app/page.tsx`

---

## Design System

See `frontend/app/globals.css` for:
- Color variables (dark & light mode)
- Typography classes
- Spacing system

---

## Documentation

- Frontend README: `frontend/README.md`
- Architecture Guide: `frontend/ARCHITECTURE.md`
- Quick Reference: `frontend/ARCHITECTURE-QUICK.md`
- Setup Details: `frontend/SETUP.md`
- Main Project README: `README.md`
