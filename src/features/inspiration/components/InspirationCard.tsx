import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { InspirationItem } from "@/mock-data/inspiration";

interface InspirationCardProps {
  item: InspirationItem;
}

export function InspirationCard({ item }: InspirationCardProps) {
  // Determine link destination based on category
  const href = `/inspiration/${item.category}/${item.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white rounded-[20px] border border-[#E8D8BC]/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden cursor-pointer hover:shadow-[0_15px_35px_rgba(200,161,101,0.12)] hover:border-[#C8A165]/50 transition-all duration-500 h-full"
    >
      {/* Image Container with Aspect Ratio 16:10 */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-100">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Soft elegant vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-65 group-hover:opacity-40 transition-opacity duration-500" />
        
        {/* Category Tag Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#8B6B35]">
            {item.category.replace("-", " ")}
          </span>
        </div>
      </div>

      {/* Info Content */}
      <div className="flex flex-col flex-grow p-5 bg-white z-10 relative">
        <h3 className="font-serif text-[17px] font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-[#8B263E] transition-colors duration-300">
          {item.title}
        </h3>
        
        <p className="text-[12px] font-medium text-neutral-500 leading-relaxed line-clamp-2 mt-1.5 flex-grow">
          {item.description}
        </p>

        {/* Action link */}
        <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8A165] group-hover:text-[#8B263E] transition-colors duration-300">
            Explore Details
          </span>
          <div className="w-7 h-7 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-[#C8A165] transition-all duration-300">
            <ChevronRight className="w-4 h-4 text-[#C8A165] group-hover:text-white transition-colors duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
