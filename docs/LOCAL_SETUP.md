# YMWA — Local Development Setup

## Prerequisites
- Node.js (20.x LTS)
- npm (10.x)
- Git (2.x)

## Step 1 — Install Dependencies
```bash
npm install
```

## Step 2 — Configure Environment Variables
Create a `.env.local` file from `.env.example`.
Required keys:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Never expose to client)
- `NEXT_PUBLIC_SITE_URL`

## Step 3 — Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Step 4 — Verify Build & Lint
```bash
npm run build
npx tsc --noEmit
npm run lint
```
