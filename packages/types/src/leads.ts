export interface ConciergeLead {
  id: string;
  leadNumber: string;
  customerName: string;
  phone: string;
  email: string;
  weddingDate: string;
  guestCount: number;
  budgetRange: string;
  status: "New" | "Contacted" | "In Negotiation" | "Site Visit Done" | "Booked" | "Lost";
  preferredAreas: string[];
  assignedConcierge: string;
  createdAt: string;
  updatedAt: string;
  notes?: string[];
}
