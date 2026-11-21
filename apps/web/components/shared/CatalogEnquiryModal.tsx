"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, CheckCircle2, Calendar, Users, Sparkles } from "lucide-react";
import { submitCustomerEnquiry } from "@/services/catalog/catalogApi";

interface CatalogEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetCity?: string;
  venueId?: number;
  vendorId?: number;
  defaultSubject?: string;
  defaultMessage?: string;
}

export function CatalogEnquiryModal({
  isOpen,
  onClose,
  targetName,
  targetCity = "Hyderabad",
  venueId,
  vendorId,
  defaultSubject,
  defaultMessage,
}: CatalogEnquiryModalProps) {
  const [subject, setSubject] = useState(
    defaultSubject || `Quote & Consultation Request for ${targetName}`
  );
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("250");
  const [budgetRange, setBudgetRange] = useState("₹15L - ₹30L");
  const [preferredCity, setPreferredCity] = useState(targetCity);
  const [message, setMessage] = useState(
    defaultMessage ||
      `Hi Concierge, we would like custom pricing, availability, and consultation details for ${targetName}.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSubject(defaultSubject || `Quote & Consultation Request for ${targetName}`);
    setMessage(
      defaultMessage ||
        `Hi Concierge, we would like custom pricing, availability, and consultation details for ${targetName}.`
    );
    setPreferredCity(targetCity);
    setError(null);
    setSubmittedId(null);
  }, [isOpen, defaultSubject, defaultMessage, targetName, targetCity]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const parsedGuests = parseInt(guestCount, 10);
    const payload = {
      ...(venueId ? { venueId } : {}),
      ...(vendorId ? { vendorId } : {}),
      subject: subject.trim(),
      message: message.trim(),
      ...(eventDate ? { eventDate } : {}),
      ...(Number.isFinite(parsedGuests) && parsedGuests >= 10
        ? { guestCount: parsedGuests }
        : {}),
      ...(budgetRange ? { budgetRange } : {}),
      ...(preferredCity ? { preferredCity } : {}),
    };

    const res = await submitCustomerEnquiry(payload);
    setSubmitting(false);

    if (!res.ok) {
      if (res.status === 401) {
        setError("Please sign in to submit an enquiry to our Concierge.");
      } else {
        setError(res.error || "Could not submit your enquiry. Please check your details.");
      }
      return;
    }

    setSubmittedId(res.data?.enquiry_id ?? 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white border border-[#C5A880]/30 shadow-2xl p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close enquiry modal"
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5ED] border border-[#C5A880]/30 text-[10px] font-bold uppercase tracking-widest text-[#8B263E] mb-3">
          <Sparkles className="w-3 h-3 text-[#C5A880]" />
          <span>Concierge Desk</span>
        </div>

        <h3 className="font-serif text-2xl font-bold text-[#2D2D2D]">
          {targetName}
        </h3>
        <p className="text-xs text-neutral-500 mt-1 mb-5">
          Submit your event details to receive negotiated quotes and site visit coordination.
        </p>

        {submittedId !== null ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-emerald-900">
              Enquiry Submitted Successfully
            </h4>
            <p className="text-xs text-emerald-800">
              Reference #{submittedId} is now active with our wedding concierge team.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/customer/bookings"
                className="px-5 py-2.5 rounded-full bg-[#8B263E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#701E31] transition-colors"
              >
                Track in My Bookings
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center justify-between gap-2">
                <span>{error}</span>
                {error.toLowerCase().includes("sign in") && (
                  <Link
                    href="/login"
                    className="px-3 py-1 rounded-full bg-[#8B263E] text-white text-[10px] font-bold uppercase shrink-0"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-[#8B263E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  <Calendar className="w-3 h-3" /> Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-[#8B263E]"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  <Users className="w-3 h-3" /> Guest Count
                </label>
                <input
                  type="number"
                  min={10}
                  max={20000}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-[#8B263E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Estimated Budget
                </label>
                <input
                  type="text"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  placeholder="e.g. ₹15L - ₹30L"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-[#8B263E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Preferred City
                </label>
                <input
                  type="text"
                  value={preferredCity}
                  onChange={(e) => setPreferredCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-[#8B263E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Requirements & Notes
              </label>
              <textarea
                rows={3}
                required
                minLength={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-[#8B263E]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Submitting..." : "Send Enquiry"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
