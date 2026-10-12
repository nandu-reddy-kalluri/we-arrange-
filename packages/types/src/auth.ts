export type UserRole = "customer" | "vendor" | "admin" | "concierge";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}
