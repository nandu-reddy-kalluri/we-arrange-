import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { InspirationItem } from "@/mock-data/inspiration";

interface InspirationCardProps {
  item: InspirationItem;
  onClick?: () => void;
}

export function InspirationCard({ item, onClick }: InspirationCardProps) {
  // Determine link destination based on category
  const href = `/inspiration/${item.category}/${item.slug}`;

  const innerContent = (
    <>
      {/* Image Container with Aspect Ratio 4:5 */}
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        
        {/* Soft elegant vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 p-3 md:p-5 flex flex-col justify-end z-10">
          <div className="mb-2">
            <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-sm text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white">
              {item.category.replace("-", " ")}
            </span>
          </div>
          <h3 className="font-serif text-[13px] md:text-[18px] font-bold text-white leading-snug line-clamp-2 drop-shadow-md transition-colors duration-300">
            {item.title}
          </h3>
          
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8D8BC]">
              Explore Details
            </span>
            <ChevronRight className="w-4 h-4 text-[#E8D8BC]" />
          </div>
        </div>
      </div>
    </>
  );

  const className = "group relative flex flex-col bg-neutral-100 rounded-2xl md:rounded-[20px] overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_15px_35px_rgba(200,161,101,0.2)] hover:-translate-y-1 transition-all duration-500 w-full h-full";

  if (onClick) {
    return (
      <div onClick={onClick} className={className}>
        {innerContent}
      </div>
    );
  }

  return (
    <Link href={href} className={className}>
      {innerContent}
    </Link>
  );
}
