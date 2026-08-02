import { InspirationDetailItem } from "@/types/inspiration-types";

export const JEWELLERY_ITEMS: InspirationDetailItem[] = [
  {
    id: "jwl-1",
    slug: "uncut-polki-diamond-emerald-choker",
    categorySlug: "jewellery",
    categoryName: "Jewellery",
    subCategory: "Kundhan & Polki",
    title: "Uncut Polki Diamond & Colombian Emerald Choker Set",
    subtitle: "Handcrafted in 22K yellow gold with cascading pearl drops",
    shortDescription: "A statement heirloom neckpiece designed to frame royal bridal necklines.",
    description: "Feast your eyes on this majestic Polki choker set. Featuring untreated Colombian emerald stones surrounded by uncut diamonds set in 22K gold foil (Meenakari backing). Paired with matching chandelier earrings and a delicate mathapatti.",
    heroImage: "/images/editorial/insp_jewelry.png",
    gallery: [
      "/images/editorial/insp_jewelry.png",
      "/images/editorial/insp_bridal.png",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Polki", "Emerald", "Heirloom", "Choker", "22K Gold"],
    budgetRange: "₹8,00,000 - ₹25,00,000",
    featured: true,
    designerOrVendor: "Tanishq Zoya Fine Jewellery",
    attributes: {
      "Gold Purity": "22 Karat Yellow Gold",
      "Gemstones": "Uncut Polki, Emerald Drops, Basra Pearls",
      "Crafting Technique": "Jadau & Hand Meenakari",
      "Certification": "BIS Hallmarked & GIA Certified"
    }
  },
  // Items 2-50
  ...Array.from({ length: 49 }).map((_, index) => {
    const i = index + 2;
    const subCategories = ["Kundhan & Polki", "Temple Gold", "Diamond & Platinum", "Maang Tikka & Nath", "Bangles & Chooda"];
    const subCategory = subCategories[index % subCategories.length];
    
    return {
      id: `jwl-${i}`,
      slug: `heritage-jewel-${subCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      categorySlug: "jewellery",
      categoryName: "Jewellery",
      subCategory: subCategory,
      title: `Heirloom ${subCategory} Collection ${i}`,
      subtitle: `Handmade 22K gold ornament with precious gem accents`,
      shortDescription: `A striking ${subCategory.toLowerCase()} piece celebrating Indian goldsmithing traditions.`,
      description: `Designed for brides seeking timeless elegance, this ${subCategory.toLowerCase()} piece combines uncut diamonds, ruby accents, and pearls. Hand-hammered gold settings ensure durability and light reflection.`,
      heroImage: "/images/editorial/insp_jewelry.png",
      gallery: [
        "/images/editorial/insp_jewelry.png",
        "/images/editorial/insp_bridal.png",
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
      ],
      tags: ["Jewellery", subCategory, "Heirloom", "22K Gold", "Precious Gems"],
      budgetRange: `₹${300 + (i * 25)},000 - ₹${800 + (i * 40)},000`,
      featured: i === 7 || i === 19,
      designerOrVendor: `Royal Jewellers Guild ${i}`,
      colorPalette: [
        { name: "Pure Gold", hex: "#FFD700" },
        { name: "Deep Ruby", hex: "#9B111E" }
      ],
      keyHighlights: [
        "100% BIS Hallmarked 22K Gold",
        "Natural certified gemstones & pearls",
        "Includes velvet heirloom storage chest"
      ],
      attributes: {
        "Gold Purity": "22 Karat Gold",
        "Craftsmanship": "Traditional Jadau / Temple Weave",
        "Occasion": "Muhurtham / Wedding Ceremony",
        "Certification": "BIS Hallmarked"
      }
    };
  })
];
