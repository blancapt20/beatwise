# BeatWise – Brand and UI Guide

Brand context and design decisions for interface development.

---

## Identity

| Element | Value |
|----------|-------|
| **Name** | BeatWise |
| **Tagline** | *Know your beats, prep your sets* |

---

## Color Palette

| Use | Color | Hex | UI Usage |
|-----|-------|-----|-----------|
| **Main background** | Deep black | `#1C1C1C` | Body, screen backgrounds, cards |
| **Buttons / accents** | Electric orange | `#FF6F00` | CTAs, primary links, interactive elements |
| **Highlights / hover / icons** | Warm yellow | `#FFD600` | Button hover, active icons, highlights |
| **Primary text** | White | `#FFFFFF` | Titles, important text |
| **Secondary text** | Light gray | `#E0E0E0` | Descriptions, subtitles, labels |

### State Colors

| State | Hex | Usage |
|--------|-----|-----|
| **Success** | `#4CAF50` | Positive feedback (e.g. "Processed"), readable on black/white |
| **Error** | `#E53935` | Alerts, failed validation |
| **Warning** | `#FFB300` | Warnings (e.g. "Fakin' the Funk"), complements orange palette |
| **Info** | `#2196F3` | Optional: hints, notifications |
| **Disabled button** | `#6B6B6B` | Medium gray, don't use muted orange |

---

## Typography

| Use | Font | Style |
|-----|--------|--------|
| **Titles** | Bebas Neue | Condensed, bold, musical character |
| **Secondary text / body** | Roboto | Readable, clean, modern |

*Look*: modern and musical. Bebas Neue brings impact to headlines; Roboto keeps body text comfortable to read.

---

## Spacing and Scale

**Base unit**: 8px (modular unit).

**Scale**: 8, 16, 24, 32, 48, 64 (padding, margins and typography).

| Example | Value |
|---------|-------|
| Margin between cards | 16px |
| Button padding | 12px vertical × 24px horizontal |
| Body line-height | 1.5 |

---

## Border Radius

| Component | Radius |
|------------|--------|
| Most (buttons, inputs) | 8px |
| Cards / modals | 12px |
| Secondary buttons | 6px |

---

## Shadows

Yes, subtle. They add depth without removing modernity.

| Use | Value |
|-----|-------|
| Card | `0 4px 12px rgba(0,0,0,0.15)` |
| Button hover | `0 6px 20px rgba(255,111,0,0.25)` |

---

## Iconography

- **Style**: Linear and modern, consistent with musical web
- **Libraries**: Lucide (priority) or Feather Icons – both clean and flexible
- **Extra**: Animatable icons for states (hover, click)

---

## Key Components

| Component | Base color | Hover | Disabled state |
|------------|------------|-------|----------------------|
| Primary button | `#FF6F00` | `#FFD600` or light orange | `#6B6B6B` |
| Secondary button | Gray border / transparent | Soft gray background | Reduced opacity |
| Input / field | Border `#E0E0E0` or `#6B6B6B` | Border `#FF6F00` on focus | - |
| Link | `#FF6F00` | `#FFD600` | - |
| Icon | `#E0E0E0` | `#FFD600` | `#6B6B6B` |

---

## Animations and Transitions

- **Duration**: 200–300ms for hover / feedback
- **Easing**: `ease-in-out` on interactions

| Element | Animation |
|----------|-----------|
| Button hover | Light scale 1.05x + color change |
| Card hover | Shadow + translateY 2px |
| Load / fade-in | opacity 0 → 1, 400ms |

---

## Logo

**Concept**: Typographic with playful personality.

- "BeatWise" in Bebas Neue
- Light tilt on W and B
- Wave or beat symbol on the I

**Variants**:
- **Horizontal**: web / app header
- **Vertical / square**: app icon, footer
- **Monochrome** (white / black): print, merchandise

---

## Favicon

- Simple logo variant: BW with wave on I or abstract beat icon
- **Sizes**: 32×32 px and 16×16 px
- **Colors**: black / orange background for readability

---

## Accessibility

- **Contrast**: Verify that `#E0E0E0` and `#FFFFFF` on `#1C1C1C` meet WCAG AA (minimum 4.5:1 for normal text).
- **Visible focus**: Orange or yellow outline on interactive elements.
- **Button text**: White on orange (`#FF6F00`) – check contrast.

---

## Decision Checklist

- [x] Typography: Bebas Neue (titles) + Roboto (body)
- [x] Base spacing (8px) and scale (8, 16, 24, 32, 48, 64)
- [x] Border radius (8px standard, 12px cards, 6px secondary)
- [x] Subtle shadows (cards, button hover)
- [x] Icons: Lucide / Feather, linear and modern
- [x] State colors (success, error, warning, info)
- [x] Animations: 200–300ms, ease-in-out
- [x] Logo: typographic concept, variants
- [x] Favicon: BW + wave, 32×32 and 16×16

---

## Summary for CSS / Tailwind

```css
/* Reference variables */
--beatwise-bg: #1C1C1C;
--beatwise-primary: #FF6F00;
--beatwise-accent: #FFD600;
--beatwise-text: #FFFFFF;
--beatwise-text-muted: #E0E0E0;

/* States */
--beatwise-success: #4CAF50;
--beatwise-error: #E53935;
--beatwise-warning: #FFB300;
--beatwise-info: #2196F3;

/* Typography */
--beatwise-font-title: 'Bebas Neue', sans-serif;
--beatwise-font-body: 'Roboto', sans-serif;

/* Spacing (base 8px) */
--beatwise-space: 8px;
--beatwise-radius: 8px;
--beatwise-radius-card: 12px;
--beatwise-radius-sm: 6px;

/* Shadows */
--beatwise-shadow-card: 0 4px 12px rgba(0,0,0,0.15);
--beatwise-shadow-button-hover: 0 6px 20px rgba(255,111,0,0.25);

/* Transitions */
--beatwise-transition: 200ms ease-in-out;
```
