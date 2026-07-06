max 200 lines

# PROJECT_CONTEXT

## Product Vision & Core Purpose
**YouMarriageWeArrange (YMWA)** is an elite, high-touch wedding planning concierge and digital curation platform.
Unlike self-service listing directories that force clients to spend weeks calling venues, looking up prices, and dealing with spam call follow-ups, YMWA integrates a personal touch:
- Customers register basic event requirements (dates, guests, budget, location).
- A YMWA Concierge Partner negotiates directly with venues and vendors, gathers custom packages, and translates them into a single side-by-side comparison matrix.
- Clients receive premium digital utilities (personalized invitations, custom wedding website, RSVP collections, photo dumps) hosted under bespoke subdomains.

**MVP Scope:** Location Focus: Hyderabad, Telangana Only (heritage palaces, luxury resorts, elite five-star banquets).

## Target Audience
- **Primary:** High-end couples, relatives, and parents looking for premium venues and professional vendor coordination in Hyderabad.
- **Access Focus:** Mobile-first WhatsApp sharing, Instagram discoveries, and clean mobile screen viewports.

## Core Workflow & Customer Flows
1. **DREAM:** User submits search parameters and requirements.
2. **PLAN:** Dedicated Concierge Specialists contact venues directly.
3. **COMPARE:** Specialists collect and negotiate custom packages and quotations.
4. **CHOOSE:** User receives a clean, side-by-side comparison sheet and chooses the best option.
5. **CELEBRATE:** Actionable final CTAs to submit planning requests.

## Tech Stack
- **Framework:** Next.js 15 (App Router), React
- **Language:** TypeScript
- **Styling:** Tailwind CSS, custom design system (HSL matching)
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **Database / Backend:** Supabase (PostgreSQL, Auth, RLS, Storage)

## Core Domain Terminology (Glossary)
- **Requirement**: The structured set of preferences a couple submits to begin the concierge process.
- **Quote**: A pricing package and inclusions document collected by a YMWA specialist. Manually assembled — never automated.
- **Comparison Sheet**: The structured side-by-side document presenting two or more Quotes.
- **Shortlist**: The curated collection of venues or vendors a couple has saved.
- **Concierge Specialist**: A YMWA team member who contacts venue/vendor partners.
- **Venue/Vendor Partner**: A venue/vendor personally contacted, verified, and approved by the YMWA team.
- **Wedding Plan**: The overall planning profile containing Requirements, Shortlist, Quotes, and Comparison Sheets.
- **Guest Count**: Number of guests (never use "seats", "pax", "covers").
- **Concierge Request**: Formal trigger event when a couple submits Requirements.
- **Vetting**: Process by which YMWA manually confirms a Venue/Vendor Partner.
- **In-House / External Catering Allowed**: Catering models for venues.
- **Admin Portal**: Internal YMWA team dashboard.
- **Customer Dashboard**: Couple-facing interface.

**Event Types:** Wedding Ceremony, Reception, Mehendi, Sangeet, Haldi, Engagement.
**Pricing:** Use ₹ X Lakhs or ₹ X Crores, suffixed with "Onwards". Never use USD or commas.
**Location:** Always append ", Hyderabad" to area names in UI copy.
**Status:** `pending`, `in_progress`, `quotes_collected`, `comparison_ready`, `decision_made`, `confirmed`, `archived`.
