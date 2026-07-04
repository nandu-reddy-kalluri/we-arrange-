# YMWA — Test Strategy

This document defines the testing philosophy, test pyramid, tool choices, and coverage expectations for YouMarriageWeArrange.

---

## 1. Testing Philosophy

YMWA tests must protect three things in priority order:

1. **Business model integrity** — Tests should catch regressions that break the concierge workflow (e.g., a requirement submission that silently fails).
2. **UI correctness** — Tests should catch layout regressions on mobile viewports, broken form interactions, and hydration errors.
3. **Data safety** — Tests should catch RLS bypasses, unauthorised data access, and schema migrations that break existing queries.

Performance testing and visual regression are secondary but encouraged.

---

## 2. Test Pyramid

```
         ┌───────────────────┐
         │   E2E Tests       │  ← 5%  (Critical user journeys only)
         │   (Playwright)    │
         ├───────────────────┤
         │ Integration Tests │  ← 20% (API routes, service functions)
         │ (Vitest + MSW)    │
         ├───────────────────┤
         │   Unit Tests      │  ← 75% (Utility functions, hooks, formatters)
         │   (Vitest)        │
         └───────────────────┘
```

---

## 3. Tool Choices

| Tool | Purpose | Version |
|:---|:---|:---|
| **Vitest** | Unit and integration tests | Latest |
| **Playwright** | End-to-end browser tests | Latest |
| **@testing-library/react** | Component rendering tests | Latest |
| **MSW (Mock Service Worker)** | API mocking for integration tests | Latest |

> [!NOTE]
> Jest is not used. Vitest is compatible with the Next.js/ESM setup and significantly faster for this stack.

---

## 4. Unit Tests

### What to Unit Test

| Category | Examples | Priority |
|:---|:---|:---:|
| Date formatters | `formatDate("2026-12-12")` → `"December 12, 2026"` | 🔴 High |
| Price formatters | `formatLakhs(30)` → `"₹30 Lakhs"` | 🔴 High |
| Validation schemas | Zod schemas for requirement inputs | 🔴 High |
| Custom React hooks | `useShortlist`, `useVendorFilters` | 🟠 Medium |
| Constants and mappings | `HYDERABAD_AREAS`, `EVENT_TYPES` | 🟡 Low |

### What NOT to Unit Test
- Tailwind class names
- Framer Motion animation values
- Static component markup with no logic

### File Naming Convention
- Test files: `[filename].test.ts` or `[filename].test.tsx`
- Location: Co-located alongside the file being tested (e.g., `formatDate.test.ts` next to `formatDate.ts`)

---

## 5. Integration Tests

### What to Integration Test

| Endpoint | Test Scenarios | Priority |
|:---|:---|:---:|
| `POST /api/requirements/submit` | Valid submission, missing fields, unauthenticated | 🔴 High |
| `GET /api/requirements/me` | Authenticated customer, no requirements, unauthenticated | 🔴 High |
| `POST /api/shortlist/manage` | Add venue, remove venue, add vendor, duplicate prevention | 🟠 Medium |
| `GET /api/quotes/compare` | Valid requirement, unauthorised access, no quotes yet | 🟠 Medium |

### Integration Test Pattern
```typescript
// Use MSW to mock Supabase responses
// Test the full route handler including auth checks
// Assert correct HTTP status codes and response shapes
```

---

## 6. End-to-End Tests

### Critical Journeys to Cover (Priority Order)

| Journey | Test Description | Priority |
|:---|:---|:---:|
| **Requirements Submission** | Couple fills form → submits → sees confirmation | 🔴 P0 |
| **Landing Page Load** | Page loads on mobile viewport without console errors | 🔴 P0 |
| **Auth Flow** | Register → login → redirect to dashboard | 🔴 P0 |
| **Shortlist Add/Remove** | Add venue to shortlist → remove from shortlist | 🟠 P1 |
| **Comparison Sheet View** | Customer with quotes_ready status sees comparison | 🟠 P1 |

### Viewport Requirement
All E2E tests must be run at minimum on:
- **Mobile:** 375×812 (iPhone SE viewport)
- **Desktop:** 1440×900

### E2E Test Location
```
tests/
└── e2e/
    ├── requirements-submission.spec.ts
    ├── landing-page.spec.ts
    └── auth-flow.spec.ts
```

---

## 7. TypeScript as the First Test

Before any test framework runs, TypeScript compilation must pass with zero errors:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

This is the fastest "test" and catches the most common regressions. It runs in CI on every PR.

---

## 8. PR Quality Gates

Every PR must pass these checks before merge:

| Check | Command | Required |
|:---|:---|:---:|
| TypeScript compile | `node .../tsc --noEmit` | ✅ Mandatory |
| Lint | `npm run lint` | ✅ Mandatory |
| Unit tests | `npm run test` | ✅ Mandatory |
| E2E (critical paths) | `npm run test:e2e` | 🟠 Required for feature PRs |

---

## 9. What Is Explicitly Not Tested

| Area | Reason |
|:---|:---|
| Tailwind class names | Fragile. Test visual output in E2E instead. |
| Framer Motion animation timing | Animation values are design decisions, not bugs. |
| Supabase Auth internals | Supabase is a tested third-party. Test our integration with it, not it itself. |
| External venue/vendor availability | Real-time external state is not deterministic. |
