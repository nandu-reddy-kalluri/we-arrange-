"use client";

import React from "react";
import { Eye, Settings } from "lucide-react";
import { Template } from "@/mock-data/templates";

export default function TemplateCard({ template }: { template: Template }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_8px_32px_0_rgba(25,45,50,0.02)] hover:shadow-premium transition-all duration-300">
      {/* Thumbnail Container */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
        <img
          src={template.imageUrl}
          alt={template.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Overlay buttons on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <button
            suppressHydrationWarning={true}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-xs font-bold text-[hsl(240,10%,15%)] hover:bg-[hsl(25,45%,50%)] hover:text-white transition-all duration-200 shadow-md"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            suppressHydrationWarning={true}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(25,45%,50%)] text-xs font-bold text-white hover:bg-[hsl(25,50%,35%)] transition-all duration-200 shadow-md"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            {template.style}
          </span>
          <h3 className="font-serif text-sm font-bold text-[hsl(240,10%,15%)]">
            {template.name}
          </h3>
        </div>
        {/* Color Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-medium">Palette</span>
          <div
            className="w-4 h-4 rounded-full border border-gray-200 shadow-inner"
            style={{ backgroundColor: template.themeColor }}
          />
        </div>
      </div>
    </div>
  );
}
