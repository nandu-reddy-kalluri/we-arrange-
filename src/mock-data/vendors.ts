export interface Vendor {
  id: string;
  name: string;
  category: string; // slug of category
  location: string;
  city: string;
  priceStart: number; // in Lakhs (L)
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  logoUrl?: string;
  slug: string;
  isVerified?: boolean;
  isPremium?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  description?: string;
  experience?: number; // years
  availability?: 'Available' | 'Booked';
  spaceType?: 'Indoor' | 'Outdoor' | 'Both';
  tier?: 'Luxury' | 'Premium' | 'Budget';
}

export interface VendorCategory {
  id: string;
  name: string;
  imageUrl: string;
  slug: string;
  count: number;
}

export const vendorCategories: VendorCategory[] = [
  { id: "c1", name: "Wedding Photographers", imageUrl: "/images/editorial/vendor_photography.png", slug: "photography", count: 120 },
  { id: "c2", name: "Wedding Decorators", imageUrl: "/images/editorial/vendor_decoration.png", slug: "decor", count: 80 },
  { id: "c3", name: "Bridal Makeup Artists", imageUrl: "/images/editorial/vendor_makeup.png", slug: "makeup", count: 150 },
  { id: "c4", name: "Mehendi Artists", imageUrl: "/images/editorial/insp_bridal.png", slug: "mehendi", count: 90 },
  { id: "c5", name: "Wedding Catering", imageUrl: "/images/editorial/vendor_catering.png", slug: "catering", count: 60 },
];

export const mockVendors: Vendor[] = [
  {
    id: "v1",
    name: "Rishi & Karan Photography",
    category: "photography",
    location: "Banjara Hills, Hyderabad",
    city: "Hyderabad",
    priceStart: 2.5,
    rating: 4.9,
    reviewsCount: 128,
    imageUrl: "/images/editorial/vendor_photography.png",
    logoUrl: "/images/editorial/insp_bridal.png",
    slug: "rishi-karan-photography",
    isVerified: true,
    isPremium: true,
    isFeatured: true,
    experience: 8,
    availability: "Available",
    spaceType: "Outdoor",
    tier: "Luxury",
    tags: ["Fine Art", "Editorial", "Candid"],
    description: "Award-winning editorial wedding photographers specializing in cinematic visual storytelling and fine-art luxury portraits."
  },
  {
    id: "v3",
    name: "Sanjana Bandla Makeup Artistry",
    category: "makeup",
    location: "Jubilee Hills, Hyderabad",
    city: "Hyderabad",
    priceStart: 0.75,
    rating: 5.0,
    reviewsCount: 162,
    imageUrl: "/images/editorial/vendor_makeup.png",
    logoUrl: "/images/editorial/insp_jewelry.png",
    slug: "sanjana-bandla-makeup",
    isVerified: true,
    isPremium: true,
    isFeatured: true,
    experience: 6,
    availability: "Available",
    spaceType: "Indoor",
    tier: "Premium",
    tags: ["HD Makeup", "Airbrush", "Vogue Bride"],
    description: "Flawless luxury bridal makeup styling with natural glow. Over 6 years of formatting premium celebrity bridal portfolios."
  },
  {
    id: "v4",
    name: "Golden Petals Decorators",
    category: "decor",
    location: "Secunderabad, Hyderabad",
    city: "Hyderabad",
    priceStart: 3.2,
    rating: 4.7,
    reviewsCount: 88,
    imageUrl: "/images/editorial/vendor_decoration.png",
    logoUrl: "/images/editorial/venue_2.png",
    slug: "golden-petals-decorators",
    isVerified: true,
    isPremium: false,
    isFeatured: false,
    experience: 10,
    availability: "Available",
    spaceType: "Outdoor",
    tier: "Premium",
    tags: ["Floral Design", "Mandap Setup", "Eco-friendly"],
    description: "Bespoke stage styling, exquisite floral mandaps, and high-end outdoor setup options for premium Indian weddings."
  },
  {
    id: "v5",
    name: "Deccan Regal Caterers",
    category: "catering",
    location: "Charminar, Hyderabad",
    city: "Hyderabad",
    priceStart: 1.5,
    rating: 4.8,
    reviewsCount: 110,
    imageUrl: "/images/editorial/vendor_catering.png",
    logoUrl: "/images/editorial/vendor_catering.png",
    slug: "deccan-regal-caterers",
    isVerified: true,
    isPremium: true,
    isFeatured: true,
    experience: 15,
    availability: "Available",
    spaceType: "Both",
    tier: "Premium",
    tags: ["Multi-Cuisine", "Hyderabadi", "Live Counters"],
    description: "Serving authentic Hyderabadi and global gourmet cuisines. Known for luxury dining service, presentation, and curated menus."
  },
  {
    id: "v6",
    name: "Aisha Henna Artistry",
    category: "mehendi",
    location: "Begumpet, Hyderabad",
    city: "Hyderabad",
    priceStart: 0.25,
    rating: 4.9,
    reviewsCount: 94,
    imageUrl: "/images/editorial/insp_bridal.png",
    logoUrl: "/images/editorial/insp_jewelry.png",
    slug: "aisha-henna-artistry",
    isVerified: true,
    isPremium: false,
    isFeatured: true,
    experience: 7,
    availability: "Available",
    spaceType: "Indoor",
    tier: "Budget",
    tags: ["Arabic", "Traditional Marwari", "Bridal Mehendi"],
    description: "Intricate custom bridal henna styling combining Rajasthani motifs and modern Arabic detailing."
  }
];
