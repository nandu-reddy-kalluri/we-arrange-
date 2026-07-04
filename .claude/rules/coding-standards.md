# YMWA Coding Standards

This document establishes the code syntax, directory boundaries, and formatting rules for YouMarriageWeArrange.

---

## 1. Directory Structure Boundaries
- **App Router (`src/app/`):** Houses route entry points only. Keep components lean. Do not declare major UI logic inside `page.tsx`.
- **Features (`src/features/`):** Domain modules containing feature-specific items (e.g. `features/vendors/components/`, `features/vendors/hooks/`).
- **Shared Components (`src/components/`):** Atoms and wrappers reused across features (e.g., core cards, inputs).

## 2. Component Structure Rules
- **Naming Conventions:**
  - Component files: PascalCase (e.g., `VenueCard.tsx`, `HeroSection.tsx`).
  - Hooks/Utility files: camelCase (e.g., `useMediaQuery.ts`, `formatDate.ts`).
  - Folder structures: kebab-case.
- **Client & Server Separation:**
  - Use Client components (`"use client"`) only when handling state, browser hooks, interactive events, or framer-motion transitions.
  - Keep default components as Server Components to improve loading speeds.

## 3. Formatting
- Use Prettier for class sorting and standardized code tab spaces.
- Preserve type safety on all props and interfaces. Avoid using the `any` type.
