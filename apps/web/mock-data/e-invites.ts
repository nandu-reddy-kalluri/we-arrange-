export interface EInviteTemplate {
  id: string;
  name: string;
  category: "wedding-card" | "video-invitation" | "save-the-date";
  imageUrl: string;
  description: string;
  features: string[];
  duration?: string; // only for videos
}

export const EINVITE_TEMPLATES: EInviteTemplate[] = [
  // 1. Wedding Cards
  {
    id: "golden-vows",
    name: "Golden Vows",
    category: "wedding-card",
    imageUrl: "https://venue-images.youmarriagewearrange.com/taj-falaknuma-palace-492086/image-1.webp",
    description: "A timeless and elegant golden invitation designed for your beautiful traditional wedding ceremony.",
    features: ["Couple Names", "Wedding Date", "Event Details", "Venue Details", "RSVP Form", "Shareable Link"]
  },
  {
    id: "royal-celebration",
    name: "Royal Celebration",
    category: "wedding-card",
    imageUrl: "https://venue-images.youmarriagewearrange.com/chowmahalla-palace-22731/image-1.webp",
    description: "Make a grand announcement with this royal heritage theme featuring rich cultural design tokens.",
    features: ["Heritage Graphics", "Couple Portrait Placeholder", "Event Schedule", "Location Map", "RSVP Form"]
  },
  {
    id: "ivory-promise",
    name: "Ivory Promise",
    category: "wedding-card",
    imageUrl: "https://images.youmarriagewearrange.com/kunal-khade-films/image-1.webp",
    description: "Soft ivory background blended with fine floral line art and modern calligraphy.",
    features: ["Clean Typography", "Event Details", "Dress Code", "RSVP", "Add to Calendar link"]
  },
  {
    id: "floral-romance",
    name: "Floral Romance",
    category: "wedding-card",
    imageUrl: "https://decorator-images.youmarriagewearrange.com/episode-events-1333773/image-1.webp",
    description: "Watercolored pastel florals frame your wedding details, evoking natural spring aesthetics.",
    features: ["Pastel Watercolor Borders", "RSVP Management", "Timeline Tracker", "Interactive Location Map"]
  },
  {
    id: "eternal-elegance",
    name: "Eternal Elegance",
    category: "wedding-card",
    imageUrl: "https://venue-images.youmarriagewearrange.com/itc-kohenur-544059/image-1.webp",
    description: "Deep luxury textures with metallic accents, designed for high-profile ballroom celebrations.",
    features: ["Cinematic Intros", "Formal Invite Text", "Multiple Events Timeline", "RSVP Manager"]
  },
  {
    id: "heritage-love",
    name: "Heritage Love",
    category: "wedding-card",
    imageUrl: "https://mehendi-images.youmarriagewearrange.com/rachna-mehndi-designs/Rachna_Mehndi_Designs_1.webp",
    description: "A template featuring traditional motifs, rich colors, and classical script formatting.",
    features: ["Traditional Motifs", "Blessings Quote Section", "Event Timelines", "RSVP Form"]
  },
  {
    id: "modern-bliss",
    name: "Modern Bliss",
    category: "wedding-card",
    imageUrl: "https://images.youmarriagewearrange.com/wedam-chronicles/image-1.webp",
    description: "Ultra-minimal layout with high-contrast luxury serif typefaces and elegant spacing.",
    features: ["Minimalist Layout", "Digital RSVP", "Direct Google Maps integration", "Social Share Card"]
  },
  {
    id: "garden-celebration",
    name: "Garden Celebration",
    category: "wedding-card",
    imageUrl: "https://decorator-images.youmarriagewearrange.com/fishi-events-entertainments-1333863/image-1.webp",
    description: "A botanical illustration frame design perfect for open-lawn weddings and garden parties.",
    features: ["Botanical Frames", "Interactive Gallery", "Event Countdown Timer", "Digital Guestbook"]
  },

  // 2. Video Invitations
  {
    id: "forever-together",
    name: "Forever Together",
    category: "video-invitation",
    imageUrl: "https://images.youmarriagewearrange.com/kunal-khade-films/image-2.webp",
    description: "An animated video invitation featuring cinematic transitions of your engagement photos.",
    features: ["Photo Slideshow", "Custom Background Music", "Animated Text", "RSVP Form Integration"],
    duration: "01:20"
  },
  {
    id: "the-beginning",
    name: "The Beginning",
    category: "video-invitation",
    imageUrl: "https://makeup-images.youmarriagewearrange.com/the-makeup-mafia/The_Makeup_Mafia_4.webp",
    description: "A modern video card capturing the romantic highlights of the couple's relationship timeline.",
    features: ["Timeline Animation", "Music Overlay", "Interactive Map Redirect", "WhatsApp Invite Card"],
    duration: "01:00"
  },
  {
    id: "royal-romance-video",
    name: "Royal Romance",
    category: "video-invitation",
    imageUrl: "https://venue-images.youmarriagewearrange.com/taj-falaknuma-palace-492086/image-2.webp",
    description: "A grand video experience featuring traditional instruments music track and animated motifs.",
    features: ["Animated Royal Motifs", "Curated Music Track", "RSVP Tracking Page", "Full Screen Video Page"],
    duration: "01:45"
  },
  {
    id: "our-love-story",
    name: "Our Love Story",
    category: "video-invitation",
    imageUrl: "https://images.youmarriagewearrange.com/wedam-chronicles/image-2.webp",
    description: "A narrative style video template highlighting the journey of Aarav & Diya from first meeting to the big day.",
    features: ["Storybook Animation", "Custom Audio Voiceover Option", "RSVP", "Gift Registry Link"],
    duration: "02:15"
  },
  {
    id: "celebration-of-love",
    name: "Celebration of Love",
    category: "video-invitation",
    imageUrl: "https://decorator-images.youmarriagewearrange.com/wah-shaadi-1331041/image-1.webp",
    description: "Warm animations framing a sacred fire/mandap graphic, setting a festive mood.",
    features: ["Animated Mandap Graphic", "Sanskrit Shloka Audio Track", "Detailed Schedule Page", "RSVP Tracker"],
    duration: "01:30"
  },
  {
    id: "timeless-promise",
    name: "Timeless Promise",
    category: "video-invitation",
    imageUrl: "https://venue-images.youmarriagewearrange.com/hyderabad-marriott-hotel-and-convention-centre-25344/image-1.webp",
    description: "A clean, modern animated video using elegant slides, rich colors, and minimalist text layouts.",
    features: ["Elegant Slider Transitions", "Minimal Text Animation", "Direct Call/Email Links", "RSVP Manager"],
    duration: "01:15"
  },

  // 3. Save The Date
  {
    id: "mark-the-date",
    name: "Mark The Date",
    category: "save-the-date",
    imageUrl: "https://catering-images.youmarriagewearrange.com/akshaya-caterers-472007/image-1.webp",
    description: "A simple, single-page Save The Date card with countdown timer to block your guests' calendars.",
    features: ["Countdown Clock", "Single-Page Layout", "Add to Google Calendar", "Shareable Link"]
  },
  {
    id: "our-forever-begins",
    name: "Our Forever Begins",
    category: "save-the-date",
    imageUrl: "https://venue-images.youmarriagewearrange.com/itc-kakatiya-hyderabad-120816/image-1.webp",
    description: "Elegant, simple typographic Save the Date featuring a calendar graphic highlight.",
    features: ["Typographic Calendar", "Add to Calendar Buttons", "Direct RSVP Shortlist", "WhatsApp Card"]
  },
  {
    id: "the-big-day",
    name: "The Big Day",
    category: "save-the-date",
    imageUrl: "https://makeup-images.youmarriagewearrange.com/makeup-by-harika/Makeup_by_Harika_1.webp",
    description: "A warm, photograph-centered card layout emphasizing the couple portrait and date.",
    features: ["Full Background Image Option", "Floating Date Text", "RSVP Page Redirect", "Social Share Card"]
  },
  {
    id: "save-our-story",
    name: "Save Our Story",
    category: "save-the-date",
    imageUrl: "https://mehendi-images.youmarriagewearrange.com/sachin-mehandi-art/Sachin_Mehandi_Art_1.webp",
    description: "A minimal, modern card featuring hand-drawn leaf accents and clean luxury lettering.",
    features: ["Botanical Accents", "Mobile-Optimized", "Add to Calendar", "Direct WhatsApp link"]
  },
  {
    id: "counting-down",
    name: "Counting Down",
    category: "save-the-date",
    imageUrl: "https://images.youmarriagewearrange.com/pixerize-photography/image-1.webp",
    description: "Features a live running digital countdown timer above clean minimalist event details.",
    features: ["Interactive Countdown Timer", "Google Maps Location", "Save to Device Option", "Instant RSVP Response"]
  },
  {
    id: "a-beautiful-beginning",
    name: "A Beautiful Beginning",
    category: "save-the-date",
    imageUrl: "https://decorator-images.youmarriagewearrange.com/episode-events-1333773/image-2.webp",
    description: "Pastel colors and beautiful garden aesthetics announcing your wedding dates.",
    features: ["Pastel Palette", "Lawn Backdrop Accent", "Add to Outlook/Google Calendar", "Guest RSVP"]
  }
];
