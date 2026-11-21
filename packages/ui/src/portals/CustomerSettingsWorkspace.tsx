"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "@we-arrange/api-client";
import { Bell, Eye, EyeOff, Loader2, Shield, Upload, User } from "lucide-react";
import { Skeleton } from "../Skeleton";

interface CustomerProfileDTO {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  pincode: string | null;
  about: string | null;
  profileImage: string | null;
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    whatsappNotifications?: boolean;
    preferredCity?: string | null;
    preferredBudgetRange?: string | null;
    weddingDate?: string | null;
    estimatedGuests?: number | null;
  } | null;
}

interface SignedUploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  requiredHeaders: Record<string, string>;
}

export function CustomerSettingsWorkspace() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [about, setAbout] = useState("");

  const [preferredCity, setPreferredCity] = useState("");
  const [preferredBudgetRange, setPreferredBudgetRange] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [estimatedGuests, setEstimatedGuests] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiClient.get<CustomerProfileDTO>("/api/customer/profile", {
      retryOn401: false,
    });
    if (!res.ok || !res.data) {
      setError(
        res.status === 401
          ? "Please sign in to view and edit your account settings."
          : res.error || "Failed to load profile."
      );
      setLoading(false);
      return;
    }

    const p = res.data;
    setEmail(p.email || "");
    setProfileImage(p.profileImage || null);
    setFullName(p.fullName || "");
    setPhone(p.phone || "");
    setAddress(p.address || "");
    setPincode(p.pincode || "");
    setAbout(p.about || "");

    const prefs = p.preferences ?? {};
    setPreferredCity(prefs.preferredCity || "");
    setPreferredBudgetRange(prefs.preferredBudgetRange || "");
    setWeddingDate(prefs.weddingDate || "");
    setEstimatedGuests(
      typeof prefs.estimatedGuests === "number" ? String(prefs.estimatedGuests) : ""
    );
    setEmailNotifications(prefs.emailNotifications ?? true);
    setSmsNotifications(prefs.smsNotifications ?? false);
    setWhatsappNotifications(prefs.whatsappNotifications ?? false);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const guestsNum = Number(estimatedGuests);
    const payload = {
      ...(fullName.trim().length >= 2 ? { fullName: fullName.trim() } : {}),
      ...(phone.trim().length >= 8 ? { phone: phone.trim() } : {}),
      ...(address.trim() ? { address: address.trim() } : {}),
      ...(pincode.trim().length >= 4 ? { pincode: pincode.trim() } : {}),
      ...(about.trim() ? { about: about.trim() } : {}),
      preferences: {
        emailNotifications,
        smsNotifications,
        whatsappNotifications,
        ...(preferredCity.trim() ? { preferredCity: preferredCity.trim() } : {}),
        ...(preferredBudgetRange.trim()
          ? { preferredBudgetRange: preferredBudgetRange.trim() }
          : {}),
        ...(weddingDate ? { weddingDate } : {}),
        ...(Number.isInteger(guestsNum) && guestsNum > 0
          ? { estimatedGuests: guestsNum }
          : {}),
      },
    };

    const res = await apiClient.patch<CustomerProfileDTO>("/api/customer/profile", payload);
    setSaving(false);

    if (!res.ok) {
      setError(res.error || "Failed to update profile and preferences.");
      return;
    }
    setSuccess("Profile and wedding preferences saved.");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    const signRes = await apiClient.post<SignedUploadUrlResponse>(
      "/api/customer/profile/avatar-upload-url",
      {
        fileName: file.name,
        contentType: file.type,
        fileSizeBytes: file.size,
      }
    );

    if (!signRes.ok || !signRes.data) {
      setUploadingAvatar(false);
      setError(signRes.error || "Failed to generate signed avatar upload URL.");
      return;
    }

    try {
      const putRes = await fetch(signRes.data.uploadUrl, {
        method: "PUT",
        headers: signRes.data.requiredHeaders,
        body: file,
      });
      if (!putRes.ok) {
        throw new Error(`Upload failed (${putRes.status})`);
      }
      setProfileImage(signRes.data.publicUrl);
      setSuccess("Avatar uploaded to storage.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar file.");
    }
    setUploadingAvatar(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setChangingPassword(true);
    setError(null);
    setSuccess(null);

    const res = await apiClient.post<{ updated?: boolean }>("/api/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    setChangingPassword(false);
    if (!res.ok) {
      setError(res.error || "Failed to update password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess("Password changed successfully.");
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl" aria-label="Loading account settings">
        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-3">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs rounded-xl font-medium">
          {success}
        </div>
      )}

      {/* PROFILE & PREFERENCES FORM */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-4">
          <h2 className="text-base font-serif text-[#2D2D2D] font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-[#8B263E]" />
            <span>Profile Details</span>
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#F5EEE7] overflow-hidden flex items-center justify-center text-[#8B263E] font-bold">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                (fullName || email || "U").slice(0, 1).toUpperCase()
              )}
            </div>
            <label className="px-4 py-2 rounded-full border border-[#8B263E]/30 text-xs font-semibold text-[#8B263E] hover:bg-[#F5EEE7] inline-flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingAvatar ? "Uploading..." : "Upload Avatar"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 text-sm text-[#2D2D2D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 text-sm text-[#2D2D2D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="500001"
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 text-sm text-[#2D2D2D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 text-sm text-[#2D2D2D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              About Your Celebration
            </label>
            <textarea
              rows={2}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full p-3 rounded-xl border border-neutral-200 text-sm text-[#2D2D2D]"
            />
          </div>
        </div>

        {/* WEDDING & NOTIFICATION PREFERENCES */}
        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-4">
          <h2 className="text-base font-serif text-[#2D2D2D] font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#8B263E]" />
            <span>Wedding & Notification Preferences</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Preferred City
              </label>
              <input
                type="text"
                value={preferredCity}
                onChange={(e) => setPreferredCity(e.target.value)}
                placeholder="Hyderabad"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Budget Range
              </label>
              <input
                type="text"
                value={preferredBudgetRange}
                onChange={(e) => setPreferredBudgetRange(e.target.value)}
                placeholder="₹20L - ₹35L"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Target Wedding Date
              </label>
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Estimated Guests
              </label>
              <input
                type="number"
                min={1}
                value={estimatedGuests}
                onChange={(e) => setEstimatedGuests(e.target.value)}
                placeholder="350"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-[#2D2D2D]">Email Notifications</p>
                <p className="text-xs text-neutral-500">
                  Receive quote alerts and vendor responses via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#8B263E]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-[#2D2D2D]">SMS Alerts</p>
                <p className="text-xs text-neutral-500">Site visit reminders and status alerts</p>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#8B263E]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-[#2D2D2D]">WhatsApp Concierge</p>
                <p className="text-xs text-neutral-500">Direct shortlist and booking updates</p>
              </div>
              <input
                type="checkbox"
                checked={whatsappNotifications}
                onChange={(e) => setWhatsappNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#8B263E]"
              />
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile & Preferences"}
            </button>
          </div>
        </div>
      </form>

      {/* PASSWORD CHANGE FORM */}
      <form
        onSubmit={handleChangePassword}
        className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-4"
      >
        <h2 className="text-base font-serif text-[#2D2D2D] font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#8B263E]" />
          <span>Security & Password</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="settings-current-password"
              className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                id="settings-current-password"
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full h-10 pl-3 pr-9 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-[#8B263E] cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="settings-new-password"
              className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="settings-new-password"
                type={showNewPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (8+ chars)"
                className="w-full h-10 pl-3 pr-9 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-[#8B263E] cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="settings-confirm-password"
              className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="settings-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-10 pl-3 pr-9 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-[#8B263E] cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={changingPassword}
          className="px-5 py-2 rounded-full border border-[#8B263E] text-[#8B263E] hover:bg-[#8B263E] hover:text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          {changingPassword ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
