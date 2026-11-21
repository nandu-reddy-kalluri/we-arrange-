import React from "react";
import { AuthProvider } from "@we-arrange/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
