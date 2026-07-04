# ADR 019: Mobile-First Enforcement Protocol

## Status
Accepted

## Context
Mobile-first is declared in `PROJECT_RULES.md` and `DESIGN_SYSTEM.md`, but enforcement depends entirely on individual contributor awareness. Without a protocol with explicit rejection criteria, contributors — especially AI agents — default to building desktop layouts first and then attempting to scale down. Scale-down produces cramped, inaccessible mobile experiences that damage the primary product surface (70–90% of YMWA users are on mobile devices).

## Decision
Mobile-first is not a suggestion. It is a build-order requirement enforced at every phase:

1. **Design order:** Mobile (375px) → Tablet (768px) → Desktop (1280px). Never reversed.
2. **Code order:** Base Tailwind classes target mobile. `md:` and `lg:` prefixes add desktop enhancements. No desktop-first overrides with `max-md:` or `max-lg:` unless explicitly justified.
3. **Review order:** Mobile layout is reviewed and approved first. Desktop layout review is secondary.
4. **Rejection trigger:** Any PR that does not include a mobile screenshot alongside its desktop screenshot is returned for revision.

## Enforcement Criteria (Rejection List)

A contribution is rejected if any of the following are true:
- The base Tailwind classes (no prefix) define a desktop-only layout
- Text is unreadable at 375px viewport width without horizontal scrolling
- Interactive elements (buttons, selects, form inputs) are smaller than 44×44px tap target on mobile
- The mobile layout is identical to the desktop layout with no responsive adaptation
- The mobile layout uses `overflow-hidden` to hide content that should be reachable on mobile

## Implications
- Forces performance-first thinking (mobile constraints drive image size, animation complexity)
- Produces accessible tap targets and readable typography by default
- Prevents the most common failure mode: "we'll do mobile later" (which becomes never)
