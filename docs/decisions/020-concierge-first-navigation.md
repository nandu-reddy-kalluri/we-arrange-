# ADR 020: Concierge-First Navigation Design

## Status
Accepted

## Context
Navigation in a standard directory or marketplace is organised around browsing verbs: "Venues", "Vendors", "Search", "Filter", "Sort". This navigation pattern primes users to browse independently — contradicting YMWA's core model where the concierge specialist does the research on the couple's behalf.

If navigation is built like a directory (even visually), users will attempt to browse and self-serve, miss the concierge value proposition, and abandon when they cannot find the automated listing experience they expect.

## Decision
All primary navigation, CTA buttons, and page headings must follow the concierge-first information architecture:

**Primary navigation intent order:**
1. Understand YMWA (How it works)
2. Begin the concierge journey (Submit Requirements)
3. Explore curated selections (curated venues, curated vendors — not browse-all)
4. Digital utilities (invitations, wedding websites)

**Prohibited navigation patterns:**
- "Browse All Venues" as a top-level nav item
- Price filter dropdowns in the navigation bar
- Category grid as the homepage's primary section
- "Search" as the homepage's primary CTA

**Required navigation copy standards:**
- Use: "How It Works", "Begin Planning", "Talk to a Specialist", "Curated Venues"
- Reject: "Browse", "Search", "Compare Prices", "Find Cheapest"

## Implications
- Couples who arrive expecting a directory will be redirected into the concierge flow, increasing requirement submissions
- Navigation structure communicates YMWA's differentiation before the user reads a single word of copy
- Any new page or route added to the app must be evaluated against this navigation intent order before being linked from the primary nav
