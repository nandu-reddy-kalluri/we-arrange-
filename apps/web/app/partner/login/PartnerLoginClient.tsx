"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar/index";
import { apiClient } from "@we-arrange/api-client";
import { supabase } from "@/services/supabase/client";

type VendorAuthMode = "login" | "register";

const VENDOR_CATEGORIES = [
  { slug: "photographers", label: "Photographers & Cinema" },
  { slug: "bridal-makeup", label: "Bridal Makeup & Hair" },
  { slug: "decorators", label: "Decorators & Floral Stylists" },
  { slug: "catering", label: "Luxury Catering" },
  { slug: "mehendi", label: "Mehendi Artists" },
  { slug: "venues", label: "Wedding Venues & Palaces" },
  { slug: "invitations", label: "E-Invites & Stationery" },
  { slug: "music-entertainment", label: "Music, DJ & Entertainment" },
];

function PartnerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode: VendorAuthMode =
    searchParams.get("mode") === "register" ? "register" : "login";
  const [vendorMode, setVendorMode] = useState<VendorAuthMode>(initialMode);

  // Vendor Form Fields
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorPassword, setVendorPassword] = useState("");
  const [showVendorPassword, setShowVendorPassword] = useState(false);

  // Vendor Register Fields
  const [regFullName, setRegFullName] = useState("");
  const [regBusinessName, setRegBusinessName] = useState("");
  const [regCategory, setRegCategory] = useState("photographers");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    searchParams.get("error") === "unauthorized_role"
      ? "Access denied. A verified vendor account is required to access the Vendor Portal."
      : null
  );
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const errParam = searchParams.get("error");
    if (errParam === "unauthorized_role") {
      setError("Access denied. A verified vendor account is required to access the Vendor Portal.");
    } else {
      setError(null);
    }
    setSuccess(null);
  }, [vendorMode, searchParams]);

  // Handle Vendor Login
  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = vendorEmail.trim().toLowerCase();
    const res = await apiClient.post("/api/vendor/auth/login", {
      email,
      password: vendorPassword,
      portal: "vendor",
    });

    if (!res.ok) {
      setLoading(false);
      setError(res.error || "Vendor authentication failed. Please verify credentials.");
      return;
    }

    await supabase.auth
      .signInWithPassword({
        email,
        password: vendorPassword,
      })
      .catch(() => undefined);

    setLoading(false);
    router.replace("/vendor");
    router.refresh();
  };

  // Handle Vendor Register
  const handleVendorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = regEmail.trim().toLowerCase();
    const res = await apiClient.post<{ requiresEmailConfirmation?: boolean }>(
      "/api/vendor/auth/register",
      {
        accountType: "vendor",
        fullName: regFullName.trim(),
        email,
        password: regPassword,
        businessName: regBusinessName.trim(),
        categorySlug: regCategory,
        ...(regPhone.trim() ? { phone: regPhone.trim() } : {}),
      }
    );

    if (!res.ok) {
      setLoading(false);
      setError(res.error || "Vendor business registration failed.");
      return;
    }

    if (res.data?.requiresEmailConfirmation === false) {
      await apiClient
        .post("/api/vendor/auth/login", {
          email,
          password: regPassword,
          portal: "vendor",
        })
        .catch(() => undefined);

      await supabase.auth
        .signInWithPassword({
          email,
          password: regPassword,
        })
        .catch(() => undefined);

      setLoading(false);
      router.replace("/vendor");
      router.refresh();
      return;
    }

    setLoading(false);
    setSuccess("Registration submitted successfully! You may now sign in.");
    setVendorMode("login");
    setVendorEmail(email);
  };

  return (
    <div className="relative min-h-[100dvh] lg:h-[100dvh] w-full bg-[#111] font-sans overflow-x-hidden overflow-y-auto lg:overflow-hidden flex flex-col">
      {/* BACKGROUND EDITORIAL IMAGE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/editorial/consultation_hero.png"
          alt="Luxury Wedding Consultation Salon"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/50 to-black/75 z-[2]" />
      </div>

      {/* TOP NAVBAR */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* MAIN CONTENT SPLIT GRID - CENTERED VERTICALLY IN THE MIDDLE OF THE PAGE WITH GAP FROM NAVBAR */}
      <main className="relative z-10 w-full max-w-[1536px] mx-auto min-h-[calc(100dvh-72px)] lg:h-[calc(100dvh-72px)] mt-[72px] py-4 px-4 md:px-10 xl:px-14 flex flex-col lg:grid lg:grid-cols-[52%_48%] items-center justify-center gap-8 lg:gap-12">
        
        {/* LEFT HERO EDITORIAL */}
        <div className="hidden lg:flex w-full text-white justify-start">
          <div className="w-full max-w-[540px]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C6934A]/15 border border-[#C6934A]/30 text-[#C6934A] text-[11px] font-bold uppercase tracking-widest mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>We Arrange Vendor Partners</span>
            </div>

            <h1 className="text-[36px] lg:text-[44px] xl:text-[48px] font-serif font-medium leading-[1.08] mb-4">
              Empowering Wedding
              <br />
              <span className="text-[#E2B777]">Professionals</span> &amp;
              <br />
              Vendors.
            </h1>

            <p className="text-sm lg:text-[15px] text-white/80 leading-[1.6] mb-6 font-light max-w-[480px]">
              Collaborate directly with high-intent couples, manage inquiries, review verified venue
              allocations, and deliver bespoke luxury celebrations.
            </p>

            <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-[11px] font-semibold tracking-widest text-[#C6934A] uppercase">
              <span>Verified Directory</span>
              <span className="text-white/40">·</span>
              <span>Direct Lead Routing</span>
              <span className="text-white/40">·</span>
              <span>Guaranteed Bookings</span>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN / ONBOARDING CARD (SLIGHTLY TO RIGHT, VERTICALLY CENTERED) */}
        <div className="w-full flex justify-center lg:justify-end xl:justify-center relative">
          <div className="w-full max-w-[440px] bg-[#141414]/92 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
            
            {/* HEADER TEXT */}
            <div className="mb-4">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white">Vendor Portal</h2>
              <p className="text-xs text-white/60 mt-0.5">
                Manage service catalogs, client quote requests, and confirmed bookings.
              </p>
            </div>

            {/* ERROR & SUCCESS NOTICES */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* VENDOR SUB-MODE TOGGLE */}
            <div className="flex border-b border-white/10 mb-5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setVendorMode("login")}
                    className={`pb-2.5 px-3 transition-colors ${
                      vendorMode === "login"
                        ? "text-[#C6934A] border-b-2 border-[#C6934A]"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    Vendor Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setVendorMode("register")}
                    className={`pb-2.5 px-3 transition-colors ${
                      vendorMode === "register"
                        ? "text-[#C6934A] border-b-2 border-[#C6934A]"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    Register Business
                  </button>
                </div>

                {vendorMode === "login" ? (
                  <form onSubmit={handleVendorLogin} className="space-y-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/60 font-semibold mb-1.5">
                        Business or Partner Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="email"
                          required
                          value={vendorEmail}
                          onChange={(e) => setVendorEmail(e.target.value)}
                          placeholder="partner@domain.com"
                          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C6934A] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/60 font-semibold mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type={showVendorPassword ? "text" : "password"}
                          required
                          value={vendorPassword}
                          onChange={(e) => setVendorPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C6934A] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowVendorPassword(!showVendorPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        >
                          {showVendorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-[#C6934A] to-[#E2B777] text-neutral-950 text-xs font-bold uppercase tracking-widest hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Signing In...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Vendor Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVendorRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-1">
                          Owner Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C6934A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-1">
                          Business Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={regBusinessName}
                          onChange={(e) => setRegBusinessName(e.target.value)}
                          placeholder="Studio / Brand"
                          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C6934A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-1">
                        Service Category *
                      </label>
                      <select
                        value={regCategory}
                        onChange={(e) => setRegCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-[#202020] border border-white/10 text-white text-xs focus:outline-none focus:border-[#C6934A]"
                      >
                        {VENDOR_CATEGORIES.map((cat) => (
                          <option key={cat.slug} value={cat.slug}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C6934A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="name@business.com"
                          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C6934A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-1">
                        Account Password *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C6934A]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-[#C6934A] to-[#E2B777] text-neutral-950 text-xs font-bold uppercase tracking-widest hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <span>Register Wedding Business</span>
                      )}
                    </button>
                  </form>
                )}

            {/* CARD FOOTER LINKS */}
            <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-white/60">
              <span>Planning your wedding? </span>
              <Link
                href="/login"
                className="text-[#C6934A] font-semibold hover:underline inline-flex items-center gap-1"
              >
                Universal Customer Login →
              </Link>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

export default function PartnerLoginClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#111]">
          <Loader2 className="w-8 h-8 text-[#C6934A] animate-spin" />
        </div>
      }
    >
      <PartnerLoginContent />
    </Suspense>
  );
}
