# YMWA — Local Development Setup

Follow these steps in order. Each step must succeed before proceeding to the next.

---

## Prerequisites

Confirm these tools are installed on your machine before starting:

| Tool | Minimum Version | Check Command |
|:---|:---:|:---|
| Node.js | 20.x LTS | `node --version` |
| npm | 10.x | `npm --version` |
| Git | 2.x | `git --version` |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/your-org/youmarriagewearrange.git
cd youmarriagewearrange
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

Expected output: dependencies installed with zero peer-dependency errors.

---

## Step 3 — Configure Environment Variables

1. Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

If `.env.example` does not exist, create `.env.local` manually with these contents:

```env
# ─── Supabase ────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ─── Application ─────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

2. Get your Supabase credentials from the project owner or from the Supabase dashboard → Settings → API.

> [!CAUTION]
> Never commit `.env.local` to Git. It is already listed in `.gitignore`.

Full variable definitions: [`.claude/rules/environment-variables.md`](../../.claude/rules/environment-variables.md)

---

## Step 4 — Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Expected: The YouMarriageWeArrange landing page loads without console errors.

---

## Step 5 — Verify TypeScript Compilation

```bash
node node_modules/typescript/bin/tsc --noEmit
```

Expected output: empty (zero errors, zero warnings).

> [!NOTE]
> If `npx` is blocked by PowerShell execution policy (Windows), always use the `node node_modules/...` form above.

---

## Step 6 — Run the Linter

```bash
npm run lint
```

Resolve any lint errors before committing.

---

## Step 7 — Verify the Build (Optional, before PR)

```bash
npm run build
```

Expected: successful build with no TypeScript or import errors.

---

## Common Setup Issues

| Symptom | Likely Cause | Fix |
|:---|:---|:---|
| `Module not found: @/...` | Path alias not resolving | Verify `tsconfig.json` has `"paths": {"@/*": ["./src/*"]}` |
| `Error: supabaseUrl is required` | Missing `.env.local` | Create `.env.local` from Step 3 |
| Hydration mismatch warnings in console | Expected in dev with browser extensions | Not a setup issue. See `CLAUDE.md` §3 |
| PowerShell script execution error | Windows execution policy | Use `node node_modules/typescript/bin/tsc` instead of `npx tsc` |
| Port 3000 already in use | Another dev server running | Kill it or use `npm run dev -- -p 3001` |

---

## Project Structure Quick Reference

```
src/
├── app/              ← Next.js App Router pages (route entry points only)
│   ├── (auth)/       ← Auth route group
│   ├── (dashboard)/  ← Customer dashboard route group
│   └── (public)/     ← Public marketing pages
├── components/       ← Shared UI atoms (VenueCard, VendorCard, etc.)
├── design-system/    ← Theme tokens (theme.ts)
├── features/         ← Domain feature modules
│   ├── home/         ← Landing page sections
│   ├── venues/       ← Venue discovery feature
│   ├── vendors/      ← Vendor discovery feature
│   ├── quotes/       ← Quote management feature
│   └── comparison/   ← Comparison sheet feature
├── services/         ← Data access layer (Supabase clients, API calls)
├── hooks/            ← Shared React hooks
└── types/            ← Shared TypeScript interfaces
```

Full architecture: [`docs/architecture/system-diagram.md`](../architecture/system-diagram.md)
