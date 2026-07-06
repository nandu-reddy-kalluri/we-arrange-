max 200 lines

# ENGINEERING RULES

## AI Coding Rules (Ponytail Philosophy)

Before creating anything:

1. Does this need to exist?
   If no → don't build.

2. Already exists in codebase?
   Reuse it.

3. Framework/native solution exists?
   Use that.

4. Existing dependency solves it?
   Use that.

5. Create only the minimum required code.

**Avoid:**
- unnecessary files
- unnecessary abstractions
- duplicate components
- premature optimization
- "future-proof" code with no need
- adding packages without reason

**Never compromise:**
- authentication
- authorization
- validation
- security
- accessibility
- error handling

## Safe Refactor Rules
**Allowed:**
- remove duplicate code
- simplify files
- improve naming
- organize rules

**Not allowed (unless specifically requested):**
- visual changes
- feature changes
- database changes

After cleanup verify: app builds, UI unchanged, routes work, authentication works.

## Dependency Rules
Before installing a package, check:
1. Is it already installed?
2. Can the framework solve it?
3. Can a browser API solve it?
4. Is the package worth the maintenance?
Avoid dependency pollution. Do not install animation libraries other than Framer Motion (no GSAP, Lottie, anime.js).

## Anti-Pattern Blacklist
If a proposed feature, UI change, data model, or API endpoint matches any pattern below — **STOP**. Do not implement it.

**Business Model Anti-Patterns:**
- Sort-by-price (ascending/descending)
- Automated venue recommendations
- Star-ratings as the primary discovery mechanic
- Vendor self-registration / self-listing (All vendors are vetted and added by YMWA admin)
- "Get instant quotes" with no human step (All CTAs must lead to a "We'll contact you" form)
- Listing all venues with no filtering by YMWA vetting
- Automated scraping of venue pricing from external sites

**Architecture Anti-Patterns:**
- Creating `VenueCardV2`, `VenueCardNew` instead of extending the canonical `VenueCard`.
- Inline `bg-[#...]` or `text-[#...]` for brand colors. Use tokens.
- Declaring `font-family` in `globals.css` for new page sections. Typography is global in `src/app/layout.tsx`.
- Writing Supabase client code inside React component render functions.
- Placing `<html>` or `<body>` inside nested layouts.
- Adding `pages/` directory routes (App Router exclusively).
- Using `any` TypeScript type without a comment justifying it.

**Data Model Anti-Patterns:**
- Using `price` as a sortable field in queries.
- Adding `verified_by_ai` field to any table (All vetting is human).
- Storing scraped data in any table.
- Mixing English and Telugu in DB column names.

**Content & Copy Anti-Patterns:**
- "Best Price Guaranteed" without concierge context.
- "Browse X venues" (Use "Discover").
- "Find your perfect match" (Use "Let our specialists find your match").
- Displaying guest count as "seats".
- Displaying price in USD or using `$` symbol.

## Security & Environment Variables
- Never commit `.env.local` to Git.
- Always use the `node node_modules/...` form if `npx` is blocked on Windows.
- Next.js environment variables must be prefixed with `NEXT_PUBLIC_` if they need to be accessed in the browser.
- Service Role Keys (`SUPABASE_SERVICE_ROLE_KEY`) must NEVER be prefixed with `NEXT_PUBLIC_` and must only be used in secure server environments.

## Testing Strategy
- Tests should be placed next to the files they test or in a dedicated `__tests__` folder for features.
- Build verifications should be run before PRs (`npm run build`, `npm run lint`, `npx tsc --noEmit`).
