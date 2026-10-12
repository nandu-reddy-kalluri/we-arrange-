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
  type: "Banquet" | "Resort" | "Farmhouse" | "Hotel" | "Palace" | "Convention" | "Destination";
  space: "Indoor" | "Outdoor" | "Poolside" | "Rooftop" | "Garden";
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

export const featuredVenues: Venue[] = [
  {
    "id": "real_322294",
    "name": "Cyber Gardens Convention Centre",
    "location": "Cyber Gardens Convention Centre",
    "city": "Hyderabad",
    "capacityRange": "100 - 700 Guests",
    "maxCapacity": 700,
    "priceOnwards": "₹ 1,000 per plate",
    "pricePerPlate": 1000,
    "rating": 5,
    "imageUrl": "https://image.wedmegood.com/resized/800X/uploads/member/25515947/1738996801_ASH09457.JPG",
    "gallery": [
      "https://image.wedmegood.com/resized/800X/uploads/member/25515947/1738996801_ASH09457.JPG"
    ],
    "type": "Banquet",
    "space": "Outdoor",
    "slug": "cyber-gardens-convention-centre",
    "isVerified": true,
    "isPopular": true,
    "isPremium": true,
    "savedCount": 139,
    "reviewCount": 1,
    "amenities": [
      "Valet Parking",
      "Air Conditioning"
    ],
    "policies": {
      "outsideCatering": false,
      "outsideDecor": true,
      "alcohol": false,
      "dj": true,
      "petFriendly": false
    },
    "rooms": 2,
    "parking": 100,
    "moodTags": [
      "Premium",
      "Banquet"
    ],
    "venueHighlights": [
      "✔ Inhouse catering only",
      "✔ Outside decorators permitted",
      "✔ 2 Rooms Available",
      "✔ Banquet Hall & Lawn"
    ],
    "editorTag": "Trending This Week"
  },
  {
    "id": "real_67416",
    "name": "Button Eyes Resort",
    "location": "Moinabad",
    "city": "Hyderabad",
    "capacityRange": "100 - 150 Guests",
    "maxCapacity": 150,
    "priceOnwards": "Price on Request",
    "rating": 5,
    "imageUrl": "https://image.wedmegood.com/resized/800X/uploads/member/722152/1569652824_Screenshot_from_2019_09_28_12_10_24.png",
    "gallery": [
      "https://image.wedmegood.com/resized/800X/uploads/member/722152/1569652824_Screenshot_from_2019_09_28_12_10_24.png"
    ],
    "type": "Banquet",
    "space": "Poolside",
    "slug": "button-eyes-resort",
    "isVerified": true,
    "isPopular": true,
    "isPremium": false,
    "savedCount": 503,
    "reviewCount": 1,
    "amenities": [
      "Valet Parking",
      "Air Conditioning"
    ],
    "policies": {
      "outsideCatering": true,
      "outsideDecor": true,
      "alcohol": false,
      "dj": true,
      "petFriendly": false
    },
    "rooms": 10,
    "parking": 100,
    "moodTags": [
      "Premium",
      "Banquet"
    ],
    "venueHighlights": [
      "✔ Outside caterering only",
      "✔ Outside decorators permitted",
      "✔ 10 Rooms Available",
      "✔ Banquet Hall & Lawn"
    ]
  },
  {
    "id": "real_96668",
    "name": "Sri Sagi Ramakrishnam Raju Community Hall",
    "location": "Jubilee Hills",
    "city": "Hyderabad",
    "capacityRange": "350 - 500 Guests",
    "maxCapacity": 500,
    "priceOnwards": "₹ 300 per plate",
    "pricePerPlate": 300,
    "rating": 5,
    "imageUrl": "https://image.wedmegood.com/resized/800X/uploads/member/999735/1579763656_dppppioi.png",
    "gallery": [
      "https://image.wedmegood.com/resized/800X/uploads/member/999735/1579763656_dppppioi.png"
    ],
    "type": "Banquet",
    "space": "Indoor",
    "slug": "sri-sagi-ramakrishnam-raju-community-hall",
    "isVerified": true,
    "isPopular": true,
    "isPremium": true,
    "savedCount": 199,
    "reviewCount": 1,
    "amenities": [
      "Valet Parking",
      "Air Conditioning"
    ],
    "policies": {
      "outsideCatering": true,
      "outsideDecor": true,
      "alcohol": false,
      "dj": true,
      "petFriendly": false
    },
    "rooms": 0,
    "parking": 100,
    "moodTags": [
      "Premium",
      "Banquet"
    ],
    "venueHighlights": [
      "✔ Inhouse & outside catering allowed",
      "✔ Outside decorators permitted",
      "✔ Banquet Hall"
    ]
  },
  {
    "id": "real_126926",
    "name": "Laxmi Garden Function Hall",
    "location": "Nagarjuna Sagar Rd",
    "city": "Hyderabad",
    "capacityRange": "1000 - 1500 Guests",
    "maxCapacity": 1500,
    "priceOnwards": "Price on Request",
    "rating": 5,
    "imageUrl": "https://image.wedmegood.com/resized/800X/uploads/member/1251313/1590473692_Screenshot_from_2020_05_26_11_35_18.png",
    "gallery": [
      "https://image.wedmegood.com/resized/800X/uploads/member/1251313/1590473692_Screenshot_from_2020_05_26_11_35_18.png"
    ],
    "type": "Banquet",
    "space": "Outdoor",
    "slug": "laxmi-garden-function-hall",
    "isVerified": true,
    "isPopular": false,
    "isPremium": false,
    "savedCount": 296,
    "reviewCount": 1,
    "amenities": [
      "Valet Parking",
      "Air Conditioning"
    ],
    "policies": {
      "outsideCatering": true,
      "outsideDecor": true,
      "alcohol": false,
      "dj": true,
      "petFriendly": false
    },
    "rooms": 0,
    "parking": 100,
    "moodTags": [
      "Premium",
      "Banquet"
    ],
    "venueHighlights": [
      "✔ Inhouse & outside catering allowed",
      "✔ Outside decorators permitted",
      "✔ Banquet Hall & Lawn"
    ]
  },
  {
    "id": "real_280842",
    "name": "AJ House",
    "location": "Vijaya laxmi cricket ground",
    "city": "Hyderabad",
    "capacityRange": "400 - 600 Guests",
    "maxCapacity": 600,
    "priceOnwards": "₹ 2,50,000 per function",
    "pricePerPlate": 250000,
    "rating": 5,
    "imageUrl": "https://image.wedmegood.com/resized/800X/uploads/member/24234386/1709289817_RED07254_Edit__1_.jpg",
    "gallery": [
      "https://image.wedmegood.com/resized/800X/uploads/member/24234386/1709289817_RED07254_Edit__1_.jpg"
    ],
    "type": "Banquet",
    "space": "Outdoor",
    "slug": "aj-house",
    "isVerified": true,
    "isPopular": false,
    "isPremium": true,
    "savedCount": 145,
    "reviewCount": 1,
    "amenities": [
      "Valet Parking",
      "Air Conditioning"
    ],
    "policies": {
      "outsideCatering": true,
      "outsideDecor": true,
      "alcohol": false,
      "dj": true,
      "petFriendly": false
    },
    "rooms": 10,
    "parking": 100,
    "moodTags": [
      "Premium",
      "Banquet"
    ],
    "venueHighlights": [
      "✔ Inhouse & outside catering allowed",
      "✔ Outside decorators permitted",
      "✔ 10 Rooms Available",
      "✔ Wedding Lawn"
    ]
  },
  {
    "id": "real_307991",
    "name": "VRC Convention",
    "location": "ORR",
    "city": "Hyderabad",
    "capacityRange": "150 - 3000 Guests",
    "maxCapacity": 3000,
    "priceOnwards": "₹ 2,000 Onwards",
    "pricePerPlate": 2000,
    "rating": 5,
    "imageUrl": "https://image.wedmegood.com/resized/800X/uploads/member/25021247/1723616799_Screenshot_2024_08_14_115415.png",
    "gallery": [
      "https://image.wedmegood.com/resized/800X/uploads/member/25021247/1723616799_Screenshot_2024_08_14_115415.png"
    ],
    "type": "Convention",
    "space": "Indoor",
    "slug": "vrc-convention",
    "isVerified": true,
    "isPopular": false,
    "isPremium": false,
    "savedCount": 175,
    "reviewCount": 5,
    "amenities": [
      "Valet Parking",
      "Air Conditioning"
    ],
    "policies": {
      "outsideCatering": true,
      "outsideDecor": false,
      "alcohol": false,
      "dj": true,
      "petFriendly": false
    },
    "rooms": 16,
    "parking": 100,
    "moodTags": [
      "Premium",
      "Convention"
    ],
    "venueHighlights": [
      "✔ Outside caterering only",
      "✔ Inhouse decor",
      "✔ 16 Rooms Available",
      "✔ Convention Hall"
    ]
  },
  {
    "id": "real_278003",
    "name": "Hotel Dhruv Elite and Banquets",
    "location": "Shivam Road",
    "city": "Hyderabad",
    "capacityRange": "120 - 360 Guests",
    "maxCapacity": 360,
    "priceOnwards": "₹ 630 Onwards",
    "pricePerPlate": 630,
    "rating": 4.5,
    "imageUrl": "https://image.wedmegood.com/resized/800X/uploads/member/4686688/1702623643_Dhruv_Diwali.png",
    "gallery": [
      "https://image.wedmegood.com/resized/800X/uploads/member/4686688/1702623643_Dhruv_Diwali.png"
    ],
    "type": "Banquet",
    "space": "Indoor",
    "slug": "hotel-dhruv-elite-and-banquets",
    "isVerified": true,
    "isPopular": false,
    "isPremium": true,
    "savedCount": 580,
    "reviewCount": 1,
    "amenities": [
      "Valet Parking",
      "Air Conditioning"
    ],
    "policies": {
      "outsideCatering": false,
      "outsideDecor": false,
      "alcohol": false,
      "dj": true,
      "petFriendly": false
    },
    "rooms": 27,
    "parking": 100,
    "moodTags": [
      "Premium",
      "Banquet"
    ],
    "venueHighlights": [
      "✔ Inhouse catering only",
      "✔ Decorators from panel only",
      "✔ 27 Rooms Available",
      "✔ Banquet Hall"
    ]
  },
  {
    "id": "real_66591",
    "name": "Nera Regency",
    "location": "Madhapur",
    "city": "Hyderabad",
    "capacityRange": "200 - 300 Guests",
    "maxCapacity": 300,
    "priceOnwards": "₹ 450 Onwards",
    "pricePerPlate": 450,
    "rating": 5,
    "imageUrl": "https://image.wedmegood.com/resized/800X/uploads/member/713943/1575285797_e4f6dd34_0779_419d_aeee_ccec4b515c91.jpg",
    "gallery": [
      "https://image.wedmegood.com/resized/800X/uploads/member/713943/1575285797_e4f6dd34_0779_419d_aeee_ccec4b515c91.jpg"
    ],
    "type": "Hotel",
    "space": "Indoor",
    "slug": "nera-regency",
    "isVerified": true,
    "isPopular": false,
    "isPremium": false,
    "savedCount": 196,
    "reviewCount": 1,
    "amenities": [
      "Valet Parking",
      "Air Conditioning"
    ],
    "policies": {
      "outsideCatering": false,
      "outsideDecor": true,
      "alcohol": false,
      "dj": true,
      "petFriendly": false
    },
    "rooms": 36,
    "parking": 100,
    "moodTags": [
      "Premium",
      "Hotel"
    ],
    "venueHighlights": [
      "✔ Inhouse catering only",
      "✔ Outside decorators permitted",
      "✔ 36 Rooms Available",
      "✔ Hotel"
    ]
  },
  {
    "id": "real_72310",
    "name": "Vasavi Kalyana Mandapam",
    "location": "MG Road",
    "city": "Hyderabad",
    "capacityRange": "800 - 1200 Guests",
    "maxCapacity": 1200,
    "priceOnwards": "Price on Request",
    "rating": 5,
    "imageUrl": "https://image.wedmegood.com/resized/800X/uploads/member/765681/1570778289_Screenshot_from_2019_10_11_12_45_57.png",
    "gallery": [
      "https://image.wedmegood.com/resized/800X/uploads/member/765681/1570778289_Screenshot_from_2019_10_11_12_45_57.png"
    ],
    "type": "Banquet",
    "space": "Indoor",
    "slug": "vasavi-kalyana-mandapam",
    "isVerified": true,
    "isPopular": false,
    "isPremium": true,
    "savedCount": 247,
    "reviewCount": 1,
    "amenities": [
      "Valet Parking",
      "Air Conditioning"
    ],
    "policies": {
      "outsideCatering": true,
      "outsideDecor": true,
      "alcohol": false,
      "dj": true,
      "petFriendly": false
    },
    "rooms": 0,
    "parking": 100,
    "moodTags": [
      "Premium",
      "Banquet"
    ],
    "venueHighlights": [
      "✔ Outside caterering only",
      "✔ Outside decorators permitted",
      "✔ Kalyana Mandapam"
    ]
  },
  {
    "id": "real_114072",
    "name": "Sitara Paradise Ameerpet",
    "location": "Punjagutta",
    "city": "Hyderabad",
    "capacityRange": "100 - 300 Guests",
    "maxCapacity": 300,
    "priceOnwards": "₹ 300 Onwards",
    "pricePerPlate": 300,
    "rating": 5,
    "imageUrl": "https://image.wedmegood.com/resized/800X/uploads/member/1153705/1645471269_39072079.jpg",
    "gallery": [
      "https://image.wedmegood.com/resized/800X/uploads/member/1153705/1645471269_39072079.jpg"
    ],
    "type": "Hotel",
    "space": "Indoor",
    "slug": "sitara-paradise-ameerpet",
    "isVerified": true,
    "isPopular": false,
    "isPremium": false,
    "savedCount": 292,
    "reviewCount": 1,
    "amenities": [
      "Valet Parking",
      "Air Conditioning"
    ],
    "policies": {
      "outsideCatering": false,
      "outsideDecor": true,
      "alcohol": false,
      "dj": true,
      "petFriendly": false
    },
    "rooms": 30,
    "parking": 100,
    "moodTags": [
      "Premium",
      "Hotel"
    ],
    "venueHighlights": [
      "✔ Panel caterers allowed",
      "✔ Outside decorators permitted",
      "✔ 30 Rooms Available",
      "✔ Hotel"
    ]
  },
  {
    "id": "real_254446",
    "name": "The Indian Trip",
    "location": "KPHB",
    "city": "Hyderabad",
    "capacityRange": "2 - 800 Guests",
    "maxCapacity": 800,
    "priceOnwards": "₹ 250 Onwards",
    "pricePerPlate": 250,
    "rating": 5,
    "imageUrl": "https://image.wedmegood.com/resized/800X/uploads/member/4019914/1675767376_Screenshot_775.png",
    "gallery": [
      "https://image.wedmegood.com/resized/800X/uploads/member/4019914/1675767376_Screenshot_775.png"
    ],
    "type": "Hotel",
    "space": "Outdoor",
    "slug": "the-indian-trip",
    "isVerified": true,
    "isPopular": false,
    "isPremium": true,
    "savedCount": 590,
    "reviewCount": 2,
    "amenities": [
      "Valet Parking",
      "Air Conditioning"
    ],
    "policies": {
      "outsideCatering": false,
      "outsideDecor": true,
      "alcohol": false,
      "dj": true,
      "petFriendly": false
    },
    "rooms": 32,
    "parking": 100,
    "moodTags": [
      "Premium",
      "Hotel"
    ],
    "venueHighlights": [
      "✔ Inhouse catering only",
      "✔ Outside decorators permitted",
      "✔ 32 Rooms Available",
      "✔ Hotel"
    ]
  }
];
