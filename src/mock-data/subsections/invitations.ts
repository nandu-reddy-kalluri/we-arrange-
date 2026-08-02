import { InspirationDetailItem } from "@/types/inspiration-types";

export const INVITATIONS_ITEMS: InspirationDetailItem[] = [
  {
    id: "inv-1",
    slug: "velvet-boxed-royal-foil-invitation-set",
    categorySlug: "invitations",
    categoryName: "Wedding Invitations",
    subCategory: "Royal Boxed",
    title: "Velvet Boxed Royal Gold Foil Invitation Set",
    subtitle: "Custom silk velvet hardbound box with gold metal wax seal and brass insignia",
    shortDescription: "Unbox luxury with custom sweets jar, scented candle, and gold-foiled event inserts.",
    description: "Set a magnificent tone for your celebration before guests even arrive. Encased in a plush burgundy velvet box with gold foil embossed calligraphy, this set includes gold-gilded acrylic main card, function inserts, and artisanal dry fruit jars.",
    heroImage: "/images/editorial/insp_invitation.png",
    gallery: [
      "/images/editorial/insp_invitation.png",
      "/images/editorial/digital_invitation.png",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Luxury Box", "Velvet", "Gold Foil", "Stationery", "Wax Seal"],
    budgetRange: "₹800 - ₹2,500 per box",
    featured: true,
    designerOrVendor: "Ravish Kapoor Innovative Invitations",
    attributes: {
      "Box Material": "Silk Velvet & Wood Frame",
      "Card Type": "Frosted Acrylic + 300 GSM Cotton Paper",
      "Personalization": "Custom Monogram Metal Seal",
      "Min Order": "100 Boxes"
    }
  },
  // Items 2-50
  ...Array.from({ length: 49 }).map((_, index) => {
    const i = index + 2;
    const subCategories = ["Royal Boxed", "Digital & Video", "Acrylic & Modern", "Eco-Friendly", "Traditional Foil"];
    const subCategory = subCategories[index % subCategories.length];
    
    return {
      id: `inv-${i}`,
      slug: `bespoke-stationery-${subCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      categorySlug: "invitations",
      categoryName: "Wedding Invitations",
      subCategory: subCategory,
      title: `Artisanal ${subCategory} Card Design ${i}`,
      subtitle: `Custom stationery set with bespoke monogram & foil accents`,
      shortDescription: `An elegant ${subCategory.toLowerCase()} invitation ensemble designed for modern celebrations.`,
      description: `Crafted using heavy cotton cardstock and custom hot-stamp foil press, this stationery suite includes ceremony timelines, venue maps, RSVP cards, and personalized wax seal envelopes.`,
      heroImage: i % 2 === 0 ? "/images/editorial/insp_invitation.png" : "/images/editorial/digital_invitation.png",
      gallery: [
        "/images/editorial/insp_invitation.png",
        "/images/editorial/digital_invitation.png",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
      ],
      tags: ["Stationery", subCategory, "Foil", "Monogram", "Keepsake"],
      budgetRange: subCategory === "Digital & Video" ? "₹5,000 - ₹25,000 flat" : `₹${150 + (i * 10)} - ₹${400 + (i * 15)} per card`,
      featured: i === 5 || i === 16,
      designerOrVendor: `Stationery Atelier ${i}`,
      colorPalette: [
        { name: "Cream White", hex: "#FFFDD0" },
        { name: "Rose Gold", hex: "#B76E79" }
      ],
      keyHighlights: [
        "300 GSM textured organic cotton cardstock",
        "Hand-applied metallic foil lettering & custom couple monogram",
        "Includes matching inner envelope and wax seal sticker"
      ],
      attributes: {
        "Card Format": subCategory,
        "Paper Stock": "300 GSM Cotton Rag",
        "Printing": "Hot Foil Stamping & Blind Debossing",
        "Lead Time": "2-3 Weeks"
      }
    };
  })
];
