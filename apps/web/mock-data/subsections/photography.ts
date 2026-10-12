import { InspirationDetailItem } from "@/types/inspiration-types";

export const PHOTOGRAPHY_ITEMS: InspirationDetailItem[] = [
  {
    id: "pho-1",
    slug: "vogue-style-editorial-couple-portraits",
    categorySlug: "photography",
    categoryName: "Photography & Cinematography",
    subCategory: "Editorial & Fashion",
    title: "Vogue-Style Editorial Couple Portraits",
    subtitle: "High-fashion pose direction, cinematic lighting, and architectural framing",
    shortDescription: "Magazine-worthy wedding portraits captured with editorial lighting and candid elegance.",
    description: "Transform your wedding gallery into a high-fashion editorial spread. Professional camera crews use off-camera lighting, prime lenses, and artistic symmetry to capture intimate glance moments, regal couple portraits, and motion blur dance shots.",
    heroImage: "/images/editorial/vendor_photography.png",
    gallery: [
      "/images/editorial/vendor_photography.png",
      "/images/editorial/hero_venue.png",
      "/images/editorial/venue_2.png",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Editorial", "Photography", "Candid", "Vogue Style", "Cinematic"],
    budgetRange: "₹2,00,000 - ₹5,00,000 per day",
    featured: true,
    designerOrVendor: "Stories by Joseph Radhik Inspiration",
    attributes: {
      "Deliverables": "500+ Edited HD Photos, Teaser Reel, Leather Album",
      "Crew": "2 Lead Photographers + 2 Candid Specialists",
      "Equipment": "Medium Format Hasselblad & Sony FX Cinema"
    }
  },
  // Items 2-50
  ...Array.from({ length: 49 }).map((_, index) => {
    const i = index + 2;
    const subCategories = ["Candid Portraits", "Editorial & Fashion", "Pre-Wedding Shoots", "Drone Cinematography", "Vintage Film"];
    const subCategory = subCategories[index % subCategories.length];
    
    return {
      id: `pho-${i}`,
      slug: `cinematic-wedding-story-${subCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      categorySlug: "photography",
      categoryName: "Photography & Cinematography",
      subCategory: subCategory,
      title: `Cinematic ${subCategory} Portfolio ${i}`,
      subtitle: `Emotional storytelling captured through prime lenses & drone perspectives`,
      shortDescription: `A masterfully shot ${subCategory.toLowerCase()} collection preserving the true spirit of your wedding.`,
      description: `Combining documentary candid shooting with artistic portrait direction, this photography team captures raw emotional tears, energetic sangeet dances, and architectural venue aerial shots.`,
      heroImage: "/images/editorial/vendor_photography.png",
      gallery: [
        "/images/editorial/vendor_photography.png",
        "/images/editorial/hero_venue.png",
        "/images/editorial/venue_2.png",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
      ],
      tags: ["Photography", subCategory, "Cinematic", "Candid", "Drone"],
      budgetRange: `₹${150 + (i * 10)},000 - ₹${350 + (i * 20)},000`,
      featured: i === 6 || i === 17,
      designerOrVendor: `Cinema Studios ${i}`,
      colorPalette: [
        { name: "Warm Amber", hex: "#FFBF00" },
        { name: "Cinematic Blue", hex: "#003366" }
      ],
      keyHighlights: [
        "Full 4K RAW video recording & 61MP photo resolution",
        "Drone aerial coverage for Baraat & Outdoor venues",
        "Handcrafted flush-mount genuine leather photo album"
      ],
      attributes: {
        "Deliverables": "500+ Color Graded Photos + 3-Min Teaser Film",
        "Team Size": "4-6 Senior Photographers & Filmmakers",
        "Delivery Time": "4 Weeks",
        "Drone License": "FAA Certified Drone Operator"
      }
    };
  })
];
