"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from "lucide-react";

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    estimatedGuests: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // shortcut: Simulate lead submission state until backend direct lead capture webhook is bound
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2D2D2D] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B263E]/10 text-[#8B263E] text-xs font-semibold tracking-wider uppercase mb-4">
            Private Client Relations
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A0308] tracking-tight mb-4">
            Connect With Our Concierge
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
            Have questions about a venue, custom vendor curation, or scheduling a private property tour? Our Hyderabad team is at your disposal.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-12 items-start">
          {/* Contact Details Card */}
          <div className="md:col-span-5 bg-[#FAF7F2] border border-[#E8D8BC]/60 rounded-3xl p-8 space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1A0308] mb-2">
                Concierge Desk
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                Dedicated personal consultations for couples, families, and luxury event coordinators.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8B263E]/10 text-[#8B263E] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">
                    Email Inquiries
                  </div>
                  <a
                    href="mailto:concierge@youmarriagewearrange.com"
                    className="text-sm font-semibold text-[#8B263E] hover:underline"
                  >
                    concierge@youmarriagewearrange.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8B263E]/10 text-[#8B263E] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">
                    Direct Line & WhatsApp
                  </div>
                  <div className="text-sm font-semibold text-neutral-900">
                    +91 (040) 4852-YMWA
                  </div>
                  <div className="text-xs text-neutral-500">
                    Mon - Sat: 10:00 AM - 7:00 PM IST
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8B263E]/10 text-[#8B263E] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">
                    Flagship Office
                  </div>
                  <div className="text-sm font-medium text-neutral-800 leading-snug">
                    Road No. 36, Jubilee Hills,<br />
                    Hyderabad, Telangana 500033
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8B263E]/10 text-[#8B263E] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">
                    Response Guarantee
                  </div>
                  <div className="text-sm text-neutral-700">
                    Within 24 business hours for all registered inquiries.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="md:col-span-7 bg-white border border-neutral-200/80 rounded-3xl p-8 sm:p-10 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-neutral-900">
                  Inquiry Received
                </h3>
                <p className="text-neutral-600 text-sm max-w-md mx-auto">
                  Thank you, <span className="font-semibold text-neutral-800">{formData.name || "there"}</span>. Your wedding vision has been routed to our senior concierge coordinator. We will reach out shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      eventDate: "",
                      estimatedGuests: "",
                      notes: "",
                    });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-full border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1A0308] mb-1">
                    Send a Requirement
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Let us know what you need and our concierge will curate recommendations.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sanjana Rao"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sanjana@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E]"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Tentative Wedding Date
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Estimated Guest Count
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedGuests}
                      onChange={(e) => setFormData({ ...formData, estimatedGuests: e.target.value })}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Tell us about your wedding vision
                  </label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Preferred locations (e.g. Banjara Hills, Shamshabad), desired decor theme, caterer preferences, or budget brackets..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {loading ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit to Concierge</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
