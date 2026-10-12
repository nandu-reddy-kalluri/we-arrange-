import { InspirationSubsectionConfig, InspirationDetailItem } from "@/types/inspiration-types";
import { BRIDAL_WEAR_ITEMS } from "./subsections/bridal-wear";
import { GROOM_WEAR_ITEMS } from "./subsections/groom-wear";
import { DECOR_ITEMS } from "./subsections/decor";
import { WEDDING_THEMES_ITEMS } from "./subsections/wedding-themes";
import { COLOR_PALETTES_ITEMS } from "./subsections/color-palettes";
import { INVITATIONS_ITEMS } from "./subsections/invitations";
import { JEWELLERY_ITEMS } from "./subsections/jewellery";
import { MAKEUP_ITEMS } from "./subsections/makeup";
import { HAIRSTYLES_ITEMS } from "./subsections/hairstyles";
import { MEHENDI_ITEMS } from "./subsections/mehendi";
import { PHOTOGRAPHY_ITEMS } from "./subsections/photography";

// Configuration for all 12 subsections
export const SUBSECTION_CONFIGS: Record<string, InspirationSubsectionConfig> = {
  "bridal-wear": {
    slug: "bridal-wear",
    title: "Bridal Wear Inspiration",
    eyebrow: "ELEGANT ATTIRE • BREATHTAKING TROUSSEAU",
    description: "Discover handcrafted bridal lehengas, royal Kanjeevaram sarees, modern fusion gowns, and exquisite bridal ensembles for your big day.",
    heroImage: "/images/editorial/insp_bridal.png",
    categories: ["All", "Lehengas", "Sarees", "Gowns", "Anarkalis", "Reception Wear"],
    stats: [
      { label: "Design Collections", value: 350 },
      { label: "Top Designers", value: 45 },
      { label: "Real Brides Featured", value: 180 },
      { label: "Curated Styles", value: 500 }
    ]
  },
  "groom-wear": {
    slug: "groom-wear",
    title: "Groom Wear Inspiration",
    eyebrow: "DAPPER LOOKS • ROYAL ELEGANCE",
    description: "Explore regal sherwanis, tailored bandhgala suits, classic tuxedos, and traditional dhoti-kurta sets crafted for the discerning modern groom.",
    heroImage: "/images/editorial/insp_groom.png",
    categories: ["All", "Sherwanis", "Bandhgalas", "Tuxedos", "Indo-Western", "Kurta Sets"],
    stats: [
      { label: "Sherwani Styles", value: 220 },
      { label: "Bespoke Tailors", value: 30 },
      { label: "Accessories Featured", value: 150 },
      { label: "Lookbooks", value: 80 }
    ]
  },
  "decor": {
    slug: "decor",
    title: "Wedding Decor Inspiration",
    eyebrow: "VISUAL SPLENDOR • BESPOKE SETTINGS",
    description: "From breathtaking mandaps and grand entrance arches to magical fairy-light ceilings and tablescapes, find decor ideas that enchant.",
    heroImage: "/images/editorial/vendor_decoration.png",
    categories: ["All", "Mandap", "Stage & Backdrop", "Entrance", "Ceiling & Lighting", "Table Settings"],
    stats: [
      { label: "Decor Themes", value: 400 },
      { label: "Floral Layouts", value: 250 },
      { label: "Decorators Rated", value: 65 },
      { label: "Photo Concepts", value: 900 }
    ]
  },
  "wedding-themes": {
    slug: "wedding-themes",
    title: "Wedding Themes & Concepts",
    eyebrow: "CURATED AESTHETICS • UNFORGETTABLE VIBES",
    description: "Whether you dream of a royal palace affair, a breezy beach sanctuary, a minimal chic night, or a whimsical garden romance, define your aesthetic here.",
    heroImage: "/images/editorial/royal_wedding.png",
    categories: ["All", "Royal & Palace", "Garden & Outdoor", "Modern Minimal", "Beach & Coastal", "Traditional Heritage"],
    stats: [
      { label: "Theme Guides", value: 120 },
      { label: "Color Schemes", value: 90 },
      { label: "Venue Matches", value: 150 },
      { label: "Curated Moodboards", value: 300 }
    ]
  },
  "color-palettes": {
    slug: "color-palettes",
    title: "Wedding Color Palettes",
    eyebrow: "HARMONIOUS TONES • VISUAL IDENTITY",
    description: "Inspiring color combinations, hex swatches, and seasonal color palettes designed to elevate your wedding invitations, decor, and fashion.",
    heroImage: "/images/editorial/minimal_wedding.png",
    categories: ["All", "Pastel & Blush", "Royal Red & Gold", "Emerald & Sage", "Sunset Coral", "Monochrome Chic"],
    stats: [
      { label: "Color Combos", value: 180 },
      { label: "Curated Swatches", value: 600 },
      { label: "Seasonal Guides", value: 24 },
      { label: "Theme Pairings", value: 310 }
    ]
  },
  "invitations": {
    slug: "invitations",
    title: "Wedding Invitations & Stationery",
    eyebrow: "FIRST IMPRESSIONS • ARTFUL KEEPSAKES",
    description: "Explore boxed luxury invites, velvet acrylic cards, digital video invites, eco-friendly seed papers, and bespoke wax-sealed stationery.",
    heroImage: "/images/editorial/insp_invitation.png",
    categories: ["All", "Royal Boxed", "Digital & Video", "Acrylic & Modern", "Eco-Friendly", "Traditional Foil"],
    stats: [
      { label: "Card Designs", value: 280 },
      { label: "Stationery Artists", value: 40 },
      { label: "Video Templates", value: 95 },
      { label: "Calligraphy Styles", value: 50 }
    ]
  },
  "jewellery": {
    slug: "jewellery",
    title: "Bridal Jewellery & Ornaments",
    eyebrow: "TIMELESS HEIRLOOMS • SPARKLE & SHINE",
    description: "Unveil royal Polki chokers, temple gold sets, uncut diamond rani haars, mathapattis, and statement bangles for royal splendour.",
    heroImage: "/images/editorial/insp_jewelry.png",
    categories: ["All", "Kundhan & Polki", "Temple Gold", "Diamond & Platinum", "Maang Tikka & Nath", "Bangles & Chooda"],
    stats: [
      { label: "Heirloom Collections", value: 310 },
      { label: "Jewellers Partnered", value: 55 },
      { label: "Styling Guides", value: 140 },
      { label: "Real Brides Styled", value: 420 }
    ]
  },
  "makeup": {
    slug: "makeup",
    title: "Bridal Makeup Trends & Styles",
    eyebrow: "GLOWING RADIANCE • FLAWLESS BEAUTY",
    description: "From soft dewy glass-skin makeup to bold matte red-lip glamour and nude wedding looks, find your perfect bridal beauty aesthetic.",
    heroImage: "/images/editorial/vendor_makeup.png",
    categories: ["All", "Dewy & Glass Skin", "Classic Royal Red", "Nude Glam", "HD Airbrush", "Cocktail Smokey Eye"],
    stats: [
      { label: "Makeup Looks", value: 290 },
      { label: "Master MUAs", value: 85 },
      { label: "Skin Preparation Tips", value: 60 },
      { label: "Product Showcases", value: 210 }
    ]
  },
  "hairstyles": {
    slug: "hairstyles",
    title: "Bridal Hairstyles & Floral Braid Ideas",
    eyebrow: "CROWNING GLORY • ARTISTIC BRAIDS & BUNS",
    description: "Royal gajra braids, textured messy buns, sleek Hollywood waves, and pearl-adorned updos crafted to elevate your bridal silhouette.",
    heroImage: "/images/editorial/insp_bridal.png",
    categories: ["All", "Gajra Braids", "Messy Floral Buns", "Sleek Updos", "Hollywood Waves", "South Indian Plait"],
    stats: [
      { label: "Hairstyle Ideas", value: 240 },
      { label: "Hair Artists", value: 50 },
      { label: "Floral Accessory Trends", value: 110 },
      { label: "Step-by-Step Guides", value: 45 }
    ]
  },
  "mehendi": {
    slug: "mehendi",
    title: "Mehendi Designs & Henna Art",
    eyebrow: "SACRED SYMBOLS • INTRICATE HENNA",
    description: "Explore bridal portrait henna, traditional Marwari patterns, minimalist Arabic motifs, and lotus mandala mehendi art.",
    heroImage: "/images/editorial/vendor_makeup.png",
    categories: ["All", "Bridal Portrait", "Arabic & Minimal", "Marwari Heritage", "Mandala Palms", "Leg & Feet Henna"],
    stats: [
      { label: "Mehendi Patterns", value: 450 },
      { label: "Master Artists", value: 90 },
      { label: "Organic Henna Guides", value: 35 },
      { label: "Recent Collections", value: 200 }
    ]
  },
  "photography": {
    slug: "photography",
    title: "Photography & Cinematography",
    eyebrow: "STORIES IN MOTION • ETERNAL FRAMES",
    description: "Captivating candid photography, Vogue-style editorial portraits, drone cinematography, and emotional wedding film inspiration.",
    heroImage: "/images/editorial/vendor_photography.png",
    categories: ["All", "Candid Portraits", "Editorial & Fashion", "Pre-Wedding Shoots", "Drone Cinematography", "Vintage Film"],
    stats: [
      { label: "Photo Albums", value: 600 },
      { label: "Cinematographers", value: 75 },
      { label: "Pose Guides", value: 190 },
      { label: "Location Inspiration", value: 120 }
    ]
  }
};

// Aggregated items for remaining 11 subsections (550 items total)
export const SUBSECTION_ITEMS: InspirationDetailItem[] = [
  ...BRIDAL_WEAR_ITEMS,
  ...GROOM_WEAR_ITEMS,
  ...DECOR_ITEMS,
  ...WEDDING_THEMES_ITEMS,
  ...COLOR_PALETTES_ITEMS,
  ...INVITATIONS_ITEMS,
  ...JEWELLERY_ITEMS,
  ...MAKEUP_ITEMS,
  ...HAIRSTYLES_ITEMS,
  ...MEHENDI_ITEMS,
  ...PHOTOGRAPHY_ITEMS
];
