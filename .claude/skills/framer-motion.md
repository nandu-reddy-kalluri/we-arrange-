# YMWA Skill Guide: Framer Motion Animations

This document defines standard micro-interactions and transitions using `framer-motion` for YouMarriageWeArrange.

---

## 1. Animation Principles
- Keep transitions subtle and purposeful. Avoid intrusive loops, heavy particles, or flying symbols.
- Set durations between `0.2s` and `0.6s` with custom ease curves (`easeOutCubic`, `spring` configurations).

## 2. Shared Variants
- **Card Hover:** scale up to `1.02` with spring curves and shadow increases.
- **Scroll Reveal:** slide up (`y: 30` to `0`) and fade-in (`opacity: 0` to `1`) using `whileInView`.
- **Crossfade Slide:** mode `"wait"` with `x: 20` entry transitions for matrices steps.
