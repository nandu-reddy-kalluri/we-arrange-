export interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string;
  priceStart: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  slug: string;
}

export interface VendorCategory {
  id: string;
  name: string;
  imageUrl: string;
  slug: string;
}

export const vendorCategories: VendorCategory[] = [
  {
    id: "c1",
    name: "Photography",
    imageUrl: "/images/editorial/vendor_photography.png",
    slug: "photography"
  },
  {
    id: "c2",
    name: "Decor",
    imageUrl: "/images/editorial/vendor_decoration.png",
    slug: "decor"
  },
  {
    id: "c3",
    name: "Catering",
    imageUrl: "/images/editorial/vendor_catering.png",
    slug: "catering"
  },
  {
    id: "c4",
    name: "Makeup",
    imageUrl: "/images/editorial/vendor_makeup.png",
    slug: "makeup"
  },
  {
    id: "c5",
    name: "Wedding Planning",
    imageUrl: "/images/editorial/vendor_planner.png",
    slug: "wedding-planning"
  },
  {
    id: "c6",
    name: "Mehendi",
    imageUrl: "/images/editorial/insp_jewelry.png",
    slug: "mehendi"
  }
];
