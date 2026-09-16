"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  LogOut,
  KeyRound,
  Server,
  User,
} from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();

  // Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update admin password.");
        setIsLoading(false);
        return;
      }

      setSuccess("✓ Master admin password updated successfully! Invalidating session...");
      sessionStorage.removeItem("ymwa_admin_tab_authenticated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/concierge-portal/login?reason=password_changed");
        router.refresh();
      }, 1200);
    } catch {
      setError("Network error updating password. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("ymwa_admin_tab_authenticated");
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/concierge-portal/login");
    router.refresh();
  };

  return (
    <div className="space-y-8 max-w-3xl animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E5E0D8] pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A165]">
          System Security &amp; Credentials
        </span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight mt-0.5">
          Admin Settings &amp; Security
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Manage master administrative credentials, access policies, and active sessions.
        </p>
      </div>

      {/* 1. Change Password Card */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF5ED] text-[#8B263E] flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-neutral-900">
              Admin Password Management
            </h2>
            <p className="text-xs text-neutral-400">
              Update the single master credential required to access the admin portal.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                placeholder="Enter current password..."
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  required
                  placeholder="Enter new password..."
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  required
                  placeholder="Confirm new password..."
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#8B263E] hover:bg-[#721f33] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Admin Session Overview */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF5ED] text-[#C8A165] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-neutral-900">
              Active Administrative Session
            </h2>
            <p className="text-xs text-neutral-400">
              Current authenticated session and authority parameters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E5E0D8]">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
              Account Role
            </span>
            <span className="font-bold text-neutral-900">
              Chief Concierge Administrator
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E5E0D8]">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
              Backend Connectivity
            </span>
            <span className="font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Supabase Connected</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E5E0D8]">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
              Access Scope
            </span>
            <span className="font-semibold text-neutral-800">
              Full CRUD &amp; CMS Authority
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            End administrative session on this browser
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout from Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
