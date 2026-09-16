"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Play, Sparkles, X, Info } from "lucide-react";
import { EINVITE_TEMPLATES, EInviteTemplate } from "@/mock-data/e-invites";

export default function TemplatePreviewClient({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const template = EINVITE_TEMPLATES.find((t) => t.id === templateId);

  if (!template) {
    return (
      <div className="min-h-[70vh] bg-[#FBF7F2] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="font-serif text-3xl text-neutral-900 mb-4">Template Not Found</h1>
        <p className="text-neutral-600 mb-6">The template you are looking for does not exist.</p>
        <Link href="/e-invites" className="text-[#8B263E] font-bold uppercase tracking-wider text-xs">
          Back to E-Invites
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F2] pb-24 text-neutral-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">
        {/* Back Link */}
        <Link 
          href="/e-invites" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-[#8B263E] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to E-Invites
        </Link>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Image Preview */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-4 border border-[#C5A880]/15 shadow-[0_8px_30px_rgba(197,168,128,0.02)]">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-neutral-100">
              <Image
                src={template.imageUrl}
                alt={template.name}
                fill
                priority
                sizes="(max-w-7xl) 50vw, 100vw"
                className="object-cover"
              />
              {template.category === "video-invitation" && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <button 
                    onClick={() => setIsPreviewOpen(true)}
                    className="w-16 h-16 rounded-full bg-white/95 text-[#8B263E] shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Play className="w-6 h-6 fill-current pl-1" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Template Info */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B263E]/5 border border-[#8B263E]/10 mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#8B263E]">
                  {template.category.replace("-", " ")}
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-neutral-900 leading-tight mb-3">
                {template.name}
              </h1>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6 font-medium">
                {template.description}
              </p>
            </div>

            {/* Features Checked List */}
            <div className="bg-white rounded-2xl p-6 border border-[#C5A880]/15 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#C5A880] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
                <span>Template Features</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {template.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                    <div className="w-4 h-4 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-green-600" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="flex-1 py-4 bg-white border border-[#8B263E] text-[#8B263E] hover:bg-[#8B263E]/5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-sm"
              >
                Preview Template
              </button>
              <Link
                href={`/e-invites/create/${template.id}`}
                className="flex-1 py-4 bg-[#8B263E] hover:bg-[#6e1c2f] text-white rounded-full text-xs font-bold uppercase tracking-widest text-center transition-all duration-300 shadow-md hover:shadow-lg active:scale-98"
              >
                Use This Template
              </Link>
            </div>

            {/* Info Notice */}
            <div className="flex gap-3 p-4 rounded-xl bg-[#FAF5ED] border border-[#C5A880]/20 text-neutral-600">
              <Info className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium leading-relaxed">
                This is a digital template. Once selected, you can customize names, dates, events, upload photos, and generate your custom guest access link instantly.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Immersive Template Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#FBF9F6] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[3/4] max-h-[90vh] flex flex-col">
            
            {/* Header / Close */}
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Card Content Mockup */}
            <div className="flex-1 overflow-y-auto scrollbar-none p-8 md:p-12 flex flex-col items-center justify-center text-center relative select-none">
              <div className="absolute inset-4 border border-[#C5A880]/30 rounded-2xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#8B263E] mb-6">
                  Together with their families
                </span>
                
                <h2 className="font-serif font-light text-4xl sm:text-5xl text-neutral-900 leading-none mb-3">
                  Aarav
                </h2>
                <span className="font-serif text-2xl text-[#C5A880] italic mb-3">&</span>
                <h2 className="font-serif font-light text-4xl sm:text-5xl text-neutral-900 leading-none mb-10">
                  Diya
                </h2>

                <p className="text-[11px] uppercase font-bold tracking-widest text-neutral-500 mb-6 leading-relaxed">
                  Request the honor of your presence<br />
                  at the celebration of their wedding
                </p>

                <div className="h-px w-16 bg-[#C5A880]/40 my-4" />

                <p className="font-serif text-lg text-neutral-800 leading-relaxed mb-8">
                  Saturday, December 12, 2026<br />
                  at 7:00 in the evening
                </p>

                <p className="text-[10px] uppercase font-black tracking-widest text-[#8B263E] bg-[#8B263E]/5 border border-[#8B263E]/10 px-4 py-1.5 rounded-full">
                  Taj Falaknuma Palace, Hyderabad
                </p>
              </div>

              {/* Watermark/Footer */}
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold">
                  Powered by YouMarriage WeArrange
                </span>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
