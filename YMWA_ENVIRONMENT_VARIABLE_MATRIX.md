# We Arrange (YMWA) — Production & Development Environment Variable Matrix

This document provides the definitive, comprehensive environment variable matrix for all five applications in the We Arrange (YMWA) monorepo.

> [!CAUTION]
> **Zero Secret Exposure Policy**: Secrets (e.g. `SUPABASE_SERVICE_ROLE_KEY`, `PAYMENT_GATEWAY_KEY_SECRET`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`) must **NEVER** be prefixed with `NEXT_PUBLIC_`, committed to git, or added to client-side bundles. Only public identifiers and endpoints may carry the `NEXT_PUBLIC_` prefix.

---

## 1. Quick Reference: Application Ports & Origins

| Application | Monorepo Path | Local Port | Production Hostname (Recommended) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Marketplace & API Gateway** | `apps/web` | `3000` | `https://youmarriagewearrange.com` | Public marketplace, catalog, customer dashboard, CMS, and centralized backend `/api/*` handlers |
| **Customer Portal** | `apps/customer` | `3001` | `https://customer.youmarriagewearrange.com` | Dedicated self-service workspace for couples |
| **Vendor Portal** | `apps/vendor` | `3002` | `https://vendor.youmarriagewearrange.com` | Dedicated portal for wedding vendors & venue managers |
| **Executive Admin** | `apps/admin` | `3003` | `https://admin.youmarriagewearrange.com` | Executive governance, user management, and moderation |
| **Concierge Operations** | `apps/concierge` | `3004` | `https://concierge.youmarriagewearrange.com` | White-glove concierge desk, lead routing, and quote builder |

---

## 2. Definitive Environment Variable Matrix

| Variable Name | Required Apps | Secret / Public | Required / Optional | Hosting Target | Description & Security Guardrails |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | All 5 Apps | **Public** | **Required** | All Vercel Projects | Public REST/Auth endpoint for Supabase (e.g. `https://zujjiiljvjwgcxtaqype.supabase.co`). Safe for client bundles. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All 5 Apps | **Public** | **Required** | All Vercel Projects | Supabase Anonymous JWT key. Governed by Postgres Row-Level Security (RLS). Safe for client bundles. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | All 5 Apps | **Public** | Optional Fallback | All Vercel Projects | Modern alias for `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Supported automatically by `@we-arrange/auth`. |
| `SUPABASE_SERVICE_ROLE_KEY` | `apps/web` Only | **SECRET** | **Required** (Server) | `apps/web` Vercel Environment | Supabase superuser key with full RLS bypass. **Strictly server-only**. Imported only behind `"server-only"` in `packages/database/src/clients.ts`. Never commit or expose to client apps. |
| `NEXT_PUBLIC_SITE_URL` | All 5 Apps | **Public** | **Required** | Specific App Vercel Config | Base URL of the respective application (e.g. `https://youmarriagewearrange.com` or `http://localhost:3000`). Used for canonical URLs, metadata, and OAuth redirects. |
| `NEXT_PUBLIC_API_BASE_URL` | `apps/customer`, `apps/vendor`, `apps/admin`, `apps/concierge` | **Public** | **Required** for Satellites | Satellite Vercel Projects | Target base URL for the backend API gateway (typically `https://youmarriagewearrange.com`). Used by Next.js `rewrites()` in `next.config.ts` to proxy `/api/:path*`. |
| `COOKIE_DOMAIN` | All 5 Apps | Server/Config | Optional (Production) | All Vercel Projects | Shared parent domain for cookie session persistence across subdomains (e.g. `.youmarriagewearrange.com`). Do not set on localhost or across disjoint apex domains. |
| `CLOUDFLARE_R2_ACCOUNT_ID` | `apps/web` | **SECRET** | Optional / Prod Required | `apps/web` Vercel Environment | Cloudflare account identifier for R2 object storage. |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | `apps/web` | **SECRET** | Optional / Prod Required | `apps/web` Vercel Environment | S3-compatible Access Key ID for R2 presigned upload/download URL generation. |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | `apps/web` | **SECRET** | Optional / Prod Required | `apps/web` Vercel Environment | S3-compatible Secret Access Key for R2. Strictly server-only. |
| `CLOUDFLARE_R2_BUCKET` | `apps/web` | Public/Config | Optional / Prod Required | `apps/web` Vercel Environment | Name of the primary R2 media bucket (e.g. `ymwa-media-prod`). |
| `CLOUDFLARE_R2_PUBLIC_BASE_URL` | `apps/web` | **Public** | Optional / Prod Required | `apps/web` Vercel Environment | Custom domain or Cloudflare public CDN URL mapped to the R2 bucket (e.g. `https://media.youmarriagewearrange.com`). |
| `PAYMENT_GATEWAY_PROVIDER` | `apps/web` | Public/Config | Optional (`razorpay`) | `apps/web` Vercel Environment | Payment provider identifier. Supported values: `razorpay`, `stripe`, or `mock`. Defaults to `razorpay`. |
| `PAYMENT_GATEWAY_KEY_ID` | `apps/web` | Public/Config | Optional / Prod Required | `apps/web` Vercel Environment | Public API key / merchant key ID for Razorpay checkout integration. |
| `PAYMENT_GATEWAY_KEY_SECRET` | `apps/web` | **SECRET** | Optional / Prod Required | `apps/web` Vercel Environment | Secret key for server-side order generation, payment captures, and refunds. Strictly server-only. |
| `PAYMENT_WEBHOOK_SECRET` | `apps/web` | **SECRET** | Optional / Prod Required | `apps/web` Vercel Environment | Shared secret for verifying Razorpay webhook HMAC signatures (`X-Razorpay-Signature`). Strictly server-only. |
| `EMAIL_PROVIDER` | `apps/web` | Public/Config | Optional (`resend`) | `apps/web` Vercel Environment | Transactional email provider adapter. Supported values: `resend` or `smtp`. |
| `EMAIL_PROVIDER_API_KEY` | `apps/web` | **SECRET** | Optional / Prod Required | `apps/web` Vercel Environment | API key for Resend transactional email delivery. Strictly server-only. |
| `SMS_PROVIDER` | `apps/web` | Public/Config | Optional (`twilio`) | `apps/web` Vercel Environment | SMS & OTP delivery provider adapter (`twilio` or `fast2sms`). |
| `SMS_PROVIDER_API_KEY` | `apps/web` | **SECRET** | Optional / Prod Required | `apps/web` Vercel Environment | API key / Auth Token for SMS gateway. Strictly server-only. |
| `NOTIFICATION_WEBHOOK_SECRET` | `apps/web` | **SECRET** | Optional | `apps/web` Vercel Environment | Shared secret for authenticating inbound webhook callbacks from notification providers. |

---

## 3. Environment Variable Distribution by Deployment Target

### A. Main Marketplace & API Gateway (`apps/web`)
```bash
# Public
NEXT_PUBLIC_SUPABASE_URL="https://zujjiiljvjwgcxtaqype.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<public-anon-key>"
NEXT_PUBLIC_SITE_URL="https://youmarriagewearrange.com"

# Server Secrets
SUPABASE_SERVICE_ROLE_KEY="<secret-service-role-key>"
COOKIE_DOMAIN=".youmarriagewearrange.com"

# Cloudflare R2 Media (Optional in dev, required in prod)
CLOUDFLARE_R2_ACCOUNT_ID="<account-id>"
CLOUDFLARE_R2_ACCESS_KEY_ID="<access-key-id>"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="<secret-access-key>"
CLOUDFLARE_R2_BUCKET="ymwa-media-prod"
CLOUDFLARE_R2_PUBLIC_BASE_URL="https://media.youmarriagewearrange.com"

# Payment Gateway (Razorpay)
PAYMENT_GATEWAY_PROVIDER="razorpay"
PAYMENT_GATEWAY_KEY_ID="<rzp_key_id>"
PAYMENT_GATEWAY_KEY_SECRET="<rzp_key_secret>"
PAYMENT_WEBHOOK_SECRET="<rzp_webhook_secret>"

# Notifications
EMAIL_PROVIDER="resend"
EMAIL_PROVIDER_API_KEY="<resend_api_key>"
SMS_PROVIDER="twilio"
SMS_PROVIDER_API_KEY="<twilio_auth_token>"
NOTIFICATION_WEBHOOK_SECRET="<shared-webhook-secret>"
```

### B. Customer Application (`apps/customer`)
```bash
NEXT_PUBLIC_SUPABASE_URL="https://zujjiiljvjwgcxtaqype.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<public-anon-key>"
NEXT_PUBLIC_SITE_URL="https://customer.youmarriagewearrange.com"
NEXT_PUBLIC_API_BASE_URL="https://youmarriagewearrange.com"
COOKIE_DOMAIN=".youmarriagewearrange.com"
```

### C. Vendor Application (`apps/vendor`)
```bash
NEXT_PUBLIC_SUPABASE_URL="https://zujjiiljvjwgcxtaqype.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<public-anon-key>"
NEXT_PUBLIC_SITE_URL="https://vendor.youmarriagewearrange.com"
NEXT_PUBLIC_API_BASE_URL="https://youmarriagewearrange.com"
COOKIE_DOMAIN=".youmarriagewearrange.com"
```

### D. Admin Application (`apps/admin`)
```bash
NEXT_PUBLIC_SUPABASE_URL="https://zujjiiljvjwgcxtaqype.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<public-anon-key>"
NEXT_PUBLIC_SITE_URL="https://admin.youmarriagewearrange.com"
NEXT_PUBLIC_API_BASE_URL="https://youmarriagewearrange.com"
COOKIE_DOMAIN=".youmarriagewearrange.com"
```

### E. Concierge Application (`apps/concierge`)
```bash
NEXT_PUBLIC_SUPABASE_URL="https://zujjiiljvjwgcxtaqype.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<public-anon-key>"
NEXT_PUBLIC_SITE_URL="https://concierge.youmarriagewearrange.com"
NEXT_PUBLIC_API_BASE_URL="https://youmarriagewearrange.com"
COOKIE_DOMAIN=".youmarriagewearrange.com"
```

---

## 4. Verification Check Before Staging / Production Launch

1. **Verify No Trailing Slashes**: All URLs (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL`, `CLOUDFLARE_R2_PUBLIC_BASE_URL`) must be defined without trailing slashes. The application code handles sanitation, but strict formatting prevents edge-case double slashes.
2. **Verify Correct Key Pairing**: Ensure `SUPABASE_SERVICE_ROLE_KEY` belongs to project `zujjiiljvjwgcxtaqype` and corresponds to the same database where migrations M01–M14 have been applied.
3. **Verify Webhook Endpoints in Third-Party Portals**:
   - Razorpay Webhook URL: `https://youmarriagewearrange.com/api/webhooks/payment`
   - Notification Webhook URL: `https://youmarriagewearrange.com/api/webhooks/notification`
