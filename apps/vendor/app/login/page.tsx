import React from "react";
import { VendorPortalClient } from "../VendorPortalClient";

export default function VendorLoginPage() {
  return <VendorPortalClient initialAuthMode="login" />;
}
