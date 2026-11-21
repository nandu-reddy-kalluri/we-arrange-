import React from "react";
import nextDynamic from "next/dynamic";
import { createPublicAnonClient } from "@we-arrange/database/clients";
import { listPublicVenues, listVenueTypes } from "@we-arrange/service-venue";
import { listPublicVendors, listVendorCategories } from "@we-arrange/service-vendor";
import { mapDbVenueToUi, mapDbVendorToUi, splitMediaUrls } from "@/services/catalog/catalogMappers";
import type { Venue } from "@/mock-data/venues";
import { vendorCategories as fallbackVendorCategories, type Vendor, type VendorCategory } from "@/mock-data/vendors";
import HeroSection from "@/features/home/components/HeroSection";
import VenueSection from "@/features/home/components/VenueSection";
import VendorSection from "@/features/home/components/VendorSection";
import { MobileQuickSearchChips } from "@/features/home/components/MobileQuickSearchChips";
import { TrustStrip } from "@/features/home/components/TrustStrip";
import { ClientScrollRail } from "@/components/layout/ClientScrollRail";
import { FloatingConciergeButton } from "@/components/layout/FloatingConciergeButton";
import { MobileHomeExperience } from "@/features/home/components/MobileHomeExperience";

const ConciergeJourney = nextDynamic(() => import("@/features/home/components/ConciergeJourney").then((m) => m.ConciergeJourney));
const DigitalSuiteSection = nextDynamic(() => import("@/features/home/components/DigitalSuiteSection"));
const CelebrateSection = nextDynamic(() => import("@/features/home/components/CelebrateSection").then((m) => m.CelebrateSection));

export const metadata = {
  title: "YouMarriageWeArrange — Hyderabad's Premier Wedding Venue & Vendor Concierge",
  description: "Experience white-glove wedding planning in Hyderabad. Our specialists negotiate, curate, and book luxury venues and verified vendors with transparent pricing and zero spam.",
  keywords: [
    "wedding concierge Hyderabad",
    "wedding venues Hyderabad",
    "wedding vendors Hyderabad",
    "luxury banquet halls Hyderabad",
    "destination wedding Hyderabad",
    "Taj Falaknuma Palace wedding",
    "Hyderabad wedding decorators",
    "bridal makeup artists Hyderabad",
    "wedding photography Hyderabad",
  ],
  alternates: {
    canonical: "https://www.youmarriagewearrange.com",
  },
  openGraph: {
    title: "YouMarriageWeArrange — Hyderabad's Premier Wedding Concierge",
    description: "Submit your wedding requirements. Our specialists negotiate and curate elite venues and verified vendors with complete discretion.",
    url: "https://www.youmarriagewearrange.com",
    siteName: "YouMarriageWeArrange",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://www.youmarriagewearrange.com/images/editorial/consultation_hero.png",
        width: 1200,
        height: 630,
        alt: "YouMarriageWeArrange Luxury Wedding Concierge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouMarriageWeArrange — Hyderabad's Premier Wedding Concierge",
    description: "Submit your wedding requirements. Our specialists negotiate and curate elite venues and verified vendors with complete discretion.",
    images: ["https://www.youmarriagewearrange.com/images/editorial/consultation_hero.png"],
  },
};

export const dynamic = "force-dynamic";

const DB_TO_UI_CATEGORY_SLUG: Record<string, string> = {
  photographers: "photography",
  decorators: "decor",
  "bridal-makeup": "makeup",
  catering: "catering",
  mehendi: "mehendi",
};

const DB_CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  photography: "Wedding Photographers",
  decor: "Wedding Decorators",
  makeup: "Bridal Makeup Artists",
  mehendi: "Mehendi Artists",
  catering: "Wedding Catering",
};

interface HomeFeaturedCatalogResult {
  heroVenues: Venue[];
  featuredVenues: Venue[];
  featuredVendors: Vendor[];
  totalVenues: number;
  vendorCategories: VendorCategory[];
}

let cachedHomeCatalog: { data: HomeFeaturedCatalogResult; timestamp: number } | null = null;
const HOME_CATALOG_CACHE_TTL_MS = 60_000;

async function loadHomeFeaturedCatalog(): Promise<HomeFeaturedCatalogResult> {
  if (cachedHomeCatalog && Date.now() - cachedHomeCatalog.timestamp < HOME_CATALOG_CACHE_TTL_MS) {
    return cachedHomeCatalog.data;
  }
  try {
    const supabase = createPublicAnonClient();
    const [venuesRes, venueTypes, vendorsRes, vendorCategories] = await Promise.all([
      listPublicVenues(supabase, { page: 1, limit: 6 }, { includeMedia: true }),
      listVenueTypes(supabase),
      listPublicVendors(supabase, { page: 1, limit: 4 }),
      listVendorCategories(supabase),
    ]);

    const venueTypeMap = new Map<number, string>(
      venueTypes.map((t) => [Number(t.type_id), String(t.type_name)])
    );
    const vendorCatMap = new Map<number, string>(
      vendorCategories.map((c) => [Number(c.category_id), String(c.slug)])
    );

    const luxuryTypeIds = venueTypes
      .filter((t) => /5\s*star|palace/i.test(String(t.type_name || "")))
      .map((t) => Number(t.type_id));

    let heroVenues: Venue[] = [];
    if (luxuryTypeIds.length > 0) {
      const luxuryRes = await listPublicVenues(
        supabase,
        { page: 1, limit: 12, typeIds: luxuryTypeIds, sortBy: "rating" },
        { includeMedia: true }
      );
      heroVenues = luxuryRes.items
        .map((row) =>
          mapDbVenueToUi(row as unknown as Record<string, unknown>, undefined, venueTypeMap)
        )
        .filter((v) => v.imageUrl && !v.imageUrl.endsWith(".svg"))
        .slice(0, 6);
    }

    const featuredVenues = venuesRes.items.map((row) =>
      mapDbVenueToUi(row as unknown as Record<string, unknown>, undefined, venueTypeMap)
    );
    if (heroVenues.length === 0) {
      heroVenues = featuredVenues.filter((v) => v.imageUrl && !v.imageUrl.endsWith(".svg")).slice(0, 6);
    }

    const liveCategories = await Promise.all(
      vendorCategories.map(async (cat) => {
        const dbSlug = String(cat.slug || "").toLowerCase();
        const uiSlug = DB_TO_UI_CATEGORY_SLUG[dbSlug] ?? dbSlug;
        const [countRes, sampleRes] = await Promise.all([
          supabase
            .from("vendors")
            .select("vendor_id", { count: "exact", head: true })
            .eq("status", "Active")
            .eq("category_id", cat.category_id),
          supabase
            .from("vendors")
            .select("cover_image")
            .eq("status", "Active")
            .eq("category_id", cat.category_id)
            .ilike("cover_image", "%youmarriagewearrange.com%")
            .order("rating", { ascending: false, nullsFirst: false })
            .order("vendor_id", { ascending: true })
            .limit(1),
        ]);
        const rawCover = splitMediaUrls(sampleRes.data?.[0]?.cover_image)[0];
        const fallbackCat = fallbackVendorCategories.find((f) => f.slug === uiSlug);
        return {
          id: String(cat.category_id),
          name: DB_CATEGORY_DISPLAY_NAMES[uiSlug] ?? String(cat.category_name),
          imageUrl: rawCover || fallbackCat?.imageUrl || "/images/placeholders/photography.svg",
          slug: uiSlug,
          count: countRes.count ?? fallbackCat?.count ?? 0,
        };
      })
    );

    const result: HomeFeaturedCatalogResult = {
      heroVenues,
      featuredVenues,
      featuredVendors: vendorsRes.items.map((row) =>
        mapDbVendorToUi(row as unknown as Record<string, unknown>, vendorCatMap)
      ),
      totalVenues: venuesRes.meta.total,
      vendorCategories: liveCategories.length > 0 ? liveCategories : fallbackVendorCategories,
    };
    cachedHomeCatalog = { data: result, timestamp: Date.now() };
    return result;
  } catch {
    if (cachedHomeCatalog) {
      return cachedHomeCatalog.data;
    }
    return {
      heroVenues: [],
      featuredVenues: [],
      featuredVendors: [],
      totalVenues: 0,
      vendorCategories: fallbackVendorCategories,
    };
  }
}

export default async function HomePage() {
  const { heroVenues, featuredVenues, featuredVendors, totalVenues, vendorCategories } =
    await loadHomeFeaturedCatalog();

  return (
    <main className="overflow-hidden relative bg-neutral-cream">
      {/* --- DESKTOP EXPERIENCE (UNCHANGED) --- */}
      <div className="hidden md:block">
        <ClientScrollRail />
        
        <div id="hero">
          <HeroSection heroVenues={heroVenues} />
        </div>

        <TrustStrip />
        <MobileQuickSearchChips />
        
        <div id="concierge-journey">
          <ConciergeJourney />
        </div>
        
        <div id="featured-venues">
          <VenueSection venues={featuredVenues} totalCount={totalVenues} />
        </div>
        
        <div id="featured-vendors">
          <VendorSection categories={vendorCategories} />
        </div>

        <DigitalSuiteSection />
        <CelebrateSection venues={heroVenues} vendors={featuredVendors} />
        
        <FloatingConciergeButton />
      </div>

      {/* --- MOBILE EXPERIENCE --- */}
      <div className="block md:hidden">
        <MobileHomeExperience
          heroVenues={heroVenues}
          featuredVenues={featuredVenues}
          featuredVendors={featuredVendors}
        />
      </div>
    </main>
  );
}
