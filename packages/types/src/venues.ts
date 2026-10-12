export type VenueType =
  | "Banquet"
  | "Resort"
  | "Farmhouse"
  | "Hotel"
  | "Palace"
  | "Convention"
  | "Destination";

export type VenueSpace =
  | "Indoor"
  | "Outdoor"
  | "Poolside"
  | "Rooftop"
  | "Garden";

export interface Venue {
  id: string;
  name: string;
  location: string;
  city: string;
  capacityRange: string;
  maxCapacity: number;
  priceOnwards: string;
  pricePerPlate?: number;
  rating: number;
  imageUrl: string;
  gallery: string[];
  type: VenueType;
  space: VenueSpace;
  slug: string;

  // Badges & Metrics
  isVerified: boolean;
  isPopular: boolean;
  isPremium: boolean;
  savedCount: number;
  reviewCount: number;

  // Detailed Editorial Fields
  amenities: string[];
  policies: {
    outsideCatering: boolean;
    outsideDecor: boolean;
    alcohol: boolean;
    dj: boolean;
    petFriendly: boolean;
  };
  rooms: number;
  parking: number;

  // Vibe & Experience
  moodTags: string[];
  venueHighlights: string[];
  editorTag?: string;
}
