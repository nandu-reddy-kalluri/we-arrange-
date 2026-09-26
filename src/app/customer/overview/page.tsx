"use client";

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

import { useAuth } from "@/context/AuthContext";

export default function CustomerDashboard() {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-[#8B263E]">
          Loading...
        </p>
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
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  return (
    <main className="min-h-screen bg-[#FAF9F6] pt-24">
      <div className="flex min-h-[calc(100vh-96px)]">

        {/* SIDEBAR */}

        <aside className="w-64 border-r border-[#8B263E]/10 bg-white px-6 py-10 flex flex-col">

          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-[#8B263E]">
              My Account
            </p>

            <h2 className="mt-2 text-2xl font-serif text-[#2D2D2D]">
              {userName}
            </h2>

            {user.email && (
              <p className="mt-1 text-xs text-gray-400 truncate">
                {user.email}
              </p>
            )}
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

            <p className="text-xs uppercase tracking-[0.25em] text-[#8B263E]">
              My Dashboard
            </p>

            <h1 className="mt-2 text-4xl lg:text-5xl font-serif text-[#2D2D2D]">
              Welcome back, {userName}
            </h1>

            <p className="mt-3 text-gray-500">
              Manage your wedding plans and saved discoveries.
            </p>

          </div>

          {/* MY WEDDING */}

          <div className="mb-10">

            <h2 className="text-xl font-serif text-[#2D2D2D] mb-5">
              MY WEDDING
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* VENUES */}

              <Link
                href="/venues"
                className="group bg-white rounded-2xl border border-[#8B263E]/10 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">

                  <div className="w-12 h-12 rounded-xl bg-[#F5EEE7] flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#8B263E]" />
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#8B263E] transition" />

                </div>

                <p className="mt-6 text-3xl font-serif text-[#2D2D2D]">
                  0
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Venues
                </p>

              </Link>

              {/* VENDORS */}

              <Link
                href="/vendors"
                className="group bg-white rounded-2xl border border-[#8B263E]/10 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">

                  <div className="w-12 h-12 rounded-xl bg-[#F5EEE7] flex items-center justify-center">
                    <Store className="w-6 h-6 text-[#8B263E]" />
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#8B263E] transition" />

                </div>

                <p className="mt-6 text-3xl font-serif text-[#2D2D2D]">
                  0
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Vendors
                </p>

              </Link>

              {/* INSPIRATIONS */}

              <Link
                href="/inspirations"
                className="group bg-white rounded-2xl border border-[#8B263E]/10 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">

                  <div className="w-12 h-12 rounded-xl bg-[#F5EEE7] flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-[#8B263E]" />
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#8B263E] transition" />

                </div>

                <p className="mt-6 text-3xl font-serif text-[#2D2D2D]">
                  0
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Inspirations
                </p>

              </Link>

            </div>
          </div>

          {/* RECENTLY USED */}

          <div className="mb-10">

            <h2 className="text-xl font-serif text-[#2D2D2D] mb-5">
              RECENTLY USED
            </h2>

            <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-8">

              <div className="flex flex-col items-center justify-center text-center py-8">

                <div className="w-14 h-14 rounded-full bg-[#F5EEE7] flex items-center justify-center mb-4">
                  <ImageIcon className="w-6 h-6 text-[#8B263E]" />
                </div>

                <h3 className="font-serif text-lg text-[#2D2D2D]">
                  Nothing here yet
                </h3>

                <p className="mt-2 text-sm text-gray-500 max-w-md">
                  Start exploring venues, vendors and wedding
                  inspirations. Your recent activity will appear here.
                </p>

              </div>

            </div>

          </div>

          {/* WEDDING ACTIVITY */}

          <div>

            <h2 className="text-xl font-serif text-[#2D2D2D] mb-5">
              WEDDING ACTIVITY
            </h2>

            <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-8">

              <div className="flex flex-col items-center justify-center text-center py-8">

                <div className="w-14 h-14 rounded-full bg-[#F5EEE7] flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-[#8B263E]" />
                </div>

                <h3 className="font-serif text-lg text-[#2D2D2D]">
                  Your wedding journey starts here
                </h3>

                <p className="mt-2 text-sm text-gray-500 max-w-md">
                  Save venues, explore vendors and collect
                  inspirations to build your perfect wedding plan.
                </p>

              </div>

            </div>

          </div>

        </section>
      </div>
    </main>
  );
}