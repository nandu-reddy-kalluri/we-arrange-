# YMWA Anti-Pattern Blacklist

This document is an **active enforcement checklist** for all human developers and AI agents.

Every item listed here represents a pattern that has been **explicitly rejected** because it would convert YouMarriageWeArrange from a Premium Wedding Concierge Platform into a generic wedding marketplace or directory.

> [!CAUTION]
> If a proposed feature, UI change, data model, or API endpoint matches any pattern below — **STOP**. Flag it for architectural review before proceeding. Do not implement it. Do not merge it.

---

## 1. Business Model Anti-Patterns

These patterns destroy the concierge identity at the product level.

| Anti-Pattern | Why It's Forbidden | What to Do Instead |
|:---|:---|:---|
| **Sort-by-price (ascending/descending)** | Converts YMWA into a directory browser. Reduces trust in concierge curation. | Let the concierge team present pre-sorted, negotiated shortlists. |
| **Automated venue recommendations** | Removes the human intermediary. Makes YMWA look like an algorithm, not a concierge. | Concierge team assembles recommendations manually from submitted requirements. |
| **Star-ratings as the primary discovery mechanic** | Turns the platform into TripAdvisor. Encourages self-promotion by vendors. | Ratings may appear as context but must never drive sorting, ranking, or CTA prominence. |
| **Vendor self-registration / self-listing** | Allows unvetted vendors to appear. Breaks the curated trust promise. | All vendors are added and approved by the YMWA admin team only. |
| **"Get instant quotes" with no human step** | Implies automation. Misleads users about the business model. | CTAs must always lead to a "We'll contact you" form, not automated price generation. |
| **Listing all venues with no filtering by YMWA vetting** | Turns the platform into a raw directory like JustDial. | Only show venues that have been personally contacted and confirmed by the concierge team. |
| **Automated scraping of venue pricing from external sites** | Produces inaccurate, stale pricing. Undermines negotiation value proposition. | All pricing is collected directly by concierge specialists and stored as manually entered quotes. |

---

## 2. UX / UI Anti-Patterns

These patterns damage the premium, editorial design identity.

| Anti-Pattern | Why It's Forbidden |
|:---|:---|
| **Floating hearts, confetti overlays, or fireworks animations** | Cheap and distracting. Inconsistent with luxury hospitality design language. |
| **Heavy glassmorphism that obscures readable text** | Prioritises visual gimmick over usability. |
| **Particle engine backgrounds or animated gradient blobs** | GPU-intensive, mobile-damaging, visually cluttered. |
| **Generic stock photography (confetti, wine glasses, cartoon couples)** | Breaks the editorial, venue-photography-led visual identity. |
| **Comic Sans, Roboto, or system-default fonts on headings** | Destroys brand typography. Only Playfair Display for headings. |
| **SaaS-style pricing tables on the landing page** | Makes YMWA look like a subscription tool, not a concierge service. |
| **Generic "Sign Up Free" or "Try For Free" CTA language** | Misrepresents the business model. Use "Begin Your Planning Journey" or "Talk to a Specialist". |
| **Progress bars, gamification badges, or loyalty points** | Inappropriate for a premium luxury context. |

---

## 3. Architecture Anti-Patterns

These patterns damage the technical health or scalability of the codebase.

| Anti-Pattern | Why It's Forbidden |
|:---|:---|
| **Creating `VenueCardV2`, `VenueCardNew`, `VenueCardImproved`** | Component duplication. Use and extend the canonical `VenueCard` in `src/components/cards/`. |
| **Inline `bg-[#...]` or `text-[#...]` for brand colors** | Use design system tokens from `tailwind.config.ts`. Raw hex breaks the token system. |
| **Declaring `font-family` in `globals.css` for new page sections** | Typography is set globally in `src/app/layout.tsx`. Never override per-page. |
| **Writing Supabase client code inside React component render functions** | Database calls must live in `src/services/supabase/` or `features/*/services/`. |
| **Placing `<html>` or `<body>` inside nested layouts** | Causes React hydration mismatches. Only `src/app/layout.tsx` owns the root HTML shell. |
| **Adding `pages/` directory routes** | YMWA uses Next.js 15 App Router exclusively. `pages/` creates a mixed routing system. |
| **Installing animation libraries other than Framer Motion** | GSAP, Lottie, anime.js create bundle conflicts. Framer Motion is the sole animation dependency. |
| **Using `any` TypeScript type without a comment justifying it** | Breaks type safety. Every `any` must have a `// TODO:` comment with a typed refactor plan. |

---

## 4. Data Model Anti-Patterns

| Anti-Pattern | Why It's Forbidden |
|:---|:---|
| **Using `price` as a sortable field in venue queries** | Enables price-sorting feature. Pricing is presented as curated context, not a filter dimension. |
| **Adding a `verified_by_ai` field to any table** | Implies automated verification. All vetting is human. Use `verified_by_admin` only. |
| **Storing scraped data in any table** | All data is manually entered or directly submitted. No automated ingestion pipelines. |
| **Mixing English and Telugu in database column names** | Naming must follow the snake_case English convention defined in `docs/database/naming-conventions.md`. |

---

## 5. Content & Copy Anti-Patterns

| Anti-Pattern | Why It's Forbidden |
|:---|:---|
| **"Best Price Guaranteed" without concierge context** | Misleads users into thinking YMWA is a price comparison aggregator. |
| **"Browse X venues"** | "Browse" implies a directory. Use "Discover" or "Explore curated selections". |
| **"Find your perfect match" (algorithmic language)** | Implies automation. Use "Let our specialists find your match". |
| **Displaying guest count as "seats"** | Domain terminology is "guests". Never use "seats", "pax", or "covers". |
| **Displaying price in USD or using "$" symbol** | All pricing is in Indian Rupees (₹), expressed in lakhs (e.g., ₹30L Onwards). |
