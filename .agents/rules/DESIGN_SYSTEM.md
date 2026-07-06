max 200 lines

# DESIGN SYSTEM

## Visual Consistency Rules
Never create random:
- colors
- typography sizes
- spacing
- shadows
- border radius
- animations

Always check existing:
- `src/styles/`
- theme files
- UI components

Maintain one consistent visual language.

## The Core Principle: Mobile-First, Desktop-Enhanced
For YouMarriageWeArrange, 70% - 90% of our wedding customers discover and browse the platform from mobile screens.

**Mobile-First Design Rule:**
Every page, component, animation, interaction, and user flow must be designed for mobile before desktop.
The mobile experience is the primary product. Desktop is an enhancement layer.
No design is considered complete until:
1. Mobile design exists (`375px` to `480px`).
2. Tablet design exists (`768px` to `1024px`).
3. Desktop design exists (`1280px+`).

## Visual Theme Values & Design Philosophy
- **Luxury Hospitality:** Warm Silk Ivory backgrounds, deep burgundy highlights, champagne gold accents. Focus on bespoke trust building and direct human concierge matching.
- **Editorial White Space:** Clean margin scales, centered text highlights, and high typographic contrast.
- **Human-Centered:** Clean, premium, and trustworthy interfaces.
- **UX Rules:** Avoid floating hearts, confetti, fireworks animations, generic stock photography, heavy glassmorphism, or SaaS-style pricing tables.

## Animation Philosophy
- **Subtle & Purposeful:** Micro-interactions, smooth hover transitions, and performance-first fade/slide transforms (fade-in, slide-up, zoom-in, ease-out-cubic).
- Standardize animations using `motion` from `framer-motion`.
- Strictly Avoid: Confetti overlays, fireworks, heavy GPU-intensive particle engines.

## Color Palette (Tailwind Mapped)
- **Primary Burgundy:** `#8B263E` (Deep Burgundy, step nodes, badges, primary CTA button bg).
- **Champagne Gold Accents:** `#C5A880` (Champagne Gold, hover highlights, borders).
- **Background Silk Ivory:** `#FAF9F6` (Warm Background Silk, overall body bg).
- **Rich Charcoal Typography:** `#2D2D2D` (Header text, descriptions, body copy).

## Typography
- **Headings Font:** `Playfair Display` (Elegant Serif font, variable weights 400 to 900).
- **Body & Controls Font:** `Plus Jakarta Sans` (Geometric Sans-Serif font, weights 300 to 800).

## UI Principles
Every page section and view must answer the following questions for the customer:
1. *Why trust us?*
2. *How does this work?*
3. *Why is this easier?*
4. *What happens next?*
