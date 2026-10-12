export interface CustomerProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  weddingDate?: string;
  city?: string;
  notificationPreferences?: {
    email: boolean;
    sms?: boolean;
    whatsapp?: boolean;
  };
}

export interface CustomerBooking {
  id: string;
  bookingRef: string;
  serviceType: "venue" | "vendor" | "concierge";
  serviceName: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  eventDate: string;
  amount?: number;
  contactPerson?: string;
  phone?: string;
}
