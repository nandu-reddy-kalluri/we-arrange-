# YouMarriageWeArrange — Design System & Guidelines

Welcome to the Design System and UI principles guide for **YouMarriageWeArrange**. This document defines the visual constraints, layout philosophies, and responsiveness rules for all platform developers.

---

## 1. The Core Principle: Mobile-First, Desktop-Enhanced

For YouMarriageWeArrange, **70% - 90% of our wedding customers** (couples, parents, relatives) discover and browse the platform from mobile screens (shared via WhatsApp, Instagram, or found on Google Search). 

> [!IMPORTANT]
> **Mobile-First Design Rule**
> 
> Every page, component, animation, interaction, and user flow must be designed for mobile before desktop.
> 
> The mobile experience is the primary product. Desktop is an enhancement layer.
> 
> No design is considered complete until:
> 1. Mobile design exists.
> 2. Tablet design exists.
> 3. Desktop design exists.
> 
> The order of design reviews and coding implementation must be:
> **Mobile** → **Tablet** → **Desktop** (Never the reverse).

### Figma & Development Workflow
For every page or module layout:
- Design and code the **Mobile screen width** (e.g. `375px` to `480px`) first.
- Scale and adapt for **Tablet width** (e.g. `768px` to `1024px`).
- Enhance for **Desktop width** (e.g. `1280px+`).

---

## 2. Homepage Section-Specific Responsiveness Specifications

When designing homepage components, use the following mobile-first behaviors rather than simply scaling down the desktop layout:

| Homepage Section | Mobile Behavior (< 768px) | Desktop Enhancement (>= 1024px) |
| :--- | :--- | :--- |
| **Section 1: DREAM (Hero)** | Single column. Stacked layout: Headline → Subheadline → Mobile-optimized Requirements Form. | Large two-column grid. Cinematic slow-zoom background, overlapping floating card layouts. |
| **Section 2: PLAN (Concierge)** | Vertical stacked single cards detailing concierge value propositions (Trust focus). | Premium asymmetrical grid layout or side-by-side splits with editorial white space. |
| **Section 3: COMPARE (Scroll Story)** | **Swipe/Tap Story Flow** (Spotify Wrapped style): Swipe/tap through sequence: Requirement Card → Quote 1 → Quote 2 → Quote 3 → Side-by-Side Comparison → Success selection. | Horizontal Apple-style scroll animation (scroll-bound scaling, cards morphing into side-by-side grids). |
| **Section 4: CHOOSE (Venues)** | **Horizontal Swipe Carousel** with snapping behavior. One card fully visible, next card peeking. | 4-column rigid responsive grid. Minimal styling, hover reveals inquiry actions. |
| **Section 5: VENDOR DISCOVERY** | **Horizontal scrollable chips** / categories row. Easy thumb tapping. | 6-column circular categories. Outer rotating dashed rings and hover zoom. |
| **Section 6: INSPIRATION** | **Pinterest-style 2-column grid** (staggered heights, compact gaps). | Asymmetrical editorial magazine gallery layout with large editorial borders. |
| **Section 7: DIGITAL INVITATIONS** | Card selector + live interactive mockup preview that updates immediately in a clean portrait card box. | Detailed side-by-side: left text inputs, right realistic phone wrapper preview. |
| **Section 8: WEBSITES** | Single parallax card mockup showing scroll animation relative to phone frame. | Multi-layered desktop screen mockups with parallax depth on scroll. |
| **Section 9: STORIES** | Clean full-screen story card with overlay quote text, swipeable manually. | Split layout: 50% emotional photography, 50% bold editorial quote typography. |
| **Section 10: CELEBRATE** | Centered single-column layout, large prominent CTA button. | Connected journey progress rail line ending in a visual finish line and CTA. |

---

## 3. Visual System Tokens

Refer to `src/design-system/colors.ts` and `src/design-system/typography.ts` for styling variables:
- **Primary Color**: `#8B263E` (Deep Burgundy)
- **Accent Color**: `#C5A880` (Champagne Gold)
- **Background Color**: `#FAF9F6` (Warm Silk Ivory)
- **Text Color**: `#2D2D2D` (Rich Charcoal)
- **Font Headings**: `Playfair Display`
- **Font Body**: `Plus Jakarta Sans`
