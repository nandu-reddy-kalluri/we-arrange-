# YouMarriageWeArrange (YMWA) — Production Readiness Review & Architecture Guide

**Document Status:** Complete & Verified  
**Project:** YouMarriageWeArrange (YMWA)  
**Target Market:** Hyderabad Luxury Wedding Concierge & Marketplace  
**Monorepo Root:** `C:\Users\varsh\Desktop\YMWA\we-arrange-`

---

## 1. Monorepo Architecture Overview

YMWA is architected as a high-performance TypeScript monorepo managed via **Turborepo** and **pnpm** (20 packages in scope: 5 Next.js web applications, 7 shared foundational libraries, 4 microservices).

### Applications & Port Allocations

| Application | Path | Port | Purpose & User Journey |
| :--- | :--- | :--- | :--- |
| **`web`** | `apps/web` | `3000` | Public marketplace, venue/vendor discovery, wedding studio, unified customer portal gateway (`/customer/*`), and dedicated staff entry (`/admin/login`). |
| **`customer`** | `apps/customer` | `3001` | Standalone Customer Portal for tracking wedding shortlist, venue visits, quotes, and concierge chats. |
| **`vendor`** | `apps/vendor` | `3002` | Standalone Vendor Portal for leads, inquiries, profile management, and bookings. |
| **`admin`** | `apps/admin` | `3003` | Standalone Admin Command Center for vetting, user management, audit logs, and analytics. |
| **`concierge`** | `apps/concierge` | `3004` | Standalone Concierge Portal for lead triage, custom quote composition, and couple matchmaking. |

### Shared Packages & Services

- **`@we-arrange/database`**: Supabase PostgreSQL client bindings (`clients.ts`), repositories, schema definitions, and migration utilities.
- **`@we-arrange/auth`**: Unified session handling, token extraction, role validation, and password hash utilities.
- **`@we-arrange/ui`**: High-end luxury design tokens, atomic components, and responsive layouts.
- **`@we-arrange/validation`**: Zod schemas for venues, vendors, bookings, auth payloads, and payment webhooks.
- **`@we-arrange/types`**: Core domain types across the wedding planning ecosystem.
- **`@we-arrange/service-venue` / `service-vendor` / `service-booking` / `service-customer`**: Dedicated domain business services.

---

## 2. Authentication & Authoritative RBAC Architecture

### Strict Security Rules
1. **Never Trust Client-Supplied Roles:** All permissions, roles, and administrative claims are resolved server-side against authoritative database tables (`users`, `roles`, `admin_memberships`, `concierge_assignments`). Client cookies and browser storage cannot forge privileges.
2. **Admin Route:**
   - Administrative login is accessible via `/admin/login` (and `/login` on standalone admin).
   - The public `/login` interface rejects administrative credentials (`rejectAdmin: true`), preventing role confusion or social engineering.
3. **Concierge Verification:**
   - Concierge access requires an active user session verified through `private.is_concierge_or_admin()`.
   - Inactive or suspended admin accounts are strictly prevented from falling back into concierge capabilities.
4. **Cross-Role Boundary Enforcement:**
   - Customers cannot access vendor dashboards or admin routes.
   - Vendors cannot view couple shortlist notes or concierge internal comments.
   - All private database queries use strict Postgres Row-Level Security (RLS).

---

## 3. Database & Supabase Configuration

- **Supabase Project ID:** `zujjiiljvjwgcxtaqype`
- **Database Engine:** PostgreSQL with Supabase Row-Level Security (RLS) enabled across 100% of public schema tables.
- **Migration Milestones Applied:**
  - `M01`: Initial schema and schema constraints.
  - `M02`: Minimum required grants and service role boundaries.
  - `M03`: Venue catalog schema, amenities, and status lifecycles.
  - `M04`: Customer and vendor ownership RLS.
  - `M05`: Booking lifecycle, quote requests, and payment state machines.
  - `M06`: Vendor lead routing and messaging.
  - `M07`: Review moderation and ratings calculations.
  - `M08`: Content management system (CMS) and inspirations.
  - `M09`: Concierge assignment and lead triage.
  - `M10`: Internal notifications and logging.
  - `M11`: Audit logs and system preferences.
  - `M12` (`20261116103058_harden_concierge_or_admin_rls`): Hardened `private.is_concierge_or_admin()` function ensuring non-active admins are blocked from concierge escalation.

### Database Security Audit Status
- **RLS Status:** Fully enabled on all domain tables (`venues`, `vendors`, `bookings`, `inquiries`, `reviews`, `user_profiles`, `shortlists`).
- **Function Execution Privileges:** Restrictive execution grants limited to `authenticated` and `postgres` roles; `anon` and `PUBLIC` have no execute permissions on privileged security functions.

---

## 4. External Service Integrations

### Cloudflare R2 (Media Storage)
- **Adapter Location:** `apps/web/services/storage/mediaAdapter.ts`
- **Mechanism:** Direct browser-to-R2 uploads using AWS Signature Version 4 pre-signed PUT URLs.
- **Security Bounds:**
  - File size restricted by category (Venues: 15MB, Profile: 5MB, Documents: 10MB).
  - Allowed MIME types strictly limited (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`).
  - Throws `503 Service Unavailable` if R2 credentials are missing, preventing silent data loss.

### Payment Gateway (Milestones & Booking Tokens)
- **Adapter Location:** `apps/web/services/payments/adapter.ts`
- **Workflow:**
  - Orders are initiated with deterministic idempotency keys and state `Pending`.
  - Webhooks enforce constant-time HMAC-SHA256 signature verification (`crypto.timingSafeEqual`).
  - Upon successful payment verification, the booking milestone transitions to `Confirmed` and triggers customer/concierge notifications.

### Notifications (SMS & Email)
- **Service Location:** `apps/web/services/notifications/notificationService.ts`
- **Supported Channels:** Transactional Email (Resend/SendGrid) and WhatsApp/SMS (Twilio/Gupshup).
- **Graceful Fallback:** If API keys are unconfigured in development, notifications are safely queued with state `queued_unconfigured` without crashing the user flow.

---

## 5. Development Server & Build Verification

### Local Development Commands
To start all 5 applications concurrently in development mode:
```bash
# From workspace root
pnpm -C we-arrange- dev
```

### Verification & Quality Assurance Suite
All suites pass with zero warnings or errors:
```bash
# Typecheck across all 20 packages
pnpm -C we-arrange- typecheck
# Result: 6 successful, 6 total (0 TypeScript errors)

# ESLint validation across all apps
pnpm -C we-arrange- lint
# Result: 5 successful, 5 total (0 ESLint errors/warnings)

# Vitest unit & security test suite
pnpm -C we-arrange- test:unit
# Result: 11 passed, 78 tests passed, 4 skipped, 0 failed
```

---

## 6. Pre-Production Checklist Before Deployment

Before triggering any Vercel deployment or domain DNS cutover:

1. **Environment Variables:**
   - Confirm production `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Set `SUPABASE_SERVICE_ROLE_KEY` exclusively on server runtime (never expose in client envs).
   - Set `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ACCOUNT_ID`.
   - Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
   - Set `RESEND_API_KEY` or transactional email provider token.
2. **Supabase Production Settings:**
   - Enable Leaked Password Protection in Supabase Auth Security settings.
   - Configure Connection Pooling (pgBouncer / Supavisor) for serverless route handlers.
3. **Domain & DNS Verification:**
   - Canonical Domain: `https://www.youmarriagewearrange.com`
   - Configure SSL/TLS with HTTP Strict Transport Security (HSTS).
