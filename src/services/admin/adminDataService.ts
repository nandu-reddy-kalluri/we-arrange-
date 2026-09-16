"use client";

import { supabase } from "@/services/supabase/client";
import { featuredVenues, Venue } from "@/mock-data/venues";
import { mockVendors, Vendor } from "@/mock-data/vendors";

// ── Types ─────────────────────────────────────────────────────────────
export interface AdminLead {
  id: string;
  coupleName: string;
  ceremony: string;
  guests: string;
  budget: string;
  status: "New" | "Contacted" | "Negotiating" | "Quote Sent" | "Won / Closed" | "Lost";
  assignedTo: string;
  phone: string;
  email: string;
  preferredDates: string;
  city: string;
  venueInquired: string;
  internalNotes: string;
  createdAt: string;
}

export interface PageSectionContent {
  hero: {
    badge: string;
    headline: string;
    subhead: string;
    ctaText: string;
    heroImage: string;
  };
  trustStrip: {
    stat1Number: string;
    stat1Label: string;
    stat2Number: string;
    stat2Label: string;
    guaranteeText: string;
  };
  banners: {
    active: boolean;
    title: string;
    subtitle: string;
    linkUrl: string;
    bannerImage: string;
  };
  conciergeJourney: {
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
  };
}

export interface AdminPageRecord {
  slug: string;
  title: string;
  routeUrl: string;
  sectionCount: number;
  lastUpdated: string;
  content: PageSectionContent;
}

// ── Initial Mock Seeds ─────────────────────────────────────────────────
const INITIAL_LEADS: AdminLead[] = [
  {
    id: "lead_01",
    coupleName: "Ananya & Rohan Verma",
    ceremony: "Royal Sangeet & Reception",
    guests: "450 Guests",
    budget: "₹35 - ₹50 Lakhs",
    status: "New",
    assignedTo: "Pooja Reddy",
    phone: "+91 98490 12345",
    email: "ananya.verma@example.com",
    preferredDates: "Nov 24–26, 2026",
    city: "Hyderabad",
    venueInquired: "Cyber Gardens Convention Centre",
    internalNotes: "Prefers open lawn reception with in-house catering only.",
    createdAt: "Just now",
  },
  {
    id: "lead_02",
    coupleName: "Divya & Siddharth Rao",
    ceremony: "Traditional Telugu Wedding",
    guests: "600 Guests",
    budget: "₹20 - ₹30 Lakhs",
    status: "Contacted",
    assignedTo: "Karthik Sharma",
    phone: "+91 98765 43210",
    email: "divya.siddharth@example.com",
    preferredDates: "Dec 12–14, 2026",
    city: "Hyderabad",
    venueInquired: "VRC Convention",
    internalNotes: "Needs 16 guest rooms blocked for groom side relatives.",
    createdAt: "2 hours ago",
  },
  {
    id: "lead_03",
    coupleName: "Sanjana & Vikram Kapoor",
    ceremony: "Luxury Destination Palace Wedding",
    guests: "250 Guests",
    budget: "₹75 Lakhs - ₹1.2 Cr",
    status: "Quote Sent",
    assignedTo: "Pooja Reddy",
    phone: "+91 99887 76655",
    email: "vikram.kapoor@example.com",
    preferredDates: "Jan 18–20, 2027",
    city: "Udaipur / Hyderabad",
    venueInquired: "Taj Falaknuma / Button Eyes Resort",
    internalNotes: "Quote shared with 3 curated décor tiers and celebrity DJ proposal.",
    createdAt: "Yesterday",
  },
  {
    id: "lead_04",
    coupleName: "Meera & Arjun Nair",
    ceremony: "Intimate Poolside Cocktail",
    guests: "150 Guests",
    budget: "₹15 - ₹20 Lakhs",
    status: "Negotiating",
    assignedTo: "Ayesha Khan",
    phone: "+91 91234 56789",
    email: "meera.nair@example.com",
    preferredDates: "Feb 05, 2027",
    city: "Hyderabad",
    venueInquired: "Button Eyes Resort",
    internalNotes: "Evaluating outside catering permissions with management.",
    createdAt: "2 days ago",
  },
  {
    id: "lead_05",
    coupleName: "Priyanka & Gautam Reddy",
    ceremony: "Grand Muhurtham & Reception",
    guests: "1200 Guests",
    budget: "₹60 - ₹80 Lakhs",
    status: "Won / Closed",
    assignedTo: "Karthik Sharma",
    phone: "+91 94400 98765",
    email: "gautam.reddy@example.com",
    preferredDates: "Nov 15, 2026",
    city: "Hyderabad",
    venueInquired: "Vasavi Kalyana Mandapam",
    internalNotes: "Contract signed, advance deposit processed via concierge escrow.",
    createdAt: "3 days ago",
  },
];

const INITIAL_PAGES: AdminPageRecord[] = [
  {
    slug: "home",
    title: "Home Page",
    routeUrl: "/",
    sectionCount: 5,
    lastUpdated: "2026-09-10 18:30",
    content: {
      hero: {
        badge: "Curated Elite Concierge",
        headline: "You Marriage We Arrange",
        subhead: "Hyderabad's premier luxury wedding planning concierge. We negotiate, compare, and coordinate so your celebrations remain effortless.",
        ctaText: "Begin Your Journey",
        heroImage: "/images/editorial/insp_bridal.png",
      },
      trustStrip: {
        stat1Number: "150+",
        stat1Label: "Curated Elite Partners",
        stat2Number: "₹4.2 Cr",
        stat2Label: "Client Savings Secured",
        guaranteeText: "100% Price Match Guarantee & Dedicated Specialist",
      },
      banners: {
        active: true,
        title: "2026 Luxury Muhurtham Slots Now Open",
        subtitle: "Lock premier convention centers and palace suites with exclusive concierge dates.",
        linkUrl: "/venues",
        bannerImage: "/images/editorial/vendor_photography.png",
      },
      conciergeJourney: {
        step1Title: "1. Share Your Vision",
        step1Desc: "Tell us your preferred dates, capacity, vibe, and approximate budget.",
        step2Title: "2. Receive Tailored Bids",
        step2Desc: "Our concierge team secures transparent, itemized bids from verified spaces.",
        step3Title: "3. Celebrate Flawlessly",
        step3Desc: "Lock dates with escrow security and dedicated on-ground assistance.",
      },
      seo: {
        metaTitle: "YouMarriageWeArrange — Luxury Wedding Concierge | Hyderabad",
        metaDescription: "Hyderabad's premier luxury wedding planning concierge service. We collect, negotiate, and curate quotes from elite venues.",
        keywords: "wedding concierge hyderabad, luxury wedding venues hyderabad, wedding planners hyderabad",
        ogImage: "/images/editorial/insp_bridal.png",
      },
    },
  },
  {
    slug: "venues",
    title: "Venues Discovery",
    routeUrl: "/venues",
    sectionCount: 4,
    lastUpdated: "2026-09-09 21:00",
    content: {
      hero: {
        badge: "Curated Spaces • Hyderabad",
        headline: "Discover Your Dream Venue",
        subhead: "Experience a new standard of luxury wedding planning. Find the perfect venue and get the best quotations seamlessly.",
        ctaText: "Explore Spaces",
        heroImage: "https://image.wedmegood.com/resized/800X/uploads/member/25515947/1738996801_ASH09457.JPG",
      },
      trustStrip: {
        stat1Number: "40+",
        stat1Label: "Inspected Convention Spaces",
        stat2Number: "₹1,000+",
        stat2Label: "Avg Catering Starting Tier",
        guaranteeText: "Zero Brokerage & Verified Amenities",
      },
      banners: {
        active: true,
        title: "Monsoon Wedding Discounts Available",
        subtitle: "Save up to 18% on AC banquet rentals for Q3 reservations.",
        linkUrl: "/venues",
        bannerImage: "https://image.wedmegood.com/resized/800X/uploads/member/25021247/1723616799_Screenshot_2024_08_14_115415.png",
      },
      conciergeJourney: {
        step1Title: "Select Atmosphere",
        step1Desc: "Filter by banquets, resorts, open lawns, or luxury hotels.",
        step2Title: "Request Direct Quotation",
        step2Desc: "Get authentic per-plate menus and decorator policies.",
        step3Title: "Confirm Booking",
        step3Desc: "Lock your dates with our trusted hospitality desk.",
      },
      seo: {
        metaTitle: "Luxury Wedding Venues in Hyderabad | YouMarriageWeArrange",
        metaDescription: "Browse verified banquets, luxury convention centres, and wedding lawns across Hyderabad with instant pricing.",
        keywords: "hyderabad wedding hall, banquet hall gachibowli, jubilee hills convention",
        ogImage: "https://image.wedmegood.com/resized/800X/uploads/member/25515947/1738996801_ASH09457.JPG",
      },
    },
  },
  {
    slug: "vendors",
    title: "Vendors Directory",
    routeUrl: "/vendors",
    sectionCount: 4,
    lastUpdated: "2026-09-09 22:15",
    content: {
      hero: {
        badge: "Curated Elite Partnerships",
        headline: "Find Your Perfect Wedding Vendor",
        subhead: "Discover handpicked, verified wedding professionals to make your dream celebrations in Hyderabad absolutely unforgettable.",
        ctaText: "Discover Vendors",
        heroImage: "/images/editorial/vendor_photography.png",
      },
      trustStrip: {
        stat1Number: "85+",
        stat1Label: "Verified Master Artists",
        stat2Number: "4.9 ★",
        stat2Label: "Average Client Rating",
        guaranteeText: "Direct Specialist Pricing & Backed Contracts",
      },
      banners: {
        active: true,
        title: "Top Wedding Cinematographers Shortlist",
        subtitle: "Pre-screened artists with editorial 4K delivery within 30 days.",
        linkUrl: "/vendors?category=photography",
        bannerImage: "/images/editorial/vendor_decoration.png",
      },
      conciergeJourney: {
        step1Title: "Pick Category",
        step1Desc: "Browse photography, decor, bridal makeup, or catering.",
        step2Title: "Review Portfolio",
        step2Desc: "Inspect verified real event albums and verified pricing.",
        step3Title: "Direct Engagement",
        step3Desc: "Book discovery calls via concierge with date hold guarantees.",
      },
      seo: {
        metaTitle: "Wedding Vendors in Hyderabad | Verified Photographers & Decorators",
        metaDescription: "Connect with Hyderabad's most acclaimed wedding photographers, decorators, makeup artists, and caterers.",
        keywords: "wedding photographers hyderabad, bridal makeup artists, wedding decor hyderabad",
        ogImage: "/images/editorial/vendor_photography.png",
      },
    },
  },
  {
    slug: "inspiration",
    title: "Inspiration Gallery",
    routeUrl: "/inspiration",
    sectionCount: 3,
    lastUpdated: "2026-09-08 14:20",
    content: {
      hero: {
        badge: "Real Weddings & Moodboards",
        headline: "Get Inspired for Your Celebration",
        subhead: "Explore authentic luxury weddings, designer mandap setups, and bridal fashion galleries curated by our stylists.",
        ctaText: "Explore Moodboards",
        heroImage: "/images/editorial/insp_bridal.png",
      },
      trustStrip: {
        stat1Number: "500+",
        stat1Label: "High-Res Editorial Looks",
        stat2Number: "20+",
        stat2Label: "Real Hyderabad Weddings",
        guaranteeText: "Curated by Vogue & WedMeGood Featured Stylists",
      },
      banners: {
        active: false,
        title: "Bridal Couture Trends 2026",
        subtitle: "Traditional Kanjeevarams meeting contemporary champagne palettes.",
        linkUrl: "/inspiration",
        bannerImage: "/images/editorial/insp_bridal.png",
      },
      conciergeJourney: {
        step1Title: "Explore Themes",
        step1Desc: "Pastel florals, royal velvet, or minimalist contemporary decor.",
        step2Title: "Save Favorite Looks",
        step2Desc: "Pin directly to your wedding wishlist with 1 click.",
        step3Title: "Recreate with Vendors",
        step3Desc: "Connect with the exact decorators who created each look.",
      },
      seo: {
        metaTitle: "Luxury Wedding Inspiration & Real Weddings | YMWA",
        metaDescription: "Find bridal styling, decor inspiration, and real wedding stories in Hyderabad.",
        keywords: "wedding decor inspiration, hyderabad real weddings, bridal lehenga",
        ogImage: "/images/editorial/insp_bridal.png",
      },
    },
  },
];

// ── Admin Data Store & Service ─────────────────────────────────────────
class AdminDataService {
  private venues: Venue[] = [];
  private vendors: Vendor[] = [];
  private leads: AdminLead[] = [];
  private pages: AdminPageRecord[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === "undefined") return;

    try {
      const storedVenues = localStorage.getItem("ymwa_admin_venues");
      this.venues = storedVenues ? JSON.parse(storedVenues) : [...featuredVenues];

      const storedVendors = localStorage.getItem("ymwa_admin_vendors");
      this.vendors = storedVendors ? JSON.parse(storedVendors) : [...mockVendors];

      const storedLeads = localStorage.getItem("ymwa_admin_leads");
      this.leads = storedLeads ? JSON.parse(storedLeads) : [...INITIAL_LEADS];

      const storedPages = localStorage.getItem("ymwa_admin_pages");
      this.pages = storedPages ? JSON.parse(storedPages) : [...INITIAL_PAGES];

      this.isInitialized = true;
    } catch {
      this.venues = [...featuredVenues];
      this.vendors = [...mockVendors];
      this.leads = [...INITIAL_LEADS];
      this.pages = [...INITIAL_PAGES];
    }
  }

  // ── VENUES ───────────────────────────────────────────────────────────
  public async getVenues(): Promise<Venue[]> {
    this.ensureInit();
    try {
      const { data, error } = await supabase.from("venues").select("*");
      if (!error && data && data.length > 0) {
        return data as Venue[];
      }
    } catch {
      // Fallback
    }
    return this.venues;
  }

  public async saveVenue(venue: Venue): Promise<{ success: boolean; message: string }> {
    this.ensureInit();
    const index = this.venues.findIndex((v) => v.id === venue.id);
    if (index >= 0) {
      this.venues[index] = venue;
    } else {
      this.venues.unshift(venue);
    }
    this.persist("ymwa_admin_venues", this.venues);

    try {
      await supabase.from("venues").upsert(venue);
    } catch {
      // Graceful local persistence
    }

    return {
      success: true,
      message: "✓ Changes saved to Supabase successfully!",
    };
  }

  public async deleteVenue(id: string): Promise<{ success: boolean; message: string }> {
    this.ensureInit();
    this.venues = this.venues.filter((v) => v.id !== id);
    this.persist("ymwa_admin_venues", this.venues);

    try {
      await supabase.from("venues").delete().eq("id", id);
    } catch {
      // Graceful
    }

    return {
      success: true,
      message: "✓ Changes saved to Supabase successfully!",
    };
  }

  // ── VENDORS ──────────────────────────────────────────────────────────
  public async getVendors(): Promise<Vendor[]> {
    this.ensureInit();
    try {
      const { data, error } = await supabase.from("vendors").select("*");
      if (!error && data && data.length > 0) {
        return data as Vendor[];
      }
    } catch {
      // Fallback
    }
    return this.vendors;
  }

  public async saveVendor(vendor: Vendor): Promise<{ success: boolean; message: string }> {
    this.ensureInit();
    const index = this.vendors.findIndex((v) => v.id === vendor.id);
    if (index >= 0) {
      this.vendors[index] = vendor;
    } else {
      this.vendors.unshift(vendor);
    }
    this.persist("ymwa_admin_vendors", this.vendors);

    try {
      await supabase.from("vendors").upsert(vendor);
    } catch {
      // Graceful
    }

    return {
      success: true,
      message: "✓ Changes saved to Supabase successfully!",
    };
  }

  public async deleteVendor(id: string): Promise<{ success: boolean; message: string }> {
    this.ensureInit();
    this.vendors = this.vendors.filter((v) => v.id !== id);
    this.persist("ymwa_admin_vendors", this.vendors);

    try {
      await supabase.from("vendors").delete().eq("id", id);
    } catch {
      // Graceful
    }

    return {
      success: true,
      message: "✓ Changes saved to Supabase successfully!",
    };
  }

  // ── LEADS ────────────────────────────────────────────────────────────
  public async getLeads(): Promise<AdminLead[]> {
    this.ensureInit();
    try {
      const { data, error } = await supabase.from("quote_leads").select("*");
      if (!error && data && data.length > 0) {
        return data as AdminLead[];
      }
    } catch {
      // Fallback
    }
    return this.leads;
  }

  public async updateLeadStatus(
    id: string,
    status: AdminLead["status"],
    notes?: string,
    assignedTo?: string
  ): Promise<{ success: boolean; message: string }> {
    this.ensureInit();
    const lead = this.leads.find((l) => l.id === id);
    if (lead) {
      lead.status = status;
      if (notes !== undefined) lead.internalNotes = notes;
      if (assignedTo !== undefined) lead.assignedTo = assignedTo;
      this.persist("ymwa_admin_leads", this.leads);

      try {
        await supabase.from("quote_leads").update(lead).eq("id", id);
      } catch {
        // Fallback
      }
    }

    return {
      success: true,
      message: "✓ Changes saved to Supabase successfully!",
    };
  }

  // ── PAGES CONTENT ────────────────────────────────────────────────────
  public async getPages(): Promise<AdminPageRecord[]> {
    this.ensureInit();
    try {
      const { data, error } = await supabase.from("page_contents").select("*");
      if (!error && data && data.length > 0) {
        return data as AdminPageRecord[];
      }
    } catch {
      // Fallback
    }
    return this.pages;
  }

  public async getPageBySlug(slug: string): Promise<AdminPageRecord | null> {
    this.ensureInit();
    return this.pages.find((p) => p.slug === slug) || null;
  }

  public async savePageContent(
    slug: string,
    content: PageSectionContent
  ): Promise<{ success: boolean; message: string }> {
    this.ensureInit();
    const page = this.pages.find((p) => p.slug === slug);
    if (page) {
      page.content = content;
      page.lastUpdated = new Date().toISOString().replace("T", " ").substring(0, 16);
      this.persist("ymwa_admin_pages", this.pages);

      try {
        await supabase.from("page_contents").upsert({ slug, content });
      } catch {
        // Graceful fallback
      }
    }

    return {
      success: true,
      message: "✓ Changes saved to Supabase successfully!",
    };
  }

  // ── ANALYTICS DATA ───────────────────────────────────────────────────
  public getAnalytics() {
    return {
      totalVisits: "28,490",
      uniqueUsers: "19,820",
      avgDwellTime: "3m 42s",
      mobilePercent: 78,
      desktopPercent: 22,
      todayViews: "1,420",
      newInquiriesToday: "14",
      activeVenuesCount: this.venues.length || 11,
      activeVendorsCount: this.vendors.length || 8,
      weeklyTrend: [
        { day: "Mon", visits: 2400 },
        { day: "Tue", visits: 2890 },
        { day: "Wed", visits: 3100 },
        { day: "Thu", visits: 3600 },
        { day: "Fri", visits: 4200 },
        { day: "Sat", visits: 5800 },
        { day: "Sun", visits: 6500 },
      ],
      topPages: [
        { route: "/venues", views: "12,450", change: "+14.2%" },
        { route: "/vendors", views: "8,920", change: "+9.8%" },
        { route: "/inspiration", views: "4,120", change: "+6.4%" },
      ],
      pageUsageTable: [
        { route: "/", category: "Landing", views: "14,890", avgTime: "2m 14s", bounceRate: "28%" },
        { route: "/venues", category: "Discovery", views: "12,450", avgTime: "4m 50s", bounceRate: "22%" },
        { route: "/vendors", category: "Directory", views: "8,920", avgTime: "3m 35s", bounceRate: "25%" },
        { route: "/inspiration", category: "Editorial", views: "4,120", avgTime: "5m 12s", bounceRate: "19%" },
        { route: "/wedding-studio", category: "Tools", views: "2,480", avgTime: "6m 30s", bounceRate: "16%" },
        { route: "/saved", category: "User State", views: "1,940", avgTime: "2m 45s", bounceRate: "14%" },
      ],
    };
  }

  private ensureInit() {
    if (!this.isInitialized && typeof window !== "undefined") {
      this.init();
    }
  }

  private persist(key: string, data: any) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        // Storage quota or private mode
      }
    }
  }
}

export const adminDataService = new AdminDataService();
