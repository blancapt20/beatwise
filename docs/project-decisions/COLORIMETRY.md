# BeatWise - Colorimetry Guide

Unified color system for BeatWise brand identity and theme behavior (dark/light).

---

## 1) Color Identity

### Core Brand Colors

| Use | Color | Hex |
|-----|-------|-----|
| Main background (dark identity) | Deep black | `#1C1C1C` |
| Primary accent / CTA | Electric orange | `#FF6F00` |
| Highlight / hover / active icons | Warm yellow | `#FFD600` |
| Primary text on dark | White | `#FFFFFF` |
| Secondary text on dark | Light gray | `#E0E0E0` |

### UI State Colors

| State | Hex | Usage |
|-------|-----|-------|
| Success | `#4CAF50` | Positive actions and confirmations |
| Error | `#E53935` | Validation and error messages |
| Warning | `#FFB300` | Cautionary feedback |
| Info | `#2196F3` | Informational messages |
| Disabled | `#6B6B6B` | Disabled controls (never muted orange) |

---

## 2) Theme System (Dark/Light)

BeatWise supports two themes via a header toggle:

- Dark mode (default)
- Light mode

Theme state is persisted in `localStorage` with:

- Key: `theme`
- Values: `dark` or `light`

The active theme is applied through the `data-theme` attribute on `<html>`:

- `<html data-theme="dark">`
- `<html data-theme="light">`

---

## 3) Semantic Color Tokens by Theme

### Dark Mode (Default)

| Purpose | Token | Color |
|---------|-------|-------|
| Primary background | `--color-bg-primary` | `#1A1A1A` |
| Secondary background | `--color-bg-secondary` | `#212121` |
| Elevated background | `--color-bg-elevated` | `#2D2D2D` |
| Primary text | `--color-text-primary` | `#FFFFFF` |
| Secondary text | `--color-text-secondary` | `#777777` |
| Orange accent | `--color-accent-orange` | `#FF6F00` |
| Teal accent | `--color-accent-teal` | `#00D4AA` |

### Light Mode

| Purpose | Token | Color |
|---------|-------|-------|
| Primary background | `--color-bg-primary` | `#FFFFFF` |
| Secondary background | `--color-bg-secondary` | `#F5F5F5` |
| Elevated background | `--color-bg-elevated` | `#E8E8E8` |
| Primary text | `--color-text-primary` | `#1A1A1A` |
| Secondary text | `--color-text-secondary` | `#666666` |
| Orange accent | `--color-accent-orange` | `#FF6F00` |
| Teal accent | `--color-accent-teal` | `#00D4AA` |

Note: Accent colors remain unchanged between themes to preserve visual identity.

---

## 4) Component Color Rules

| Component | Default | Hover/Active | Disabled |
|-----------|---------|--------------|----------|
| Primary button | `#FF6F00` | `#FFD600` | `#6B6B6B` |
| Secondary button | Transparent + gray border | Soft gray background | Reduced opacity |
| Input / field | `#E0E0E0` or `#6B6B6B` border | Orange focus border (`#FF6F00`) | N/A |
| Links | `#FF6F00` | `#FFD600` | N/A |
| Icons | `#E0E0E0` | `#FFD600` | `#6B6B6B` |

---

## 5) Transitions and Behavior

- Theme transition timing: `0.3s ease` for background and text.
- Interaction feedback timing (buttons/cards): `200-300ms ease-in-out`.
- All theme-sensitive colors should come from CSS variables, not hardcoded values in components.

---

## 6) Accessibility Requirements

- Maintain WCAG AA contrast at minimum (target 4.5:1 for normal text).
- Keep focus indicators clearly visible (orange or yellow outlines).
- Ensure text remains readable in both themes on every screen/state.
- Keep toggle keyboard-accessible and labeled (`aria-label="Toggle theme"`).

---

## 7) CSS Variable Reference (Unified)

```css
/* Brand identity tokens */
--beatwise-bg: #1C1C1C;
--beatwise-primary: #FF6F00;
--beatwise-accent: #FFD600;
--beatwise-text: #FFFFFF;
--beatwise-text-muted: #E0E0E0;

/* State tokens */
--beatwise-success: #4CAF50;
--beatwise-error: #E53935;
--beatwise-warning: #FFB300;
--beatwise-info: #2196F3;
--beatwise-disabled: #6B6B6B;

/* Theme semantic tokens (example names) */
--color-bg-primary: ...;
--color-bg-secondary: ...;
--color-bg-elevated: ...;
--color-text-primary: ...;
--color-text-secondary: ...;
--color-accent-orange: #FF6F00;
--color-accent-teal: #00D4AA;

/* Motion */
--beatwise-transition: 200ms ease-in-out;
```

---

## 8) Implementation Notes

- The toggle is placed in the header top-right area.
- Use sun/moon icon swap to communicate current mode.
- Theme selection must persist across reloads and sessions.
- Avoid flash of incorrect theme on initial load by applying stored theme as early as possible.
