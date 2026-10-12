"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar, MapPin, Clock, Users, Heart, CheckCircle2, MessageSquare } from "lucide-react";

interface InvitePageProps {
  params: Promise<{
    inviteId: string;
  }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const unwrappedParams = React.use(params);
  const inviteId = unwrappedParams.inviteId;

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // RSVP Form state
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpAttending, setRsvpAttending] = useState("yes");
  const [rsvpGuests, setRsvpGuests] = useState("1");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Invite data state
  const [inviteData, setInviteData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Load invite data from localStorage or use premium fallback mock
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("we-arrange-invites");
    let loaded = null;
    if (saved) {
      try {
        const list = JSON.parse(saved);
        loaded = list.find((item: any) => item.id === inviteId);
      } catch (e) {
        console.error(e);
      }
    }

    if (loaded) {
      setInviteData(loaded);
    } else {
      // Premium Mock Fallback
      setInviteData({
        id: inviteId,
        groomName: "Aarav",
        brideName: "Diya",
        weddingDate: "2026-12-12",
        weddingTime: "19:00",
        weddingVenue: "Taj Falaknuma Palace",
        venueAddress: "Engine Bowli, Falaknuma, Hyderabad, Telangana 500053",
        events: [
          { id: "1", name: "Sangeet Night", date: "2026-12-10", time: "18:30", venue: "Durbar Hall, Taj Falaknuma" },
          { id: "2", name: "Mehendi & Haldi", date: "2026-12-11", time: "11:00", venue: "Poolside Lawns, Taj Falaknuma" },
          { id: "3", name: "Reception", date: "2026-12-13", time: "19:30", venue: "Grand Ballroom, Taj Falaknuma" }
        ],
        accentColor: "#8B263E",
        fontStyle: "font-serif",
        photoUrl: "/images/editorial/insp_bridal.png"
      });
    }
  }, [inviteId]);

  // Countdown timer calculator
  useEffect(() => {
    if (!inviteData) return;
    const weddingDateTime = new Date(`${inviteData.weddingDate}T${inviteData.weddingTime || "00:00"}`).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = weddingDateTime - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [inviteData]);

  if (!mounted || !inviteData) {
    return (
      <div className="w-full min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#C5A880]/20 border-t-[#8B263E] animate-spin" />
      </div>
    );
  }

  // --- SUBMIT RSVP HANDLER ---
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    setRsvpSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-neutral-charcoal relative overflow-hidden flex justify-center">
      
      {/* ─────────────────────────────────────────────────────────────────────────
          SPLASH / ENVELOPE SCREEN
          ───────────────────────────────────────────────────────────────────────── */}
      {!isOpen && (
        <div className="fixed inset-0 z-50 bg-[#FBF9F6] flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#C5A880]/20 aspect-[3/5] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="absolute inset-4 border border-[#C5A880]/30 rounded-2xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-full bg-[#FAF5ED] border border-[#C5A880]/20 flex items-center justify-center text-3xl mb-6 text-[#8B263E] animate-bounce">
              💌
            </div>
            
            <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: inviteData.accentColor }}>
              YOU ARE INVITED
            </span>
            
            <h1 className={`text-4xl text-neutral-900 leading-none mb-2 ${inviteData.fontStyle}`}>
              {inviteData.groomName}
            </h1>
            <span className="text-neutral-400 italic text-xl mb-2 block">&</span>
            <h1 className={`text-4xl text-neutral-900 leading-none mb-12 ${inviteData.fontStyle}`}>
              {inviteData.brideName}
            </h1>

            <button
              onClick={() => setIsOpen(true)}
              className="px-10 py-4 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md hover:scale-105 active:scale-98"
              style={{ backgroundColor: inviteData.accentColor }}
            >
              Open Invitation
            </button>

            <span className="absolute bottom-6 text-[8px] uppercase tracking-widest text-neutral-400 font-bold">
              Powered by YouMarriage WeArrange
            </span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          MAIN MOBILE-FIRST INVITATION PAGE
          ───────────────────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="w-full max-w-md bg-[#FAF9F6] min-h-screen shadow-2xl relative pb-20 border-x border-[#C5A880]/15 animate-fade-in">
          
          {/* Main Hero Portrait */}
          <div className="relative aspect-[3/4] w-full bg-neutral-200">
            <Image
              src={inviteData.photoUrl}
              alt="Couple Portrait"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-black/20" />
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-white drop-shadow-md">
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">Wedding Invitation</span>
            </div>
          </div>

          {/* Couple Announcement */}
          <div className="px-6 -mt-16 relative z-10 text-center">
            <div className="bg-white rounded-3xl p-6 border border-[#C5A880]/15 shadow-md flex flex-col items-center">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: inviteData.accentColor }}>
                Celebration of Love
              </span>
              <h2 className={`text-3xl text-neutral-900 leading-none mb-1 ${inviteData.fontStyle}`}>
                {inviteData.groomName}
              </h2>
              <span className="text-neutral-400 italic text-lg my-1 block">&</span>
              <h2 className={`text-3xl text-neutral-900 leading-none mb-4 ${inviteData.fontStyle}`}>
                {inviteData.brideName}
              </h2>
              <p className="text-xs text-neutral-550 max-w-xs leading-relaxed font-semibold">
                Request the pleasure of your presence to celebrate the beginning of their forever.
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="mx-6 mt-8 p-5 bg-[#FAF5ED] border border-[#C5A880]/20 rounded-2xl text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#C5A880] mb-3 block">Days Until Celebration</span>
            <div className="grid grid-cols-4 gap-2 text-neutral-900">
              {[
                { val: timeLeft.days, unit: "Days" },
                { val: timeLeft.hours, unit: "Hours" },
                { val: timeLeft.minutes, unit: "Mins" },
                { val: timeLeft.seconds, unit: "Secs" }
              ].map((c, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className={`text-xl font-bold font-mono`} style={{ color: inviteData.accentColor }}>
                    {String(c.val).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold mt-1">{c.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Ceremony details */}
          <div className="mx-6 mt-8 p-6 bg-white border border-[#C5A880]/15 rounded-2xl flex flex-col gap-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A880] border-b border-neutral-100 pb-2">Main Ceremony</h3>
            
            <div className="flex gap-4 items-start">
              <Calendar className="w-5 h-5 shrink-0 mt-0.5" style={{ color: inviteData.accentColor }} />
              <div className="leading-tight">
                <span className="text-[9px] uppercase font-bold text-neutral-400">Date</span>
                <p className="text-sm font-semibold mt-1">
                  {inviteData.weddingDate ? new Date(inviteData.weddingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ""}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: inviteData.accentColor }} />
              <div className="leading-tight">
                <span className="text-[9px] uppercase font-bold text-neutral-400">Time</span>
                <p className="text-sm font-semibold mt-1">
                  {inviteData.weddingTime ? new Date(`2000-01-01T${inviteData.weddingTime}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : ""}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: inviteData.accentColor }} />
              <div className="leading-tight">
                <span className="text-[9px] uppercase font-bold text-neutral-400">Venue</span>
                <p className="text-sm font-semibold mt-1">{inviteData.weddingVenue}</p>
                <p className="text-xs text-neutral-550 mt-1">{inviteData.venueAddress}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inviteData.weddingVenue + " " + inviteData.venueAddress)}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-3"
                  style={{ color: inviteData.accentColor }}
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Detailed Events Schedule */}
          {inviteData.events && inviteData.events.length > 0 && (
            <div className="mx-6 mt-8 p-6 bg-white border border-[#C5A880]/15 rounded-2xl flex flex-col gap-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A880] border-b border-neutral-100 pb-2">Events Schedule</h3>
              
              <div className="flex flex-col gap-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#C5A880]/20">
                {inviteData.events.map((ev: any, idx: number) => (
                  <div key={ev.id} className="flex gap-4 items-start relative z-10">
                    <div className="w-6 h-6 rounded-full border bg-white flex items-center justify-center shrink-0" style={{ borderColor: inviteData.accentColor }}>
                      <Heart className="w-3 h-3 fill-current" style={{ color: inviteData.accentColor }} />
                    </div>
                    <div className="leading-tight pt-0.5">
                      <span className="text-xs font-bold text-neutral-900">{ev.name}</span>
                      <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{ev.date} at {ev.time}</span>
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{ev.venue}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Gallery Grid */}
          <div className="mx-6 mt-8 p-6 bg-white border border-[#C5A880]/15 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A880] border-b border-neutral-100 pb-2">Gallery</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-50">
                <Image src="/images/editorial/insp_bridal.png" alt="Bridal Preview" fill className="object-cover" />
              </div>
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-50">
                <Image src="/images/editorial/insp_groom.png" alt="Groom Preview" fill className="object-cover" />
              </div>
              <div className="col-span-2 relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-50">
                <Image src="/images/editorial/insp_photography.png" alt="Couple Preview" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* RSVP Interactive Card Form */}
          <div className="mx-6 mt-8 p-6 bg-white border border-[#C5A880]/15 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A880] border-b border-neutral-100 pb-2">RSVP Status</h3>
            
            {rsvpSubmitted ? (
              <div className="text-center py-6 flex flex-col items-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-green-600 animate-pulse" />
                <h4 className="font-serif text-lg font-bold text-neutral-900">RSVP Submitted</h4>
                <p className="text-xs text-neutral-550 max-w-xs leading-relaxed">
                  Thank you! Your RSVP status has been successfully recorded. Aarav & Diya look forward to celebrating with you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-neutral-450 tracking-wider">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C5A880] bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-bold text-neutral-450 tracking-wider">Will you Attend?</label>
                    <select
                      value={rsvpAttending}
                      onChange={(e) => setRsvpAttending(e.target.value)}
                      className="px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C5A880] bg-white cursor-pointer"
                    >
                      <option value="yes">Yes, Attending</option>
                      <option value="no">No, Unable to Attend</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-bold text-neutral-450 tracking-wider">No. of Guests</label>
                    <select
                      value={rsvpGuests}
                      onChange={(e) => setRsvpGuests(e.target.value)}
                      disabled={rsvpAttending === "no"}
                      className="px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C5A880] bg-white cursor-pointer disabled:bg-neutral-100 disabled:text-neutral-400"
                    >
                      {["1", "2", "3", "4", "5+"].map((num) => (
                        <option key={num} value={num}>{num} Guest{num !== "1" ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-neutral-450 tracking-wider">Message to the Couple</label>
                  <textarea
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    placeholder="Warm wishes on your new journey..."
                    rows={3}
                    className="px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C5A880] bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-all active:scale-98 mt-2"
                  style={{ backgroundColor: inviteData.accentColor }}
                >
                  Submit RSVP
                </button>
              </form>
            )}
          </div>

          {/* Footer watermark */}
          <footer className="text-center py-10 text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-black">
            YouMarriage • WeArrange
          </footer>

        </div>
      )}

    </div>
  );
}
