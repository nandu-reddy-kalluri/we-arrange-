"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, MapPin, Users, IndianRupee, Home, Calendar, Sun, X, Check, ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";

const searchChips = [
  { id: "location", label: "Location", icon: MapPin },
  { id: "guests", label: "Guests", icon: Users },
  { id: "budget", label: "Budget", icon: IndianRupee },
  { id: "venueType", label: "Venue Type", icon: Home },
  { id: "date", label: "Date", icon: Calendar },
  { id: "space", label: "Indoor / Outdoor", icon: Sun },
];

const searchOptions: Record<string, string[]> = {
  location: ["All Hyderabad Areas", "Banjara Hills", "Jubilee Hills", "Gachibowli", "Hitech City", "Secunderabad", "Kondapur", "Madhapur"],
  guests: ["Under 200", "200-500", "500-1000", "1000+"],
  budget: ["Under ₹5L", "₹5L-₹10L", "₹10L-₹25L", "₹25L+"],
  venueType: ["All Venue Types", "Banquet Hall", "Hotel", "Resort", "Farmhouse", "Destination Wedding", "Convention Hall", "Heritage Venue", "Garden Venue"],
  date: [], 
  space: ["Any", "Indoor", "Outdoor", "Indoor + Outdoor"],
};

const mobileGuestOptions = [
  { value: "Under 200", label: "Under 200", desc: "Small celebration" },
  { value: "200-500", label: "200 – 500", desc: "Medium wedding" },
  { value: "500-1000", label: "500 – 1000", desc: "Large wedding" },
  { value: "1000+", label: "1000+", desc: "Grand celebration" }
];

const mobileBudgetOptions = [
  { value: "Under ₹5L", label: "₹ Under 5L", desc: "Simple celebrations" },
  { value: "₹5L-₹10L", label: "₹ 5L – ₹10L", desc: "Comfortable celebrations" },
  { value: "₹10L-₹25L", label: "₹ 10L – ₹25L", desc: "Premium weddings" },
  { value: "₹25L+", label: "₹ 25L+", desc: "Luxury celebrations" }
];

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function PremiumSearchAction({ onMenuClose, useDarkText = false }: { onMenuClose: () => void, useDarkText?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [mobileView, setMobileView] = useState<"main" | "location" | "guests" | "budget" | "venueType" | "date" | "space">("main");
  const [locationQuery, setLocationQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIsExpanded(false);
    setMobileView("main");
    setActiveChip(null);
    setShowAdvanced(false);
  }, [pathname]);

  React.useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isExpanded]);

  const handleOpenSearch = () => {
    onMenuClose();
    setIsExpanded(true);
  };

  const handleCloseSearch = () => {
    setIsExpanded(false);
    setMobileView("main");
    setActiveChip(null);
  };

  const handleSearch = () => {
    setIsExpanded(false);
    setMobileView("main");
    setActiveChip(null);
    const params = new URLSearchParams();
    if (selections.location && selections.location !== "All Hyderabad Areas") params.set("location", selections.location);
    if (selections.guests) params.set("guests", selections.guests);
    if (selections.budget) params.set("budget", selections.budget);
    if (selections.venueType && selections.venueType !== "All Venue Types") params.set("venueType", selections.venueType);
    if (selections.date) params.set("date", selections.date);
    if (selections.space && selections.space !== "Any") params.set("space", selections.space);
    router.push(`/venues?${params.toString()}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    }
  };

  const textClass = useDarkText ? "text-[#2D2D2D] hover:text-[#8B263E]" : "text-[#FAF9F6] drop-shadow-md hover:text-white hover:bg-white/10";
  const iconClass = useDarkText ? "text-black/40 group-hover:text-[#C5A880]" : "text-white/70 group-hover:text-white";

  const filteredLocations = searchOptions.location.filter(l => l.toLowerCase().includes(locationQuery.toLowerCase()));

  return (
    <>
      <div className="relative z-[60] flex items-center">
        <motion.button
          onClick={handleOpenSearch}
          onMouseEnter={onMenuClose}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 group hover:shadow-sm ${useDarkText ? "hover:bg-black/5" : ""} ${textClass}`}
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-300 pointer-events-none" />
          <Search className={`w-4 h-4 transition-colors duration-300 ${iconClass}`} />
          <span>Search</span>
          <span className="absolute bottom-1 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#C5A880]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.button>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isExpanded && (
            <>
              {/* ======================================================== */}
              {/* DESKTOP MODAL (hidden md:flex)                           */}
              {/* ======================================================== */}
              <div className="hidden md:flex fixed inset-0 z-[100] items-center justify-center pt-32 px-4 pointer-events-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-black/70 backdrop-blur-md"
                  onClick={handleCloseSearch}
                />
                <motion.div
                  className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-[0_24px_80px_rgba(0,0,0,0.15)] rounded-[32px] p-12 flex flex-col"
                >
                  <button
                    onClick={handleCloseSearch}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors text-black/40 hover:text-black z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="mb-10 text-center"
                  >
                    <h2 className="font-serif text-4xl font-bold text-black mb-2 tracking-tight">Quick Site Search</h2>
                    <p className="text-black/60 text-base font-medium max-w-lg mx-auto">Instantly explore venues, vendors, themes, and wedding ideas across Hyderabad.</p>
                  </motion.div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="w-full grid grid-cols-3 gap-4 mb-10"
                  >
                    {searchChips.map((chip) => {
                      const isActive = activeChip === chip.id;
                      const selectedValue = selections[chip.id];
                      const hasOptions = !!searchOptions[chip.id];
                      const displayValue = chip.id === "date" ? formatDate(selectedValue) : selectedValue;

                      return (
                        <motion.div
                          key={chip.id}
                          variants={itemVariants}
                          className={`relative group flex flex-col p-4 rounded-2xl bg-white hover:bg-[#FAF7F2] border transition-all text-left shadow-sm ${
                            isActive ? "border-[#C5A880] ring-1 ring-[#C5A880]/20 z-10" : "border-black/5 hover:border-[#E8D8BC] z-0"
                          }`}
                        >
                          <div 
                            className="flex items-center justify-between w-full cursor-pointer"
                            onClick={() => { if (hasOptions) setActiveChip(isActive ? null : chip.id); }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                <chip.icon className={`w-5 h-5 ${isActive ? "text-[#8B263E]" : "text-black/50 group-hover:text-[#8B263E]"}`} />
                              </div>
                              <div>
                                <span className="block text-sm font-bold text-black">{chip.label}</span>
                                {displayValue ? (
                                  <span className="block text-xs text-[#8B263E] font-bold mt-0.5 flex items-center gap-1">
                                    {displayValue} <Check className="w-3 h-3" />
                                  </span>
                                ) : (
                                  <span className="block text-xs text-black/50 font-medium">Filter by {chip.label.toLowerCase()}</span>
                                )}
                              </div>
                            </div>
                            {hasOptions && (
                              <ChevronDown className={`w-4 h-4 text-black/40 transition-transform ${isActive ? "rotate-180" : ""}`} />
                            )}
                          </div>
                          {hasOptions && (
                            <AnimatePresence>
                              {isActive && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-[calc(100%+8px)] left-0 w-full bg-white shadow-xl rounded-xl border border-gray-100 z-[60] overflow-hidden"
                                >
                                  {chip.id === "location" ? (
                                    <>
                                      <div className="p-3 border-b border-gray-100 bg-white">
                                        <div className="relative">
                                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                                          <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search area, venue or locality..."
                                            value={locationQuery}
                                            onChange={(e) => setLocationQuery(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-[#8B263E]/20 text-black font-medium placeholder:text-black/30 placeholder:font-normal"
                                          />
                                        </div>
                                      </div>
                                      <div className="max-h-[240px] overflow-y-auto">
                                        {filteredLocations.length > 0 ? (
                                          filteredLocations.map(opt => (
                                            <div
                                              key={opt}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelections(prev => ({ ...prev, [chip.id]: opt }));
                                                setActiveChip(null);
                                                setLocationQuery("");
                                              }}
                                              className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${selectedValue === opt ? "font-bold text-[#8B263E] bg-gray-50" : "text-gray-700"}`}
                                            >
                                              {opt}
                                              {selectedValue === opt && <Check className="w-4 h-4 text-[#8B263E]" />}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="px-4 py-6 text-center text-sm text-black/40">No locations found.</div>
                                        )}
                                      </div>
                                    </>
                                  ) : chip.id === "date" ? (
                                    <div className="p-4 bg-white flex flex-col gap-3">
                                      <label className="text-sm font-bold text-neutral-800">Select Date</label>
                                      <input
                                        type="date"
                                        onClick={(e) => e.stopPropagation()}
                                        value={selections.date || ""}
                                        onChange={(e) => {
                                          setSelections(prev => ({ ...prev, date: e.target.value }));
                                          setActiveChip(null);
                                        }}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 px-4 text-sm font-medium text-black outline-none focus:ring-1 focus:ring-[#8B263E]/20"
                                      />
                                    </div>
                                  ) : (
                                    <div className="max-h-[240px] overflow-y-auto">
                                      {searchOptions[chip.id].map(opt => (
                                        <div
                                          key={opt}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelections(prev => ({ ...prev, [chip.id]: opt }));
                                            setActiveChip(null);
                                          }}
                                          className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${selectedValue === opt ? "font-bold text-[#8B263E] bg-gray-50" : "text-gray-700"}`}
                                        >
                                          {opt}
                                          {selectedValue === opt && <Check className="w-4 h-4 text-[#8B263E]" />}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center"
                  >
                    <button
                      onClick={handleSearch}
                      className="bg-[#8B263E] text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#6e1c2f] transition-all duration-300 flex items-center gap-2 shadow-md"
                    >
                      <Search className="w-4 h-4" />
                      SEARCH ALL CATEGORIES
                    </button>
                  </motion.div>
                </motion.div>
              </div>

              {/* ======================================================== */}
              {/* MOBILE BOTTOM SHEET (md:hidden flex)                       */}
              {/* ======================================================== */}
              <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end pointer-events-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={handleCloseSearch}
                />
                
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="relative bg-[#FAF9F6] rounded-t-[32px] p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex flex-col"
                  style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))", maxHeight: "85vh" }}
                >
                  {mobileView === "main" && (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-1">Quick Search</h2>
                          <p className="text-sm text-neutral-500 font-medium">Find what you need faster</p>
                        </div>
                        <button onClick={handleCloseSearch} className="p-2 -mr-2 -mt-2 text-neutral-400 hover:text-neutral-800 transition-colors">
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-3 mb-6">
                        <button onClick={() => setMobileView("location")} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-colors">
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] uppercase font-bold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5"/> Location
                            </span>
                            <span className={`text-base ${selections.location ? "font-bold text-neutral-900" : "font-medium text-neutral-400"}`}>
                              {selections.location || "Choose an area or venue"}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-neutral-300" />
                        </button>

                        <button onClick={() => setMobileView("guests")} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-colors">
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] uppercase font-bold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5"/> Guests
                            </span>
                            <span className={`text-base ${selections.guests ? "font-bold text-neutral-900" : "font-medium text-neutral-400"}`}>
                              {selections.guests || "How many guests?"}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-neutral-300" />
                        </button>

                        <button onClick={() => setMobileView("budget")} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-colors">
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] uppercase font-bold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                              <IndianRupee className="w-3.5 h-3.5"/> Budget
                            </span>
                            <span className={`text-base ${selections.budget ? "font-bold text-neutral-900" : "font-medium text-neutral-400"}`}>
                              {selections.budget || "What's your budget?"}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-neutral-300" />
                        </button>

                        {!showAdvanced ? (
                          <button onClick={() => setShowAdvanced(true)} className="text-[#8B263E] text-xs font-bold w-full py-2 tracking-wide flex items-center justify-center gap-1">
                            + MORE OPTIONS (Venue Type, Date, Space)
                          </button>
                        ) : (
                          <>
                            <button onClick={() => setMobileView("venueType")} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-colors">
                              <div className="flex flex-col text-left">
                                <span className="text-[11px] uppercase font-bold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                                  <Home className="w-3.5 h-3.5"/> Venue Type
                                </span>
                                <span className={`text-base ${selections.venueType ? "font-bold text-neutral-900" : "font-medium text-neutral-400"}`}>
                                  {selections.venueType || "Any venue type"}
                                </span>
                              </div>
                              <ChevronDown className="w-4 h-4 text-neutral-300" />
                            </button>
                            <button onClick={() => setMobileView("date")} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-colors">
                              <div className="flex flex-col text-left">
                                <span className="text-[11px] uppercase font-bold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5"/> Date
                                </span>
                                <span className={`text-base ${selections.date ? "font-bold text-neutral-900" : "font-medium text-neutral-400"}`}>
                                  {selections.date ? formatDate(selections.date) : "Any date"}
                                </span>
                              </div>
                              <ChevronDown className="w-4 h-4 text-neutral-300" />
                            </button>
                            <button onClick={() => setMobileView("space")} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-colors">
                              <div className="flex flex-col text-left">
                                <span className="text-[11px] uppercase font-bold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                                  <Sun className="w-3.5 h-3.5"/> Indoor / Outdoor
                                </span>
                                <span className={`text-base ${selections.space ? "font-bold text-neutral-900" : "font-medium text-neutral-400"}`}>
                                  {selections.space || "Any space"}
                                </span>
                              </div>
                              <ChevronDown className="w-4 h-4 text-neutral-300" />
                            </button>
                          </>
                        )}
                      </div>

                      <button onClick={handleSearch} className="w-full bg-[#8B263E] text-white py-4 rounded-full font-bold text-sm tracking-widest flex justify-center items-center gap-2 hover:bg-[#6e1c2f] transition-colors shadow-md">
                        FIND MATCHES <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* LOCATION SEARCH VIEW */}
                  {mobileView === "location" && (
                    <>
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200/60">
                        <button onClick={() => setMobileView("main")} className="p-1 -ml-1 text-neutral-500 hover:text-neutral-900 transition-colors">
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search area, venue or locality..."
                          value={locationQuery}
                          onChange={(e) => setLocationQuery(e.target.value)}
                          className="flex-1 bg-transparent text-base font-medium text-neutral-900 placeholder:text-neutral-400 outline-none"
                        />
                        {locationQuery && (
                          <button onClick={() => setLocationQuery("")} className="p-1 text-neutral-400 hover:text-neutral-600">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-col overflow-y-auto -mx-2 px-2" style={{ maxHeight: "50vh" }}>
                        {filteredLocations.length > 0 ? filteredLocations.map(opt => {
                          const isSelected = selections.location === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                setSelections(prev => ({ ...prev, location: opt }));
                                setMobileView("main");
                                setLocationQuery("");
                              }}
                              className="w-full flex items-center justify-between p-4 rounded-xl mb-1.5 transition-colors text-left"
                              style={{ backgroundColor: isSelected ? "rgba(139, 38, 62, 0.05)" : "transparent" }}
                            >
                              <span className={`text-[15px] ${isSelected ? "font-bold text-[#8B263E]" : "font-medium text-neutral-700"}`}>
                                {opt}
                              </span>
                              {isSelected && <Check className="w-5 h-5 text-[#8B263E]" />}
                            </button>
                          );
                        }) : (
                          <div className="text-center py-8 text-neutral-500 text-sm">No locations found.</div>
                        )}
                      </div>
                    </>
                  )}

                  {/* GUESTS CHOICE VIEW */}
                  {mobileView === "guests" && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-serif text-xl font-bold text-neutral-900">How many guests?</h2>
                        <button onClick={() => setMobileView("main")} className="text-[#8B263E] text-sm font-bold p-2 -mr-2">DONE</button>
                      </div>
                      
                      <div className="flex flex-col overflow-y-auto -mx-2 px-2" style={{ maxHeight: "50vh" }}>
                        {mobileGuestOptions.map(opt => {
                          const isSelected = selections.guests === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setSelections(prev => ({ ...prev, guests: opt.value }));
                                setMobileView("main");
                              }}
                              className={`w-full flex items-center justify-between p-4 rounded-xl mb-3 border transition-colors text-left ${isSelected ? "border-[#8B263E] bg-[#8B263E]/5" : "border-gray-200 bg-white"}`}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className={`text-[15px] ${isSelected ? "font-bold text-[#8B263E]" : "font-bold text-neutral-800"}`}>
                                  {opt.label}
                                </span>
                                <span className={`text-[13px] ${isSelected ? "font-medium text-[#8B263E]/80" : "font-medium text-neutral-500"}`}>
                                  {opt.desc}
                                </span>
                              </div>
                              {isSelected && <Check className="w-5 h-5 text-[#8B263E] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* BUDGET CHOICE VIEW */}
                  {mobileView === "budget" && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-serif text-xl font-bold text-neutral-900">What's your wedding budget?</h2>
                        <button onClick={() => setMobileView("main")} className="text-[#8B263E] text-sm font-bold p-2 -mr-2">DONE</button>
                      </div>
                      
                      <div className="flex flex-col overflow-y-auto -mx-2 px-2" style={{ maxHeight: "50vh" }}>
                        {mobileBudgetOptions.map(opt => {
                          const isSelected = selections.budget === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setSelections(prev => ({ ...prev, budget: opt.value }));
                                setMobileView("main");
                              }}
                              className={`w-full flex items-center justify-between p-4 rounded-xl mb-3 border transition-colors text-left ${isSelected ? "border-[#8B263E] bg-[#8B263E]/5" : "border-gray-200 bg-white"}`}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className={`text-[15px] ${isSelected ? "font-bold text-[#8B263E]" : "font-bold text-neutral-800"}`}>
                                  {opt.label}
                                </span>
                                <span className={`text-[13px] ${isSelected ? "font-medium text-[#8B263E]/80" : "font-medium text-neutral-500"}`}>
                                  {opt.desc}
                                </span>
                              </div>
                              {isSelected && <Check className="w-5 h-5 text-[#8B263E] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* VENUE TYPE / SPACE / DATE SHARED VIEW */}
                  {(mobileView === "venueType" || mobileView === "space" || mobileView === "date") && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-serif text-xl font-bold text-neutral-900">
                          {mobileView === "venueType" ? "Venue Type" : mobileView === "space" ? "Indoor / Outdoor" : "Select Date"}
                        </h2>
                        <button onClick={() => setMobileView("main")} className="text-[#8B263E] text-sm font-bold p-2 -mr-2">DONE</button>
                      </div>
                      
                      {mobileView === "date" ? (
                        <div className="flex flex-col pt-4">
                          <input
                            type="date"
                            value={selections.date || ""}
                            onChange={(e) => {
                              setSelections(prev => ({ ...prev, date: e.target.value }));
                              setMobileView("main");
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl py-4 px-4 text-base font-bold text-neutral-900 outline-none focus:border-[#8B263E]"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col overflow-y-auto -mx-2 px-2" style={{ maxHeight: "50vh" }}>
                          {searchOptions[mobileView].map(opt => {
                            const isSelected = selections[mobileView] === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => {
                                  setSelections(prev => ({ ...prev, [mobileView]: opt }));
                                  setMobileView("main");
                                }}
                                className={`w-full flex items-center justify-between p-4 rounded-xl mb-1.5 transition-colors text-left ${isSelected ? "bg-[#8B263E]/5" : "bg-transparent"}`}
                              >
                                <span className={`text-[15px] ${isSelected ? "font-bold text-[#8B263E]" : "font-medium text-neutral-700"}`}>
                                  {opt}
                                </span>
                                {isSelected && <Check className="w-5 h-5 text-[#8B263E]" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
