import { InspirationDetailItem } from "@/types/inspiration-types";

export const COLOR_PALETTES_ITEMS: InspirationDetailItem[] = [
  {
    id: "cp-1",
    slug: "blush-pink-sage-green-gold",
    categorySlug: "color-palettes",
    categoryName: "Color Palettes",
    subCategory: "Pastel & Blush",
    title: "Blush Pink, Sage Green & Champagne Gold",
    subtitle: "A romantic and refreshing palette tailored for day weddings and garden mandaps",
    shortDescription: "Soft, graceful tones that blend seamlessly with natural outdoor greenery.",
    description: "This viral color palette harmonizes soft rose blush with organic sage foliage and warm champagne accents. Ideal for Anand Karaj, day phera setups, and outdoor lawn luncheons.",
    heroImage: "/images/editorial/minimal_wedding.png",
    gallery: [
      "/images/editorial/minimal_wedding.png",
      "/images/editorial/garden_wedding.png",
      "/images/editorial/insp_bridal.png",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Color Palette", "Pastel", "Blush Pink", "Sage Green", "Day Wedding"],
    budgetRange: "Curated Palette Concept",
    designerOrVendor: "YouMarriageWeArrange Color Studio",
    featured: true,
    colorPalette: [
      { name: "Rose Blush", hex: "#FFC0CB" },
      { name: "Sage Green", hex: "#8FBC8F" },
      { name: "Champagne Gold", hex: "#F7E7CE" },
      { name: "Cream Ivory", hex: "#FFFFF0" }
    ],
    styleTip: "Use Sage Green for bridesmaid drapes and Blush Pink for main mandap blooms for balanced contrast.",
    attributes: {
      "Best Season": "Spring & Daylight Events",
      "Matching Fashion": "Pastel Silk Lehengas & Beige Sherwanis",
      "Decor Compatibility": "Lawn & Garden Spaces"
    }
  },
  // Items 2-50
  ...Array.from({ length: 49 }).map((_, index) => {
    const i = index + 2;
    const subCategories = ["Pastel & Blush", "Royal Red & Gold", "Emerald & Sage", "Sunset Coral", "Monochrome Chic"];
    const subCategory = subCategories[index % subCategories.length];
    
    const palettePresets = [
      [
        { name: "Emerald", hex: "#50C878" },
        { name: "Mint", hex: "#98FF98" },
        { name: "Champagne", hex: "#F7E7CE" },
        { name: "Gold", hex: "#D4AF37" }
      ],
      [
        { name: "Coral Sunset", hex: "#FF7F50" },
        { name: "Peach Blush", hex: "#FFDAB9" },
        { name: "Warm Terracotta", hex: "#E2725B" },
        { name: "Ivory", hex: "#FFFFF0" }
      ],
      [
        { name: "Deep Ruby", hex: "#840011" },
        { name: "Crimson Red", hex: "#DC143C" },
        { name: "Antique Brass", hex: "#CC9933" },
        { name: "Charcoal", hex: "#36454F" }
      ]
    ];

    return {
      id: `cp-${i}`,
      slug: `harmonious-palette-${subCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      categorySlug: "color-palettes",
      categoryName: "Color Palettes",
      subCategory: subCategory,
      title: `${subCategory} Color Palette ${i}`,
      subtitle: `Curated hex swatch combination for decor, attire, and stationery`,
      shortDescription: `A balanced ${subCategory.toLowerCase()} color harmony created for cohesive wedding styling.`,
      description: `Elevate your visual identity with this multi-tone palette. Designed by senior wedding stylists to help couples coordinate floral tones, lighting gels, invitations, and wedding party outfits seamlessly.`,
      heroImage: i % 2 === 0 ? "/images/editorial/minimal_wedding.png" : "/images/editorial/garden_wedding.png",
      gallery: [
        "/images/editorial/minimal_wedding.png",
        "/images/editorial/garden_wedding.png",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"
      ],
      tags: ["Color Palette", subCategory, "Hex Swatches", "Styling Guide", "Tones"],
      budgetRange: "Curated Palette Concept",
      designerOrVendor: `Color Consultant Studio ${i}`,
      featured: i === 3 || i === 15,
      colorPalette: palettePresets[index % palettePresets.length],
      styleTip: `Use dominant base tone for 60% of decor space and metallic accents for subtle highlights.`,
      keyHighlights: [
        "4 precision Hex color codes ready for graphic designers",
        "Includes daylight vs evening lighting gel recommendations",
        "Fabric dye matching suggestions for silk and velvet"
      ],
      attributes: {
        "Vibe": subCategory,
        "Best Season": i % 2 === 0 ? "Spring / Summer" : "Autumn / Winter",
        "Application": "Invitations, Mandap, Linen & Fashion"
      }
    };
  })
];
