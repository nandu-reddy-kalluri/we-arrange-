# Phase 1 — Frontend–Supabase Integration Foundation

**Branch:** `chore/phase-1-integration-foundation`  
**Target Supabase Project:** `YouMarriageWeArrange` (`zujjiiljvjwgcxtaqype`, `ap-south-1`, PostgreSQL 17)  
**Canonical Application:** `apps/web` (Next.js 15 / React 19)

## 1. Summary of Changes (Steps 1–5)

Phase 1 establishes a safe, consistent Supabase client and environment foundation for `apps/web` without modifying database schema, RLS policies, auth flows, middleware, UI, mock data, or legacy root `src/`.

- **Step 1 — Dependency & Environment Foundation:** Aligned workspace tooling to `pnpm@11.10.0`, added `@supabase/ssr@^0.12.7` to `packages/auth` (reusing the locked `@supabase/supabase-js` `2.117.2` resolution), implemented `packages/auth/src/env.ts` with static `NEXT_PUBLIC_*` reads and placeholder rejection, and updated root `.env.example` plus `apps/web/.env.example`.
- **Step 2 — Shared Browser Client:** Updated `packages/auth/src/supabaseClient.ts` to use `createBrowserClient` from `@supabase/ssr` backed by `getSupabasePublicEnv()`, exported `createSupabaseBrowserClient()`, preserved the existing `supabase` export via a lazy `Proxy`, and updated `apps/web/services/supabase/client.ts` to re-export from `@we-arrange/auth`.
- **Step 3 — Server-Side Client:** Added `@supabase/ssr@^0.12.7` to `apps/web/package.json` (for pnpm strict workspace resolution) and created `apps/web/services/supabase/server.ts` using `createServerClient` and Next.js 15 `await cookies()`.
- **Step 4 — Safe Connectivity Verification:** Created `apps/web/app/api/health/supabase/route.ts` and mocked unit tests in `apps/web/app/api/health/supabase/route.test.ts` probing `GET /auth/v1/health` with a 5-second timeout and separating HTTP reachability from HTTP status errors.
- **Step 5 — Documentation & Verification:** Updated `docs/LOCAL_SETUP.md` and added this implementation report.

## 2. Files Added and Modified

### Modified
- `.env.example` — Documented `NEXT_PUBLIC_SUPABASE_URL`, primary `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` without secrets.
- `packages/auth/package.json` — Added `@supabase/ssr@^0.12.7`.
- `packages/auth/src/index.ts` — Re-exported `./env`.
- `packages/auth/src/supabaseClient.ts` — Migrated to `@supabase/ssr` `createBrowserClient` with `createSupabaseBrowserClient()` and lazy `supabase` `Proxy`.
- `apps/web/package.json` — Added `@supabase/ssr@^0.12.7`.
- `apps/web/services/supabase/client.ts` — Re-exported shared Supabase client and env helpers from `@we-arrange/auth`.
- `pnpm-lock.yaml` — Updated lockfile for `@supabase/ssr@0.12.7`.
- `docs/LOCAL_SETUP.md` — Updated prerequisites (`pnpm@11.10.0`), `apps/web/.env.local` setup, health endpoint behavior, and security warnings.

### Added
- `apps/web/.env.example` — App-scoped public Supabase environment template.
- `packages/auth/src/env.ts` — Public Supabase env validation (`getSupabaseConfigStatus`, `hasSupabasePublicEnv`, `getSupabasePublicEnv`).
- `apps/web/services/supabase/server.ts` — Server-only `createSupabaseServerClient()` using `@supabase/ssr` and `next/headers`.
- `apps/web/app/api/health/supabase/route.ts` — Read-only Supabase HTTP reachability diagnostics route.
- `apps/web/app/api/health/supabase/route.test.ts` — Mocked Node test suite (7 tests) covering env errors, client init failures, network/timeout errors, `401`/`403`, `5xx`, and secret/OpenAPI non-leakage.
- `docs/phase-1-supabase-integration.md` — This Phase 1 report.

## 3. Architecture Summary

### Environment Validation (`packages/auth/src/env.ts`)
- Reads `process.env.NEXT_PUBLIC_SUPABASE_URL`, `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` via static property access so Next.js inlines them into browser bundles.
- Prefers `NEXT_PUBLIC_SUPABASE_ANON_KEY` and falls back to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Rejects missing values, known placeholders, and non-`http(s)` URLs without introducing any service-role key helper.

### Browser vs. Server Clients
- **Browser (`packages/auth/src/supabaseClient.ts`, re-exported by `apps/web/services/supabase/client.ts`):** Uses `@supabase/ssr`'s `createBrowserClient(url, anonKey)`. Preserves existing `supabase` imports via a lazy `Proxy` so SSR/static page evaluation does not crash when env vars are unconfigured, while still failing loudly on actual use and caching a singleton only in the browser (`typeof window !== "undefined"`).
- **Server (`apps/web/services/supabase/server.ts`):** Uses `@supabase/ssr`'s `createServerClient` with `await cookies()` from `next/headers`. Cookie `setAll` swallows only Next.js's Server Component read-only mutation error (`"Cookies can only be modified in a Server Action or Route Handler"`) and re-throws unexpected failures. `next/headers` is never imported into `packages/auth`.

### Health Endpoint (`apps/web/app/api/health/supabase/route.ts`)
- Distinguishes `missing_environment` (`503`), `invalid_environment` (`500`), `client_initialization_failed` (`500`), `service_unreachable` (`503`, `reachable: false`), `auth_rejected` (`502`, `reachable: true` on `401`/`403`), `upstream_error` (`502`, `reachable: true` on `5xx`/other non-`2xx`), and `service_reachable` (`200`, `reachable: true`).
- Probes `GET /auth/v1/health` with `apikey` and `Accept: application/json` (avoiding PostgREST `/rest/v1/` OpenAPI schema exposure and supporting both `anon` JWTs and `sb_publishable_*` keys) with a 5-second `AbortSignal.timeout(5000)`, cancels the response stream, never returns secrets or raw errors/bodies, and marks `databaseConnectivity` and `rlsVerification` as `"not_verified"`.

## 4. Verification Results

| Check | Classification | Result & Details |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | **Passed** | All 21 workspace projects verified up to date using `pnpm@11.10.0`. |
| `node --test apps/web/app/api/health/supabase/route.test.ts` | **Passed** | 7/7 mocked unit tests passed for `/api/health/supabase`. |
| `git status -s` / `git diff --stat` | **Passed** | Only intended Phase 1 files modified/added; root `src/`, schema, RLS, UI, auth flows, middleware, and other apps untouched; zero commits made. |
| `pnpm --filter web typecheck` | **Failed due to pre-existing issues** | 0 errors in Phase 1 files; fails on `packages/config/tailwind.config.ts(1,29): error TS2307` (`Cannot find module 'tailwindcss'`). |
| `pnpm --filter concierge typecheck` | **Failed due to pre-existing issues** | Fails on the same `packages/config/tailwind.config.ts(1,29): error TS2307`. |
| `pnpm --filter customer typecheck` | **Failed due to pre-existing issues** | Fails on the same `packages/config/tailwind.config.ts(1,29): error TS2307`. |
| `pnpm --filter web lint` | **Failed due to pre-existing issues** | Fails resolving `@next/eslint-plugin-next` from root `eslint.config.mjs` under pnpm strict isolation. |
| `pnpm --filter web build` | **Failed due to pre-existing issues** | Next.js webpack/app compilation succeeded (`✓ Compiled successfully in 41s`), then Next's lint & typecheck phase failed on the same pre-existing `@next/eslint-plugin-next` and `packages/config/tailwind.config.ts` errors. |
| Live `GET /api/health/supabase` | **Not run** | No `apps/web/.env.local` exists locally; live HTTP connectivity to `zujjiiljvjwgcxtaqype.supabase.co` was not run or claimed. |

## 5. Pre-existing Issues, Limitations, and Deferred Work

- **No `.env.local` in workspace:** Live connectivity against `https://zujjiiljvjwgcxtaqype.supabase.co` and end-to-end Next.js runtime verification with real keys were not executed.
- **Database & RLS unverified:** No database tables, RPCs, or RLS policies were queried or modified in Phase 1.
- **Pre-existing TypeScript issue:** `pnpm --filter <app> typecheck` fails on `packages/config/tailwind.config.ts(1,29): error TS2307` (`Cannot find module 'tailwindcss' or its corresponding type declarations`) across `web`, `concierge`, and `customer`.
- **Pre-existing ESLint issue:** `pnpm --filter web lint` fails because root `eslint.config.mjs` cannot resolve `@next/eslint-plugin-next` under pnpm strict `node_modules` isolation.
- **Pre-existing `packages/auth` standalone `tsc` caveat:** `packages/auth` lacks `@types/node`, relying on consuming apps during workspace builds/typechecks.
- **Deferred security & architecture risks (for later phases):**
  - Tracked `.admin_auth.json` plaintext credentials and hardcoded fallback admin password in `packages/auth/src/adminAuth.ts`, paired with presence-only cookie check (`ymwa_admin_session`) in `apps/web/middleware.ts`.
  - `apps/web/services/adminDataService.ts` performs direct client-side table writes via the anon key; table names (`quote_leads`, `page_contents`) also diverge from `.agents/rules/DATABASE_SECURITY.md`.
  - React components call `supabase.auth.*` directly rather than through a unified service layer; `apps/concierge` calls `/api/admin/auth/*` without local route handlers; legacy root `src/` remains orphaned; TanStack Query is not yet installed.

