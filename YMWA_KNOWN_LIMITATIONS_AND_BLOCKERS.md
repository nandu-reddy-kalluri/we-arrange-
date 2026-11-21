# We Arrange (YMWA) — Known Limitations, External Dependencies & Pre-Launch Blockers

This document transparently itemizes the known limitations, external service dependencies, and operator prerequisites for the We Arrange (YMWA) platform prior to live production deployment.

---

## 1. Classification of Development Readiness

The platform is classified as **FULLY DEVELOPMENT READY**:
- All five applications compile cleanly with 0 type errors, 0 linter errors, and 100% passing automated unit tests.
- Core business logic, authentication guards, authorization policies, and API contracts are fully implemented and verified.
- No application rebuilds, merges, or breaking architectural changes are needed.

The items below represent **external configuration prerequisites** that require manual operator action or third-party credential provisioning, NOT application code defects.

---

## 2. External Service & Credential Blockers

| External Dependency | Current Development State | Production Requirement | Action Required By Operator |
| :--- | :--- | :--- | :--- |
| **Cloudflare R2 Media Storage** | Uses deterministic mock presigned URL generator in development when env vars are absent. Full SigV4 AWS S3 adapter is implemented and verified. | Production bucket and S3 API credentials required for persistent media storage. | 1. Create R2 bucket `ymwa-media-prod` in Cloudflare.<br/>2. Generate S3 API tokens (Read/Write).<br/>3. Add `CLOUDFLARE_R2_*` variables to `apps/web` environment in Vercel.<br/>4. Map custom CDN domain (e.g. `media.youmarriagewearrange.com`). |
| **Razorpay Payment Gateway** | Sandbox & mock simulation active. Server-side order calculation, HMAC-SHA256 signature verification, and webhook processors are fully implemented and verified. | Live Razorpay merchant account, Key ID, Key Secret, and Webhook Secret. | 1. Generate API keys in Razorpay Dashboard.<br/>2. Add `PAYMENT_GATEWAY_KEY_ID`, `PAYMENT_GATEWAY_KEY_SECRET`, `PAYMENT_WEBHOOK_SECRET` to `apps/web` in Vercel.<br/>3. Configure Webhook URL in Razorpay: `https://youmarriagewearrange.com/api/webhooks/payment` with event `payment.captured`. |
| **Transactional Email (Resend)** | Fallback to structured console logging when `EMAIL_PROVIDER_API_KEY` is not present. HTML templates and delivery tracking are fully implemented. | Verified sending domain and Resend API Key. | 1. Add domain `youmarriagewearrange.com` in Resend and configure DNS DKIM/SPF records.<br/>2. Add `EMAIL_PROVIDER_API_KEY` to `apps/web` in Vercel. |
| **SMS & OTP Delivery (Twilio / Fast2SMS)** | Fallback to console logging and secure mock OTP validation in development. | Active SMS provider account, sender ID, and API tokens. | 1. Obtain SMS gateway credentials.<br/>2. Add `SMS_PROVIDER_API_KEY` to `apps/web` in Vercel.<br/>3. Comply with DLT template registration rules in India. |

---

## 3. Database Operator Actions (Supabase Project `zujjiiljvjwgcxtaqype`)

| Item | Supabase Advisory | Recommended Action | Risk Assessment |
| :--- | :--- | :--- | :--- |
| **Leaked Password Protection** | `auth_leaked_password_protection` (Level: `WARN`) | Enable **Leaked Password Protection** in Supabase Dashboard (**Authentication > Password Security**). | **Zero risk**. Automatically checks passwords against HaveIBeenPwned.org to reject compromised credentials during registration. |
| **Eight Proposed Performance Indexes** | Catalog & review queries | Review and apply SQL script in `docs/proposed_phase5_performance_indexes.sql` when production traffic reaches significant volume. | **Zero risk**. Read-only acceleration indexes. Do not alter existing schema, constraints, or foreign keys. |
| **Database Connection Pooling** | Postgres connection limits | In production, ensure `apps/web` utilizes the Supabase Transaction Pooler (port `6543`) for serverless functions, while direct connection (port `5432`) is used for migrations. | Prevents connection starvation during high concurrency traffic spikes. |

---

## 4. Domain & Cookie Configuration Prerequisites

| Item | Requirement | Operator Action |
| :--- | :--- | :--- |
| **Shared Cookie Domain** | Cross-subdomain session persistence (`youmarriagewearrange.com`, `customer.`, `vendor.`, `admin.`, `concierge.`). | Add `COOKIE_DOMAIN=.youmarriagewearrange.com` to environment variables across all 5 applications in Vercel. |
| **Supabase Auth Redirect URLs** | Authorized redirect URLs for OAuth and magic links. | Add the following to Supabase Dashboard (**Authentication > URL Configuration > Redirect URLs**):<br/>- `https://youmarriagewearrange.com/**`<br/>- `https://customer.youmarriagewearrange.com/**`<br/>- `https://vendor.youmarriagewearrange.com/**`<br/>- `https://admin.youmarriagewearrange.com/**`<br/>- `https://concierge.youmarriagewearrange.com/**` |
| **DNS Subdomain Records** | Subdomain routing for the 5 Next.js applications. | Configure CNAME records in Cloudflare/DNS pointing each subdomain (`@`, `customer`, `vendor`, `admin`, `concierge`) to Vercel's `cname.vercel-dns.com`. |

---

## 5. Architectural Non-Critical Limitations

1. **Vitest Test Runner Environment**:
   - The monorepo test suite runs under Vitest in `node` mode with `@we-arrange/database` mocks.
   - Vitest is optimized for business logic, metadata, schemas, and API handler testing. Client-side visual component rendering and interactions are verified via Next.js production builds and browser manual smoke tests rather than headless JSDOM rendering.
2. **Next.js 15 Deprecation Warning on `next lint`**:
   - Next.js 15 outputs an informational warning: `next lint is deprecated and will be removed in Next.js 16`.
   - All lint rules pass with 0 errors. Migration to standard ESLint 9 flat config CLI can be scheduled for a future Next.js 16 major upgrade.
3. **Legacy Root `src/` Directory**:
   - The root `src/` folder remains in the repository from the pre-monorepo setup.
   - Monorepo apps and packages strictly resolve from their local directories. Root `src/` is not imported, but can be safely archived/deleted in a dedicated post-launch repository cleanup commit.
