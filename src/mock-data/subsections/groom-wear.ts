import { InspirationDetailItem } from "@/types/inspiration-types";

export const GROOM_WEAR_ITEMS: InspirationDetailItem[] = [
  {
    id: "gw-1",
    slug: "ivory-raw-silk-embroidered-sherwani",
    categorySlug: "groom-wear",
    categoryName: "Groom Wear",
    subCategory: "Sherwanis",
    title: "Ivory Raw Silk Embroidered Sherwani",
    subtitle: "Tailored in raw silk with tonal Ari needlework and pearl buttons",
    shortDescription: "A stately royal sherwani set with layered silk stole, velvet safa, and fitted churidar.",
    description: "Crafted from hand-spun raw silk, this ivory sherwani features subtle tone-on-tone embroidery across the chest and cuffs. Paired with a contrasting ruby-hued stole, pearl necklace, and structured churidar.",
    heroImage: "/images/editorial/insp_groom.png",
    gallery: [
      "/images/editorial/insp_groom.png",
      "/images/editorial/venue_3.png",
      "/images/editorial/royal_wedding.png",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Royal", "Ivory", "Raw Silk", "Sherwani", "Groom Style"],
    budgetRange: "₹85,000 - ₹2,20,000",
    featured: true,
    designerOrVendor: "Tarun Tahiliani Groomswear",
    styleTip: "Accessorize with a multi-strand pearl and emerald mala and hand-worked mojris.",
    colorPalette: [
      { name: "Ivory White", hex: "#FFFFF0" },
      { name: "Ruby Accent", hex: "#E0115F" },
      { name: "Warm Gold", hex: "#DAA520" }
    ],
    keyHighlights: [
      "Precision-tailored shoulder structure with hidden pocketing",
      "Hand-worked fabric buttons and detachable jewel pin",
      "Includes matching embroidered dupatta and silk safa"
    ],
    attributes: {
      "Fabric": "Raw Silk & Chanderi Stole",
      "Fit": "Structured Slim Fit",
      "Occasion": "Baraat & Pheras",
      "Lead Time": "3-5 Weeks"
    }
  },
  {
    id: "gw-2",
    slug: "midnight-blue-velvet-bandhgala",
    categorySlug: "groom-wear",
    categoryName: "Groom Wear",
    subCategory: "Bandhgalas",
    title: "Midnight Blue Velvet Bandhgala Suit",
    subtitle: "Luxury velvet jacket with brass lion crest buttons",
    shortDescription: "Sleek and commanding bandhgala for Sangeet, Cocktail, or Reception evenings.",
    description: "A tailored velvet bandhgala jacket in deep midnight blue paired with crisp slim trousers. Features hand-carved brass crest buttons and silk lining for supreme comfort.",
    heroImage: "/images/editorial/venue_4.png",
    gallery: [
      "/images/editorial/venue_4.png",
      "/images/editorial/insp_groom.png",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Velvet", "Bandhgala", "Sangeet", "Midnight Blue", "Dapper"],
    budgetRange: "₹65,000 - ₹1,40,000",
    featured: false,
    designerOrVendor: "Manish Malhotra Groom",
    attributes: {
      "Fabric": "Italian Velvet",
      "Buttons": "Custom Brass Crest",
      "Occasion": "Reception / Sangeet",
      "Lead Time": "3 Weeks"
    }
  },
  // Items 3-50
  ...Array.from({ length: 48 }).map((_, index) => {
    const i = index + 3;
    const subCategories = ["Sherwanis", "Bandhgalas", "Tuxedos", "Indo-Western", "Kurta Sets"];
    const subCategory = subCategories[index % subCategories.length];
    
    return {
      id: `gw-${i}`,
      slug: `dapper-groom-${subCategory.toLowerCase()}-edition-${i}`,
      categorySlug: "groom-wear",
      categoryName: "Groom Wear",
      subCategory: subCategory,
      title: `Regal Groom ${subCategory} Style ${i}`,
      subtitle: `Handcrafted ${subCategory.toLowerCase()} tailored for royal weddings`,
      shortDescription: `A distinguished ${subCategory.toLowerCase()} offering sophisticated tailoring for the modern groom.`,
      description: `Crafted with meticulous attention to detail, this ensemble combines structured shoulder tailoring, rich fabric weave, and custom jewel button accents to give the groom an unforgettable royal presence.`,
      heroImage: i % 2 === 0 ? "/images/editorial/insp_groom.png" : "/images/editorial/venue_3.png",
      gallery: [
        "/images/editorial/insp_groom.png",
        "/images/editorial/venue_3.png",
        "/images/editorial/royal_wedding.png",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80"
      ],
      tags: ["Groom", subCategory, "Regal", "Tailored", "Dapper"],
      date: "2026 Season",
      budgetRange: `₹${50 + (i * 3)},000 - ₹${120 + (i * 5)},000`,
      featured: i === 5 || i === 20,
      designerOrVendor: `Master Tailor Studio ${i}`,
      styleTip: `Pair with handcrafted leather mojaris and a matching pocket square.`,
      colorPalette: [
        { name: "Royal Beige", hex: "#F5F5DC" },
        { name: "Gold Ochre", hex: "#CC7722" }
      ],
      keyHighlights: [
        "Bespoke canvased inner lining for structured silhouette",
        "Hand-stitched thread embroidery along collar & cuffs",
        "Includes matching trousers / churidar"
      ],
      attributes: {
        "Fabric": i % 2 === 0 ? "Silk Matka" : "Italian Wool & Velvet",
        "Fit": "Tailored Slim Fit",
        "Occasion": subCategory === "Tuxedos" ? "Reception" : "Baraat & Mandap",
        "Lead Time": "3-4 Weeks"
      }
    };
  })
];
