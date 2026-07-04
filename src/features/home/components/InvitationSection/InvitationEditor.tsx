"use client";

import React, { useState } from "react";
import { Heart, ArrowRight } from "lucide-react";
import Image from "next/image";

export function InvitationEditor() {
  const [brideName, setBrideName] = useState("Aria");
  const [groomName, setGroomName] = useState("Rohan");
  const [eventDate, setEventDate] = useState("2026-12-12");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "December 12, 2026";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx < 0 || mIdx > 11) return dateStr;
    const dVal = parseInt(day, 10);
    return `${months[mIdx]} ${dVal}, ${year}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch max-w-5xl mx-auto text-left">
      <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-sm flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-accent-gold tracking-wider block mb-1">
              Invitation Customizer
            </span>
            <h3 className="font-serif text-xl font-bold text-neutral-charcoal">
              Type to Edit Card Live
            </h3>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bride-name" className="text-[10px] font-black text-neutral-muted uppercase tracking-widest">
              Bride's First Name
            </label>
            <input
              suppressHydrationWarning
              id="bride-name"
              type="text"
              maxLength={15}
              value={brideName}
              onChange={(e) => setBrideName(e.target.value)}
              className="w-full bg-neutral-cream border border-neutral-border rounded-xl px-4 py-3 text-xs font-semibold text-neutral-charcoal outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Enter name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="groom-name" className="text-[10px] font-black text-neutral-muted uppercase tracking-widest">
              Groom's First Name
            </label>
            <input
              suppressHydrationWarning
              id="groom-name"
              type="text"
              maxLength={15}
              value={groomName}
              onChange={(e) => setGroomName(e.target.value)}
              className="w-full bg-neutral-cream border border-neutral-border rounded-xl px-4 py-3 text-xs font-semibold text-neutral-charcoal outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Enter name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="event-date" className="text-[10px] font-black text-neutral-muted uppercase tracking-widest">
              Celebration Date
            </label>
            <div className="relative">
              <input
                suppressHydrationWarning
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-neutral-cream border border-neutral-border rounded-xl px-4 py-3 text-xs font-semibold text-neutral-charcoal outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer min-h-[48px] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-neutral-cream">
          <button
            suppressHydrationWarning
            className="w-full min-h-[48px] px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span>Customize Template</span>
            <ArrowRight className="w-4 h-4 text-accent-gold" />
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 bg-primary-light/10 border border-primary/5 rounded-3xl p-6 sm:p-8 flex items-center justify-center">
        <div className="w-64 h-[440px] bg-neutral-charcoal rounded-[2.5rem] border-[6px] border-neutral-charcoal shadow-2xl p-2 relative shrink-0">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-neutral-charcoal rounded-full z-20 flex items-center justify-center">
            <div className="w-8 h-1 bg-black/60 rounded-full" />
          </div>

          <div className="w-full h-full bg-neutral-cream rounded-[2.2rem] overflow-hidden p-4 flex flex-col justify-between border border-accent-gold/30 relative text-center">
            <div className="absolute inset-2 border border-accent-gold/20 rounded-[2rem] pointer-events-none" />

            <div className="pt-8 z-10 flex flex-col items-center">
              <span className="font-sans text-[8px] font-black uppercase text-accent-gold tracking-[0.25em] block mb-1">
                Save the Date
              </span>
              <div className="w-6 h-[0.5px] bg-accent-gold" />
            </div>

            <div className="z-10 px-2 py-4">
              <h4 className="font-serif text-2xl font-bold text-primary tracking-tight leading-none truncate px-2">
                {brideName || "Bride"}
              </h4>
              <div className="flex items-center justify-center gap-2 my-2.5">
                <div className="w-4 h-[0.5px] bg-neutral-border" />
                <Heart className="w-3.5 h-3.5 text-accent-gold fill-accent-gold/20 shrink-0" />
                <div className="w-4 h-[0.5px] bg-neutral-border" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-primary tracking-tight leading-none truncate px-2">
                {groomName || "Groom"}
              </h4>
            </div>

            <div className="w-20 h-20 rounded-full overflow-hidden border border-accent-gold/30 mx-auto z-10 my-1 relative bg-neutral-cream">
              <Image
                src="/images/editorial/insp_photography.png"
                alt="Couple Preview"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>

            <div className="pb-6 z-10">
              <span className="font-sans text-[9px] font-bold text-neutral-muted uppercase tracking-widest block mb-1">
                Join us on
              </span>
              <span className="font-serif text-xs font-extrabold text-neutral-charcoal block">
                {formatDate(eventDate)}
              </span>
              <span className="text-[7px] font-black uppercase text-accent-gold tracking-widest block mt-2">
                Hyderabad, Telangana
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
