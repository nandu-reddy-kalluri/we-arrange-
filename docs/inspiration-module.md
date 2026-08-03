# Inspiration Module — Technical & Architecture Guide

This document serves as the comprehensive technical specification and developer onboarding guide for the **Inspiration Module** in the `YouMarriageWeArrange` platform.

The **Real Weddings** section established the visual, technical, and UX benchmark for the entire module. All 12 remaining Inspiration subsections build upon this foundation using a modular, highly scalable, and performant component architecture.

---

## 1. Folder Architecture

```
src/
├── app/
│   └── (public)/
│       └── inspiration/
│           ├── page.tsx                           # Main Inspiration Landing Page
│           ├── real-weddings/                      # Benchmark Subsection
│           │   ├── page.tsx
│           │   ├── RealWeddingsClient.tsx
│           │   ├── RealWeddingCard.tsx
│           │   └── [slug]/page.tsx
│           ├── bridal-wear/                       # Subsection 1
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           ├── groom-wear/                        # Subsection 2
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           ├── decor/                             # Subsection 3
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           ├── wedding-themes/                    # Subsection 4
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           ├── color-palettes/                    # Subsection 5
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           ├── invitations/                       # Subsection 6
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           ├── jewellery/                         # Subsection 7
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           ├── makeup/                            # Subsection 8
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           ├── hairstyles/                        # Subsection 9
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           ├── mehendi/                           # Subsection 10
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           ├── photography/                       # Subsection 11
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           └── [route-aliases]/                   # Backward-compatible redirects
│               ├── bridal-fashion/page.tsx -> /bridal-wear
│               ├── groom-fashion/page.tsx  -> /groom-wear
│               ├── themes/page.tsx         -> /wedding-themes
│               └── invitation-ideas/page.tsx -> /invitations
├── features/
│   └── inspiration/
│       └── components/
│           ├── InspirationClientPage.tsx          # Main Landing Page Client
│           ├── InspirationHero.tsx                # Hero Header Search Bar
│           ├── InspirationCard.tsx                # Landing Grid Card
│           ├── InspirationCategoryPageClient.tsx   # Universal Category Client Component
│           ├── InspirationDetailPageClient.tsx    # Universal Detail Client Component
│           ├── InspirationSubcategoryCard.tsx     # Subsection Grid Card Component
│           └── InspirationSkeletonLoader.tsx      # Skeleton Loading Grid Placeholder
├── mock-data/
│   ├── inspiration.ts                             # Main Landing Data
│   ├── real-weddings.ts                           # Real Weddings Data
│   └── inspiration-subsections.ts                 # 12 Subsections Dataset & Configs
├── types/
│   └── inspiration-types.ts                       # TypeScript Models & Interfaces
└── utils/
    └── json.ts                                    # Defensive JSON utilities (safeJsonParse)
```

---

## 2. Component Hierarchy

### A. Subsection Category Page (`/inspiration/[category-slug]`)
```
[Server Component: page.tsx]
└── Injects JSON-LD (BreadcrumbList) & exports Metadata
    └── [InspirationCategoryPageClient] ("use client")
        ├── Sticky Glassmorphic Breadcrumb Header
        ├── Hero Banner (Eyebrow, Title, Description, Scroll Action)
        ├── StatCounters (Animated Framer Motion counter pills)
        ├── Search & Filter Toolbar
        │   ├── Subcategory Filter Pills (tablist)
        │   └── Search Input (with clear button & focus rings)
        ├── Featured Spotlight Section (when filter = "All" & no query)
        ├── Content Grid
        │   ├── InspirationSubcategoryCard (16:10 aspect, badges, hover elevation)
        │   ├── InspirationSkeletonLoader (dynamic pagination state)
        │   └── Empty State Fallback (with Reset Filters button)
        ├── Explore Other Subsections Grid
        └── Newsletter CTA Block
```

### B. Subsection Detail Page (`/inspiration/[category-slug]/[slug]`)
```
[Server Component: [slug]/page.tsx]
└── Injects JSON-LD (Article schema) & generates dynamic Metadata
    └── [InspirationDetailPageClient] ("use client")
        ├── Sticky Breadcrumb Navigation Bar
        ├── Hero Full-Width Cover Banner (Gradient overlay, badges, main heading)
        ├── Two-Column Layout Grid (lg:grid-cols-12)
        │   ├── Left Column (lg:col-span-8)
        │   │   ├── Overview & Description Section
        │   │   ├── Key Highlights Box (checkmarked features list)
        │   │   ├── Color Palette Swatches (hex swatches & titles)
        │   │   ├── Stylist Expert Tip Banner (italic callout)
        │   │   └── Image Lookbook Album (Responsive multi-column masonry grid)
        │   └── Right Column (lg:col-span-4)
        │       └── Sticky Sidebar (top-[140px])
        │           ├── Quick Details Summary Box (Creator, Budget, Attributes)
        │           ├── Tags & Style Hashtag Cloud
        │           └── "Back to Category" Button
        └── Related Inspiration Recommendations Grid (4-column grid)
```

---

## 3. Data Flow

```
[mock-data/inspiration-subsections.ts]
      │
      ├── SUBSECTION_CONFIGS  ──>  Passed to InspirationCategoryPageClient
      │                             (Title, eyebrow, description, stats, tabs)
      │
      └── SUBSECTION_ITEMS    ──>  Filtered by categorySlug
                                    │
                                    ├── Category Page: Filtered via tabs & search query
                                    │                   --> Rendered in InspirationSubcategoryCard
                                    │
                                    └── Detail Page: Looked up by slug
                                                        --> Rendered in InspirationDetailPageClient
```

---

## 4. Route Structure

| Primary Route Path | Alias/Redirect Path | Subcategory Filter Tabs |
| :--- | :--- | :--- |
| `/inspiration` | - | All, Themes, Real Weddings, Decor, Photography, Bridal, Groom, Trends |
| `/inspiration/real-weddings` | - | All, Royal, Traditional, Luxury, Destination, Beach, Garden, Minimal |
| `/inspiration/bridal-wear` | `/inspiration/bridal-fashion` | All, Lehengas, Sarees, Gowns, Anarkalis, Reception Wear |
| `/inspiration/groom-wear` | `/inspiration/groom-fashion` | All, Sherwanis, Bandhgalas, Tuxedos, Indo-Western, Kurta Sets |
| `/inspiration/decor` | - | All, Mandap, Stage & Backdrop, Entrance, Ceiling & Lighting, Table Settings |
| `/inspiration/wedding-themes` | `/inspiration/themes` | All, Royal & Palace, Garden & Outdoor, Modern Minimal, Beach & Coastal |
| `/inspiration/color-palettes` | - | All, Pastel & Blush, Royal Red & Gold, Emerald & Sage, Sunset Coral |
| `/inspiration/invitations` | `/inspiration/invitation-ideas` | All, Royal Boxed, Digital & Video, Acrylic & Modern, Eco-Friendly |
| `/inspiration/jewellery` | - | All, Kundhan & Polki, Temple Gold, Diamond & Platinum, Tikka & Nath |
| `/inspiration/makeup` | - | All, Dewy & Glass Skin, Classic Royal Red, Nude Glam, HD Airbrush |
| `/inspiration/hairstyles` | - | All, Gajra Braids, Messy Floral Buns, Sleek Updos, Hollywood Waves |
| `/inspiration/mehendi` | - | All, Bridal Portrait, Arabic & Minimal, Marwari Heritage, Mandala Palms |
| `/inspiration/photography` | - | All, Candid Portraits, Editorial & Fashion, Pre-Wedding, Drone |
| `/inspiration/planning-tips` | `/inspiration/ideas` | All, Budget & Advice, Timelines & Checklist, Vendor Tips, Guest Experience |

---

## 5. Reusable Components

### `InspirationCategoryPageClient`
- **Path**: [`src/features/inspiration/components/InspirationCategoryPageClient.tsx`](file:///c:/Users/jaisa/Documents/insperations/we-arrange-/src/features/inspiration/components/InspirationCategoryPageClient.tsx)
- **Props**: `{ config: InspirationSubsectionConfig; items: InspirationDetailItem[] }`
- **Features**: Handles state management for tab selection, live search input with clear trigger, pagination count, and Framer Motion stagger animations.

### `InspirationDetailPageClient`
- **Path**: [`src/features/inspiration/components/InspirationDetailPageClient.tsx`](file:///c:/Users/jaisa/Documents/insperations/we-arrange-/src/features/inspiration/components/InspirationDetailPageClient.tsx)
- **Props**: `{ item: InspirationDetailItem; relatedItems: InspirationDetailItem[] }`
- **Features**: Renders a complete luxury detail layout with hero image backdrop, two-column layout, interactive color swatches, key highlights checklist, masonry gallery, and sticky sidebar.

### `InspirationSubcategoryCard`
- **Path**: [`src/features/inspiration/components/InspirationSubcategoryCard.tsx`](file:///c:/Users/jaisa/Documents/insperations/we-arrange-/src/features/inspiration/components/InspirationSubcategoryCard.tsx)
- **Props**: `{ item: InspirationDetailItem; index?: number }`
- **Features**: Implements `16:10` image container, soft vignette gradient, image fade-in skeleton, subcategory badge, title, short description, color swatches preview, and hover elevation.

### `InspirationSkeletonLoader`
- **Path**: [`src/features/inspiration/components/InspirationSkeletonLoader.tsx`](file:///c:/Users/jaisa/Documents/insperations/we-arrange-/src/features/inspiration/components/InspirationSkeletonLoader.tsx)
- **Props**: `{ count?: number }`
- **Features**: Animated CSS pulse placeholder matching the card layout grid during load-more transitions.

---

## 6. Shared Utilities

### `safeJsonParse`
- **Path**: [`src/utils/json.ts`](file:///c:/Users/jaisa/Documents/insperations/we-arrange-/src/utils/json.ts)
- **Signature**: `safeJsonParse<T>(raw: string | null | undefined, fallback: T): T`
- **Purpose**: Defensive wrapper around `JSON.parse` to prevent runtime crashes caused by empty strings, `null`, or truncated Webpack manifests.

---

## 7. SEO & Metadata Implementation

Each page route exports static `Metadata` or dynamic `generateMetadata()` following Next.js App Router best practices:

```ts
export const metadata: Metadata = {
  title: "Bridal Wear Inspiration | YouMarriageWeArrange",
  description: "Discover handcrafted bridal lehengas, royal Kanjeevaram sarees, and trousseau designs.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/inspiration/bridal-wear"
  },
  openGraph: {
    title: "Bridal Wear Inspiration | YouMarriageWeArrange",
    description: "Discover handcrafted bridal lehengas and royal sarees.",
    type: "website",
    url: "https://www.youmarriagewearrange.com/inspiration/bridal-wear",
    images: ["/images/editorial/insp_bridal.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Bridal Wear Inspiration",
    description: "Discover handcrafted bridal lehengas and royal sarees."
  }
};
```

### JSON-LD Structured Data
- **Category Pages**: Injects Google `BreadcrumbList` schema.
- **Detail Pages**: Injects Google `Article` schema with publisher details and image arrays.

---

## 8. Animation System

All animations are powered by `framer-motion`:
- **Page & Section Fade Up**:
  ```ts
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  ```
- **Staggered Children**: Parent container uses `staggerChildren: 0.15`.
- **Card Entrance**: Entrance delay calculated via `delay: Math.min(index * 0.08, 0.4)`.
- **Hover Micro-Animations**: Card elevation `-translate-y-[6px]`, scale `scale-[1.05]`, and chevron right arrow translate `group-hover:translate-x-1`.
- **Stat Counter Roll-up**: Animated using Framer Motion's `animate()` function triggered when scrolled into view via `useInView`.

---

## 9. Design Tokens & Visual Hierarchy

- **Background Palette**: Cream `#FBF9F6`, Pure White `#FFFFFF`, Dark Canvas `neutral-900`.
- **Accent Colors**: Warm Gold `#C8A165` (primary accent), Rich Burgundy `#8B263E` (brand CTA buttons), Deep Olive `#8B6B35` (tags).
- **Borders & Dividers**: Warm Gold Tint `#E8D8BC`/30 or `#E8D8BC`/50.
- **Typography**:
  - Headings: `font-serif` (Playfair Display)
  - Eyebrows: `font-sans text-[11px] font-black uppercase tracking-[0.25em] text-[#C8A165]`
  - Body: `font-sans text-neutral-600` (Plus Jakarta Sans)
- **Border Radius**: Cards `rounded-[20px]`, Containers `rounded-3xl` or `rounded-[24px]`, Buttons `rounded-full`.

---

## 10. Future Extension Guide

### How to Add a New Inspiration Subsection (e.g. "Pre-Wedding Outfits")

1. **Update Types**: Add new category slug to [`src/types/inspiration-types.ts`](file:///c:/Users/jaisa/Documents/insperations/we-arrange-/src/types/inspiration-types.ts) if necessary.
2. **Add Mock Data & Config**: Open [`src/mock-data/inspiration-subsections.ts`](file:///c:/Users/jaisa/Documents/insperations/we-arrange-/src/mock-data/inspiration-subsections.ts):
   - Add a entry to `SUBSECTION_CONFIGS["pre-wedding-outfits"]`.
   - Add detail objects to `SUBSECTION_ITEMS` with `categorySlug: "pre-wedding-outfits"`.
3. **Create Route Folder**:
   - Create `src/app/(public)/inspiration/pre-wedding-outfits/page.tsx`:
     ```tsx
     import { SUBSECTION_CONFIGS, SUBSECTION_ITEMS } from "@/mock-data/inspiration-subsections";
     import { InspirationCategoryPageClient } from "@/features/inspiration/components/InspirationCategoryPageClient";

     const config = SUBSECTION_CONFIGS["pre-wedding-outfits"];
     const items = SUBSECTION_ITEMS.filter(i => i.categorySlug === "pre-wedding-outfits");

     export default function PreWeddingOutfitsPage() {
       return <InspirationCategoryPageClient config={config} items={items} />;
     }
     ```
   - Create `src/app/(public)/inspiration/pre-wedding-outfits/[slug]/page.tsx`:
     ```tsx
     import { SUBSECTION_ITEMS } from "@/mock-data/inspiration-subsections";
     import { InspirationDetailPageClient } from "@/features/inspiration/components/InspirationDetailPageClient";

     export default async function PreWeddingOutfitsDetailPage({ params }) {
       const { slug } = await params;
       const item = SUBSECTION_ITEMS.find(i => i.categorySlug === "pre-wedding-outfits" && i.slug === slug);
       const relatedItems = SUBSECTION_ITEMS.filter(i => i.categorySlug === "pre-wedding-outfits" && i.slug !== slug).slice(0, 4);
       return <InspirationDetailPageClient item={item} relatedItems={relatedItems} />;
     }
     ```
4. **Register Link in Navbar**: Add `{ label: "Pre-Wedding Outfits", href: "/inspiration/pre-wedding-outfits" }` to `NAVIGATION_HIERARCHY` in [`src/components/layout/Navbar/data/navigationData.ts`](file:///c:/Users/jaisa/Documents/insperations/we-arrange-/src/components/layout/Navbar/data/navigationData.ts).

---

## 11. Developer Onboarding Notes

- **Never Modify Real Weddings**: The Real Weddings section (`/inspiration/real-weddings`) is the reference implementation. Do not edit `RealWeddingsClient.tsx` or `RealWeddingCard.tsx` unless explicitly requested.
- **Maintain Modular Architecture**: Use `InspirationCategoryPageClient` and `InspirationDetailPageClient` for all standard inspiration categories to ensure styling consistency and avoid duplicating code.
- **Type Checking & Build**: Always run `npx tsc --noEmit` and `npm run build` after introducing new data items or components to verify zero compilation errors.
