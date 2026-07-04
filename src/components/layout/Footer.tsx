"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  const [showMobileLinks, setShowMobileLinks] = useState(false);
  return (
    <footer className="bg-[#FAF9F6] text-[#2D2D2D] pt-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-5 lg:col-span-2 text-left">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#C5A880] fill-current">
              <path d="M12 4a3 3 0 0 0-3 3c0 2.2 2 4.5 3 5.5 1-1 3-3.3 3-5.5a3 3 0 0 0-3-3zm0 4.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
              <path d="M6 19a6 6 0 0 1 12 0H6z" />
            </svg>
            <div className="flex flex-col">
              <span className="font-serif text-[18px] lg:text-[21px] font-bold leading-none tracking-tight text-[#C5A880]">
                YouMarriage
              </span>
              <span className="font-sans text-[10px] uppercase tracking-widest text-[#8B263E] font-bold leading-none mt-0.5">
                WeArrange
              </span>
            </div>
          </Link>
          <p className="text-sm text-[#6D6D6D] leading-relaxed max-w-sm">
            Your one-stop solution for venues, vendors, invitations and everything you need for your perfect wedding.
          </p>
          <div className="mt-2 w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#FAF9F6] shadow-md relative">
            <Image src="/images/editorial/insp_invitation.png" alt="Luxury Wedding Detail" fill sizes="96px" className="object-cover" />
          </div>
          <div className="flex items-center gap-3 text-[#6D6D6D]">
            <a href="#" className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 hover:text-[#8B263E] transition-colors shadow-sm">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 hover:text-[#8B263E] transition-colors shadow-sm">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 hover:text-[#8B263E] transition-colors shadow-sm">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 hover:text-[#8B263E] transition-colors shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.63 11.16-.1-.95-.2-2.4.04-3.43.22-.93 1.4-5.93 1.4-5.93s-.35-.7-.35-1.74c0-1.63.95-2.85 2.13-2.85 1 0 1.48.75 1.48 1.65 0 1-.64 2.5-1 3.88-.28 1.18.6 2.13 1.76 2.13 2.12 0 3.75-2.23 3.75-5.46 0-2.85-2.05-4.85-4.98-4.85-3.4 0-5.4 2.55-5.4 5.2 0 1.03.4 2.14.9 2.75.1.12.1.22.07.33-.1.38-.3.1.25-.4-.14-.54-.62-1.3-.62-2.1 0-3.4 2.47-6.52 7.12-6.52 3.74 0 6.64 2.66 6.64 6.22 0 3.7-2.35 6.7-5.6 6.7-1.1 0-2.13-.57-2.48-1.24l-.68 2.6c-.25.96-.92 2.16-1.37 2.9C9.72 23.8 10.84 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Desktop Footer Links */}
        <div className="hidden md:flex flex-col gap-4 text-left">
          <h4 className="font-sans text-sm font-bold text-[#2D2D2D] tracking-wide">
            Quick Links
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs font-semibold text-[#6D6D6D]">
            <li><Link href="/venues" className="hover:text-[#8B263E] transition-colors">Venues</Link></li>
            <li><Link href="/vendors" className="hover:text-[#8B263E] transition-colors">Vendors</Link></li>
            <li><Link href="/quotes" className="hover:text-[#8B263E] transition-colors">Get Best Quotes</Link></li>
            <li><Link href="/invitations" className="hover:text-[#8B263E] transition-colors">Digital Invitations</Link></li>
            <li><Link href="/websites" className="hover:text-[#8B263E] transition-colors">Wedding Websites</Link></li>
            <li><Link href="/inspiration" className="hover:text-[#8B263E] transition-colors">Wedding Inspiration</Link></li>
          </ul>
        </div>

        <div className="hidden md:flex flex-col gap-4 text-left">
          <h4 className="font-sans text-sm font-bold text-[#2D2D2D] tracking-wide">
            Company
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs font-semibold text-[#6D6D6D]">
            <li><Link href="/about" className="hover:text-[#8B263E] transition-colors">About Us</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-[#8B263E] transition-colors">How It Works</Link></li>
            <li><Link href="/blog" className="hover:text-[#8B263E] transition-colors">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-[#8B263E] transition-colors">Contact Us</Link></li>
            <li><Link href="/careers" className="hover:text-[#8B263E] transition-colors">Careers</Link></li>
            <li><Link href="/press" className="hover:text-[#8B263E] transition-colors">Press</Link></li>
          </ul>
        </div>

        <div className="hidden md:flex flex-col gap-4 text-left">
          <h4 className="font-sans text-sm font-bold text-[#2D2D2D] tracking-wide">
            Support
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs font-semibold text-[#6D6D6D]">
            <li><Link href="/help" className="hover:text-[#8B263E] transition-colors">Help Center</Link></li>
            <li><Link href="/faq" className="hover:text-[#8B263E] transition-colors">FAQ's</Link></li>
            <li><Link href="/terms" className="hover:text-[#8B263E] transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-[#8B263E] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/refund" className="hover:text-[#8B263E] transition-colors">Refund Policy</Link></li>
          </ul>
        </div>

        <div className="hidden md:flex flex-col gap-4 text-left lg:col-span-2 md:col-span-1">
          <h4 className="font-sans text-sm font-bold text-[#2D2D2D] tracking-wide">
            Contact Us
          </h4>
          <ul className="flex flex-col gap-3 text-xs font-semibold text-[#6D6D6D]">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#8B263E] shrink-0" />
              <span>+91 12345 67890</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8B263E] shrink-0" />
              <span className="break-all">support@youmarriagewearrange.com</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#8B263E] shrink-0 mt-0.5" />
              <span>123, Luxury Avenue, Banjara Hills, Hyderabad, Telangana - 500034</span>
            </li>
          </ul>
        </div>

        {/* Mobile Quick Actions */}
        <div className="md:hidden flex justify-center gap-6 mt-4 pb-8">
          <a href="#" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm text-neutral-charcoal hover:bg-[#8B263E] hover:text-white transition-colors">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted">Call</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.63 11.16-.1-.95-.2-2.4.04-3.43.22-.93 1.4-5.93 1.4-5.93s-.35-.7-.35-1.74c0-1.63.95-2.85 2.13-2.85 1 0 1.48.75 1.48 1.65 0 1-.64 2.5-1 3.88-.28 1.18.6 2.13 1.76 2.13 2.12 0 3.75-2.23 3.75-5.46 0-2.85-2.05-4.85-4.98-4.85-3.4 0-5.4 2.55-5.4 5.2 0 1.03.4 2.14.9 2.75.1.12.1.22.07.33-.1.38-.3.1.25-.4-.14-.54-.62-1.3-.62-2.1 0-3.4 2.47-6.52 7.12-6.52 3.74 0 6.64 2.66 6.64 6.22 0 3.7-2.35 6.7-5.6 6.7-1.1 0-2.13-.57-2.48-1.24l-.68 2.6c-.25.96-.92 2.16-1.37 2.9C9.72 23.8 10.84 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted">WhatsApp</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm text-pink-600 hover:bg-pink-600 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted">Instagram</span>
          </a>
        </div>

        {/* Mobile Expander */}
        <div className="md:hidden">
          <button 
            onClick={() => setShowMobileLinks(!showMobileLinks)}
            className="w-full py-4 border-t border-b border-gray-200 flex justify-between items-center text-sm font-bold text-[#2D2D2D]"
          >
            <span>{showMobileLinks ? "Hide Details" : "More Information & Legal"}</span>
            <span className="text-xl leading-none">{showMobileLinks ? "−" : "+"}</span>
          </button>
          
          {showMobileLinks && (
            <div className="pt-6 flex flex-col gap-8 pb-4">
              <div className="flex flex-col gap-4 text-left">
                <h4 className="font-sans text-sm font-bold text-[#2D2D2D] tracking-wide">
                  Contact Us
                </h4>
                <ul className="flex flex-col gap-3 text-xs font-semibold text-[#6D6D6D]">
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#8B263E] shrink-0" />
                    <span>+91 12345 67890</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#8B263E] shrink-0" />
                    <span className="break-all">support@youmarriagewearrange.com</span>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-4 text-left">
                  <h4 className="font-sans text-sm font-bold text-[#2D2D2D] tracking-wide">
                    Support
                  </h4>
                  <ul className="flex flex-col gap-2.5 text-xs font-semibold text-[#6D6D6D]">
                    <li><Link href="/help" className="hover:text-[#8B263E]">Help Center</Link></li>
                    <li><Link href="/terms" className="hover:text-[#8B263E]">Terms</Link></li>
                    <li><Link href="/privacy" className="hover:text-[#8B263E]">Privacy</Link></li>
                  </ul>
                </div>
                <div className="flex flex-col gap-4 text-left">
                  <h4 className="font-sans text-sm font-bold text-[#2D2D2D] tracking-wide">
                    Company
                  </h4>
                  <ul className="flex flex-col gap-2.5 text-xs font-semibold text-[#6D6D6D]">
                    <li><Link href="/about" className="hover:text-[#8B263E]">About Us</Link></li>
                    <li><Link href="/contact" className="hover:text-[#8B263E]">Contact Us</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="bg-[#1C0006] text-white py-3.5 text-center text-xs font-medium">
        <p>© 2026 YouMarriageWeArrange. All rights reserved.</p>
      </div>
    </footer>
  );
}
