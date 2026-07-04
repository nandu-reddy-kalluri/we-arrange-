# CLAUDE.md — Developer Reference & Codebase Rules

Welcome to **YouMarriageWeArrange**. This guide serves as the standard instructions for developer tooling, command scopes, and architectural guidelines.

## Tooling & Execution Commands

- **Development Server:** `npm run dev` or `cmd /c "npm run dev"`
- **Production Build Check:** `npm run build` or `cmd /c "npm run build"`
- **TypeScript Verification:** `npx tsc --noEmit` or `cmd /c "npx tsc --noEmit"`
- **Linter Checks:** `npm run lint` or `cmd /c "npm run lint"`

---

## Code Guidelines & Standards

1. **Routing & Directory Model:**
   - Next.js 15 App Router (`src/app/`). Keep router files minimal; import complex layouts/views from `src/features/`.
   - Feature directories inside `src/features/` should isolate components, hooks, services, types, and constants.

2. **Styling & Theme Variables:**
   - Use Tailwind CSS configuration (`tailwind.config.ts`) extending custom YMWA HSL colors, spacing offsets, border radii, shadows, fonts, and screens.
   - Reference `src/design-system/theme.ts` for unified JavaScript/TypeScript theme tokens.
   - Do **not** inject raw inline values (`bg-[#...]`, `w-[...px]`) if matching token values exist.

3. **DOM Integrity & Hydration Safety:**
   - Return clean fragment wrappers in nested layouts; do **not** repeat `<html>` or `<body>` nodes.
   - Never embed block elements (`div`, `h3`, `p`) inside inline phasing parents (e.g. `<button>`).
   - Add `suppressHydrationWarning={true}` to inputs/selects vulnerable to browser autofill.
   - Replace locale/timezone sensitive code (`new Date()`, `toLocaleDateString()`) with deterministic string parse functions.

4. **Animations:**
   - Standardize animations using `motion` from `framer-motion`. Keep movements subtle and performance-oriented.
