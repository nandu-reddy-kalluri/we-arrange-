# YMWA Skill Guide: Next.js 15 App Router

This document summarizes Next.js 15 patterns and standards for YouMarriageWeArrange.

---

## 1. App Router File Conventions
- **Root Layout (`src/app/layout.tsx`):** Holds global styles, brand fonts variables, standard navigation menus and footers.
- **Nested Layouts:** Use to wrap specific sub-directories (e.g. `(auth)` or `(dashboard)`), ensuring they only export React Fragments `<>{children}</>` to prevent hydration issues.
- **Pages (`page.tsx`):** Assemble pages by importing feature-specific components. Do not declare major visual logic inline.

## 2. Server vs Client Components
- Keep layout pages and data grids as **Server Components** to maximize hydration efficiency and SEO readability.
- Move interactivity, local filters state, animations, and modal hooks to **Client Components** (`"use client"`). Keep client boundaries as small as possible.
