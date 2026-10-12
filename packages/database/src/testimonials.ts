export interface Testimonial {
  id: string;
  coupleNames: string;
  quote: string;
  imageUrl: string;
  starsCount: number;
  location?: string;
  date?: string;
}

export const reviewsList: Testimonial[] = [
  {
    id: "te1",
    coupleNames: "Priya & Rohit",
    quote: "YouMarriageWeArrange transformed our planning process. Ananya personally coordinated with Taj Falaknuma and locked in three detailed venue quotes in 48 hours. We focused entirely on the celebration.",
    imageUrl: "/images/editorial/insp_photography.png",
    starsCount: 5,
    location: "Taj Falaknuma Palace, Hyderabad",
    date: "Nov 2025"
  },
  {
    id: "te2",
    coupleNames: "Anjali & Karan",
    quote: "Having a dedicated concierge handle all the negotiations and quotation comparisons saved us weeks of phone tag. The Spotify-wrapped style comparison sheet made our choice so obvious.",
    imageUrl: "/images/editorial/vendor_makeup.png",
    starsCount: 5,
    location: "Fort Grand, Hyderabad",
    date: "Dec 2025"
  },
  {
    id: "te3",
    coupleNames: "Neha & Vikram",
    quote: "We loved that the team focuses exclusively on Hyderabad. They knew the layout of Chowmahalla Palace inside out and matched us with local decorators and mehendi artists that fitted our budget perfectly.",
    imageUrl: "/images/editorial/insp_groom.png",
    starsCount: 5,
    location: "Chowmahalla Palace, Hyderabad",
    date: "Jan 2026"
  }
];
