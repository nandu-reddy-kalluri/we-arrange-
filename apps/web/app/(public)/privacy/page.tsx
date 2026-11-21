import React from "react";
import type { Metadata } from "next";
import { Lock, ShieldCheck, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | YouMarriageWeArrange",
  description: "Privacy policy detailing how YouMarriageWeArrange collects, uses, and safeguards client and vendor personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2D2D2D] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B263E]/10 text-[#8B263E] text-xs font-semibold uppercase tracking-wider mb-4">
            <Lock className="w-3.5 h-3.5" />
            Data Protection & Privacy
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A0308] tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Last Updated: November 2026 • Your privacy and confidentiality are paramount at YMWA.
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-neutral max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-neutral-700">
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0308] mb-3">
              1. Our Zero-Spam Commitment
            </h2>
            <p>
              At YouMarriageWeArrange, we believe wedding planning should be discreet, private, and respectful. We strictly reject the practice of broadcasting your contact information to hundreds of aggressive telemarketers or third-party lead brokers.
            </p>
            <p className="mt-2">
              Your phone number, email address, and personal wedding details are held in confidence and only disclosed to venues or vendors you have personally approved for an official consultation.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0308] mb-3">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Account & Profile Details:</strong> Full name, verified mobile number, email address, and authentication credentials.
              </li>
              <li>
                <strong>Wedding Requirements:</strong> Desired celebration dates, estimated guest count, preferred Hyderabad neighborhoods (Banjara Hills, Gachibowli, Shamshabad, etc.), budget brackets, and thematic preferences.
              </li>
              <li>
                <strong>Transaction & Booking Records:</strong> Milestone confirmations, receipt IDs, and service tier agreements. We do not store raw card numbers.
              </li>
              <li>
                <strong>Technical Usage Data:</strong> IP address, device type, browser metadata, and navigation interactions used strictly to optimize platform performance and prevent malicious activity.
              </li>
            </ul>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0308] mb-3">
              3. How We Use Your Information
            </h2>
            <p>We process your data exclusively for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Facilitating concierge matchmaking and obtaining authentic price quotations from vetted venues.</li>
              <li>Authenticating your account and ensuring secure role-based dashboard access.</li>
              <li>Delivering vital transactional notifications, booking confirmations, and concierge updates via SMS or email.</li>
              <li>Complying with regulatory obligations and maintaining financial audit standards.</li>
            </ul>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0308] mb-3">
              4. Data Storage & Security
            </h2>
            <p>
              Your data is stored in enterprise-grade, encrypted PostgreSQL databases powered by Supabase with stringent Row-Level Security (RLS) enforcement. Media assets are secured via Cloudflare R2 object storage. All communication between your client device and our servers is secured using TLS 1.3 encryption.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0308] mb-3">
              5. Your Rights & Data Control
            </h2>
            <p>
              You have the right to inspect, correct, or request the permanent deletion of your profile data and saved wedding preferences at any time. To exercise these rights or request an export of your information, please submit a verified request to our privacy desk.
            </p>
          </section>

          {/* Privacy Officer Contact */}
          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8D8BC]/60 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-[#8B263E] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm mb-1">
                Data Protection Officer
              </h3>
              <p className="text-xs text-neutral-600">
                For privacy inquiries or deletion requests, contact our Data Protection Officer at{" "}
                <a href="mailto:privacy@youmarriagewearrange.com" className="text-[#8B263E] underline font-medium">
                  privacy@youmarriagewearrange.com
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
