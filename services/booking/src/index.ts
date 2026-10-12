import type { ConciergeLead } from "@we-arrange/types";

export interface BookingRequirement {
  customerName: string;
  phone: string;
  email: string;
  weddingDate: string;
  guestCount: number;
  budgetRange: string;
  preferredAreas?: string[];
}

export function createBookingLead(req: BookingRequirement): ConciergeLead {
  const id = `lead_${Date.now()}`;
  return {
    id,
    leadNumber: `YM-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: req.customerName,
    phone: req.phone,
    email: req.email,
    weddingDate: req.weddingDate,
    guestCount: req.guestCount,
    budgetRange: req.budgetRange,
    status: "New",
    preferredAreas: req.preferredAreas || ["Hyderabad"],
    assignedConcierge: "Specialist Team",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
