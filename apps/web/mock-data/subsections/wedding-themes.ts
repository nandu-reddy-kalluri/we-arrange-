import { InspirationDetailItem } from "@/types/inspiration-types";

export const WEDDING_THEMES_ITEMS: InspirationDetailItem[] = [
  {
    id: "wt-1",
    slug: "royal-rajputana-palace-affair",
    categorySlug: "wedding-themes",
    categoryName: "Wedding Themes",
    subCategory: "Royal & Palace",
    title: "Royal Rajputana Palace Affair",
    subtitle: "Grand heritage architecture, royal bugles, and crimson gold grandeur",
    shortDescription: "Experience majestic luxury surrounded by historic fort walls and royal hospitality.",
    description: "Rooted in royal heritage, this theme transforms historic fort and palace venues into a regal spectacle. Think royal procession (Baraat) with horses and traditional folk musicians, velvet-curtained mandaps, and candlelit courtyard dinners under the stars.",
    heroImage: "/images/editorial/royal_wedding.png",
    gallery: [
      "/images/editorial/royal_wedding.png",
      "/images/editorial/hero_venue.png",
      "/images/editorial/venue_3.png",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Royal", "Palace", "Heritage", "Rajputana", "Grandeur"],
    budgetRange: "₹30,000,000+",
    featured: true,
    designerOrVendor: "YouMarriageWeArrange Curated Theme",
    colorPalette: [
      { name: "Rajputana Red", hex: "#9B111E" },
      { name: "Royal Gold", hex: "#D4AF37" },
      { name: "Fort Sandstone", hex: "#E3A857" }
    ],
    keyHighlights: [
      "Processional folk performers and Manganiyar musicians",
      "Torchlit entrance pathways with royal flags",
      "Traditional Thali feast and royal silver table settings"
    ],
    attributes: {
      "Best Suited Venues": "Palaces, Forts & Luxury Resorts",
      "Guest Capacity": "200 - 1500 Guests",
      "Recommended Season": "October to March",
      "Key Elements": "Baraat Procession, Fireworks, Candlelit Courtyards"
    }
  },
  // Items 2-50
  ...Array.from({ length: 49 }).map((_, index) => {
    const i = index + 2;
    const subCategories = ["Royal & Palace", "Garden & Outdoor", "Modern Minimal", "Beach & Coastal", "Traditional Heritage"];
    const subCategory = subCategories[index % subCategories.length];
    
    return {
      id: `wt-${i}`,
      slug: `curated-wedding-theme-${subCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      categorySlug: "wedding-themes",
      categoryName: "Wedding Themes",
      subCategory: subCategory,
      title: `Atmospheric ${subCategory} Concept ${i}`,
      subtitle: `Complete visual style guide & event concept for ${subCategory.toLowerCase()} weddings`,
      shortDescription: `A holistic wedding theme blending custom decor palettes, attire codes, and entertainment.`,
      description: `Designed to create an immersive experience, this theme harmonizes environmental lighting, sensory floral scents, curated music playlists, and coordinated table settings.`,
      heroImage: i % 2 === 0 ? "/images/editorial/royal_wedding.png" : "/images/editorial/garden_wedding.png",
      gallery: [
        "/images/editorial/royal_wedding.png",
        "/images/editorial/garden_wedding.png",
        "/images/editorial/minimal_wedding.png",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"
      ],
      tags: ["Theme", subCategory, "Atmospheric", "Concept", "Moodboard"],
      budgetRange: `₹${15 + (i * 2)},00,000 - ₹${40 + (i * 3)},00,000`,
      featured: i === 4 || i === 12,
      designerOrVendor: `Event Concept Studio ${i}`,
      colorPalette: [
        { name: "Sunset Gold", hex: "#FFD700" },
        { name: "Emerald Olive", hex: "#556B2F" }
      ],
      keyHighlights: [
        "Comprehensive moodboard & guest dress code styling guide",
        "Coordinated stationery, decor, and lighting color key",
        "Curated vendor recommendations matching theme aesthetic"
      ],
      attributes: {
        "Vibe": subCategory,
        "Best Season": i % 2 === 0 ? "Winter / Evening" : "Spring / Daylight",
        "Guest Capacity": "100 - 800 Guests"
      }
    };
  })
];
