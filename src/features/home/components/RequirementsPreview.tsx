"use client";

import React from "react";
import { CheckCircle2, MapPin, Users, IndianRupee } from "lucide-react";

interface RequirementsPreviewProps {
  location: string;
  guests: string;
  budget: string;
  venuesCount: number;
  vendorsCount: number;
}

export default function RequirementsPreview({
  location,
  guests,
  budget,
  venuesCount,
  vendorsCount,
}: RequirementsPreviewProps) {
  const trustSignals = [
    { text: "Currently Serving Hyderabad Only", desc: "100% localized expertise" },
    { text: "Handpicked Venue Partners", desc: "Vetted for elite standards" },
    { text: "Personal Quote Collection", desc: "No automated web scraping" },
    { text: "Human Support Desk", desc: "Direct specialist interaction" },
  ];

  return (
    <section className="hidden md:block bg-neutral-cream py-12 border-b border-neutral-border relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(139,38,62,0.03),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,168,128,0.03),transparent_45%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-8">
          
          <div className="flex-1 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-sm hover:shadow-premium hover:border-accent-gold/30 transition-all duration-500 text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-sans text-[10px] font-black uppercase text-accent-gold tracking-[0.2em] block">
                  DREAM • Your Custom Search
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-cream text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Active
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-neutral-charcoal mb-6 leading-tight">
                Current Planner Requirements
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-neutral-cream border border-neutral-border">
                  <div className="w-10 h-10 rounded-xl bg-white border border-accent-gold/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-neutral-muted uppercase tracking-widest block">
                      Target Area
                    </span>
                    <span className="text-sm font-bold text-neutral-charcoal">
                      {location || "All Hyderabad Areas"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-neutral-cream border border-neutral-border">
                  <div className="w-10 h-10 rounded-xl bg-white border border-accent-gold/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-neutral-muted uppercase tracking-widest block">
                      Estimated Guests
                    </span>
                    <span className="text-sm font-bold text-neutral-charcoal">
                      {guests || "Select Guest Size"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-neutral-cream border border-neutral-border">
                  <div className="w-10 h-10 rounded-xl bg-white border border-accent-gold/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-neutral-muted uppercase tracking-widest block">
                      Projected Budget
                    </span>
                    <span className="text-sm font-bold text-neutral-charcoal">
                      {budget || "Select Budget Range"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-cream flex items-center justify-between gap-4">
              <div className="flex-1 bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
                <span className="block text-2xl font-serif font-black text-primary">
                  {venuesCount}
                </span>
                <span className="text-[9px] font-black uppercase text-primary tracking-widest mt-1 block">
                  Venues Matches
                </span>
              </div>
              <div className="flex-1 bg-accent-gold/10 border border-accent-gold/20 rounded-2xl p-4 text-center">
                <span className="block text-2xl font-serif font-black text-primary">
                  {vendorsCount}
                </span>
                <span className="text-[9px] font-black uppercase text-accent-gold tracking-widest mt-1 block">
                  Vendors Matches
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center text-left gap-6">
            <div>
              <span className="font-sans text-[10px] font-black uppercase text-accent-gold tracking-[0.25em] block mb-2">
                DREAM • Hyperlocal Concierge Model
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-charcoal leading-tight">
                Serving Hyderabad with Handpicked Precision
              </h2>
              <p className="text-sm font-medium text-neutral-muted mt-3 max-w-lg leading-relaxed">
                Unlike directories that dump automated listings, we personally contact each partner, collect fresh quotes, and negotiate custom bundles matching your specifics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
              {trustSignals.map((signal) => (
                <div key={signal.text} className="flex gap-3 items-start group">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-accent-gold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-charcoal group-hover:text-primary transition-colors duration-200">
                      {signal.text}
                    </h4>
                    <p className="text-[11px] font-semibold text-neutral-muted mt-0.5">
                      {signal.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
