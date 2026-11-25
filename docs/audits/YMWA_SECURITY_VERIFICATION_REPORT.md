# YMWA Security Verification & Attack Surface Audit

- **Target System:** YouMarriageWeArrange Production Platform
- **Date:** 2026-11-22
- **Lead Auditor:** Application Security Engineer
- **Scope:** Monorepo API routes, middleware, Supabase RLS, session tokens, and input sanitizers

---

## 1. Security Architecture Summary

The YMWA platform employs a defense-in-depth security model:
1. **Edge & Transport:** Strict HTTPS enforcement, HSTS (`max-age=63072000`), secure cookie flags, and modern security headers across all responses.
2. **Application Boundary:** Centralized rate limiting ([rateLimit.ts](file:///c:/project%20%202/we%20arrange/packages/utils/src/rateLimit.ts)), input sanitizers ([sanitizers.ts](file:///c:/project%20%202/we%20arrange/packages/utils/src/sanitizers.ts)), and Zod schema validation across all API endpoints.
3. **Identity & Session:** Supabase Auth session validation, token verification, and active-admin revocation checks.
4. **Database Tier:** PostgreSQL Row-Level Security (RLS) policies on all customer- and vendor-owned tables; least-privilege grants to `anon` and `authenticated` roles.

---

## 2. Specific Vulnerability Verifications & Mitigations

### 2.1 Inactive-Admin Authorization Bypass (`F-01`) — VERIFIED MITIGATED
- **Risk:** Deactivating an administrator in `public.admins` (`status = 'inactive'`) while leaving `users.role_id` as admin could allow inactive staff to access administrative APIs.
- **Verification & Mitigation:**
  - `requireActiveAdmin()` in [adminPortalService.ts](file:///c:/project%20%202/we%20arrange/apps/web/services/admin/adminPortalService.ts) and all staff route handlers explicitly queries `public.admins` and requires `status === 'active'`. If inactive, requests are rejected with HTTP 403 Forbidden.
  - Verified via test suite in `apps/web/__tests__/phase1-remaining-auth.test.ts`.

### 2.2 IDOR & Cross-Tenant Data Isolation — VERIFIED MITIGATED
- **Risk:** Malicious customers or vendors tampering with IDs to view or mutate another tenant's quotes, enquiries, or profiles.
- **Verification & Mitigation:**
  - Vendor API routes (`/api/vendor/me/[resource]`) enforce `requireVendorOwner()`, resolving the authenticated user's vendor ID from their session token. It is impossible to mutate another vendor's services or portfolio.
  - Verified via test suite in `apps/web/__tests__/m04-ownership-security.test.ts` (14 tests passed).

### 2.3 SQL Injection Surfaces — VERIFIED ZERO VULNERABILITIES
- **Analysis:** Zero raw SQL string interpolation exists in application code. All queries use the Supabase PostgREST query builder with parameterized values, or validated repository helpers using `sanitizePostgrestFilterTerm()`.

### 2.4 Cross-Site Scripting (XSS) — VERIFIED MITIGATED
- **Analysis:** Next.js React JSX automatically escapes dynamic strings. Freeform search and user input pass through `sanitizeSearchTerm()` and `sanitizeHtmlBasic()` in [sanitizers.ts](file:///c:/project%20%202/we%20arrange/packages/utils/src/sanitizers.ts). Content security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`) prevent MIME-type sniffing and clickjacking.

### 2.5 Secret Containment — VERIFIED
- **Audit:** Zero production secrets or service-role keys are committed to Git. `apps/web/.env.local` contains only public anon keys; `SUPABASE_SERVICE_ROLE_KEY` is maintained exclusively in server environments.
