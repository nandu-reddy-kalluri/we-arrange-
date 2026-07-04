# PROJECT GLOSSARY — YouMarriageWeArrange

This glossary defines the **canonical terminology** for every domain concept used in YouMarriageWeArrange.

All developers, AI agents, UI copy, API field names, database columns, and documentation must use these exact terms. Synonyms are rejected to prevent inconsistent naming across the codebase, database, and user-facing copy.

---

## The Golden Rule

> If you are about to use a word not in this glossary to describe a YMWA concept, stop and check the **Rejected Synonyms** column first. If your word is listed there, use the canonical term instead.

---

## Core Domain Terms

| Canonical Term | Definition | Rejected Synonyms |
|:---|:---|:---|
| **Requirement** | The structured set of preferences a couple submits to begin the concierge process. Includes event date, guest count, budget, location preference, and event type. | request, inquiry, lead, submission, interest, booking request |
| **Quote** | A pricing package and inclusions document collected by a YMWA specialist from a specific venue or vendor. Quotes are manually assembled — never automated. | bid, estimate, price, listing price, auto-quote, rate card |
| **Comparison Sheet** | The structured side-by-side document presenting two or more Quotes to the couple for review. | search results, results page, price grid, recommendations list |
| **Shortlist** | The curated collection of venues or vendors that a couple has saved during their planning journey. | cart, wishlist, saved items, bookmarks, favourites list |
| **Concierge Specialist** | A YMWA team member who contacts venue and vendor partners, negotiates packages, and assembles Quotes. | agent, bot, assistant, AI planner, recommendation engine, matchmaker |
| **Venue Partner** | A wedding venue that has been personally contacted, verified, and approved by the YMWA team. | venue listing, venue entry, database record, venue result |
| **Vendor Partner** | A wedding vendor (photographer, caterer, decorator, etc.) that has been personally vetted by the YMWA team. | vendor listing, vendor profile, seller, provider |
| **Wedding Plan** | The overall planning profile associated with a couple's account, containing their Requirements, Shortlist, Quotes, and Comparison Sheets. | project, booking, event file, case |
| **Guest Count** | The number of guests expected at the wedding event. | seats, pax, covers, capacity units, attendees count |
| **Concierge Request** | The formal trigger event when a couple submits their Requirements and the concierge workflow begins. | form submission, lead capture, booking start |
| **Vetting** | The process by which YMWA manually confirms a Venue Partner or Vendor Partner's availability, pricing accuracy, and service quality before listing them. | verification, listing approval, onboarding |
| **In-House Catering** | A catering model where the venue provides food and beverage exclusively; external catering is prohibited. | internal catering, venue catering, bundled catering |
| **External Catering Allowed** | A catering model where the couple may bring their own catering team. | BYOC, open catering, outside catering, bring your own |
| **Admin Portal** | The internal YMWA team dashboard used by Concierge Specialists to manage Requirements, assemble Quotes, and build Comparison Sheets. | CMS, backend, admin panel, dashboard |
| **Customer Dashboard** | The couple-facing interface showing their active Wedding Plan, Shortlist, Quote status, and Comparison Sheets. | user portal, client area, booking dashboard |

---

## Event Type Terminology

| Canonical Term | Description |
|:---|:---|
| **Wedding Ceremony** | The main marriage ritual event |
| **Reception** | The post-ceremony celebration with guests |
| **Mehendi** | Pre-wedding henna ceremony |
| **Sangeet** | Pre-wedding music and dance celebration |
| **Haldi** | Pre-wedding turmeric ceremony |
| **Engagement** | Formal ring exchange event |

---

## Pricing Terminology

| Format | Usage | Example |
|:---|:---|:---|
| **₹ X Lakhs** | Standard format for all pricing | `₹30 Lakhs`, `₹18L Onwards` |
| **₹ X Crores** | For venues above ₹1 Crore | `₹1.2 Crores` |
| **Onwards** | Suffix for minimum pricing | `₹18L Onwards` |

**Never use:**
- USD, dollars, or `$` symbol
- Thousands formatting (`₹30,00,000` is permitted only in invoice documents, never in UI copy)
- "Starting from" as a phrase (use "Onwards")

---

## Location Terminology

| Location | Correct Usage |
|:---|:---|
| Banjara Hills | `Banjara Hills, Hyderabad` |
| Jubilee Hills | `Jubilee Hills, Hyderabad` |
| Hitec City | `Hitec City, Hyderabad` |
| Shamshabad | `Shamshabad, Hyderabad` |
| Falaknuma | `Falaknuma, Hyderabad` |
| Begumpet | `Begumpet, Hyderabad` |
| Secunderabad | `Secunderabad, Hyderabad` |

Always append `, Hyderabad` to area names in UI copy and data fields.

---

## Status Terminology

Used in API responses, database enums, and UI status indicators.

| Status | Meaning |
|:---|:---|
| `pending` | Requirement received, specialist not yet assigned |
| `in_progress` | Specialist is actively contacting venues/vendors |
| `quotes_collected` | All quotes assembled, Comparison Sheet being prepared |
| `comparison_ready` | Couple can view their Comparison Sheet |
| `decision_made` | Couple has selected a venue or vendor |
| `confirmed` | Booking formally confirmed with the venue/vendor |
| `archived` | Completed or cancelled wedding plan |
