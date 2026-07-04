"use client";

import React from "react";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Vendor } from "@/mock-data/vendors";

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_8px_32px_0_rgba(25,45,50,0.02)] hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        <img
          src={vendor.imageUrl}
          alt={vendor.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold text-[hsl(340,60%,15%)] uppercase tracking-wider shadow-sm">
          {vendor.category}
        </div>
      </div>

      {/* Details */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-base font-bold text-[#2D2D2D] truncate group-hover:text-[#C5A880] transition-colors duration-200">
            {vendor.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D2D2D]">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span>{vendor.rating}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-[hsl(240,5%,45%)] mb-4">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C5A880]" />
          <span>{vendor.location}</span>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Starting Price
            </span>
            <span className="text-base font-bold text-[#8B263E]">
              ₹{vendor.priceStart}L Onwards
            </span>
          </div>
          <Link
            href={`/vendors/${vendor.slug}`}
            className="px-4 py-2 rounded-full text-xs font-bold text-[#C5A880] bg-[#8B263E]/5 hover:bg-[#8B263E] hover:text-white transition-all duration-300"
          >
            Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
