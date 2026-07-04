export interface Template {
  id: string;
  name: string;
  type: "invitation" | "website";
  style: string;
  imageUrl: string;
  themeColor: string;
}

export const featuredTemplates: Template[] = [
  {
    id: "t1",
    name: "Classic Royal Gold",
    type: "invitation",
    style: "Traditional & Elegant",
    imageUrl: "/images/editorial/insp_invitation.png",
    themeColor: "#D4AF37"
  },
  {
    id: "t2",
    name: "Minimalist Linen Blush",
    type: "invitation",
    style: "Modern & Clean",
    imageUrl: "/images/editorial/digital_invitation.png",
    themeColor: "#E8C8A3"
  },
  {
    id: "t3",
    name: "Ethereal Vineyard",
    type: "website",
    style: "Rustic & Floral",
    imageUrl: "/images/editorial/venue_2.png",
    themeColor: "#808000"
  },
  {
    id: "t4",
    name: "Midnight Silk Ballroom",
    type: "website",
    style: "Luxury & Dramatic",
    imageUrl: "/images/editorial/venue_3.png",
    themeColor: "#171717"
  }
];
