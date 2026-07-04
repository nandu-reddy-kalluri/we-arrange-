# YMWA Performance Rules

This document outlines load times optimizations, image delivery, and bundle-size rules for YouMarriageWeArrange.

---

## 1. Asset Sizes & Delivery
- Use modern optimized image formats (WebP/AVIF).
- Add `loading="lazy"` on all cards thumbnails, venue slider preview assets, and testimonials photos.
- Define explicit width and height dimensions on custom brand logos to prevent layout shifts.

## 2. Rendering Paths Optimization
- Rely on Server Components by default for static marketing pages to minimize initial JavaScript bundle size.
- Isolate client-side state and animation modules (`use client`) to the specific leaves of the render tree (e.g. specific buttons, sliders).

## 3. Hydration Warnings Management
- Prevent React hydration mismatch overhead by avoiding client-specific timezone/locale functions (`new Date()`, `toLocaleDateString()`) during initial renders.
- Apply `suppressHydrationWarning={true}` on inputs targeted by password managers or browser autofill scripts.
