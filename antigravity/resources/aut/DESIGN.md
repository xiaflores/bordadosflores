---
name: Ancestral Heritage
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#594045'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8d6f75'
  outline-variant: '#e1bec4'
  surface-tint: '#b90c55'
  primary: '#9b0044'
  on-primary: '#ffffff'
  primary-container: '#c2185b'
  on-primary-container: '#ffd9df'
  inverse-primary: '#ffb1c2'
  secondary: '#b80049'
  on-secondary: '#ffffff'
  secondary-container: '#e2165f'
  on-secondary-container: '#fffbff'
  tertiary: '#93174b'
  on-tertiary: '#ffffff'
  tertiary-container: '#b33363'
  on-tertiary-container: '#ffd9e1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9df'
  primary-fixed-dim: '#ffb1c2'
  on-primary-fixed: '#3f0018'
  on-primary-fixed-variant: '#8f003f'
  secondary-fixed: '#ffd9de'
  secondary-fixed-dim: '#ffb2be'
  on-secondary-fixed: '#400014'
  on-secondary-fixed-variant: '#900038'
  tertiary-fixed: '#ffd9e1'
  tertiary-fixed-dim: '#ffb1c5'
  on-tertiary-fixed: '#3f001b'
  on-tertiary-fixed-variant: '#8b0e45'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-xl:
    fontFamily: manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: beVietnamPro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: beVietnamPro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: beVietnamPro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: beVietnamPro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-tablet: 32px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style

The design system is built to bridge the gap between ancient Bolivian weaving traditions and modern e-commerce. It targets a global audience seeking authentic, high-quality artisanal clothing while providing a premium, contemporary shopping experience.

The aesthetic follows a **Modern / Corporate** foundation infused with **Tactile** accents. It prioritizes clean layouts and heavy whitespace to let the intricate textures of the textiles breathe. The personality is respectful, sophisticated, and culturally rich. Visual interest is generated through high-quality photography and the subtle use of geometric Andean patterns as decorative backgrounds or divider elements.

## Colors

The palette is anchored by a deep, authoritative raspberry primary and supported by vibrant pinks that echo the natural dyes used in traditional Aguayos and Polleras. 

- **Primary & Secondary:** Used for brand identity, primary actions, and navigational headers.
- **Accent:** Reserved for subtle highlights, active states, and soft background washes behind product shots.
- **Neutral & Background:** A near-white background (#fefefe) ensures a "gallery" feel, while the high-contrast text (#0f0f0f) ensures maximum readability.
- **Surface:** A light grey used for container backgrounds and subtle section differentiation.

## Typography

The typography system uses **Manrope** for headlines to provide a structured, geometric, and modern feel. **Be Vietnam Pro** is used for body and label text to add a touch of warmth and approachability. 

Headlines should use tight letter-spacing for a sophisticated look, while body text maintains standard spacing for legibility. Large headlines scale down on mobile to prevent awkward wrapping, ensuring the cultural storytelling remains impactful on smaller screens.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop and tablet, transitioning to a fluid model on mobile devices.

- **Desktop (1200px+):** 12-column grid with 24px gutters and 64px side margins.
- **Tablet (768px - 1199px):** 8-column grid with 16px gutters and 32px side margins.
- **Mobile (0px - 767px):** 4-column grid with 16px gutters and 16px margins.

Spacing follows a 4px base unit. Vertical rhythm is maintained through consistent padding on sections (80px on desktop, 48px on mobile) to ensure the interface feels spacious and premium.

## Elevation & Depth

This design system utilizes **Tonal Layers** combined with **Ambient Shadows** to create a sense of organized depth.

- **Surface 0 (Background):** #fefefe, the base level.
- **Surface 1 (Cards/Inputs):** White (#ffffff) with a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.04)).
- **Surface 2 (Floating/Modals):** White (#ffffff) with a more defined shadow (0px 8px 30px rgba(0,0,0,0.08)).

Backdrop blurs (12px) are used specifically for navigation bars and overlays to maintain context while focusing user attention.

## Shapes

The design system employs a **Rounded** (Level 2) shape language. This provides a soft, friendly counterpoint to the sharp geometric patterns found in traditional textiles. 

Buttons and input fields use a 0.5rem (8px) radius. Larger containers like product cards use a 1rem (16px) radius, while featured promotional banners use a 1.5rem (24px) radius to stand out.

## Components

### Buttons
- **Primary:** Solid #c2185b with white text. High emphasis.
- **Secondary:** Outlined with #c2185b and 2px border. Medium emphasis.
- **Ghost:** Text-only in #c2185b for subtle actions.

### Cards
- **Product Card:** Surface 1 elevation. High-quality imagery takes up 70% of the card height. Typography is centered or left-aligned depending on the layout density.
- **Category Card:** Circular imagery with a subtle 2px border in the Primary color to highlight traditional patterns.

### Inputs & Selection
- **Text Inputs:** Soft grey background (#f5f5f5) with a bottom border that transitions to the Primary color on focus.
- **Chips:** Used for sizing and categories. Pill-shaped (rounded-xl) with a light pink background (#f06292 at 10% opacity) and #c2185b text.

### Navigation
- **Mobile Bottom Bar:** Solid #c2185b background with white icons. Active states use a subtle scale-up effect.
- **Desktop Header:** Minimalist white background with a blur effect, keeping the brand logo and search prominent.