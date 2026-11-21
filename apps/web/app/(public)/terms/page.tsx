import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | YouMarriageWeArrange",
  description: "Terms and conditions governing the use of the YouMarriageWeArrange luxury wedding concierge platform and marketplace.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2D2D2D] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B263E]/10 text-[#8B263E] text-xs font-semibold uppercase tracking-wider mb-4">
            <FileText className="w-3.5 h-3.5" />
            Legal Documentation
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A0308] tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Last Updated: November 2026 • Effective for all users and partners of YouMarriageWeArrange
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-neutral max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-neutral-700">
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0308] mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or utilizing the YouMarriageWeArrange platform (available via youmarriagewearrange.com and associated mobile/web applications), you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0308] mb-3">
              2. Scope of Services
            </h2>
            <p>
              YouMarriageWeArrange provides an online discovery platform, digital wedding planning utilities, and a dedicated concierge service connecting couples (&ldquo;Clients&rdquo;) with verified venues and wedding service providers (&ldquo;Vendors&rdquo;).
            </p>
            <p className="mt-2">
              While YMWA conducts thorough quality reviews and vetting of participating venues and vendors, the ultimate contractual agreement for event execution, venue occupancy, catering, photography, and decor remains between the Client and the designated Vendor or Venue.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0308] mb-3">
              3. Client Accounts & Communication
            </h2>
            <p>
              To access personalized concierge recommendations, shortlist venues, and manage booking inquiries, clients must create an account. You agree to provide accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your login credentials.
            </p>
            <p className="mt-2">
              We pledge a Zero-Spam standard: YMWA will never transmit your private contact details to unapproved third parties. Communications via our platform must remain professional and respectful at all times.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0308] mb-3">
              4. Booking Tokens & Financial Transactions
            </h2>
            <p>
              Any booking advances, token payments, or milestone installments processed via YMWA are handled using authorized, PCI-DSS compliant third-party payment gateways. YMWA does not store full credit card or debit card numbers on its servers.
            </p>
            <p className="mt-2">
              Cancellation policies, refunds, and rescheduling terms for specific venues or vendors are set forth in their respective vendor service contracts. YMWA facilitates transparent disclosure of all such terms prior to token confirmation.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0308] mb-3">
              5. Intellectual Property
            </h2>
            <p>
              All content, brand marks, logos, user interface designs, custom photography, algorithms, and software code on YMWA are the exclusive property of YouMarriageWeArrange and protected under Indian and international intellectual property laws. Reproduction, redistribution, or scraping of proprietary material without prior written consent is strictly prohibited.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0308] mb-3">
              6. Limitation of Liability & Governing Law
            </h2>
            <p>
              In no event shall YouMarriageWeArrange, its founders, officers, or employees be liable for any indirect, incidental, punitive, or consequential damages resulting from vendor performance, force majeure disruptions, or platform downtime.
            </p>
            <p className="mt-2">
              These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute or controversy arising out of these terms shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad, Telangana.
            </p>
          </section>

          {/* Contact Box */}
          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8D8BC]/60 flex items-start gap-4">
            <Shield className="w-6 h-6 text-[#8B263E] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm mb-1">
                Legal & Compliance Inquiries
              </h3>
              <p className="text-xs text-neutral-600">
                If you have questions regarding these terms, please direct inquiries to{" "}
                <a href="mailto:legal@youmarriagewearrange.com" className="text-[#8B263E] underline font-medium">
                  legal@youmarriagewearrange.com
                </a>{" "}
                or contact our registered office in Jubilee Hills, Hyderabad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
