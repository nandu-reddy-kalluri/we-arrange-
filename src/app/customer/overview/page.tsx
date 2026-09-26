"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Settings,
  MapPin,
  Store,
  Image as ImageIcon,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { supabase } from "@/services/supabase/client";

export default function CustomerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-[#8B263E]">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-[#2D2D2D]">
            Please login first
          </h1>

          <Link
            href="/login"
            className="inline-block mt-5 px-6 py-3 rounded-full bg-[#8B263E] text-white"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  const userName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  return (
    <main className="min-h-screen bg-[#FAF9F6] pt-24">
      <div className="flex min-h-[calc(100vh-96px)]">

        {/* LEFT SIDEBAR */}
        <aside className="w-64 border-r border-[#8B263E]/10 bg-white px-6 py-10">

          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-[#8B263E]">
              My Account
            </p>

            <h2 className="mt-2 text-2xl font-serif text-[#2D2D2D]">
              {userName}
            </h2>
          </div>

          <nav className="space-y-3">

            <Link
              href="/customer/overview"
              className="flex items-center gap-3 rounded-xl bg-[#F5EEE7] px-4 py-3 text-sm font-semibold text-[#8B263E]"
            >
              <Home className="w-5 h-5" />
              Home
            </Link>

            <Link
              href="/customer/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#555] hover:bg-[#F5EEE7] hover:text-[#8B263E] transition"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>

          </nav>

          <div className="mt-auto pt-12">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:text-[#8B263E] transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 px-8 lg:px-14 py-10">

          {/* HEADER */}
          <div className="mb-10">

            <p className="text-sm uppercase tracking-[0.2em] text-[#8B263E]">
              Your Wedding Journey
            </p>

            <h1 className="mt-2 text-4xl lg:text-5xl font-serif text-[#2D2D2D]">
              Welcome back, {userName}
            </h1>

            <p className="mt-3 text-gray-500">
              Everything you're using for your wedding, all in one place.
            </p>

          </div>

          {/* MY WEDDING */}
          <div className="rounded-3xl bg-white border border-[#8B263E]/10 shadow-sm p-8">

            <div className="flex items-center justify-between mb-8">

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8B263E]">
                  Your Journey
                </p>

                <h2 className="mt-2 text-3xl font-serif text-[#2D2D2D]">
                  My Wedding
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Your wedding planning activity.
                </p>
              </div>

            </div>

            {/* COUNTS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div className="rounded-2xl bg-[#FAF9F6] p-6">

                <div className="w-11 h-11 rounded-full bg-[#F5EEE7] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#8B263E]" />
                </div>

                <p className="mt-5 text-sm text-gray-500">
                  Venues
                </p>

                <p className="mt-1 text-3xl font-serif text-[#2D2D2D]">
                  0
                </p>

              </div>

              <div className="rounded-2xl bg-[#FAF9F6] p-6">

                <div className="w-11 h-11 rounded-full bg-[#F5EEE7] flex items-center justify-center">
                  <Store className="w-5 h-5 text-[#8B263E]" />
                </div>

                <p className="mt-5 text-sm text-gray-500">
                  Vendors
                </p>

                <p className="mt-1 text-3xl font-serif text-[#2D2D2D]">
                  0
                </p>

              </div>

              <div className="rounded-2xl bg-[#FAF9F6] p-6">

                <div className="w-11 h-11 rounded-full bg-[#F5EEE7] flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-[#8B263E]" />
                </div>

                <p className="mt-5 text-sm text-gray-500">
                  Inspirations
                </p>

                <p className="mt-1 text-3xl font-serif text-[#2D2D2D]">
                  0
                </p>

              </div>

            </div>

          </div>

          {/* RECENTLY USED */}
          <div className="mt-10">

            <div className="flex items-center justify-between mb-5">

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8B263E]">
                  Your Activity
                </p>

                <h2 className="mt-1 text-2xl font-serif text-[#2D2D2D]">
                  Recently Used
                </h2>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div className="h-48 rounded-2xl bg-white border border-[#8B263E]/10 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-7 h-7 mx-auto text-[#C5A880]" />
                  <p className="mt-3 text-sm text-gray-500">
                    No venues yet
                  </p>
                </div>
              </div>

              <div className="h-48 rounded-2xl bg-white border border-[#8B263E]/10 flex items-center justify-center">
                <div className="text-center">
                  <Store className="w-7 h-7 mx-auto text-[#C5A880]" />
                  <p className="mt-3 text-sm text-gray-500">
                    No vendors yet
                  </p>
                </div>
              </div>

              <div className="h-48 rounded-2xl bg-white border border-[#8B263E]/10 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-7 h-7 mx-auto text-[#C5A880]" />
                  <p className="mt-3 text-sm text-gray-500">
                    No inspirations yet
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* WEDDING ACTIVITY */}
          <div className="mt-10 rounded-3xl bg-white border border-[#8B263E]/10 p-8">

            <h2 className="text-2xl font-serif text-[#2D2D2D]">
              Wedding Activity
            </h2>

            <div className="mt-6 space-y-5">

              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <span className="text-sm text-gray-600">
                  Shortlisted venues
                </span>

                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <span className="text-sm text-gray-600">
                  Selected vendors
                </span>

                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Wedding inspirations
                </span>

                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}