import type { ReactNode } from "react";

export interface CardStackItem {
  id?: string | number;
  color?: string;
  bg?: string;
  image?: string;
  title?: string;
  subtitle?: string;
  tag?: string;
  content?: ReactNode;
  slug?: string;
}

const CARD_IMG = "auto=format&fit=crop&w=400&q=75";

export const DEFAULT_CARDS: CardStackItem[] = [
  {
    id: "falaknuma",
    title: "Taj Falaknuma Palace",
    subtitle: "Engineered Luxury • Hyderabad",
    tag: "Palace Venue",
    image: `https://venue-images.youmarriagewearrange.com/taj-falaknuma-palace-492086/image-1.webp`,
    color: "#2c2018",
  },
  {
    id: "itc-kohenur",
    title: "ITC Kohenur",
    subtitle: "HITEC City • Luxury 5-Star",
    tag: "5-Star Hotel",
    image: `https://venue-images.youmarriagewearrange.com/itc-kohenur-544059/image-1.webp`,
    color: "#2a2418",
  },
  {
    id: "episode-events",
    title: "Episode Events",
    subtitle: "Bespoke Floral & Mandap Decor",
    tag: "Wedding Decorator",
    image: `https://decorator-images.youmarriagewearrange.com/episode-events-1333773/image-1.webp`,
    color: "#3a2418",
  },
  {
    id: "kunal-khade",
    title: "Kunal Khade Films",
    subtitle: "Cinematic Wedding Visuals",
    tag: "Cinematographer",
    image: `https://images.youmarriagewearrange.com/kunal-khade-films/image-1.webp`,
    color: "#1c2a24",
  },
  {
    id: "sitara-luxury",
    title: "Sitara Luxury Hotel",
    subtitle: "Ramoji Film City • Destination Venue",
    tag: "Resort Venue",
    image: `https://venue-images.youmarriagewearrange.com/ramoji-film-city-sitara-luxury-hotel-485923/image-1.webp`,
    color: "#1a2e1a",
  },
];
