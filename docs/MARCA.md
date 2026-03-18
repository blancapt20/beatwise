# Beatwise – Guía de marca y UI

Contexto de marca y decisiones de diseño para el desarrollo de la interfaz.

---

## Identidad

| Elemento | Valor |
|----------|-------|
| **Nombre** | BeatWise |
| **Tagline** | *Know your beats, prep your sets* |

---

## Paleta de color

| Uso | Color | Hex | Uso en UI |
|-----|-------|-----|-----------|
| **Fondo principal** | Negro profundo | `#1C1C1C` | Body, fondos de pantalla, cards |
| **Botones / acentos** | Naranja eléctrico | `#FF6F00` | CTAs, links primarios, elementos interactivos |
| **Destacados / hover / iconos** | Amarillo cálido | `#FFD600` | Hover sobre botones, iconos activos, highlights |
| **Texto principal** | Blanco | `#FFFFFF` | Títulos, texto importante |
| **Texto secundario** | Gris claro | `#E0E0E0` | Descripciones, subtítulos, labels |

### Colores de estados

| Estado | Hex | Uso |
|--------|-----|-----|
| **Éxito** | `#4CAF50` | Feedback positivo (ej. "Procesado"), legible sobre negro/blanco |
| **Error** | `#E53935` | Alertas, validación fallida |
| **Warning** | `#FFB300` | Avisos (ej. "Fakin' the Funk"), complementa la paleta naranja |
| **Info** | `#2196F3` | Opcional: hints, notificaciones |
| **Botón deshabilitado** | `#6B6B6B` | Gris medio, no usar naranja apagado |

---

## Tipografía

| Uso | Fuente | Estilo |
|-----|--------|--------|
| **Títulos** | Bebas Neue | Condensada, bold, carácter musical |
| **Texto secundario / cuerpo** | Roboto | Legible, limpia, moderna |

*Look*: moderno y musical. Bebas Neue aporta impacto en headlines; Roboto mantiene la lectura cómoda en cuerpo de texto.

---

## Espaciado y escala

**Unidad base**: 8px (unidad modular).

**Escala**: 8, 16, 24, 32, 48, 64 (padding, márgenes y tipografía).

| Ejemplo | Valor |
|---------|-------|
| Margen entre cards | 16px |
| Padding de botones | 12px vertical × 24px horizontal |
| Line-height body | 1.5 |

---

## Border radius

| Componente | Radius |
|------------|--------|
| Mayoría (botones, inputs) | 8px |
| Cards / modales | 12px |
| Botones secundarios | 6px |

---

## Sombras

Sí, sutiles. Dan profundidad sin quitar modernidad.

| Uso | Valor |
|-----|-------|
| Card | `0 4px 12px rgba(0,0,0,0.15)` |
| Botón hover | `0 6px 20px rgba(255,111,0,0.25)` |

---

## Iconografía

- **Estilo**: Lineal y moderno, consistente con web musical
- **Librerías**: Lucide (prioritaria) o Feather Icons – ambas limpias y flexibles
- **Extra**: Iconos animables para estados (hover, click)

---

## Componentes clave

| Componente | Color base | Hover | Estado deshabilitado |
|------------|------------|-------|----------------------|
| Botón primario | `#FF6F00` | `#FFD600` o naranja claro | `#6B6B6B` |
| Botón secundario | Borde gris / transparente | Fondo gris suave | Opacidad reducida |
| Input / campo | Borde `#E0E0E0` o `#6B6B6B` | Borde `#FF6F00` en focus | - |
| Link | `#FF6F00` | `#FFD600` | - |
| Icono | `#E0E0E0` | `#FFD600` | `#6B6B6B` |

---

## Animaciones y transiciones

- **Duración**: 200–300ms para hover / feedback
- **Easing**: `ease-in-out` en interacciones

| Elemento | Animación |
|----------|-----------|
| Hover botón | Escala ligera 1.05x + cambio de color |
| Hover card | Sombra + translateY 2px |
| Carga / fade-in | opacity 0 → 1, 400ms |

---

## Logo

**Concepto**: Tipográfico con personalidad traviesa.

- "BeatWise" en Bebas Neue
- Ligero tilt en W y B
- Wave o símbolo de beat en la I

**Variantes**:
- **Horizontal**: header web / app
- **Vertical / cuadrado**: icono de app, footer
- **Monocromo** (blanco / negro): imprimir, merchandising

---

## Favicon

- Variante simple del logo: BW con wave en la I o icono abstracto de beat
- **Tamaños**: 32×32 px y 16×16 px
- **Colores**: fondo negro / naranja para legibilidad

---

## Accesibilidad

- **Contraste**: Verificar que `#E0E0E0` y `#FFFFFF` sobre `#1C1C1C` cumplan WCAG AA (mínimo 4.5:1 para texto normal).
- **Focus visible**: Outline naranja o amarillo en elementos interactivos.
- **Texto en botones**: Blanco sobre naranja (`#FF6F00`) – revisar contraste.

---

## Checklist de decisiones

- [x] Tipografía: Bebas Neue (títulos) + Roboto (cuerpo)
- [x] Espaciado base (8px) y escala (8, 16, 24, 32, 48, 64)
- [x] Border radius (8px estándar, 12px cards, 6px secundarios)
- [x] Sombras sutiles (cards, botón hover)
- [x] Iconos: Lucide / Feather, lineal y moderno
- [x] Colores de estados (éxito, error, warning, info)
- [x] Animaciones: 200–300ms, ease-in-out
- [x] Logo: concepto tipográfico, variantes
- [x] Favicon: BW + wave, 32×32 y 16×16

---

## Resumen para CSS / Tailwind

```css
/* Variables de referencia */
--beatwise-bg: #1C1C1C;
--beatwise-primary: #FF6F00;
--beatwise-accent: #FFD600;
--beatwise-text: #FFFFFF;
--beatwise-text-muted: #E0E0E0;

/* Estados */
--beatwise-success: #4CAF50;
--beatwise-error: #E53935;
--beatwise-warning: #FFB300;
--beatwise-info: #2196F3;

/* Tipografía */
--beatwise-font-title: 'Bebas Neue', sans-serif;
--beatwise-font-body: 'Roboto', sans-serif;

/* Espaciado (base 8px) */
--beatwise-space: 8px;
--beatwise-radius: 8px;
--beatwise-radius-card: 12px;
--beatwise-radius-sm: 6px;

/* Sombras */
--beatwise-shadow-card: 0 4px 12px rgba(0,0,0,0.15);
--beatwise-shadow-button-hover: 0 6px 20px rgba(255,111,0,0.25);

/* Transiciones */
--beatwise-transition: 200ms ease-in-out;
```
