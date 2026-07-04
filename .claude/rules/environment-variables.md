# YMWA Environment Variables Standard

This document defines every environment variable used in YouMarriageWeArrange, their naming conventions, security classifications, and correct usage locations.

> [!CAUTION]
> Never commit real environment variable values to Git. Always use `.env.local` for local development and the Vercel Environment Variables dashboard for staging and production.

---

## 1. Naming Conventions

All environment variables follow this structure:

```
[SCOPE]_[SERVICE]_[DESCRIPTOR]
```

- **`NEXT_PUBLIC_`** prefix → Safe to expose in the browser bundle. Do NOT put secrets here.
- **No prefix** → Server-only. Never accessible in client-side code.

### Examples

| Variable Name | Scope | Used In |
|:---|:---:|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | Supabase client init in Client Components |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe | Supabase client init in Client Components |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Admin operations in Route Handlers only |
| `NEXT_PUBLIC_SITE_URL` | Browser-safe | Canonical URL generation, OG meta tags |

---

## 2. Complete Variable Registry

### 2.1 Supabase

| Variable | Required | Scope | Description |
|:---|:---:|:---:|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Browser | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Browser | Supabase anon/public key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Server | Full admin access. **Never expose in client code.** |

### 2.2 Application

| Variable | Required | Scope | Description |
|:---|:---:|:---:|:---|
| `NEXT_PUBLIC_SITE_URL` | ✅ Yes | Browser | Full canonical URL (e.g. `https://youmarriagewearrange.com`) |
| `NEXT_PUBLIC_APP_ENV` | ✅ Yes | Browser | `development`, `staging`, or `production` |

### 2.3 Third-Party Services (Phase 2+)

| Variable | Required | Scope | Description |
|:---|:---:|:---:|:---|
| `RESEND_API_KEY` | Phase 2 | Server | Email delivery for quote notifications |
| `WHATSAPP_WEBHOOK_SECRET` | Phase 2 | Server | WhatsApp Business API webhook verification |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Phase 2 | Browser | Google Analytics 4 measurement ID |
| `CLOUDINARY_CLOUD_NAME` | Phase 3 | Browser | Media CDN for venue/vendor images |
| `CLOUDINARY_API_KEY` | Phase 3 | Server | Cloudinary upload credentials |
| `CLOUDINARY_API_SECRET` | Phase 3 | Server | Cloudinary API secret. **Never expose.** |

---

## 3. .env.local Template

Copy this to `.env.local` when setting up the project locally. Fill in values from the Supabase dashboard.

```env
# ─── Supabase ────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ─── Application ─────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

---

## 4. Security Classification Matrix

| Classification | Examples | Rules |
|:---|:---|:---|
| 🟢 **Public** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SITE_URL` | Safe in browser. Still rotate if compromised. |
| 🟡 **Semi-Private** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public-safe, but Supabase RLS must be correctly configured for this to be secure. |
| 🔴 **Secret** | `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` | Server-side only. Never `NEXT_PUBLIC_`. Never log. Never expose in error messages. |

---

## 5. Rules for AI Agents and Developers

- **Never** invent a new variable name without adding it to this document first.
- **Never** use a `NEXT_PUBLIC_` prefix for secrets, service keys, or webhook secrets.
- **Never** hardcode a value that should be an environment variable (e.g., `const url = "https://xyz.supabase.co"`).
- **Always** read environment variables through `process.env.VARIABLE_NAME` — never through `window` or `localStorage`.
- When in doubt about the right scope for a new variable, default to **server-only** (no prefix) and open a discussion.

---

## 6. Vercel Deployment Environment Setup

Variables are promoted across environments:

| Environment | Variables Set |
|:---|:---|
| **Development (local)** | `.env.local` file |
| **Preview (Vercel PR previews)** | Vercel → Settings → Environment Variables → Preview |
| **Production** | Vercel → Settings → Environment Variables → Production |

`NEXT_PUBLIC_APP_ENV` must be set to the correct value in each environment:
- Local: `development`
- Preview: `staging`
- Production: `production`
