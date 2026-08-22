"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Globe } from "lucide-react";

export function StudioProducts() {
  return (
    <section id="products" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-3xl md:text-5xl text-neutral-900 mb-6"
        >
          Everything You Need in One Studio
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#C5A880]" />
          <svg className="w-4 h-4 text-[#C5A880]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#C5A880]" />
        </motion.div>
      </div>

      <div className="flex flex-col gap-8 lg:gap-12">
        {/* eInvites Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6 }}
          className="group relative bg-[#F7F2F5] rounded-3xl overflow-hidden border border-[#8B263E]/10 flex flex-col md:flex-row shadow-sm hover:shadow-[0_20px_40px_rgba(139,38,62,0.06)] transition-all duration-500"
        >
          {/* Content */}
          <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative z-10">
            <div className="w-12 h-12 rounded-full bg-[#8B263E]/10 flex items-center justify-center mb-6">
              <Mail className="w-5 h-5 text-[#8B263E]" />
            </div>
            
            <h3 className="font-serif text-3xl md:text-4xl text-neutral-900 mb-4">eInvites</h3>
            <p className="text-neutral-600 text-lg mb-8 max-w-md leading-relaxed">
              Create beautiful digital invitations that wow your guests and set the tone for your celebration.
            </p>
            
            {/* Removed generic feature list in favor of product-led visualization */}


            <Link 
              href="/wedding-studio/einvites" 
              className="inline-flex items-center gap-2 text-[#8B263E] font-bold uppercase tracking-widest text-xs group/btn hover:text-[#6e1c2f] transition-colors"
            >
              Explore eInvites
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mockup Area */}
          <div className="flex-1 min-h-[400px] relative bg-gradient-to-br from-[#F7F2F5] to-[#ebdbe1] overflow-hidden flex items-center justify-center p-8">
            <motion.div 
              className="relative w-full max-w-[280px] aspect-[3/4] bg-white rounded-md shadow-2xl origin-bottom-right"
              whileHover={{ rotate: -2, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Back Card layer */}
              <div className="absolute inset-0 bg-[#FDFBF7] rounded-md shadow-lg transform rotate-6 translate-x-4 translate-y-2 border border-neutral-200" />
              
              {/* Front Card */}
              <div className="absolute inset-0 bg-[#FBF9F6] rounded-md border border-neutral-100 p-6 flex flex-col items-center justify-center text-center shadow-sm overflow-hidden z-10">
                <div className="absolute inset-2 border border-[#C5A880]/30 rounded-sm pointer-events-none" />
                <span className="font-sans text-[8px] uppercase tracking-[0.25em] text-[#8B263E] mb-4 font-bold">Together with their families</span>
                <div className="font-serif text-3xl text-neutral-900 mb-2 leading-none">Aarav</div>
                <div className="font-serif text-lg text-neutral-400 italic mb-2">&</div>
                <div className="font-serif text-3xl text-neutral-900 mb-6 leading-none">Diya</div>
                <span className="font-sans text-[7px] uppercase tracking-widest text-neutral-500 mb-2 font-bold">Request the honor of your presence</span>
                <span className="font-serif text-xs italic text-neutral-700 mb-6">December 12, 2026<br />Hyderabad</span>
                
                {/* Visual Feature Demos */}
                <div className="flex gap-2 w-full justify-center mt-auto">
                   <div className="px-3 py-1.5 bg-[#8B263E] text-white rounded-full text-[6px] uppercase tracking-widest font-bold shadow-sm">RSVP</div>
                   <div className="px-3 py-1.5 bg-neutral-900 text-white rounded-full text-[6px] uppercase tracking-widest font-bold shadow-sm">Share</div>
                </div>
              </div>

              {/* Floating Product Indicator */}
              <motion.div 
                className="absolute -top-3 -right-6 bg-white py-1.5 px-3 rounded-full shadow-lg border border-neutral-100 flex items-center gap-1.5 z-30"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[8px] font-bold text-neutral-600">Shared via WhatsApp ✓</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Wedding Websites Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6 }}
          className="group relative bg-[#F2F7F5] rounded-3xl overflow-hidden border border-[#4A7C59]/10 flex flex-col md:flex-row-reverse shadow-sm hover:shadow-[0_20px_40px_rgba(74,124,89,0.06)] transition-all duration-500"
        >
          {/* Content */}
          <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative z-10">
            <div className="w-12 h-12 rounded-full bg-[#4A7C59]/10 flex items-center justify-center mb-6">
              <Globe className="w-5 h-5 text-[#4A7C59]" />
            </div>
            
            <h3 className="font-serif text-3xl md:text-4xl text-neutral-900 mb-4">Wedding Websites</h3>
            <p className="text-neutral-600 text-lg mb-8 max-w-md leading-relaxed">
              Build your personal wedding website and share your journey, events, and memories with ease.
            </p>
            
            {/* Removed generic feature list in favor of product-led visualization */}


            <Link 
              href="/wedding-studio/websites" 
              className="inline-flex items-center gap-2 text-[#4A7C59] font-bold uppercase tracking-widest text-xs group/btn hover:text-[#386044] transition-colors"
            >
              Explore Websites
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mockup Area */}
          <div className="flex-1 min-h-[400px] relative bg-gradient-to-bl from-[#F2F7F5] to-[#e1efe8] overflow-hidden flex items-center justify-center p-8">
            <motion.div 
              className="relative w-full max-w-[400px] aspect-[16/10] bg-neutral-900 rounded-lg p-1.5 shadow-2xl origin-bottom-left"
              whileHover={{ scale: 1.03, rotate: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="bg-white rounded-sm h-full flex flex-col overflow-hidden">
                <div className="h-4 bg-neutral-100 flex items-center px-2 gap-1 border-b border-neutral-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                </div>
                <div className="flex-1 relative flex flex-col bg-neutral-50">
                  <div className="h-24 w-full bg-[#4A7C59]/10 relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1519225495810-7517c2965a7d?auto=format&fit=crop&q=80" alt="wedding" className="w-full h-full object-cover opacity-50" />
                  </div>
                  <div className="flex-1 p-4 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-white shadow-md -mt-10 overflow-hidden relative z-10 mb-2">
                       <img src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80" alt="couple" className="w-full h-full object-cover" />
                    </div>
                    <div className="font-serif text-sm font-bold text-neutral-800">Aarav & Diya</div>
                    <div className="text-[6px] text-neutral-500 uppercase tracking-widest mt-1 mb-3">Our Wedding Story</div>
                    <div className="w-full grid grid-cols-2 gap-2 mt-auto">
                      <div className="bg-white rounded shadow-sm border border-neutral-100 p-2 text-center flex flex-col items-center justify-center">
                         <div className="text-[8px] font-bold text-neutral-700 mb-0.5">Events</div>
                         <div className="text-[5px] text-neutral-400">View Schedule</div>
                      </div>
                      <div className="bg-white rounded shadow-sm border border-neutral-100 p-2 text-center flex flex-col items-center justify-center">
                         <div className="text-[8px] font-bold text-neutral-700 mb-0.5">Gallery</div>
                         <div className="text-[5px] text-neutral-400">View Photos</div>
                      </div>
                      <div className="col-span-2 bg-neutral-900 rounded shadow-sm border border-neutral-800 p-2 text-center flex flex-col items-center justify-center text-white">
                         <div className="text-[8px] font-bold uppercase tracking-widest">RSVP Now</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
