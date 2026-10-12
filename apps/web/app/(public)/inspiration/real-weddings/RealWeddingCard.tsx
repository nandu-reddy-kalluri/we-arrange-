"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, Calendar, Camera } from "lucide-react";
import { RealWeddingDetail } from "@/mock-data/real-weddings";
import { motion } from "framer-motion";

interface RealWeddingCardProps {
  wedding: RealWeddingDetail;
  index?: number;
}

export function RealWeddingCard({ wedding, index = 0 }: RealWeddingCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const href = `/inspiration/real-weddings/${wedding.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.5) }}
      className="h-full"
    >
      <Link
        href={href}
        className="group flex flex-col bg-white rounded-[20px] border border-[#E8D8BC]/30 shadow-sm overflow-hidden cursor-pointer hover:-translate-y-[6px] hover:shadow-[0_20px_40px_rgba(200,161,101,0.15)] transition-all duration-300 h-full"
      >
        {/* Image Container 16:10 */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-100">
          <Image
            src={wedding.heroImage}
            alt={wedding.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onLoad={() => setImageLoaded(true)}
            className={`object-cover transition-all duration-500 ease-out group-hover:scale-[1.05] ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
          />
          
          {/* Soft vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
          
          {/* Theme Tag */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8B6B35]">
              {wedding.theme}
            </span>
          </div>
          
          {/* Date on image */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white z-10">
            <div className="flex items-center gap-1.5 text-xs font-semibold drop-shadow-md">
              <Calendar className="w-3.5 h-3.5" />
              <span>{wedding.date}</span>
            </div>
            {wedding.photographer && (
              <div className="flex items-center gap-1 text-[10px] font-medium opacity-90 drop-shadow-md bg-black/20 px-2 py-1 rounded-md backdrop-blur-sm">
                <Camera className="w-3 h-3" />
                <span>{wedding.photographer}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Content */}
        <div className="flex flex-col flex-grow p-5 bg-white z-10 relative">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C8A165] mb-2 group-hover:text-[#8B263E] transition-colors duration-300">
            {wedding.coupleNames}
          </h4>
          <h3 className="font-serif text-[18px] font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-[#C8A165] transition-colors duration-300 mb-3">
            {wedding.title}
          </h3>
          
          <div className="flex items-start gap-1.5 mb-3 text-neutral-500">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C8A165]/70" />
            <span className="text-[13px] font-medium leading-tight">
              {wedding.venue}, {wedding.city}
            </span>
          </div>
          
          <p className="text-[13px] text-neutral-500 leading-relaxed line-clamp-2 mb-5 flex-grow">
            {wedding.shortDescription}
          </p>

          {/* Action link */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between mt-auto">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C8A165] group-hover:text-[#8B263E] transition-colors duration-300">
              View Story
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center group-hover:bg-[#C8A165] transition-all duration-300">
              <ChevronRight className="w-4 h-4 text-[#C8A165] group-hover:text-white transition-colors duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
