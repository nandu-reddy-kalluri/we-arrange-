# We Arrange (YMWA) — Comprehensive Security & Secret Audit

**Date:** November 19, 2026  
**Status:** PASSED — SECURE FOR DEVELOPMENT & PRE-DEPLOYMENT  
**Database Reference:** Supabase Project `zujjiiljvjwgcxtaqype` (ap-south-1)  

---

## 1. Executive Summary

A comprehensive security audit of the entire We Arrange (YMWA) codebase, database policies, authentication gateways, and API boundaries was executed in Phase 8.

### Key Audit Findings
- **Zero Committed Secrets**: Scanned repository history and git-tracked files. No `.env`, `.env.local`, API keys, private certificates, or JWT tokens are tracked by git.
- **Zero Frontend Secret Exposure**: Confirmed that `SUPABASE_SERVICE_ROLE_KEY`, `PAYMENT_GATEWAY_KEY_SECRET`, and `CLOUDFLARE_R2_SECRET_ACCESS_KEY` are strictly server-only. `packages/database/src/clients.ts` enforces `import "server-only";` and throws if evaluated in a browser runtime.
- **Strict Row-Level Security (RLS)**: Row-Level Security is enabled across 100% of public tables in Supabase. Multi-tenant isolation prevents customers, vendors, and staff from accessing unauthorized records.
- **Robust RBAC & Inactive Status Rejection**: Database-backed role enforcement checks both `users.status === 'Active'` and role-specific membership (`admins.status === 'active'`). Inactive and suspended users are rejected at both middleware and route handler levels.
- **Cryptographic Signature Verification**: Razorpay webhooks enforce HMAC-SHA256 signature verification before processing payment confirmations.
- **Path Traversal & Injection Immunity**: R2 media upload keys are sanitized (`sanitizeUploadFileName`) to strip directory traversal (`../`) and illegal characters. All SQL interactions utilize parameterized PostgREST calls, eliminating SQL injection.

---

## 2. Secret Management & Repository Cleanliness

| Check | Target / File | Status | Audit Findings |
| :--- | :--- | :--- | :--- |
| **`.gitignore` Completeness** | `.gitignore` | **PASSED** | Explicitly excludes `.env`, `.env*.local`, `.env.production`, `.env.staging`, `.env.backup`, `.next/`, `node_modules/`, and test log traces. |
| **Git-Tracked Env Files** | `git ls-files \| grep .env` | **PASSED** | Only `.env.example` is tracked by git, containing placeholder keys and descriptive documentation only. |
| **Hardcoded Secret Scan** | All workspace code | **PASSED** | Automated regex scans for live Stripe, Razorpay (`rzp_live`), AWS/R2, and Supabase service role keys returned 0 hits. |
| **Server-Only Bundling Boundary** | `packages/database/src/clients.ts` | **PASSED** | Uses React 19 / Next.js `import "server-only";` and runtime browser assertion: `assertServerRuntime()`. Build fails immediately if any client component attempts import. |

---

## 3. Authentication, Authorization & Session Security

### 3.1 Session Persistence & Cookie Flags
- Supabase SSR manages authentication cookies using `SameSite=Lax`, `HttpOnly=true`, and `Secure=true` (in production HTTPS).
- Session tokens are refreshed automatically on the server side in middleware before route rendering.

### 3.2 Role-Based Access Control (RBAC)
- **Customer Access**: Restricted to customer workflows. Cannot access vendor, concierge, or admin management screens.
- **Vendor Access**: Requires explicit vendor assignment (`authUser.vendorId`). Verification status (`Verified Partner` vs `Pending Verification`) is strictly enforced; unverified or unlinked vendors cannot execute booking confirmations.
- **Admin Access**:
  - The secret entry route `/admin/login143` is preserved and completely excluded from public navigation.
  - Authorization requires active status in `public.users` AND active membership in `public.admins`.
  - Rejects inactive, suspended, or unassigned accounts with `unauthorized_role`.
- **Concierge Staff Access**:
  - Requires assignment in `public.concierge_staff` or active administrative privileges.
  - Concierge staff cannot access executive system settings or delete accounts.

### 3.3 Open-Redirect Protection
All login and redirect flows utilize `sanitizeRedirect()`:
```typescript
export function sanitizeRedirect(target: string | null | undefined, fallback = "/"): string {
  if (!target) return fallback;
  const trimmed = target.trim();
  // Reject absolute URLs, protocol-relative URLs (//), and javascript: URIs
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://") || trimmed.includes("\\")) {
    return fallback;
  }
  return trimmed;
}
```

---

## 4. Supabase Database Security & Policy Review

Live inspection of database project `zujjiiljvjwgcxtaqype` via Supabase advisors:

| Advisor Finding | Category | Level | Classification | Analysis & Action |
| :--- | :--- | :--- | :--- | :--- |
| **Leaked Password Protection Disabled** | Security | `WARN` | **Requires Operator Action** | Supabase Auth provides an optional check against HaveIBeenPwned.org to prevent compromised passwords. This must be enabled in the Supabase Dashboard under **Authentication > Password Security**. |
| **Multiple Permissive Policies (28 findings)** | Performance / RLS | `WARN` | **Accepted Architectural Pattern** | Detected multiple permissive SELECT policies on tables like `bookings`, `reviews`, `vendors`. In Postgres, multiple permissive policies for `authenticated` combine cleanly using `OR`. This is the standard pattern for allowing public reads while granting owners or staff private record access. |
| **RLS Enabled No Policy (10 tables)** | Security / RLS | `INFO` | **Accepted Risk / By Design** | Tables including `app_settings`, `email_templates`, `moderation_logs`, `notification_templates`, and `role_permissions` have RLS enabled with 0 policies. In Postgres, this creates a default **DENY ALL** for client anon/authenticated roles. These tables are strictly manipulated via `service_role` on the server. |
| **Search Path Security** | Functions | `PASS` | **Resolved** | Migration `20261114043236_harden_update_updated_at_search_path` and `20261116103058_harden_concierge_or_admin_rls` set immutable `SET search_path = public` on all `SECURITY DEFINER` functions, preventing search path hijacking. |

---

## 5. API & Input Validation

1. **Zod Validation at API Trust Boundaries**:
   - Every mutating route handler parses incoming request bodies with validated Zod schemas (`packages/validation/src/*`).
   - Invalid payloads return structured HTTP 400 Bad Request with field-level issues.
2. **SQL Injection**:
   - Zero raw string concatenation for SQL queries. All database access uses Supabase PostgREST client methods (`.select()`, `.eq()`, `.in()`, `.insert()`) which automatically parameterize query arguments.
3. **Cross-Site Scripting (XSS)**:
   - React 19 JSX natively escapes dynamic text nodes.
   - Any raw HTML or markdown rendering (in blog/CMS) uses sanitized parsing.
4. **Denial of Service & Rate Limiting**:
   - In-memory rate limiting applied to sensitive endpoints (OTP requests, login attempts, contact inquiries).
   - Maximum upload payload size restricted to 25MB.

---

## 6. External Webhooks & Signature Validation

1. **Payment Webhook Security (`/api/webhooks/payment`)**:
   - Requires `X-Razorpay-Signature` header.
   - Computes expected HMAC-SHA256 signature using `PAYMENT_WEBHOOK_SECRET`.
   - Rejects missing, mismatched, or replayed webhook events with HTTP 400/401.
   - Enforces transaction idempotency to prevent double-crediting.
2. **Cloudflare R2 Media Upload Security**:
   - Clients never receive direct write credentials to the Cloudflare bucket.
   - Short-lived AWS SigV4 presigned PUT URLs (5-minute expiry) are generated server-side after verifying user authorization.
   - Upload keys enforce strict directory namespaces: `avatars/{userId}/`, `venues/{venueId}/`, `vendors/{vendorId}/`.

---

## 7. Security Audit Conclusion

The We Arrange codebase and database configuration meet modern security standards:
- **Zero critical or high vulnerabilities detected in application code.**
- **One operator action recommended**: Enable Leaked Password Protection in the Supabase Dashboard prior to production launch.
