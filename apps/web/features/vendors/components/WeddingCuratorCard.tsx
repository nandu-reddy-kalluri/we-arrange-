"use client";

import React from "react";
import { Star, MessageCircle, Phone } from "lucide-react";

export function WeddingCuratorCard() {
  return (
    <div className="border-t border-gray-150 pt-6 mt-2">
      <div className="flex flex-col items-center text-center">
        <span className="text-[9px] font-black uppercase text-[#C5A880] tracking-widest mb-3">
          Meet Your Wedding Curator
        </span>
        
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm mb-3">
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80" 
            alt="Priya Sharma - Senior Wedding Curator" 
            className="w-full h-full object-cover"
          />
        </div>

        <h4 className="font-serif text-lg font-bold text-neutral-charcoal leading-tight">
          Priya Sharma
        </h4>
        <span className="text-xs text-neutral-muted mb-3 block">
          Senior Wedding Curator
        </span>

        <div className="flex items-center justify-center gap-1 text-xs font-bold text-neutral-charcoal mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-[#C5A880] text-[#C5A880]" />
          ))}
          <span className="ml-1">5.0</span>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mb-5">
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-1">
              Experience
            </span>
            <span className="text-xs font-extrabold text-[#8B263E]">
              183 Luxury Weddings
            </span>
          </div>
          <div className="text-center border-l border-gray-150">
            <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-1">
              Avg Response
            </span>
            <span className="text-xs font-extrabold text-[#8B263E]">
              &lt; 2 Hours
            </span>
          </div>
        </div>

        <div className="flex gap-2.5 w-full">
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 flex items-center justify-center gap-1.5 text-green-700 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-green-600 text-green-600" />
            WhatsApp
          </a>
          <a
            href="tel:+919999999999"
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-neutral-charcoal text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        </div>
      </div>
    </div>
  );
}
