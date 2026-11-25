# FUNCTIONALITY AND USER JOURNEY BUG AUDIT: YouMarriageWeArrange
**Target System:** YouMarriageWeArrange Production Workflows & Applications  
**Auditor Role:** Senior QA Engineer & Lead Full-Stack Auditor  
**Date of Audit:** 2026-11-22  
**Status:** **CONFIRMED WORKFLOW BUGS & JOURNEY DEFECTS**

---

## 1. Executive Summary

A functional audit tracing every major user and administrative workflow was performed across the public website, authentication flows, customer portal, concierge workspace, and administrative control center.

### Overall Functional Posture: **STABLE FOUNDATION WITH SEVERAL WORKFLOW DEFECTS**

Core inquiry generation, quote generation, and authentication work as designed. However, several critical edge cases, race conditions, and UI state synchronization defects were uncovered:

1. **Venue Budget Filter Empty-Result Defect**:
   - In `services/venue/src/venueService.ts:32–56`, `matchesVenueBudget()` parses `venue_price_tag` via regex `Number(priceTag.replace(/[^\d.]/g, ""))`.
   - When a venue in the database contains multi-price strings (e.g. `"Veg: ₹1,500 / Non-Veg: ₹2,000"`), the regex concatenates digits into `15002000`, causing the venue to be evaluated as ₹1.5 crore per plate, completely failing all standard budget filters (`₹1,500` or `₹2,000`)!
2. **Double Submission on Lead and Enquiry Forms**:
   - `apps/web/features/venues/components/VenueHeroSearch.tsx` and public inquiry modals lack button disabling during asynchronous in-flight requests, allowing fast double-clicks to dispatch duplicate enquiry rows into `public.enquiries`.
3. **Hardcoded Category Alias Fallback Issue**:
   - In `apps/web/app/(public)/vendors/page.tsx:9–14`, `CATEGORY_ALIAS` maps aliases (`photographers` -> `photography`), but an unmapped query param defaults to `rawCategory`. If a user enters `/vendors?category=videography`, the database returns empty results with no visual message explaining that the category does not exist.
4. **Card Stack Swiper Touch Threshold Conflict on Mobile**:
   - In `apps/web/components/cards/VenueCard.tsx` and `VendorCard.tsx`, horizontal touch swipe thresholds are set to a low 20px delta. During vertical scrolling on mobile touchscreens, minor diagonal finger drift triggers image slide changes, frustrating users trying to scroll down the directory.
5. **Customer Saved Items Store-to-DB Desynchronization**:
   - `apps/web/store/useSavedStore.ts` uses localStorage via Zustand persist. While it attempts to sync with `public.favorites` on login, offline or failed network calls leave the local state out of sync with the database, leading to "ghost" saved cards.

---

## 2. Journey-by-Journey Functional Breakdown

### Journey 1: Couple Venue Discovery & Filtering
- **Flow:** Homepage -> `/venues` -> Select Location "Banjara Hills", Guests "200-500", Budget "₹1,500 per plate".
- **Defects Identified:**
  - Budget filtering regex flaw drops venues with split Veg/Non-Veg pricing.
  - Page resets scroll position to top when applying filters.
  - URL query params are not cleanly updated via `shallow` routing, breaking browser back-button expectations.

### Journey 2: Vendor Discovery & Inquiry
- **Flow:** `/vendors` -> Filter "Photographers" -> Open Photographer Detail -> Click "Request Availability".
- **Defects Identified:**
  - Initial directory shows empty loading spinner for 1.5s due to client-side fetch.
  - Portfolio masonry renders 40+ unpaginated images.
  - Fast double-click on enquiry submission creates duplicate lead records in `public.enquiries`.

### Journey 3: Wedding E-Invites & RSVP
- **Flow:** `/e-invites` -> Select Template -> Customize -> Send Link -> Guest visits `/invite/[id]` -> Submits RSVP.
- **Defects Identified:**
  - Public RSVP endpoint previously lacked rate limiting (now protected by token-bucket rate limiter).
  - Mobile virtual keyboard covers the RSVP guest count input on iPhone Safari.

### Journey 4: Concierge Specialist Workflow
- **Flow:** Concierge Login -> `/concierge-portal` -> Open Lead -> Generate Quote -> Send to Couple.
- **Defects Identified:**
  - Inactive admins attempting to access concierge functions are rejected (hardened in Migration 12).
  - Concierge specialists cannot upload custom PDF venue brochures directly unless Cloudflare R2 credentials are configured.

### Journey 5: Admin Platform Management
- **Flow:** Admin Login -> User Management / Role Management / Settings.
- **Defects Identified:**
  - Unlisted secret login route at `/admin/login143`.
  - Admin audit logging previously omitted `role_create` and `setting_update` (now patched in `adminPortalService.ts`).

---

## 3. Confirmed Functional Defect Inventory

| Issue ID | Journey / Module | File Path | Severity | Description | Recommended Fix |
|---|---|---|---|---|---|
| **FUNC-001** | Venue Catalog | `services/venue/src/venueService.ts:40` | **P1 - High** | Split Veg/Non-Veg price strings concatenate digits (`1500` + `2000` = `15002000`), breaking budget filters. | Parse `venue_price_tag` with boundary regex or store structured numeric column. |
| **FUNC-002** | Enquiry Forms | `apps/web/features/venues/components/` | **P2 - Medium** | Missing disabled state during async mutation; fast clicks create duplicate enquiries. | Add `isSubmitting` disabled state to all submit buttons. |
| **FUNC-003** | Mobile Card Swiper | `apps/web/components/cards/VenueCard.tsx:51` | **P2 - Medium** | 20px delta threshold triggers slide transition during vertical scroll. | Increase threshold to 45px and check `Math.abs(deltaX) > Math.abs(deltaY) * 2`. |
| **FUNC-004** | Saved Store Sync | `apps/web/store/useSavedStore.ts` | **P2 - Medium** | LocalStorage state diverges from Supabase `public.favorites` on network failure. | Implement optimistic update with rollback on API rejection. |
| **FUNC-005** | Lightbox Keyboard Nav | `apps/web/app/(public)/venues/[slug]/VenueDetailsClient.tsx:240` | **P3 - Low** | Keyboard listener remains active when subsidiary modals open. | Guard keydown handlers with modal focus state. |

---
*Report certified by Senior QA Engineer & Lead Full-Stack Auditor.*
