import React from "react";

export function VenueCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-3xl p-5 border border-neutral-border shadow-sm flex flex-col gap-4 animate-pulse">
      <div className="relative aspect-[4/3] w-full rounded-2xl bg-neutral-border/50" />
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-neutral-border/60 rounded w-2/3" />
          <div className="h-4 bg-neutral-border/40 rounded w-8" />
        </div>
        <div className="h-3 bg-neutral-border/40 rounded w-1/2" />
        <div className="h-3 bg-neutral-border/40 rounded w-1/3" />
      </div>
      <div className="pt-3 border-t border-neutral-border/40 flex justify-between">
        <div className="h-4 bg-neutral-border/60 rounded w-1/3" />
        <div className="h-6 bg-neutral-border/40 rounded w-1/4" />
      </div>
    </div>
  );
}

export function VendorSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="w-full aspect-square rounded-full bg-neutral-border/50" />
      <div className="h-4 bg-neutral-border/60 rounded w-3/4 mx-auto" />
      <div className="h-3 bg-neutral-border/40 rounded w-1/2 mx-auto" />
    </div>
  );
}

export function TestimonialSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xxl p-8 border border-neutral-border animate-pulse flex flex-col items-center gap-6">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 rounded-full bg-neutral-border/50" />)}
      </div>
      <div className="w-full space-y-3">
        <div className="h-4 bg-neutral-border/60 rounded w-full" />
        <div className="h-4 bg-neutral-border/60 rounded w-11/12 mx-auto" />
        <div className="h-4 bg-neutral-border/60 rounded w-4/5 mx-auto" />
      </div>
      <div className="flex items-center gap-3 mt-4">
        <div className="w-10 h-10 rounded-full bg-neutral-border/60" />
        <div className="space-y-2">
          <div className="h-3 bg-neutral-border/60 rounded w-24" />
          <div className="h-2 bg-neutral-border/40 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
