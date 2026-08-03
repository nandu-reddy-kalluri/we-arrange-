import { InspirationDetailItem } from "@/types/inspiration-types";

export const MEHENDI_ITEMS: InspirationDetailItem[] = [
  {
    id: "mhd-1",
    slug: "royal-baraat-bride-groom-portrait-henna",
    categorySlug: "mehendi",
    categoryName: "Mehendi Designs",
    subCategory: "Bridal Portrait",
    title: "Royal Baraat Bride & Groom Portrait Henna",
    subtitle: "Intricate portrait art capturing the couple, doli, baraat, and sacred wedding mantras",
    shortDescription: "Bespoke bridal mehendi telling your personal love story across palms and arms.",
    description: "Elevate your bridal henna into a masterpiece. This detailed pattern incorporates realistic portraits of the bride and groom on opposite palms, flanked by a doli procession, jaimala exchange scene, lotus mandalas, and custom wedding hashtags or dates.",
    heroImage: "/images/editorial/vendor_makeup.png",
    gallery: [
      "/images/editorial/vendor_makeup.png",
      "/images/editorial/insp_jewelry.png",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Mehendi", "Portrait Henna", "Bridal Mehendi", "Marwari Art", "Doli Baraat"],
    budgetRange: "₹15,000 - ₹45,000",
    featured: true,
    designerOrVendor: "Veena Nagda Mehendi Artist",
    styleTip: "Apply eucalyptus oil and clove steam after removing dry henna for deep dark mahogany stain.",
    attributes: {
      "Coverage": "Elbows to Palms & Mid-Calf Feet",
      "Henna Type": "100% Organic Sojat Chemical-Free Henna",
      "Application Time": "4 - 6 Hours",
      "Stain Peak": "48 Hours post-application"
    }
  },
  // Items 2-50
  ...Array.from({ length: 49 }).map((_, index) => {
    const i = index + 2;
    const subCategories = ["Bridal Portrait", "Arabic & Minimal", "Marwari Heritage", "Mandala Palms", "Leg & Feet Henna"];
    const subCategory = subCategories[index % subCategories.length];
    
    return {
      id: `mhd-${i}`,
      slug: `intricate-henna-${subCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      categorySlug: "mehendi",
      categoryName: "Mehendi Designs",
      subCategory: subCategory,
      title: `Artisanal ${subCategory} Motif ${i}`,
      subtitle: `Bespoke organic henna art with lotus mandalas & fine line work`,
      shortDescription: `A breathtaking ${subCategory.toLowerCase()} design featuring delicate symmetry and deep stain results.`,
      description: `Hand-drawn using 100% organic Sojat henna paste, this pattern combines traditional peacock motifs, floral vines, negative space shading, and customized wedding date lettering.`,
      heroImage: "/images/editorial/vendor_makeup.png",
      gallery: [
        "/images/editorial/vendor_makeup.png",
        "/images/editorial/insp_jewelry.png",
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
      ],
      tags: ["Mehendi", subCategory, "Henna Art", "Bridal", "Organic"],
      budgetRange: `₹${10 + (i * 2)},000 - ₹${25 + (i * 3)},000`,
      featured: i === 4 || i === 14,
      designerOrVendor: `Henna Artist Guild ${i}`,
      colorPalette: [
        { name: "Rich Mahogany Stain", hex: "#4A0E0E" },
        { name: "Terracotta Henna", hex: "#E2725B" }
      ],
      styleTip: "Avoid washing hands with water for 12 hours after paste removal for maximum stain darkness.",
      keyHighlights: [
        "100% natural, chemical-free organic henna paste",
        "Fine tip precision cone work for intricate detail",
        "Includes aftercare oil & clove steaming kit"
      ],
      attributes: {
        "Coverage": subCategory === "Leg & Feet Henna" ? "Ankles to Mid-Calf" : "Elbows to Palms",
        "Henna Source": "Sojat Organic Leaves",
        "Application Time": "3-5 Hours",
        "Stain Peak": "48 Hours"
      }
    };
  })
];
