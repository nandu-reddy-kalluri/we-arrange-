import React from "react";
import type { Metadata } from "next";
import SavedClient from "./SavedClient";

export const metadata: Metadata = {
  title: "Saved Items | YouMarriage We Arrange",
  description: "View and manage your saved wedding venues and vendors in Hyderabad. Compare pricing, reviews, and amenities in one place.",
};

export default function SavedPage() {
  return <SavedClient />;
}
