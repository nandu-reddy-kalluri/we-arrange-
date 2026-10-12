import { InspirationDetailItem } from "@/types/inspiration-types";

export const MAKEUP_ITEMS: InspirationDetailItem[] = [
  {
    id: "mkp-1",
    slug: "glass-skin-dewy-bridal-makeup",
    categorySlug: "makeup",
    categoryName: "Makeup",
    subCategory: "Dewy & Glass Skin",
    title: "Glass-Skin Dewy Bridal Beauty Look",
    subtitle: "Hydrated skin, soft neutral eyeshadow, and rosy peach glossy lips",
    shortDescription: "Radiant, skin-first makeup designed to look effortlessly glowing in high-definition camera lenses.",
    description: "Move away from heavy cakey layers! This signature glass-skin bridal makeup focuses on intense hydration prep, sheer HD airbrush base, luminous liquid highlighter on high points, soft champagne shimmer eyes, and fluttery mink lashes.",
    heroImage: "/images/editorial/vendor_makeup.png",
    gallery: [
      "/images/editorial/vendor_makeup.png",
      "/images/editorial/insp_bridal.png",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Dewy Makeup", "Glass Skin", "HD Airbrush", "Nude Lip", "Glow"],
    budgetRange: "₹25,000 - ₹60,000 per function",
    featured: true,
    designerOrVendor: "Namrata Soni Hair & Makeup",
    styleTip: "Start a strict skin hydration routine 4 weeks before the wedding day for optimal glow.",
    attributes: {
      "Technique": "HD Airbrush + Skin Prep Massaging",
      "Finish": "Luminous Dewy Glass Finish",
      "Durability": "16+ Hours Waterproof",
      "Includes": "Draping, Hair Styling & Lash Extensions"
    }
  },
  // Items 2-50
  ...Array.from({ length: 49 }).map((_, index) => {
    const i = index + 2;
    const subCategories = ["Dewy & Glass Skin", "Classic Royal Red", "Nude Glam", "HD Airbrush", "Cocktail Smokey Eye"];
    const subCategory = subCategories[index % subCategories.length];
    
    return {
      id: `mkp-${i}`,
      slug: `radiant-bridal-makeup-${subCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      categorySlug: "makeup",
      categoryName: "Makeup",
      subCategory: subCategory,
      title: `Flawless ${subCategory} Look ${i}`,
      subtitle: `Long-wear HD bridal makeup crafted for high-definition photography`,
      shortDescription: `A stunning ${subCategory.toLowerCase()} look tailored to highlight natural features.`,
      description: `Designed for all-day performance under hot stage lights, this bridal beauty look utilizes waterproof silicon-based products, soft contouring, custom false lashes, and hydrated skin prep.`,
      heroImage: "/images/editorial/vendor_makeup.png",
      gallery: [
        "/images/editorial/vendor_makeup.png",
        "/images/editorial/insp_bridal.png",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80"
      ],
      tags: ["Makeup", subCategory, "Bridal Glow", "HD Makeup", "Flawless"],
      budgetRange: `₹${20 + (i * 2)},000 - ₹${45 + (i * 3)},000`,
      featured: i === 6 || i === 18,
      designerOrVendor: `Celebrity MUA Studio ${i}`,
      colorPalette: [
        { name: "Peach Nude", hex: "#FFDAB9" },
        { name: "Warm Bronze", hex: "#CD7F32" }
      ],
      styleTip: "Keep touch-up powder and lipstick handy for post-jaimala photos.",
      keyHighlights: [
        "Waterproof 18-hour sweatproof formula",
        "Custom silk false lashes matched to eye shape",
        "Includes hair styling & dupatta draping"
      ],
      attributes: {
        "Base Type": subCategory === "HD Airbrush" ? "Silicon Airbrush Base" : "Hydrating Cream HD Base",
        "Finish": subCategory.includes("Dewy") ? "Luminous Dewy" : "Velvet Soft Matte",
        "Time Required": "2 Hours",
        "Trial Available": "Yes"
      }
    };
  })
];
