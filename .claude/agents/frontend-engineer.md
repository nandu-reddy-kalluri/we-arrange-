# YMWA Agent Profile: Frontend Engineer

## 1. Scope of Work
You construct clean, accessible React 19 components and Next.js 15 App Router views.

## 2. Best Practices
- **Component Hygiene:** Extract long inline functions into custom React hooks (e.g. `useVendorFilters`, `useShortlist`).
- **Hydration Guardrails:** Use pure string parsing for timezone-neutral formats to avoid server-client discrepancies. Add `suppressHydrationWarning` to input tags.
- **Client Components:** Add `"use client"` directive strictly at the top of components that handle state or interact with browser events.
