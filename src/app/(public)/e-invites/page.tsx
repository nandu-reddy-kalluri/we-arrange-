"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Mail, Video, Calendar, Sparkles, ChevronRight, Trash2 } from "lucide-react";
import { EINVITE_TEMPLATES, EInviteTemplate } from "@/mock-data/e-invites";

export default function EInvitesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "wedding-card" | "video-invitation" | "save-the-date">("all");
  const [savedInvites, setSavedInvites] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Load saved invites from localStorage
    const saved = localStorage.getItem("we-arrange-invites");
    if (saved) {
      try {
        setSavedInvites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved invites", e);
      }
    }
  }, []);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const updated = savedInvites.filter((inv) => inv.id !== deleteTarget);
    setSavedInvites(updated);
    localStorage.setItem("we-arrange-invites", JSON.stringify(updated));
    setDeleteTarget(null);
  };

  const handleScrollToExplore = () => {
    document.getElementById("explore-invites-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredTemplates = EINVITE_TEMPLATES.filter(
    (tpl) => activeTab === "all" || tpl.category === activeTab
  );

  // Group templates for preview sections
  const weddingCards = EINVITE_TEMPLATES.filter((t) => t.category === "wedding-card");
  const videoInvites = EINVITE_TEMPLATES.filter((t) => t.category === "video-invitation");
  const saveTheDates = EINVITE_TEMPLATES.filter((t) => t.category === "save-the-date");

  if (!mounted) {
    return (
      <div className="w-full min-h-screen bg-[#FBF7F2] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#C5A880]/20 border-t-[#8B263E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F2] pb-24 text-neutral-charcoal">
      {/* Page Content Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">
        
        {/* Back to Wedding Studio */}
        <div className="mb-4">
          <Link
            href="/wedding-studio"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-[#8B263E] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Wedding Studio
          </Link>
        </div>

        {/* Breadcrumb / Page Header */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">
          <Link href="/" className="hover:text-[#8B263E] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-charcoal">E-Invites</span>
        </nav>

        {/* Elegant Header Section */}
        <header className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#C5A880]/30 shadow-sm mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8B263E]">
              Digital Invites & Websites
            </span>
          </div>
          <h1 className="font-serif font-light text-4xl sm:text-5xl md:text-6xl text-neutral-900 leading-tight mb-4">
            E-Invites <span className="font-semibold text-[#C5A880]">Studio</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-600 font-medium leading-relaxed">
            Create beautiful digital invitations for your special celebration. Custom RSVP tracking, instant sharing, and premium guest experiences.
          </p>
        </header>

        {/* Section 1: Your Invitations */}
        <section className="mb-20">
          <h2 className="font-serif text-2xl md:text-3xl text-neutral-900 mb-6">Your Invitations</h2>
          {savedInvites.length === 0 ? (
            <div className="bg-white border border-[#C5A880]/20 rounded-2xl p-10 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(197,168,128,0.04)] max-w-3xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#FAF5ED] border border-[#C5A880]/20 flex items-center justify-center text-3xl mb-4 text-[#8B263E]">
                💌
              </div>
              <h3 className="font-serif text-xl font-bold text-neutral-900 mb-2">No invitations yet</h3>
              <p className="text-sm text-neutral-550 max-w-sm mb-6 font-medium leading-relaxed">
                Create your first beautiful digital invitation and share your celebration with loved ones.
              </p>
              <button
                onClick={handleScrollToExplore}
                className="px-8 py-3.5 bg-[#8B263E] hover:bg-[#6e1c2f] text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg active:scale-98"
              >
                Create Invitation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedInvites.map((invite) => (
                <div key={invite.id} className="bg-white border border-[#C5A880]/25 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="p-6">
                    <span className="text-[10px] font-black uppercase text-[#C5A880] tracking-wider mb-2 block">
                      {invite.templateId.replace("-", " ")}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-neutral-900 mb-2">
                      {invite.groomName} & {invite.brideName}
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      {invite.weddingDate} at {invite.weddingVenue}
                    </p>
                    <div className="flex gap-2 items-center text-xs text-neutral-400 font-medium">
                      <span>{invite.events?.length || 0} Events Added</span>
                    </div>
                  </div>
                  <div className="p-4 bg-[#FAF7F2] border-t border-[#C5A880]/15 flex items-center justify-between">
                    <Link
                      href={`/invite/${invite.id}`}
                      className="text-xs font-bold text-[#8B263E] hover:text-[#6e1c2f] transition-colors"
                      target="_blank"
                    >
                      View Live Invite →
                    </Link>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/e-invites/create/${invite.templateId}?edit=${invite.id}`}
                        className="text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(invite.id)}
                        className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-[#8B263E] transition-colors"
                        title="Delete invitation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Explore Invitations */}
        <section id="explore-invites-section" className="scroll-mt-24 mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-neutral-900 mb-2">Explore E-Invites</h2>
              <p className="text-sm text-neutral-500 font-medium">
                Choose a design that tells your story beautifully.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { id: "all", label: "All Templates" },
                { id: "wedding-card", label: "Wedding Cards" },
                { id: "video-invitation", label: "Video Invitations" },
                { id: "save-the-date", label: "Save The Date" }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap shadow-sm border ${
                      isActive
                        ? "bg-[#8B263E] text-white border-transparent"
                        : "bg-white text-neutral-700 border-[#C5A880]/20 hover:bg-[#FAF5ED] hover:text-[#8B263E] hover:border-[#C5A880]/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {filteredTemplates.map((tpl) => (
              <Link 
                key={tpl.id}
                href={`/e-invites/template/${tpl.id}`}
                className="w-[82vw] max-w-[320px] sm:w-auto shrink-0 snap-center group bg-white rounded-2xl overflow-hidden border border-[#C5A880]/15 hover:border-[#C5A880]/40 shadow-sm hover:shadow-[0_12px_32px_rgba(139,38,62,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                {/* Preview Image Container */}
                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden w-full shrink-0">
                  <Image
                    src={tpl.imageUrl}
                    alt={tpl.name}
                    fill
                    sizes="(max-w-7xl) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {tpl.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-bold text-white tracking-wider flex items-center gap-1.5 z-10 shadow-sm">
                      <Video className="w-3 h-3 text-white" />
                      <span>{tpl.duration}</span>
                    </div>
                  )}
                  {tpl.category === "video-invitation" && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-[#8B263E] transform group-hover:scale-110 transition-transform">
                        <span className="text-xs pl-0.5">▶</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-[9px] font-black uppercase text-[#C5A880] tracking-widest block mb-1">
                      {tpl.category.replace("-", " ")}
                    </span>
                    <h3 className="font-serif text-base font-bold text-neutral-900 group-hover:text-[#8B263E] transition-colors">
                      {tpl.name}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center justify-end text-[10px] font-bold uppercase tracking-wider text-[#8B263E] group-hover:translate-x-0.5 transition-transform">
                    <span>Design Invite →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 3: Wedding Cards Quick Showcase */}
        {activeTab === "all" && (
          <section className="border-t border-[#C5A880]/15 pt-16 mb-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h3 className="font-serif text-2xl text-neutral-900 mb-1">Wedding Cards</h3>
                <p className="text-xs text-neutral-500 font-medium">Elegant designs for the beginning of your forever.</p>
              </div>
              <button
                onClick={() => setActiveTab("wedding-card")}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B263E] hover:text-[#6e1c2f] transition-all hover:translate-x-0.5"
              >
                View All Wedding Cards <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {weddingCards.slice(0, 4).map((tpl) => (
                <Link 
                  key={tpl.id}
                  href={`/e-invites/template/${tpl.id}`}
                  className="w-[82vw] max-w-[320px] sm:w-auto shrink-0 snap-center group bg-white rounded-2xl overflow-hidden border border-[#C5A880]/15 hover:border-[#C5A880]/40 shadow-sm hover:shadow-[0_12px_32px_rgba(139,38,62,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden w-full">
                    <Image
                      src={tpl.imageUrl}
                      alt={tpl.name}
                      fill
                      sizes="25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[9px] font-black uppercase text-[#C5A880] tracking-widest block mb-1">Wedding Card</span>
                    <h4 className="font-serif text-base font-bold text-neutral-900 group-hover:text-[#8B263E] transition-colors">{tpl.name}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Video Invitations Quick Showcase */}
        {activeTab === "all" && (
          <section className="border-t border-[#C5A880]/15 pt-16 mb-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h3 className="font-serif text-2xl text-neutral-900 mb-1">Video Invitations</h3>
                <p className="text-xs text-neutral-500 font-medium">Bring your celebration to life.</p>
              </div>
              <button
                onClick={() => setActiveTab("video-invitation")}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B263E] hover:text-[#6e1c2f] transition-all hover:translate-x-0.5"
              >
                View All Video Invitations <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {videoInvites.slice(0, 4).map((tpl) => (
                <Link 
                  key={tpl.id}
                  href={`/e-invites/template/${tpl.id}`}
                  className="w-[82vw] max-w-[320px] sm:w-auto shrink-0 snap-center group bg-white rounded-2xl overflow-hidden border border-[#C5A880]/15 hover:border-[#C5A880]/40 shadow-sm hover:shadow-[0_12px_32px_rgba(139,38,62,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden w-full">
                    <Image
                      src={tpl.imageUrl}
                      alt={tpl.name}
                      fill
                      sizes="25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-bold text-white tracking-wider flex items-center gap-1.5 z-10">
                      <Video className="w-3 h-3 text-white" />
                      <span>{tpl.duration}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-[#8B263E]">
                        <span className="text-xs pl-0.5">▶</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-[9px] font-black uppercase text-[#C5A880] tracking-widest block mb-1">Video Invite</span>
                    <h4 className="font-serif text-base font-bold text-neutral-900 group-hover:text-[#8B263E] transition-colors">{tpl.name}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Save The Date Showcase */}
        {activeTab === "all" && (
          <section className="border-t border-[#C5A880]/15 pt-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h3 className="font-serif text-2xl text-neutral-900 mb-1">Save The Date</h3>
                <p className="text-xs text-neutral-500 font-medium">Let your loved ones know something beautiful is coming.</p>
              </div>
              <button
                onClick={() => setActiveTab("save-the-date")}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B263E] hover:text-[#6e1c2f] transition-all hover:translate-x-0.5"
              >
                View All Save The Date <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {saveTheDates.slice(0, 4).map((tpl) => (
                <Link 
                  key={tpl.id}
                  href={`/e-invites/template/${tpl.id}`}
                  className="w-[82vw] max-w-[320px] sm:w-auto shrink-0 snap-center group bg-white rounded-2xl overflow-hidden border border-[#C5A880]/15 hover:border-[#C5A880]/40 shadow-sm hover:shadow-[0_12px_32px_rgba(139,38,62,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden w-full">
                    <Image
                      src={tpl.imageUrl}
                      alt={tpl.name}
                      fill
                      sizes="25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[9px] font-black uppercase text-[#C5A880] tracking-widest block mb-1">Save The Date</span>
                    <h4 className="font-serif text-base font-bold text-neutral-900 group-hover:text-[#8B263E] transition-colors">{tpl.name}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.15)] p-8 max-w-sm w-full mx-4 border border-[#C5A880]/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#FAF5ED] border border-[#C5A880]/25 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-5 h-5 text-[#8B263E]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-neutral-900 text-center mb-2">
              Delete Invitation?
            </h3>
            <p className="text-sm text-neutral-500 text-center leading-relaxed mb-7 font-medium">
              Are you sure you want to delete this invitation?{" "}
              <span className="text-neutral-700 font-semibold">This action cannot be undone.</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-5 py-3 rounded-full border border-[#C5A880]/30 bg-white text-xs font-bold uppercase tracking-widest text-neutral-600 hover:bg-[#FAF5ED] hover:text-neutral-900 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-5 py-3 rounded-full bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
