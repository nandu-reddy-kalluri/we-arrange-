export type InspirationCategory = 
  | "themes" 
  | "decor" 
  | "real-weddings" 
  | "ideas" 
  | "photography" 
  | "bridal-fashion" 
  | "groom-fashion" 
  | "wedding-trends" 
  | "editors-picks";

export interface InspirationItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  category: InspirationCategory;
}

export const weddingThemes: InspirationItem[] = [
  {
    id: "royal",
    title: "Royal Wedding",
    description: "Opulent settings, palace venues, and majestic red-gold decor fit for royalty.",
    imageUrl: "/images/editorial/royal_wedding.png",
    slug: "royal-wedding",
    category: "themes",
  },
  {
    id: "minimal",
    title: "Minimal Wedding",
    description: "Sleek, modern styling with clean lines, neutral tones, and elegant simplicity.",
    imageUrl: "/images/editorial/minimal_wedding.png",
    slug: "minimal-wedding",
    category: "themes",
  },
  {
    id: "traditional",
    title: "Traditional Wedding",
    description: "Deeply rooted cultural rituals, vibrant colors, and classic heritage settings.",
    imageUrl: "/images/editorial/venue_3.png",
    slug: "traditional-wedding",
    category: "themes",
  },
  {
    id: "luxury",
    title: "Modern Luxury",
    description: "Grand chandeliers, bespoke floral structures, and sophisticated contemporary aesthetics.",
    imageUrl: "/images/editorial/venue_4.png",
    slug: "modern-luxury",
    category: "themes",
  },
  {
    id: "garden",
    title: "Garden Wedding",
    description: "Romantic outdoor setups surrounded by lush greenery, fairy lights, and pastel blooms.",
    imageUrl: "/images/editorial/garden_wedding.png",
    slug: "garden-wedding",
    category: "themes",
  },
  {
    id: "beach",
    title: "Beach Wedding",
    description: "Serene ocean backdrops, breezy setups, and natural sandy pathways for a relaxed vibe.",
    imageUrl: "/images/editorial/venue_2.png",
    slug: "beach-wedding",
    category: "themes",
  },
  {
    id: "palace",
    title: "Palace Wedding",
    description: "Immersive historic venues, sweeping stone arches, and time-honored grand scale events.",
    imageUrl: "/images/editorial/hero_venue.png",
    slug: "palace-wedding",
    category: "themes",
  },
  {
    id: "destination",
    title: "Destination Wedding",
    description: "Exotic getaways with close loved ones, combining vacation comfort with celebration.",
    imageUrl: "/images/editorial/venue_1.png",
    slug: "destination-wedding",
    category: "themes",
  },
  {
    id: "floral",
    title: "Floral Wedding",
    description: "Stunning, layered walls of fresh flowers, cascading installations, and organic accents.",
    imageUrl: "/images/editorial/vendor_decoration.png",
    slug: "floral-wedding",
    category: "themes",
  },
  {
    id: "vintage",
    title: "Vintage Wedding",
    description: "Nostalgic retro charm, antique gold finishes, and delicate lace and pearl highlights.",
    imageUrl: "/images/editorial/insp_jewelry.png",
    slug: "vintage-wedding",
    category: "themes",
  },
];

export const decorInspirations: InspirationItem[] = [
  {
    id: "mandap",
    title: "Mandap Designs",
    description: "Sacred, visually stunning wedding altars featuring traditional structures and floral arches.",
    imageUrl: "/images/editorial/mandap_design.png",
    slug: "mandap-designs",
    category: "decor",
  },
  {
    id: "stage",
    title: "Stage Decoration",
    description: "Bespoke stage backdrops, plush seating arrangements, and elaborate ambient lighting.",
    imageUrl: "/images/editorial/vendor_decoration.png",
    slug: "stage-decoration",
    category: "decor",
  },
  {
    id: "entrance",
    title: "Entrance Decor",
    description: "Grand archways, walkway lanterns, and floral pathways welcoming your guests.",
    imageUrl: "/images/editorial/venue_3.png",
    slug: "entrance-decor",
    category: "decor",
  },
  {
    id: "reception",
    title: "Reception Decor",
    description: "Glamorous banquet themes, custom dance floors, and modern lounges for evening functions.",
    imageUrl: "/images/editorial/venue_4.png",
    slug: "reception-decor",
    category: "decor",
  },
  {
    id: "floral-decor",
    title: "Floral Decoration",
    description: "Lush floral canopies, hanging floral chandeliers, and intricate backdrops.",
    imageUrl: "/images/editorial/vendor_decoration.png",
    slug: "floral-decoration",
    category: "decor",
  },
  {
    id: "lighting",
    title: "Lighting Ideas",
    description: "Fairy lights, warm uplighting, and dramatic Edison bulb layouts to set the mood.",
    imageUrl: "/images/editorial/vendor_music.png",
    slug: "lighting-ideas",
    category: "decor",
  },
  {
    id: "ceiling",
    title: "Ceiling Decor",
    description: "Draped luxury fabrics, hanging greenery, and cascading crystal chandelier installations.",
    imageUrl: "/images/editorial/hero_venue.png",
    slug: "ceiling-decor",
    category: "decor",
  },
  {
    id: "table",
    title: "Table Decoration",
    description: "Elegant centerpieces, candle settings, custom tableware, and luxury name placements.",
    imageUrl: "/images/editorial/vendor_catering.png",
    slug: "table-decoration",
    category: "decor",
  },
  {
    id: "outdoor",
    title: "Outdoor Decor",
    description: "Whimsical open-air elements, canopy seating, and tree decorations for garden layouts.",
    imageUrl: "/images/editorial/garden_wedding.png",
    slug: "outdoor-decor",
    category: "decor",
  },
  {
    id: "mehendi",
    title: "Mehendi Decor",
    description: "Playful, colorful drapes, marigold tassels, and comfortable seating for relaxed daytime events.",
    imageUrl: "/images/editorial/vendor_makeup.png",
    slug: "mehendi-decor",
    category: "decor",
  },
];

export const realWeddings: InspirationItem[] = [
  {
    id: "rw-1",
    title: "An Elegant City Affair",
    description: "A beautiful celebration featuring stunning skyline views and minimalist floral arrangements.",
    imageUrl: "/images/editorial/hero_venue.png",
    slug: "elegant-city-affair",
    category: "real-weddings",
  },
  {
    id: "rw-2",
    title: "Rustic Vineyard Romance",
    description: "Warm sunset lighting, rustic wooden tables, and endless vineyards.",
    imageUrl: "/images/editorial/garden_wedding.png",
    slug: "rustic-vineyard-romance",
    category: "real-weddings",
  }
];

export const ideas: InspirationItem[] = [
  {
    id: "idea-1",
    title: "Sustainable Favors",
    description: "Eco-friendly and meaningful gifting ideas for your wedding guests.",
    imageUrl: "/images/editorial/insp_jewelry.png",
    slug: "sustainable-favors",
    category: "ideas",
  },
  {
    id: "idea-2",
    title: "Interactive Food Stations",
    description: "Creative catering setups that double as entertainment for your guests.",
    imageUrl: "/images/editorial/vendor_catering.png",
    slug: "interactive-food-stations",
    category: "ideas",
  }
];

export const photography: InspirationItem[] = [
  {
    id: "photo-1",
    title: "Editorial Portraits",
    description: "Vogue-inspired poses and dramatic lighting for a fashion-forward album.",
    imageUrl: "/images/editorial/vendor_photography.png",
    slug: "editorial-portraits",
    category: "photography",
  },
  {
    id: "photo-2",
    title: "Candid Moments",
    description: "Capturing the raw, unfiltered emotions and joy of your special day.",
    imageUrl: "/images/editorial/venue_2.png",
    slug: "candid-moments",
    category: "photography",
  }
];

export const bridalFashion: InspirationItem[] = [
  {
    id: "bf-1",
    title: "Modern Minimalist Lehengas",
    description: "Sleek silhouettes, monochromatic tones, and subtle embellishments.",
    imageUrl: "/images/editorial/vendor_makeup.png",
    slug: "modern-minimalist-lehengas",
    category: "bridal-fashion",
  },
  {
    id: "bf-2",
    title: "Heritage Weaves",
    description: "Traditional silk sarees showcasing rich cultural craftsmanship.",
    imageUrl: "/images/editorial/insp_jewelry.png",
    slug: "heritage-weaves",
    category: "bridal-fashion",
  }
];

export const groomFashion: InspirationItem[] = [
  {
    id: "gf-1",
    title: "Contemporary Sherwanis",
    description: "Pastel shades, asymmetrical cuts, and textured fabrics for the modern groom.",
    imageUrl: "/images/editorial/venue_3.png",
    slug: "contemporary-sherwanis",
    category: "groom-fashion",
  },
  {
    id: "gf-2",
    title: "Classic Tuxedos",
    description: "Timeless black-tie elegance for a sophisticated evening reception.",
    imageUrl: "/images/editorial/venue_4.png",
    slug: "classic-tuxedos",
    category: "groom-fashion",
  }
];

export const weddingTrends: InspirationItem[] = [
  {
    id: "wt-1",
    title: "Micro Weddings",
    description: "Intimate celebrations focusing on high-quality experiences for fewer guests.",
    imageUrl: "/images/editorial/venue_1.png",
    slug: "micro-weddings",
    category: "wedding-trends",
  },
  {
    id: "wt-2",
    title: "Weekend Buyouts",
    description: "Taking over a resort for a multi-day immersive wedding festival.",
    imageUrl: "/images/editorial/royal_wedding.png",
    slug: "weekend-buyouts",
    category: "wedding-trends",
  }
];

export const editorsPicks: InspirationItem[] = [
  {
    id: "ep-1",
    title: "The Ultimate Bridal Trousseau",
    description: "Our curated selection of must-have pieces for the modern bride.",
    imageUrl: "/images/editorial/insp_jewelry.png",
    slug: "ultimate-bridal-trousseau",
    category: "editors-picks",
  },
  {
    id: "ep-2",
    title: "Top 10 Emerging Venues",
    description: "Discover the newest luxury properties before everyone else does.",
    imageUrl: "/images/editorial/hero_venue.png",
    slug: "top-10-emerging-venues",
    category: "editors-picks",
  }
];
