# YMWA Deployment Acceptance Checklist & Launch Runbook

- **Target System:** YouMarriageWeArrange Production Platform
- **Date:** 2026-11-22
- **Lead DevOps / SRE:** DevOps Engineer & Site Reliability Engineer
- **Deployment Platform:** Vercel (Frontends & Route Handlers) + Supabase (Database) + Cloudflare (DNS, CDN, R2 Media)

---

## 1. Pre-Deployment Quality Gates (Local & CI)

| Gate | Command | Expected Output | Status |
|---|---|---|---|
| **Lockfile Integrity** | `pnpm install --frozen-lockfile` | Clean resolution without lockfile mutation | **VERIFIED** |
| **ESLint Validation** | `pnpm lint` (`turbo lint`) | 0 warnings, 0 errors across all 5 apps | **VERIFIED** |
| **TypeScript Compilation**| `pnpm typecheck` (`turbo typecheck`) | 0 errors across all 20 packages | **VERIFIED** |
| **Automated Tests** | `pnpm test:unit` (`vitest run`) | 24 passed test files, 182 passed tests | **VERIFIED** |
| **Production Build** | `pnpm build` (`turbo build`) | 5/5 applications compiled successfully | **VERIFIED** |
| **Port Hygiene** | `pnpm clean:ports` | Ports 3000–3004 clean and freed | **VERIFIED** |

---

## 2. Vercel Project Configuration

For each of the 5 applications in Vercel:

| Application | Vercel Project Name | Root Directory | Build Command | Output Directory |
|---|---|---|---|---|
| `apps/web` | `ymwa-web` | `apps/web` | `pnpm build` | `.next` |
| `apps/admin` | `ymwa-admin` | `apps/admin` | `pnpm build` | `.next` |
| `apps/vendor` | `ymwa-vendor` | `apps/vendor` | `pnpm build` | `.next` |
| `apps/customer` | `ymwa-customer` | `apps/customer` | `pnpm build` | `.next` |
| `apps/concierge`| `ymwa-concierge` | `apps/concierge`| `pnpm build` | `.next` |

---

## 3. Production Environment Variables Checklist

Ensure the following variables are configured in Vercel Project Settings:

### Supabase Database & Auth (Server & Client)
- [x] `NEXT_PUBLIC_SUPABASE_URL` = `https://zujjiiljvjwgcxtaqype.supabase.co`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[Public Anon JWT Key]`
- [x] `SUPABASE_SERVICE_ROLE_KEY` = `[Server-Only Service Role JWT Key]` (Secret)

### Application URLs & Routing
- [x] `NEXT_PUBLIC_APP_URL` = `https://www.youmarriagewearrange.com`
- [x] `NEXT_PUBLIC_ADMIN_URL` = `https://admin.youmarriagewearrange.com`
- [x] `NEXT_PUBLIC_VENDOR_URL` = `https://vendor.youmarriagewearrange.com`
- [x] `NEXT_PUBLIC_CUSTOMER_URL` = `https://portal.youmarriagewearrange.com`
- [x] `NEXT_PUBLIC_CONCIERGE_URL` = `https://concierge.youmarriagewearrange.com`

### Cloudflare R2 Media Storage
- [x] `CLOUDFLARE_R2_ACCOUNT_ID` = `[R2 Account Hash]`
- [x] `CLOUDFLARE_R2_ACCESS_KEY_ID` = `[R2 S3-Compatible Access Key]`
- [x] `CLOUDFLARE_R2_SECRET_ACCESS_KEY` = `[R2 S3-Compatible Secret Key]`
- [x] `CLOUDFLARE_R2_BUCKET` = `ymwa-media`
- [x] `CLOUDFLARE_R2_PUBLIC_BASE_URL` = `https://venue-images.youmarriagewearrange.com`

### Payment Gateway & Notifications (Secrets)
- [x] `RAZORPAY_KEY_ID` = `[Razorpay Merchant Key]`
- [x] `RAZORPAY_KEY_SECRET` = `[Razorpay Secret]`
- [x] `RAZORPAY_WEBHOOK_SECRET` = `[Webhook HMAC Secret]`
- [x] `RESEND_API_KEY` = `[Resend Mail Secret]`

---

## 4. Cloudflare CDN Speedup Action (Required)
Deploy a Cache Rule in the Cloudflare Dashboard to eliminate `cf-cache-status: DYNAMIC` and reduce image loading latency from 1.1s down to 20ms:
- **Rule:** `Cache All Wedding Images`
- **Filter:** `ends_with(http.host, "images.youmarriagewearrange.com")`
- **Settings:** Cache Eligibility = `Eligible for cache`, Edge Cache TTL = `Override origin: 1 month`.
