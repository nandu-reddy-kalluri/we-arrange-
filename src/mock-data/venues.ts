export interface Venue {
  id: string;
  name: string;
  location: string;
  capacityRange: string;
  priceOnwards: string;
  rating: number;
  imageUrl: string;
  type: string;
  slug: string;
  isVerified?: boolean;
  isPopular?: boolean;
  savedCount?: number;
  reviewCount?: number;
}

export const featuredVenues: Venue[] = [
  {
    id: "v1",
    name: "Taj Falaknuma Palace",
    location: "Falaknuma, Hyderabad",
    capacityRange: "200 - 1,200 Guests",
    priceOnwards: "₹ 45,00,000 Onwards",
    rating: 4.9,
    imageUrl: "/images/editorial/venue_1.png",
    type: "Royal Palace & Heritage Hotel",
    slug: "taj-falaknuma-palace",
    isVerified: true,
    isPopular: true,
    savedCount: 890,
    reviewCount: 154
  },
  {
    id: "v2",
    name: "Chowmahalla Palace",
    location: "Khilwat, Hyderabad",
    capacityRange: "500 - 3,000 Guests",
    priceOnwards: "₹ 30,00,000 Onwards",
    rating: 4.8,
    imageUrl: "/images/editorial/venue_2.png",
    type: "Heritage Palace Grounds",
    slug: "chowmahalla-palace",
    isVerified: true,
    isPopular: true,
    savedCount: 624,
    reviewCount: 92
  },
  {
    id: "v3",
    name: "Fort Grand",
    location: "Rajendranagar, Hyderabad",
    capacityRange: "800 - 4,000 Guests",
    priceOnwards: "₹ 25,00,000 Onwards",
    rating: 4.7,
    imageUrl: "/images/editorial/venue_3.png",
    type: "Luxury Fort Resort",
    slug: "fort-grand",
    isVerified: true,
    isPopular: false,
    savedCount: 512,
    reviewCount: 118
  },
  {
    id: "v4",
    name: "ITC Kohenur",
    location: "Hitec City, Hyderabad",
    capacityRange: "150 - 800 Guests",
    priceOnwards: "₹ 18,00,000 Onwards",
    rating: 4.8,
    imageUrl: "/images/editorial/venue_4.png",
    type: "5-Star Luxury Hotel",
    slug: "itc-kohenur",
    isVerified: true,
    isPopular: false,
    savedCount: 430,
    reviewCount: 84
  }
];
