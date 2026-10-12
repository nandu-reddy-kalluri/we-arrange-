"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Mail, Shield, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CustomerSettingsPage() {
  const { user } = useAuth();
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#2D2D2D] font-bold">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your profile information and notification preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs rounded-xl font-medium">
          Preferences updated successfully!
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        {/* PROFILE INFO CARD */}
        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6">
          <h2 className="text-base font-serif text-[#2D2D2D] font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#8B263E]" />
            <span>Profile Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={userName}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || "No email linked"}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-700 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* PREFERENCES CARD */}
        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6">
          <h2 className="text-base font-serif text-[#2D2D2D] font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#8B263E]" />
            <span>Notifications & Concierge Updates</span>
          </h2>

          <form onSubmit={handleSavePreferences} className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-[#2D2D2D]">Email Notifications</p>
                <p className="text-xs text-neutral-500">Receive quote alerts and vendor responses via email</p>
              </div>
              <input
                type="checkbox"
                checked={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.checked)}
                className="w-4 h-4 accent-[#8B263E]"
              />
            </label>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* SECURITY CARD */}
        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6">
          <h2 className="text-base font-serif text-[#2D2D2D] font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#8B263E]" />
            <span>Security & Password</span>
          </h2>

          <p className="text-xs text-neutral-500 mb-4">
            Need to change your password? You can request a password reset link to your registered email.
          </p>

          <Link
            href="/reset-password"
            className="inline-block px-5 py-2 rounded-full border border-[#8B263E] text-[#8B263E] hover:bg-[#8B263E] hover:text-white text-xs font-semibold transition-colors"
          >
            Reset Password
          </Link>
        </div>
      </div>
    </div>
  );
}
