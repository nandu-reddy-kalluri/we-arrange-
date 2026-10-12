import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Sparkles, Tag } from "lucide-react";
import { InspirationDetailItem } from "@/types/inspiration-types";

interface InspirationSubcategoryCardProps {
  item: InspirationDetailItem;
  index?: number;
}

export function InspirationSubcategoryCard({ item, index = 0 }: InspirationSubcategoryCardProps) {
  const href = `/inspiration/${item.categorySlug}/${item.slug}`;

  return (
    <div
      className="h-full animate-fade-in-up fill-mode-both"
      style={{ animationDelay: `${Math.min(index * 0.08, 0.4)}s` }}
    >
      <Link
        href={href}
        className="group flex flex-col bg-white rounded-[20px] border border-[#E8D8BC]/30 shadow-sm overflow-hidden cursor-pointer hover:-translate-y-[6px] hover:shadow-[0_20px_40px_rgba(200,161,101,0.15)] transition-all duration-300 h-full focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
      >
        {/* Image Container 16:10 */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-100">
          <Image
            src={item.heroImage}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            loading="lazy"
          />
          
          {/* Soft vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
          
          {/* Subcategory Tag */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8B6B35]">
              {item.subCategory}
            </span>
          </div>
          
          {/* Budget / Creator Badge on Image Bottom */}
          {(item.budgetRange || item.designerOrVendor) && (
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white z-10">
              {item.designerOrVendor && (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold drop-shadow-md bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-sm truncate max-w-[65%]">
                  <Tag className="w-3 h-3 text-[#C8A165] shrink-0" />
                  <span className="truncate">{item.designerOrVendor}</span>
                </div>
              )}
              {item.budgetRange && (
                <div className="flex items-center gap-1 text-[10px] font-semibold drop-shadow-md bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-sm shrink-0 ml-auto">
                  <Sparkles className="w-3 h-3 text-[#C8A165]" />
                  <span>{item.budgetRange}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Content */}
        <div className="flex flex-col flex-grow p-5 bg-white z-10 relative">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C8A165] mb-2 group-hover:text-[#8B263E] transition-colors duration-300">
            {item.categoryName}
          </h4>
          <h3 className="font-serif text-[18px] font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-[#C8A165] transition-colors duration-300 mb-3">
            {item.title}
          </h3>
          
          <p className="text-[13px] text-neutral-500 leading-relaxed line-clamp-2 mb-4 flex-grow">
            {item.shortDescription}
          </p>

          {/* Color palette preview swatches if available */}
          {item.colorPalette && item.colorPalette.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4 pt-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-1">Palette:</span>
              {item.colorPalette.slice(0, 4).map((swatch, idx) => (
                <span
                  key={idx}
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs inline-block"
                  style={{ backgroundColor: swatch.hex }}
                  title={swatch.name}
                />
              ))}
            </div>
          )}

          {/* Action link */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between mt-auto">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C8A165] group-hover:text-[#8B263E] transition-colors duration-300">
              Explore Details
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center group-hover:bg-[#C8A165] transition-all duration-300">
              <ChevronRight className="w-4 h-4 text-[#C8A165] group-hover:text-white transition-colors duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
