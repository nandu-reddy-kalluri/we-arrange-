"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ArrowLeft, ArrowRight, Plus, Trash2, Check, Sparkles, AlertCircle } from "lucide-react";
import { EINVITE_TEMPLATES } from "@/mock-data/e-invites";

interface EventData {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
}

export default function CreateInviteClient({ templateId }: { templateId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const template = EINVITE_TEMPLATES.find((t) => t.id === templateId);

  // Steps: 1 = Details, 2 = Events, 3 = Customize, 4 = Preview
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form Fields
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingTime, setWeddingTime] = useState("");
  const [weddingVenue, setWeddingVenue] = useState("");
  const [venueAddress, setVenueAddress] = useState("");

  // Step 2: Events List
  const [events, setEvents] = useState<EventData[]>([]);
  const [newEventName, setNewEventName] = useState("Wedding");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventVenue, setNewEventVenue] = useState("");

  // Step 3: Customize
  const [accentColor, setAccentColor] = useState("#8B263E"); // default burgundy
  const [fontStyle, setFontStyle] = useState("font-serif");
  const [photoUrl, setPhotoUrl] = useState("/images/editorial/insp_bridal.png");

  // Step 4: Preview Layout Toggle
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("mobile");

  // Load existing data if editing
  useEffect(() => {
    if (editId) {
      const saved = localStorage.getItem("we-arrange-invites");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          const existing = list.find((item: any) => item.id === editId);
          if (existing) {
            setGroomName(existing.groomName || "");
            setBrideName(existing.brideName || "");
            setWeddingDate(existing.weddingDate || "");
            setWeddingTime(existing.weddingTime || "");
            setWeddingVenue(existing.weddingVenue || "");
            setVenueAddress(existing.venueAddress || "");
            setEvents(existing.events || []);
            setAccentColor(existing.accentColor || "#8B263E");
            setFontStyle(existing.fontStyle || "font-serif");
            setPhotoUrl(existing.photoUrl || "/images/editorial/insp_bridal.png");
          }
        } catch (e) {
          console.error("Failed to parse local storage for edit", e);
        }
      }
    }
  }, [editId]);

  if (!template) {
    return (
      <div className="min-h-[70vh] bg-[#FBF7F2] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="font-serif text-3xl text-neutral-900 mb-4">Template Not Found</h1>
        <p className="text-neutral-600 mb-6">The template you are looking for does not exist.</p>
        <Link href="/e-invites" className="text-[#8B263E] font-bold uppercase tracking-wider text-xs">
          Back to E-Invites
        </Link>
      </div>
    );
  }

  // --- Step navigation and validation ---
  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!groomName.trim()) errs.groomName = "Groom Name is required";
    if (!brideName.trim()) errs.brideName = "Bride Name is required";
    if (!weddingDate) errs.weddingDate = "Wedding Date is required";
    if (!weddingTime) errs.weddingTime = "Wedding Time is required";
    if (!weddingVenue.trim()) errs.weddingVenue = "Wedding Venue is required";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // --- Add Event Handler ---
  const handleAddEvent = () => {
    if (!newEventName.trim()) return;
    const item: EventData = {
      id: Math.random().toString(36).substring(2, 9),
      name: newEventName,
      date: newEventDate || weddingDate,
      time: newEventTime || weddingTime,
      venue: newEventVenue || weddingVenue
    };
    setEvents((prev) => [...prev, item]);
    // Reset inputs
    setNewEventName("Haldi");
    setNewEventTime("");
    setNewEventVenue("");
  };

  // --- Delete Event Handler ---
  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  // --- Finalize and Create Invite ---
  const handleCreateInvitation = () => {
    const invitesData = localStorage.getItem("we-arrange-invites");
    let invitesList: any[] = [];
    if (invitesData) {
      try {
        invitesList = JSON.parse(invitesData);
      } catch (e) {
        console.error(e);
      }
    }

    const newInviteId = editId || `invite-${Math.random().toString(36).substring(2, 11)}`;
    const newInvite = {
      id: newInviteId,
      templateId: template.id,
      groomName,
      brideName,
      weddingDate,
      weddingTime,
      weddingVenue,
      venueAddress,
      events,
      accentColor,
      fontStyle,
      photoUrl
    };

    if (editId) {
      // Replace existing
      invitesList = invitesList.map((item) => (item.id === editId ? newInvite : item));
    } else {
      // Add new
      invitesList.push(newInvite);
    }

    localStorage.setItem("we-arrange-invites", JSON.stringify(invitesList));
    router.push(`/invite/${newInviteId}`);
  };

  return (
    <div className="min-h-screen bg-[#FBF7F2] pb-24 text-neutral-charcoal">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">
        
        {/* Back navigation */}
        <button 
          onClick={() => {
            if (step > 1) handleBack();
            else router.push(`/e-invites/template/${templateId}`);
          }}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-[#8B263E] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {step > 1 ? "Previous Step" : `Back to ${template.name}`}
        </button>

        {/* Builder Header & Progress indicator */}
        <div className="mb-10 text-center">
          <h1 className="font-serif text-2xl md:text-3xl text-neutral-900 mb-6">Invitation Builder</h1>
          
          {/* Progress Bar */}
          <div className="max-w-xl mx-auto flex items-center justify-between relative px-2">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-[#8B263E] -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {[
              { num: 1, label: "Details" },
              { num: 2, label: "Events" },
              { num: 3, label: "Customize" },
              { num: 4, label: "Preview" }
            ].map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  step === s.num
                    ? "bg-white border-[#8B263E] text-[#8B263E] shadow-sm scale-110"
                    : step > s.num
                    ? "bg-[#8B263E] border-transparent text-white"
                    : "bg-white border-neutral-200 text-neutral-400"
                }`}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-all ${
                  step === s.num ? "text-[#8B263E]" : "text-neutral-450"
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Builder Grid (Form left, preview right in customize steps) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Area */}
          <div className={`${step === 4 ? "lg:col-span-12" : "lg:col-span-7"} bg-white rounded-3xl p-6 md:p-8 border border-[#C5A880]/15 shadow-sm`}>
            
            {/* STEP 1: DETAILS */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-serif text-xl text-neutral-900 mb-1">Wedding Details</h2>
                  <p className="text-xs text-neutral-500 font-medium">Enter the foundational details of the wedding ceremony.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-neutral-550 tracking-wider">Groom Name</label>
                    <input 
                      type="text" 
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      placeholder="e.g. Aarav"
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                        errors.groomName ? "border-red-400 focus:border-red-500" : "border-neutral-200 focus:border-[#C5A880]"
                      }`}
                    />
                    {errors.groomName && <span className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.groomName}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-neutral-550 tracking-wider">Bride Name</label>
                    <input 
                      type="text" 
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      placeholder="e.g. Diya"
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                        errors.brideName ? "border-red-400 focus:border-red-500" : "border-neutral-200 focus:border-[#C5A880]"
                      }`}
                    />
                    {errors.brideName && <span className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.brideName}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-neutral-550 tracking-wider">Wedding Date</label>
                    <input 
                      type="date" 
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                        errors.weddingDate ? "border-red-400 focus:border-red-500" : "border-neutral-200 focus:border-[#C5A880]"
                      }`}
                    />
                    {errors.weddingDate && <span className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.weddingDate}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-neutral-550 tracking-wider">Wedding Time</label>
                    <input 
                      type="time" 
                      value={weddingTime}
                      onChange={(e) => setWeddingTime(e.target.value)}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                        errors.weddingTime ? "border-red-400 focus:border-red-500" : "border-neutral-200 focus:border-[#C5A880]"
                      }`}
                    />
                    {errors.weddingTime && <span className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.weddingTime}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-neutral-550 tracking-wider">Wedding Venue</label>
                  <input 
                    type="text" 
                    value={weddingVenue}
                    onChange={(e) => setWeddingVenue(e.target.value)}
                    placeholder="e.g. Taj Falaknuma Palace"
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                      errors.weddingVenue ? "border-red-400 focus:border-red-500" : "border-neutral-200 focus:border-[#C5A880]"
                    }`}
                  />
                  {errors.weddingVenue && <span className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.weddingVenue}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-neutral-550 tracking-wider">Venue Address</label>
                  <textarea 
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="e.g. Engine Bowli, Falaknuma, Hyderabad, Telangana 500053"
                    rows={3}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: EVENTS */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-serif text-xl text-neutral-900 mb-1">Add Wedding Events</h2>
                  <p className="text-xs text-neutral-500 font-medium">Add celebratory sessions like Haldi, Mehendi, Sangeet, etc.</p>
                </div>

                {/* Quick Add presets */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 mr-1">Quick Presets:</span>
                  {["Haldi", "Mehendi", "Sangeet", "Cocktail Party", "Reception"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewEventName(preset)}
                      className="px-3 py-1 bg-[#FAF5ED] border border-[#C5A880]/30 hover:border-[#C5A880] rounded-full text-[10px] font-semibold text-neutral-750 transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {/* Event Form Inputs */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#C5A880]/15 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Event Name</label>
                      <input 
                        type="text" 
                        value={newEventName}
                        onChange={(e) => setNewEventName(e.target.value)}
                        placeholder="e.g. Mehendi"
                        className="px-3.5 py-2 rounded-xl border border-neutral-250 bg-white text-xs font-semibold focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Event Date</label>
                      <input 
                        type="date" 
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-neutral-250 bg-white text-xs font-semibold focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Event Time</label>
                      <input 
                        type="time" 
                        value={newEventTime}
                        onChange={(e) => setNewEventTime(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-neutral-250 bg-white text-xs font-semibold focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Event Venue</label>
                      <input 
                        type="text" 
                        value={newEventVenue}
                        onChange={(e) => setNewEventVenue(e.target.value)}
                        placeholder="e.g. Lawn/Hall name"
                        className="px-3.5 py-2 rounded-xl border border-neutral-250 bg-white text-xs font-semibold focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddEvent}
                    className="py-2.5 bg-[#C5A880] hover:bg-[#9E8158] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-colors mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Event to List
                  </button>
                </div>

                {/* List of current events */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Added Events ({events.length})</h3>
                  {events.length === 0 ? (
                    <span className="text-xs text-neutral-400 italic">No custom events added yet. Your primary wedding ceremony details will still be displayed on the card.</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {events.map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between p-3.5 bg-white border border-[#C5A880]/15 rounded-xl">
                          <div className="leading-tight">
                            <span className="text-xs font-bold text-neutral-900">{ev.name}</span>
                            <p className="text-[10px] text-neutral-500 mt-0.5">
                              {ev.date} at {ev.time} — {ev.venue}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="p-1.5 text-neutral-450 hover:text-red-500 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: CUSTOMIZE */}
            {step === 3 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-serif text-xl text-neutral-900 mb-1">Customize Invitation</h2>
                  <p className="text-xs text-neutral-500 font-medium">Fine-tune the presentation of your digital card.</p>
                </div>

                {/* Color swatches */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-neutral-550 tracking-wider">Accent Theme Color</label>
                  <div className="flex items-center gap-3">
                    {[
                      { hex: "#8B263E", name: "Burgundy" },
                      { hex: "#C5A880", name: "Champagne Gold" },
                      { hex: "#4A7C59", name: "Forest Green" },
                      { hex: "#1A0810", name: "Deep Blackberry" },
                      { hex: "#9E8158", name: "Bronze" }
                    ].map((sw) => (
                      <button
                        key={sw.hex}
                        type="button"
                        onClick={() => setAccentColor(sw.hex)}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                          accentColor === sw.hex ? "scale-110 border-neutral-900 ring-2 ring-[#C5A880]/40" : "border-neutral-200"
                        }`}
                        style={{ backgroundColor: sw.hex }}
                        title={sw.name}
                      >
                        {accentColor === sw.hex && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                    
                    {/* Custom input */}
                    <div className="flex items-center gap-1.5 border border-neutral-200 rounded-xl px-3 py-1.5 ml-2">
                      <input 
                        type="color" 
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-6 h-6 border-none cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="text-xs font-semibold uppercase font-mono w-16 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Font swatches */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-neutral-550 tracking-wider">Typography Accent Font</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "font-serif", name: "Classic Elegant Serif (Playfair)", preview: "Aarav & Diya" },
                      { id: "font-sans", name: "Modern Contemporary Sans (Jakarta)", preview: "Aarav & Diya" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontStyle(f.id)}
                        className={`p-4 rounded-xl text-left border flex flex-col justify-between transition-all ${
                          fontStyle === f.id ? "bg-[#FAF5ED] border-[#8B263E] shadow-sm" : "bg-white border-neutral-200"
                        }`}
                      >
                        <span className="text-[10px] text-neutral-400 font-bold block mb-2">{f.name}</span>
                        <span className={`text-xl font-medium text-neutral-900 ${f.id}`}>
                          {f.preview}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Couple Image Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-neutral-550 tracking-wider">Cover Image Portrait</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { url: "/images/editorial/insp_bridal.png", label: "Bridal Portrait" },
                      { url: "/images/editorial/insp_groom.png", label: "Groom Portrait" },
                      { url: "/images/editorial/insp_photography.png", label: "Couple Shoot" }
                    ].map((img) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => setPhotoUrl(img.url)}
                        className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                          photoUrl === img.url ? "border-[#8B263E] scale-98 shadow-md" : "border-transparent opacity-80"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={img.label}
                          fill
                          sizes="15vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-center">
                          <span className="text-[8px] font-bold text-white uppercase tracking-wider">{img.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PREVIEW */}
            {step === 4 && (
              <div className="flex flex-col gap-6 items-center">
                <div className="text-center w-full">
                  <h2 className="font-serif text-xl text-neutral-900 mb-1">Preview Your Invitation</h2>
                  <p className="text-xs text-neutral-500 font-medium mb-6">Review exactly how guests will see your invitation on mobile and desktop devices.</p>
                  
                  {/* Device Toggle */}
                  <div className="inline-flex bg-[#FAF5ED] border border-[#C5A880]/30 p-1 rounded-full mb-6">
                    <button
                      onClick={() => setPreviewDevice("mobile")}
                      className={`px-6 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        previewDevice === "mobile" ? "bg-[#8B263E] text-white" : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      Mobile View (WhatsApp)
                    </button>
                    <button
                      onClick={() => setPreviewDevice("desktop")}
                      className={`px-6 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        previewDevice === "desktop" ? "bg-[#8B263E] text-white" : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      Desktop Preview
                    </button>
                  </div>
                </div>

                {/* Immersive Scrollable Frame */}
                <div className={`w-full transition-all duration-300 flex items-center justify-center p-4 bg-neutral-100 rounded-3xl ${
                  previewDevice === "mobile" ? "max-w-md" : "max-w-4xl"
                }`}>
                  <div className={`w-full bg-[#FBF9F6] border border-neutral-250 shadow-lg rounded-2xl overflow-hidden flex flex-col relative ${
                    previewDevice === "mobile" ? "aspect-[3/5]" : "min-h-[500px]"
                  }`}>
                    {/* Splash/Envelope Cover */}
                    <div className="absolute inset-0 bg-[#FAF9F6] p-8 flex flex-col items-center justify-center text-center z-10 z-20 border border-neutral-200">
                      <div className="absolute inset-4 border border-[#C5A880]/30 rounded-lg pointer-events-none" />
                      <div className="text-4xl mb-4">💌</div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B263E] mb-2">YOU ARE INVITED</span>
                      <h2 className={`text-3xl text-neutral-900 mb-2 leading-none ${fontStyle}`}>
                        {groomName || "Groom"}
                      </h2>
                      <span className="text-neutral-400 italic mb-2">&</span>
                      <h2 className={`text-3xl text-neutral-900 mb-6 leading-none ${fontStyle}`}>
                        {brideName || "Bride"}
                      </h2>
                      <button className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white transition-all shadow" style={{ backgroundColor: accentColor }}>
                        Open Invitation
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-10 pt-6 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (step > 1) handleBack();
                  else router.push(`/e-invites/template/${templateId}`);
                }}
                className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                {step > 1 ? "← Back" : "Cancel"}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3.5 bg-[#8B263E] hover:bg-[#6e1c2f] text-white rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md active:scale-98"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateInvitation}
                  className="px-10 py-4 text-white rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-98"
                  style={{ backgroundColor: accentColor }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{editId ? "Save Invitation" : "Create Invitation"}</span>
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Mini live card component during customization steps */}
          {step < 4 && (
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">Live Invitation Preview</h3>
              <div className="bg-[#FBF9F6] border border-[#C5A880]/20 rounded-2xl overflow-hidden shadow-sm aspect-[3/4] p-6 relative flex flex-col items-center justify-center text-center">
                <div className="absolute inset-3 border border-[#C5A880]/20 rounded-lg pointer-events-none" />
                
                <div className="relative z-10">
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] mb-4 block" style={{ color: accentColor }}>
                    Together with their families
                  </span>
                  
                  <h3 className={`text-2xl text-neutral-800 leading-none mb-1 ${fontStyle}`}>
                    {groomName || "Groom Name"}
                  </h3>
                  <span className="text-neutral-400 italic text-sm mb-1 block">&</span>
                  <h3 className={`text-2xl text-neutral-800 leading-none mb-6 ${fontStyle}`}>
                    {brideName || "Bride Name"}
                  </h3>

                  <div className="h-[1px] w-10 mx-auto my-3 bg-neutral-250" />

                  <p className="text-[9px] uppercase tracking-wider text-neutral-500 mb-6">
                    Request the honor of your presence<br />
                    at their wedding ceremony
                  </p>

                  <p className="text-xs text-neutral-700 leading-relaxed mb-4">
                    {weddingDate ? new Date(weddingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Wedding Date"}
                  </p>
                  
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white px-4 py-1.5 rounded-full inline-block mt-2 shadow-sm" style={{ backgroundColor: accentColor }}>
                    {weddingVenue || "Wedding Venue"}
                  </p>
                </div>

                <div className="absolute bottom-4 left-0 right-0">
                  <span className="text-[7px] font-bold uppercase tracking-widest text-neutral-400">
                    YouMarriage E-Invites
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
