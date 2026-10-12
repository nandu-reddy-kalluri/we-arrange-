import { InspirationDetailItem } from "@/types/inspiration-types";

export const HAIRSTYLES_ITEMS: InspirationDetailItem[] = [
  {
    id: "hs-1",
    slug: "royal-gajra-wrapped-braid-with-jeweled-pins",
    categorySlug: "hairstyles",
    categoryName: "Hairstyles",
    subCategory: "Gajra Braids",
    title: "Royal Gajra-Wrapped South Indian Braid",
    subtitle: "Voluminous fishtail braid wrapped in fresh jasmine mogra garlands and temple hair pins",
    shortDescription: "The ultimate traditional hairstyle for Muhurtham sarees and royal silk ensembles.",
    description: "A timeless South Indian bridal classic. The hair is styled into a neat crown bump with a long, thick braid adorned with dense fresh jasmine (gajra) strings, red rose petals, and traditional gold Billai / hair brooch pins down the length.",
    heroImage: "/images/editorial/insp_bridal.png",
    gallery: [
      "/images/editorial/insp_bridal.png",
      "/images/editorial/insp_jewelry.png",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Gajra Braid", "South Indian", "Jasmine", "Mugappu Pins", "Traditional Hair"],
    budgetRange: "₹12,000 - ₹28,000 per style",
    featured: true,
    designerOrVendor: "Ritika Kadam Hair Artistry",
    attributes: {
      "Hair Type": "All Hair Lengths (Extensions available)",
      "Flowers": "Fresh Mogra & Red Miniature Roses",
      "Time Needed": "45 - 60 Minutes",
      "Hold Rating": "Ultra Strong All-Day Hold"
    }
  },
  // Items 2-50
  ...Array.from({ length: 49 }).map((_, index) => {
    const i = index + 2;
    const subCategories = ["Gajra Braids", "Messy Floral Buns", "Sleek Updos", "Hollywood Waves", "South Indian Plait"];
    const subCategory = subCategories[index % subCategories.length];
    
    return {
      id: `hs-${i}`,
      slug: `bridal-hair-artistry-${subCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      categorySlug: "hairstyles",
      categoryName: "Hairstyles",
      subCategory: subCategory,
      title: `Artisanal ${subCategory} Design ${i}`,
      subtitle: `Intricate bridal hairstyle adorned with fresh flowers & hair brooches`,
      shortDescription: `A gorgeous ${subCategory.toLowerCase()} style designed to anchor bridal head veils securely.`,
      description: `Crafted to endure heat, heavy dupattas, and dancing, this hairstyle utilizes texturizing sprays, hidden padding, and precision pinning. Complemented by fresh floral arrangements or pearl pins.`,
      heroImage: "/images/editorial/insp_bridal.png",
      gallery: [
        "/images/editorial/insp_bridal.png",
        "/images/editorial/vendor_makeup.png",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
      ],
      tags: ["Hairstyle", subCategory, "Gajra", "Floral Bun", "Updo"],
      budgetRange: `₹8,000 - ₹25,000 per style`,
      featured: i === 5 || i === 15,
      designerOrVendor: `Master Hair Artist ${i}`,
      colorPalette: [
        { name: "Jasmine White", hex: "#FFFFFF" },
        { name: "Rose Pink", hex: "#FFC0CB" }
      ],
      keyHighlights: [
        "Structure padded to support dupattas weighing up to 3kg",
        "100% fresh flowers & pearl pin accessories",
        "Holds shape for 14+ hours without frizz"
      ],
      attributes: {
        "Style": subCategory,
        "Accessories": "Fresh Floral Garlands & Pearl Pins",
        "Time Required": "45 Minutes",
        "Dupatta Anchor": "Reinforced Pins Included"
      }
    };
  })
];
