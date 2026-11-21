# YMWA — Local Development Setup

## Prerequisites

- **Node.js:** `20.x` LTS or newer (verified locally on `v24.14.0`)
- **pnpm:** **`11.10.0`** (strictly required to match `"packageManager": "pnpm@11.10.0"` in root `package.json`; do not use `npm`, `yarn`, or `pnpm@12`)
- **Git:** `2.x`

Verify or install the exact `pnpm` version:

```bash
corepack enable
# or install globally if not using Corepack:
npm install -g pnpm@11.10.0

pnpm --version # must print 11.10.0
```

## Step 1 — Install Workspace Dependencies

From the repository root (`we-arrange-`), install all monorepo workspaces using the frozen lockfile:

```bash
pnpm install --frozen-lockfile
```

The canonical active Next.js application is `apps/web`. Do not run installs or dev servers from the legacy root `src/` files.

## Step 2 — Configure Supabase Public Environment Variables

Target Supabase project metadata:
- **Project:** `YouMarriageWeArrange`
- **Project Ref:** `zujjiiljvjwgcxtaqype`
- **Region:** `ap-south-1`
- **Project URL:** `https://zujjiiljvjwgcxtaqype.supabase.co`

Next.js loads environment variables from the application directory, so create **`apps/web/.env.local`** from [`apps/web/.env.example`](../apps/web/.env.example):

```bash
cp apps/web/.env.example apps/web/.env.local
```

Set the required public variables in `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://zujjiiljvjwgcxtaqype.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-or-publishable-key>
# Optional fallback if NEXT_PUBLIC_SUPABASE_ANON_KEY is not set:
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<sb_publishable_...>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Variable rules:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the primary supported public key variable.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is supported as a fallback when `NEXT_PUBLIC_SUPABASE_ANON_KEY` is unset.
- **Never** put service-role keys (`SUPABASE_SERVICE_ROLE_KEY` or `sb_secret_*`) into any `NEXT_PUBLIC_*` or browser-accessible environment variable. Phase 1 intentionally does not include a service-role client.
- **Never** commit `.env.local` (it is ignored by `.gitignore`).

## Step 3 — Run the Canonical Web Application

Start `apps/web` from the repository root:

```bash
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000).

## Step 4 — Test `/api/health/supabase`

With `apps/web` running, query the Supabase health-check endpoint:

```bash
curl -i http://localhost:3000/api/health/supabase
```

The endpoint probes `GET ${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health` with your configured public `apikey` header (5-second timeout, response body discarded) and returns one of the following statuses:

| `status` | HTTP | `service.reachable` | Meaning |
| --- | --- | --- | --- |
| `missing_environment` | `503` | `false` | Required `NEXT_PUBLIC_SUPABASE_URL` or public key env var is missing or still a placeholder. |
| `invalid_environment` | `500` | `false` | `NEXT_PUBLIC_SUPABASE_URL` is not a valid `http(s)` URL, or the public key contains whitespace/control characters. |
| `client_initialization_failed` | `500` | `false` | `createSupabaseServerClient()` threw while initializing the SSR client. |
| `service_unreachable` | `503` | `false` | Network failure or 5-second timeout (`service.timedOut: true`) before receiving an HTTP response. |
| `auth_rejected` | `502` | `true` | Supabase Auth responded with HTTP `401` or `403`, rejecting the configured public API key. |
| `upstream_error` | `502` | `true` | Supabase Auth responded with an HTTP `5xx` (including `503`) or another unexpected non-`2xx` status. |
| `service_reachable` | `200` | `true` | Supabase Auth HTTP endpoint responded `2xx`. |

> **Important:** A `service_reachable` (`200`) response proves only that your environment configuration is valid, the server client initialized, and Supabase Auth is reachable over HTTP. It does **not** prove PostgreSQL database connectivity, table/schema existence, or Row Level Security (RLS) correctness (`databaseConnectivity` and `rlsVerification` always report `"not_verified"`).

## Step 5 — Verification Commands

```bash
pnpm --filter web build
pnpm --filter web typecheck
pnpm --filter web lint
node --test apps/web/app/api/health/supabase/route.test.ts
```

Note: In the current baseline, `typecheck` and `lint` have pre-existing workspace issues unrelated to Phase 1 (see [`docs/phase-1-supabase-integration.md`](./phase-1-supabase-integration.md)).
