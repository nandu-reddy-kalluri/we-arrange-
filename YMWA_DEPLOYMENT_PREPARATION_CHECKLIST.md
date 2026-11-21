# We Arrange (YMWA) — Deployment Preparation Checklist

This checklist provides the exact, sequential operational steps for devops, engineering leads, or platform administrators when production deployment is authorized.

> [!IMPORTANT]
> **Pre-Deployment Safety Reminder**: No production deployments, DNS modifications, or live database alterations should be executed without explicit operator approval.

---

## Stage 1: Supabase Production Configuration (Project `zujjiiljvjwgcxtaqype`)

- [ ] **1.1 Migration State Verification**:
  - Verify that migrations `20261031083047` through `20261116103058` are applied.
- [ ] **1.2 Leaked Password Protection**:
  - In Supabase Dashboard, navigate to **Authentication > Password Security**.
  - Toggle **Enable Leaked Password Protection** to `ON` (checks HaveIBeenPwned.org).
- [ ] **1.3 Site URL & Allowed Redirect URLs**:
  - In Supabase Dashboard, navigate to **Authentication > URL Configuration**.
  - Set **Site URL**: `https://youmarriagewearrange.com`
  - Add **Redirect URLs**:
    - `https://youmarriagewearrange.com/**`
    - `https://customer.youmarriagewearrange.com/**`
    - `https://vendor.youmarriagewearrange.com/**`
    - `https://admin.youmarriagewearrange.com/**`
    - `https://concierge.youmarriagewearrange.com/**`
- [ ] **1.4 Email Auth Settings**:
  - Enable Custom SMTP / Resend provider in Supabase Auth if using direct Supabase confirmation emails.
  - Review email confirmation templates for branding consistency.

---

## Stage 2: Vercel Project Setup (5 Independent Projects)

Deploy the repository as 5 separate Vercel projects sharing the same Git repository (`nandu-reddy-kalluri/we-arrange-`):

| Project Name | Root Directory | Framework | Build Command | Output Directory |
| :--- | :--- | :--- | :--- | :--- |
| `ymwa-web` | `apps/web` | Next.js | `pnpm --filter web build` | `.next` (default) |
| `ymwa-customer` | `apps/customer` | Next.js | `pnpm --filter customer build` | `.next` (default) |
| `ymwa-vendor` | `apps/vendor` | Next.js | `pnpm --filter vendor build` | `.next` (default) |
| `ymwa-admin` | `apps/admin` | Next.js | `pnpm --filter admin build` | `.next` (default) |
| `ymwa-concierge` | `apps/concierge` | Next.js | `pnpm --filter concierge build` | `.next` (default) |

- [ ] Configure `pnpm` as the package manager in Vercel Project Settings.
- [ ] Set **Install Command**: `pnpm install`

---

## Stage 3: Environment Variable Provisioning

Reference [YMWA_ENVIRONMENT_VARIABLE_MATRIX.md](file:///c:/Users/varsh/Documents/PROJECTS/YMWA/we-arrange-/YMWA_ENVIRONMENT_VARIABLE_MATRIX.md) for variable definitions.

### 3.1 All Five Projects
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://zujjiiljvjwgcxtaqype.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<production-anon-key>`
- [ ] `COOKIE_DOMAIN` = `.youmarriagewearrange.com`

### 3.2 Satellite Projects (`customer`, `vendor`, `admin`, `concierge`)
- [ ] `NEXT_PUBLIC_API_BASE_URL` = `https://youmarriagewearrange.com`
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://<subdomain>.youmarriagewearrange.com`

### 3.3 Main Gateway Project (`ymwa-web`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `<production-service-role-key>` (Server-only)
- [ ] `CLOUDFLARE_R2_ACCOUNT_ID` = `<account-id>`
- [ ] `CLOUDFLARE_R2_ACCESS_KEY_ID` = `<access-key-id>`
- [ ] `CLOUDFLARE_R2_SECRET_ACCESS_KEY` = `<secret-access-key>`
- [ ] `CLOUDFLARE_R2_BUCKET` = `ymwa-media-prod`
- [ ] `CLOUDFLARE_R2_PUBLIC_BASE_URL` = `https://media.youmarriagewearrange.com`
- [ ] `PAYMENT_GATEWAY_PROVIDER` = `razorpay`
- [ ] `PAYMENT_GATEWAY_KEY_ID` = `<razorpay-key-id>`
- [ ] `PAYMENT_GATEWAY_KEY_SECRET` = `<razorpay-key-secret>`
- [ ] `PAYMENT_WEBHOOK_SECRET` = `<razorpay-webhook-secret>`
- [ ] `EMAIL_PROVIDER` = `resend`
- [ ] `EMAIL_PROVIDER_API_KEY` = `<resend-api-key>`
- [ ] `SMS_PROVIDER` = `twilio`
- [ ] `SMS_PROVIDER_API_KEY` = `<twilio-auth-token>`

---

## Stage 4: DNS & Cloudflare Routing

- [ ] **4.1 Apex Domain**: Add CNAME or A record for `youmarriagewearrange.com` pointing to Vercel.
- [ ] **4.2 Subdomains**:
  - `customer.youmarriagewearrange.com` -> `cname.vercel-dns.com`
  - `vendor.youmarriagewearrange.com` -> `cname.vercel-dns.com`
  - `admin.youmarriagewearrange.com` -> `cname.vercel-dns.com`
  - `concierge.youmarriagewearrange.com` -> `cname.vercel-dns.com`
  - `media.youmarriagewearrange.com` -> Cloudflare R2 bucket custom domain
- [ ] **4.3 SSL/TLS**: Ensure Full (Strict) SSL is active on Cloudflare and SSL certificates are issued by Vercel.

---

## Stage 5: Webhook Configuration

- [ ] **5.1 Razorpay Webhook**:
  - Endpoint: `https://youmarriagewearrange.com/api/webhooks/payment`
  - Secret: Match `PAYMENT_WEBHOOK_SECRET`
  - Active Events: `order.paid`, `payment.captured`, `payment.failed`, `refund.processed`
- [ ] **5.2 Notification Webhooks**:
  - Endpoint: `https://youmarriagewearrange.com/api/webhooks/notification`
  - Secret: Match `NOTIFICATION_WEBHOOK_SECRET`

---

## Stage 6: Post-Deployment Smoke Test Protocol

- [ ] **6.1 Public Website Smoke Test**:
  - Visit `https://youmarriagewearrange.com/` — check Hero section and navigation.
  - Visit `/venues` and `/vendors` — verify search, category filters, and detail page rendering.
  - Check informational pages (`/about`, `/contact`, `/terms`, `/privacy`, `/faq`).
- [ ] **6.2 Customer Journey**:
  - Register new test couple account on `https://customer.youmarriagewearrange.com/register`.
  - Verify session persistence and dashboard access.
  - Test saving a venue to favorites.
- [ ] **6.3 Vendor Experience**:
  - Access `https://vendor.youmarriagewearrange.com/login`.
  - Log in with partner test account; verify `Verified Partner` or `Pending Verification` status.
- [ ] **6.4 Admin Security Boundary**:
  - Confirm public navigation has **zero** links to admin routes.
  - Navigate to `https://admin.youmarriagewearrange.com/login143`.
  - Attempt login with non-admin credentials — verify immediate rejection.
  - Log in with active administrator credentials — verify dashboard metrics and moderation queue.
- [ ] **6.5 Concierge Desk Operations**:
  - Log in at `https://concierge.youmarriagewearrange.com/login`.
  - Verify inquiry lead workspace, comparison sheets, and custom quote builder.
- [ ] **6.6 Health Checks**:
  - Probe `https://youmarriagewearrange.com/api/health` — expect HTTP 200 `{ status: "ok" }`.
