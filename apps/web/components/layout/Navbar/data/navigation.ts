export type NavigationCardData = {
  id: string;
  category: string;
  heading: string;
  description: string;
  ctaText: string;
  imageSrc: string;
  href: string;
};

export const NAVIGATION_DATA: Record<string, NavigationCardData> = {
  venues: {
    id: "venues",
    category: "Luxury Venues",
    heading: "Royal Wedding Venues",
    description: "Discover handpicked palaces, luxury hotels and heritage venues personally curated by our concierge team.",
    ctaText: "Explore Curated Venues",
    imageSrc: "https://venue-images.youmarriagewearrange.com/taj-falaknuma-palace-492086/image-1.webp",
    href: "/venues"
  },
  vendors: {
    id: "vendors",
    category: "Curated Vendors",
    heading: "Trusted Professionals",
    description: "Meet photographers, decorators, makeup artists and entertainers selected for exceptional quality.",
    ctaText: "Meet Our Experts",
    imageSrc: "https://images.youmarriagewearrange.com/kunal-khade-films/image-1.webp",
    href: "/vendors"
  },
  services: {
    id: "services",
    category: "Concierge Planning",
    heading: "Personal Wedding Concierge",
    description: "From planning to execution, your dedicated concierge manages every detail with care.",
    ctaText: "See How It Works",
    imageSrc: "https://venue-images.youmarriagewearrange.com/itc-kohenur-544059/image-1.webp",
    href: "/contact"
  },
  inspiration: {
    id: "inspiration",
    category: "Moodboard",
    heading: "Wedding Inspiration",
    description: "Explore curated themes, floral styling, invitations and editorial ideas for your celebration.",
    ctaText: "View Inspiration",
    imageSrc: "/images/editorial/insp_photography.png",
    href: "/inspiration"
  }
};

// Main top-level navigation links
export const NAV_LINKS = [
  { name: "Venues", id: "venues", href: "/venues" },
  { name: "Vendors", id: "vendors", href: "/vendors" },
  { name: "Inspiration", id: "inspiration", href: "/inspiration" },
];
