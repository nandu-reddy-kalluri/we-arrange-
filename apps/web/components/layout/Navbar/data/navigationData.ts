export type SubMenuItem = {
  label: string;
  href: string;
};

export type MenuSection = {
  title: string;
  items: SubMenuItem[];
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  type: "mega-menu" | "dropdown" | "link";
  sections?: MenuSection[];
  items?: SubMenuItem[];
};

export const NAVIGATION_HIERARCHY: NavItem[] = [
  {
    id: "venues",
    label: "Venues",
    href: "/venues",
    type: "mega-menu",
    sections: [
      {
        title: "Browse",
        items: [
          { label: "All Venues", href: "/venues" },
          { label: "Luxury Venues", href: "/venues/luxury" },
          { label: "Destination Venues", href: "/venues/destination" },
          { label: "Hotels", href: "/venues/hotels" },
          { label: "Resorts", href: "/venues/resorts" },
          { label: "Farmhouses", href: "/venues/farmhouses" },
          { label: "Banquet Halls", href: "/venues/banquet-halls" },
        ],
      },
      {
        title: "Curated",
        items: [
          { label: "Royal Weddings", href: "/venues/collections/royal" },
          { label: "Garden Romance", href: "/venues/collections/garden" },
          { label: "Beach Weddings", href: "/venues/collections/beach" },
          { label: "Modern Luxury", href: "/venues/collections/modern" },
          { label: "Heritage Venues", href: "/venues/collections/heritage" },
        ],
      },
    ],
  },
  {
    id: "vendors",
    label: "Vendors",
    href: "/vendors",
    type: "mega-menu",
    sections: [
      {
        title: "Photography",
        items: [
          { label: "Wedding Photographers", href: "/vendors/photography" },
        ],
      },
      {
        title: "Design & Decor",
        items: [
          { label: "Wedding Decorators", href: "/vendors/decor" },
        ],
      },
      {
        title: "Beauty & Style",
        items: [
          { label: "Bridal Makeup Artists", href: "/vendors/makeup" },
          { label: "Mehendi Artists", href: "/vendors/mehendi" },
        ],
      },
      {
        title: "Catering",
        items: [
          { label: "Wedding Catering", href: "/vendors/catering" },
        ],
      },
    ],
  },
  {
    id: "inspiration",
    label: "Inspiration",
    href: "/inspiration",
    type: "dropdown",
    items: [
      { label: "All Inspirations", href: "/inspiration" },
      { label: "Real Weddings", href: "/inspiration/real-weddings" },
      { label: "Bridal Wear", href: "/inspiration/bridal-wear" },
      { label: "Groom Wear", href: "/inspiration/groom-wear" },
      { label: "Wedding Decor", href: "/inspiration/decor" },
      { label: "Wedding Themes", href: "/inspiration/wedding-themes" },
      { label: "Color Palettes", href: "/inspiration/color-palettes" },
      { label: "Invitations", href: "/inspiration/invitations" },
      { label: "Jewellery", href: "/inspiration/jewellery" },
      { label: "Makeup Trends", href: "/inspiration/makeup" },
      { label: "Hairstyles", href: "/inspiration/hairstyles" },
      { label: "Mehendi Designs", href: "/inspiration/mehendi" },
      { label: "Photography", href: "/inspiration/photography" },
    ],
  },
  {
    id: "wedding-studio",
    label: "Wedding Studio",
    href: "/wedding-studio",
    type: "link",
  },
];
