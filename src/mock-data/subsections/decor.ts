import { InspirationDetailItem } from "@/types/inspiration-types";

export const DECOR_ITEMS: InspirationDetailItem[] = [
  {
    id: "dec-1",
    slug: "royal-palace-marigold-mandap",
    categorySlug: "decor",
    categoryName: "Wedding Decor",
    subCategory: "Mandap",
    title: "Royal Palace Marigold & Mogra Mandap",
    subtitle: "Four-pillar carved wood mandap enveloped in fresh marigolds and hanging bells",
    shortDescription: "An iconic traditional setup with brass lamps, lotus floral chandeliers, and plush seating.",
    description: "Immerse your ceremony in sacred golden light with this magnificent four-pillar carved wooden mandap draped with thousands of fresh orange marigold strings and fragrant white mogra tassels. Complemented by traditional brass diyas, urli bowls with floating lotus blossoms, and rich velvet seating.",
    heroImage: "/images/editorial/mandap_design.png",
    gallery: [
      "/images/editorial/mandap_design.png",
      "/images/editorial/vendor_decoration.png",
      "/images/editorial/hero_venue.png",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Mandap", "Marigold", "Traditional", "Brass Diyas", "Palace Decor"],
    budgetRange: "₹3,50,000 - ₹8,00,000",
    featured: true,
    designerOrVendor: "Devika Narain Decorators",
    colorPalette: [
      { name: "Marigold Yellow", hex: "#FFC800" },
      { name: "Sacred Vermillion", hex: "#D32F2F" },
      { name: "Antiqued Brass", hex: "#B8860B" }
    ],
    keyHighlights: [
      "Custom hand-carved wooden pillar frame",
      "100% fresh, locally sourced marigold & lotus blooms",
      "Integrated ambient warm spot lighting"
    ],
    attributes: {
      "Structure": "4-Pillar Arch",
      "Flowers Used": "Orange Marigold, White Mogra, Red Lotus",
      "Setup Time": "12 Hours",
      "Ideal Space": "Outdoor Lawn or Grand Ballroom"
    }
  },
  {
    id: "dec-2",
    slug: "enchanted-glasshouse-fairy-light-ceiling",
    categorySlug: "decor",
    categoryName: "Wedding Decor",
    subCategory: "Ceiling & Lighting",
    title: "Enchanted Glasshouse Fairy Light Ceiling",
    subtitle: "Over 10,000 twinkling warm LEDs intermingled with cascading eucalyptus greenery",
    shortDescription: "A starlight night ambiance for unforgettable reception dances and dinner toasts.",
    description: "Transform your venue into a magical starlit sanctuary. Thousands of delicate fairy lights descend from draped ceiling structures intermixed with fresh monstera leaves, eucalyptus, and crystal drop chandeliers.",
    heroImage: "/images/editorial/vendor_decoration.png",
    gallery: [
      "/images/editorial/vendor_decoration.png",
      "/images/editorial/vendor_music.png",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Ceiling Decor", "Fairy Lights", "Luxury", "Greenery", "Starlight"],
    budgetRange: "₹2,00,000 - ₹5,00,000",
    featured: false,
    designerOrVendor: "Altair Decor Studio",
    attributes: {
      "Lighting Type": "Warm LED Fairy Lights + Crystal Chandeliers",
      "Coverage": "Up to 5000 sq ft",
      "Occasion": "Reception / Sangeet",
      "Setup Time": "8 Hours"
    }
  },
  // Items 3-50
  ...Array.from({ length: 48 }).map((_, index) => {
    const i = index + 3;
    const subCategories = ["Mandap", "Stage & Backdrop", "Entrance", "Ceiling & Lighting", "Table Settings"];
    const subCategory = subCategories[index % subCategories.length];
    
    return {
      id: `dec-${i}`,
      slug: `breathtaking-${subCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-design-${i}`,
      categorySlug: "decor",
      categoryName: "Wedding Decor",
      subCategory: subCategory,
      title: `Bespoke ${subCategory} Layout ${i}`,
      subtitle: `Stunning ${subCategory.toLowerCase()} installation with exotic florals`,
      shortDescription: `An immersive ${subCategory.toLowerCase()} concept designed to awe your guests.`,
      description: `Transforming empty venues into architectural visual art, this ${subCategory.toLowerCase()} design merges dramatic lighting, lush floral walls, and custom structural backdrops.`,
      heroImage: i % 2 === 0 ? "/images/editorial/vendor_decoration.png" : "/images/editorial/mandap_design.png",
      gallery: [
        "/images/editorial/vendor_decoration.png",
        "/images/editorial/mandap_design.png",
        "/images/editorial/hero_venue.png",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"
      ],
      tags: ["Decor", subCategory, "Floral", "Atmospheric", "Luxury"],
      budgetRange: `₹${150 + (i * 10)},000 - ₹${300 + (i * 15)},000`,
      featured: i === 6 || i === 18,
      designerOrVendor: `Floral Decor Artistry ${i}`,
      styleTip: `Use warm dimmable spotlighting to bring out rich flower textures after dusk.`,
      colorPalette: [
        { name: "Blush Rose", hex: "#FFB6C1" },
        { name: "Gold Foil", hex: "#D4AF37" }
      ],
      keyHighlights: [
        "100% fresh orchid and baby breath arrangements",
        "Modular metallic truss structure suitable for any ceiling height",
        "Includes full tear-down and cleanup logistics"
      ],
      attributes: {
        "Style": i % 2 === 0 ? "Grand Royal" : "Modern Botanical Minimal",
        "Floral Type": "Imported Hydrangeas & Local Mogra",
        "Setup Time": "10-14 Hours",
        "Space Suitability": "Indoor Ballroom / Outdoor Lawn"
      }
    };
  })
];
