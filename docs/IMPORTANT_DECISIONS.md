# YMWA Important Architectural & Business Decisions

## 1. Mobile-First & Desktop Enhanced
70% - 90% of customers access the platform via mobile. All UI development must begin with mobile viewports (375px) before scaling up to desktop.

## 2. Phase 1 MVP Scope: Hyderabad Only
The initial rollout is restricted to Hyderabad, Telangana to ensure high-quality curation of premium venues (palaces, luxury resorts).

## 3. Concierge Business Model (No Algorithmic Booking)
YMWA is a high-touch concierge service. We do not offer instant automated quotes or sort-by-price features. All quotes and venue negotiations are performed manually by YMWA Concierge Specialists to maintain luxury trust.

## 4. No AI Features in Phase 1
Automated AI recommendations, AI voice agents, and dynamic AI budget projection graphs are strictly out of scope for the MVP.

## 5. Technology Stack
- Next.js 15 App Router
- Tailwind CSS with bespoke HSL token system (no inline random hex colors)
- Framer Motion for subtle micro-interactions
- Supabase (PostgreSQL, Auth, RLS)

## 6. Human-Assisted Quote Collection
Couples submit a "Requirement". Specialists contact venues and create "Quotes". These are presented as a "Comparison Sheet" to the customer. Vendors cannot self-register; all are vetted by the admin team.
