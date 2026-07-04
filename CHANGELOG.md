# Changelog — YouMarriageWeArrange

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `docs/onboarding/README.md` and `docs/onboarding/local-setup.md` — developer onboarding guide
- `docs/architecture/system-diagram.md` — platform layer diagrams with Mermaid
- `docs/architecture/data-flow.md` — data flow sequence diagrams
- `docs/database/schema.md` — complete Supabase table definitions
- `docs/flows/customer-journey.md` — full customer journey mapping
- `docs/flows/concierge-ops-flow.md` — internal concierge operations workflow
- `docs/testing/test-strategy.md` — test pyramid and tool choices
- `docs/components/` — component documentation for VenueCard, VendorCard, QuoteCard, RequirementsForm, SectionHeader
- `PROJECT_GLOSSARY.md` — canonical domain terminology
- `CONTRIBUTING.md` — contributor guide with PR checklist
- `.claude/rules/anti-patterns.md` — identity protection blacklist
- `.claude/rules/business-model.md` — concierge model feature evaluation rules
- `.claude/rules/environment-variables.md` — env var registry and naming standard
- `.claude/agents/concierge-domain-expert.md` — new domain guardian agent
- `docs/decisions/019-mobile-first-enforcement.md` — ADR for mobile-first protocol
- `docs/decisions/020-concierge-first-navigation.md` — ADR for concierge navigation design
- `docs/decisions/021-human-assisted-quote-collection.md` — ADR rejecting automated quotes
- `docs/decisions/022-no-ai-features-phase-1.md` — ADR for AI feature boundary

### Fixed
- `InvitationSection.tsx` — Replaced `toLocaleDateString()` with deterministic string date parser (timezone hydration fix)
- `HowItWorks.tsx` — Replaced invalid `<button>` wrapping block elements with `<div role="button" tabIndex={0}>` (HTML5 nesting fix)
- `HeroSection.tsx` — Added `suppressHydrationWarning` to all three `<select>` elements (browser extension injection fix)
- `InvitationSection.tsx` — Added `suppressHydrationWarning` to all three `<input>` elements

### Changed
- `src/app/(public)/layout.tsx` — Refactored to Fragment wrapper; removed duplicate `<html>/<body>` nodes
- `src/middleware.ts` — Unified auth middleware entrypoint (consolidated from multiple middleware sub-files)
- `src/design-system/theme.ts` — Consolidated all design tokens

---

## [0.1.0] — 2026-06-23

### Added
- Phase 1 MVP landing page with 10-section DREAM → PLAN → COMPARE → CHOOSE → CELEBRATE journey
- `HeroSection` with requirements form, backdrop slideshow, and floating venue preview card
- `WhyChooseUs` with editorial value proposition layout
- `HowItWorks` with 4-step interactive comparison story
- `VenueSection` with curated Hyderabad venue grid
- `VendorSection` with vendor category discovery
- `InvitationSection` with live digital invitation preview
- `WebsiteSection` with wedding website mockup
- `InspirationSection` with editorial inspiration grid
- `Testimonials` with couple testimonial cards
- `CelebrateSection` with final planning CTA
- `VenueCard` shared component
- `VendorCard` shared component
- `TestimonialCard` shared component
- `InspirationCard` shared component
- `TemplateCard` shared component
- Next.js 15 App Router setup with `(public)`, `(auth)`, `(dashboard)` route groups
- Consolidated design token system (`src/design-system/theme.ts` + `tailwind.config.ts`)
- Root documentation suite: `CLAUDE.md`, `GEMINI.md`, `PROJECT_RULES.md`, `PROJECT_STATUS.md`, `PROJECT_CONTEXT.md`, `PRODUCT_VISION.md`, `BRAND_GUIDELINES.md`, `DESIGN_SYSTEM.md`
- `.claude/` agent profiles, rules, and skills directories
- `docs/decisions/` ADR records (001–004)
