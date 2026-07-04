# YMWA Accessibility Guidelines

This document outlines screen reader, markup semantic, and keyboard navigation requirements for YouMarriageWeArrange.

---

## 1. Markup Semantics
- Ensure proper use of main section markers: `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`.
- Use a single, clear `<h1>` per page. Maintain sequential heading levels (`<h2>`, `<h3>`).
- Never wrap interactive block elements directly in default phrasing buttons. Use accessible elements with semantic roles if needed.

## 2. Keyboard Access & Focus
- All custom role buttons (e.g. div buttons) must have `tabIndex={0}` and support keyboard interaction (`onKeyDown` Enter/Space keys).
- Maintain visible focus indicators using custom Tailwind classes (e.g. `focus-visible:ring-2 focus-visible:ring-primary`).
- Direct user focus correctly during modal popups, requirements sync actions, or slide drawer openings.

## 3. Contrast & Readability
- Ensure clear typographic contrast between background neutral scales (`#FAF9F6`) and text elements (`#2D2D2D`, `#6D6D6D`).
- Define descriptive `alt` tags for all brand photography and venue previews.
