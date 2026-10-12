export interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string;
  city: string;
  priceStart: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  logoUrl?: string;
  slug: string;
  isVerified?: boolean;
  isPremium?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  description?: string;
  experience?: number;
  availability?: "Available" | "Booked";
  spaceType?: "Indoor" | "Outdoor" | "Both";
  tier?: "Luxury" | "Premium" | "Budget";
}

export interface VendorCategory {
  id: string;
  name: string;
  imageUrl: string;
  slug: string;
  count: number;
}
