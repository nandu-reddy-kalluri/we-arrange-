import React from "react";

export function InspirationSkeletonLoader({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col bg-white rounded-[20px] border border-[#E8D8BC]/20 shadow-sm overflow-hidden animate-pulse h-full min-h-[360px]"
        >
          {/* Image Placeholder */}
          <div className="relative w-full aspect-[16/10] bg-neutral-200/80" />
          
          {/* Content Placeholder */}
          <div className="flex flex-col flex-grow p-5 space-y-3">
            <div className="w-1/3 h-3 bg-neutral-200 rounded-full" />
            <div className="w-4/5 h-5 bg-neutral-200 rounded-md" />
            <div className="w-full h-3 bg-neutral-100 rounded" />
            <div className="w-2/3 h-3 bg-neutral-100 rounded" />

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between mt-auto">
              <div className="w-20 h-3 bg-neutral-200 rounded" />
              <div className="w-8 h-8 rounded-full bg-neutral-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
