# We Arrange (YMWA) — Luxury Wedding Marketplace Platform

> **Status:** Fully Development Ready (Phases 1–8 Completed)  
> **Repository:** `https://github.com/nandu-reddy-kalluri/we-arrange-`  
> **Database:** Supabase Postgres (`zujjiiljvjwgcxtaqype`)  
> **Architecture:** Turborepo + pnpm Monorepo (5 Next.js Apps, 11 Shared Packages, 4 Domain Services)

---

## 1. Applications & Architecture

We Arrange (YMWA) is structured as a multi-application monorepo designed for Hyderabad and destination luxury wedding planning.

| Application | Path | Port | Production Hostname (Target) | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Marketplace & Gateway** | `apps/web` | `3000` | `https://youmarriagewearrange.com` | Public marketplace, catalog discovery, editorial inspiration, customer dashboard, and unified REST `/api/*` backend handlers. |
| **Customer Portal** | `apps/customer` | `3001` | `https://customer.youmarriagewearrange.com` | Couple planning workspace, saved venue/vendor shortlists, comparison sheets, and booking tracking. |
| **Vendor Portal** | `apps/vendor` | `3002` | `https://vendor.youmarriagewearrange.com` | Vendor onboarding, package & pricing editor, portfolio gallery, verification badge, and inquiry inbox. |
| **Admin Operations** | `apps/admin` | `3003` | `https://admin.youmarriagewearrange.com` | Executive governance, KPI analytics, user role assignments, moderation queue (`/admin/login143`). |
| **Concierge Operations** | `apps/concierge` | `3004` | `https://concierge.youmarriagewearrange.com` | White-glove concierge desk, lead routing, site visit scheduling, and custom quote builder. |

---

## 2. Shared Packages & Domain Services

- **`packages/ui`**: Accessible UI components adhering to We Arrange luxury design tokens (Imperial maroon `#8B263E`, warm gold `#C8A165`).
- **`packages/auth`**: Supabase SSR client factories, session persistence, and RBAC helpers.
- **`packages/database`**: Typed Supabase schema (`database.types.ts`), server-only client protection, and query repository.
- **`packages/validation`**: Zod validation schemas across auth, catalog, inquiries, quotes, and uploads.
- **`packages/api-client`**: Type-safe API client with automatic token forwarding.
- **`services/venue`**: Venue search, availability, capacity, and pricing calculations.
- **`services/vendor`**: Vendor catalog, categories, and business profiles.
- **`services/customer`**: Customer profiles, inquiries, and saved shortlists.
- **`services/booking`**: Booking lifecycle, quotes, comparisons, payment intent creation, and refunds.

---

## 3. Getting Started (Local Development)

### Prerequisites
- Node.js `>= 20.0.0`
- pnpm `^11.0.0`

### Installation
```bash
# Clone the repository
git clone https://github.com/nandu-reddy-kalluri/we-arrange-.git
cd we-arrange-

# Install dependencies across all 20 packages
pnpm install

# Copy environment template
cp .env.example .env.local
```

### Running Applications
```bash
# Run all 5 applications concurrently (Ports 3000-3004)
pnpm dev

# Or run individual applications:
pnpm dev:web        # apps/web       (http://localhost:3000)
pnpm dev:customer   # apps/customer  (http://localhost:3001)
pnpm dev:vendor     # apps/vendor    (http://localhost:3002)
pnpm dev:admin      # apps/admin     (http://localhost:3003)
pnpm dev:concierge  # apps/concierge (http://localhost:3004)
```

---

## 4. Verification & Testing

```bash
# Run the complete automated test suite (130 tests)
pnpm test:unit

# Run TypeScript typechecks across all 20 workspace packages
pnpm -r run typecheck

# Run ESLint across all applications
pnpm -r run lint

# Build all applications for production
pnpm build
```

---

## 5. Architectural & Handover Documentation

- [YMWA_FINAL_ARCHITECTURE.md](YMWA_FINAL_ARCHITECTURE.md) — Comprehensive architecture, reverse-proxy pattern, and application responsibilities.
- [YMWA_ENVIRONMENT_VARIABLE_MATRIX.md](YMWA_ENVIRONMENT_VARIABLE_MATRIX.md) — Complete environment variable reference with public/secret classification.
- [YMWA_SECURITY_FINAL_AUDIT.md](YMWA_SECURITY_FINAL_AUDIT.md) — Comprehensive security audit, secret management, and RLS policy review.
- [YMWA_DEPLOYMENT_PREPARATION_CHECKLIST.md](YMWA_DEPLOYMENT_PREPARATION_CHECKLIST.md) — Step-by-step production deployment checklist.
- [YMWA_KNOWN_LIMITATIONS_AND_BLOCKERS.md](YMWA_KNOWN_LIMITATIONS_AND_BLOCKERS.md) — External service dependencies and operator action items.
- [YMWA_FINAL_TEST_RESULTS.md](YMWA_FINAL_TEST_RESULTS.md) — Detailed test breakdown and build matrix.
- [phase8_final_development_readiness_report.md](phase8_final_development_readiness_report.md) — Master Phase 8 audit and acceptance report.
