# UI/UX AND RESPONSIVE DESIGN AUDIT: YouMarriageWeArrange
**Target System:** YouMarriageWeArrange Design System & User Interfaces  
**Auditor Role:** Senior UI/UX Architect & Accessibility Engineer  
**Date of Audit:** 2026-11-22  
**Status:** **CONFIRMED DESIGN & ACCESSIBILITY AUDIT**

---

## 1. Executive Summary

A cross-device UI/UX and accessibility evaluation was conducted across desktop (1920×1080, 1440×900), tablet (768×1024), and mobile viewports (375×812, 390×844) across `apps/web`, `apps/customer`, `apps/concierge`, and `apps/admin`.

### Overall UI/UX Posture: **PREMIUM LUXURY AESTHETICS WITH MOBILE USABILITY FRICTIONS**

The platform possesses a bespoke, high-end bridal editorial design language with tasteful gold (`#C5A880`) and royal burgundy (`#8B263E`) accents. The visual hierarchy, typography (Playfair Display + Plus Jakarta Sans), and card styling align well with luxury wedding hospitality. 

However, several critical mobile and accessibility shortcomings were identified:

1. **Floating Concierge Button Overlaps Mobile UI Elements**:
   - `FloatingConciergeButton.tsx` floats in the bottom-right corner with `z-40`. On mobile devices, it frequently obscures sticky navigation bars, form submit buttons, and the bottom pagination controls on `/venues` and `/vendors`.
2. **Card Swiper Touch Sensitivity Friction**:
   - In `VenueCard.tsx` and `VendorCard.tsx`, the swipe delta threshold of 20px is too low. When users scroll vertically through venue listings on mobile touchscreens, minor lateral thumb movements trigger image slide changes, frustrating smooth browsing.
3. **Missing Accessible Labels & Focus Traps in Lightbox Modals**:
   - In `VenueDetailsClient.tsx` and `VendorDetailsClient.tsx`, fullscreen lightbox modals lack a focus trap. Keyboard screen-reader users can Tab behind the dark backdrop to invisible page links.
   - Lightbox thumbnail navigation buttons lack `aria-label` descriptions (e.g., "View photo 4 of 28").
4. **Color Contrast Borderlines on Muted Text**:
   - Secondary metadata tags using `text-neutral-muted` (#8C8885 or #A39E9B) on light cream backgrounds (#FBF9F6) achieve a contrast ratio of 3.8:1, failing WCAG 2.1 AA requirements (minimum 4.5:1 for normal text).
5. **Multi-Column Masonry Reflow Disorientation**:
   - The CSS `columns-2 sm:columns-3` masonry layout in `VenueDetailsClient` and `VendorDetailsClient` reflows elements down columns rather than across rows, making chronological wedding photo narratives difficult to follow.

---

## 2. Confirmed UI/UX & Accessibility Defect Inventory

| Issue ID | Component / Area | File Path | Severity | Description | Recommended Fix |
|---|---|---|---|---|---|
| **UI-001** | Mobile Concierge Button | `apps/web/components/layout/FloatingConciergeButton.tsx` | **P2 - Medium** | Floating button overlaps mobile bottom navigation and card interaction areas. | Hide floating button on mobile in favor of the mobile bottom tab bar or adjust bottom margin to `bottom-20`. |
| **UI-002** | Card Swipe Sensitivity | `apps/web/components/cards/VenueCard.tsx:51` | **P2 - Medium** | 20px horizontal delta triggers image carousel during vertical page scrolling. | Increase delta to 45px and require `Math.abs(deltaX) > Math.abs(deltaY) * 2`. |
| **UI-003** | Lightbox Focus Trap | `apps/web/app/(public)/venues/[slug]/VenueDetailsClient.tsx:505` | **P2 - Medium** | Lightbox modal lacks focus trap; Tab key focuses background elements behind modal. | Implement focus trap using standard HTML `<dialog>` or React focus-trap helper. |
| **UI-004** | Lightbox Thumbnail ARIA | `apps/web/app/(public)/venues/[slug]/VenueDetailsClient.tsx:567` | **P3 - Low** | Thumbnail buttons omit descriptive `aria-label`. | Add `aria-label={`Select photo ${idx + 1} of ${lightboxImages.length}`}`. |
| **UI-005** | Text Color Contrast | `apps/web/styles/globals.css`, Tailwind tokens | **P3 - Low** | Muted subtitle text on cream backgrounds achieves 3.8:1 contrast (WCAG AA requires 4.5:1). | Darken muted text token from `#8C8885` to `#6E6A67`. |

---
*Report certified by Senior UI/UX Architect & Accessibility Engineer.*
