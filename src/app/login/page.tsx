import React from "react";
import LoginClient from "./LoginClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | YouMarriage",
  description: "Sign in or create an account to start planning your perfect wedding with YouMarriage.",
};

export default function AuthenticationPage() {
  return <LoginClient />;
}
