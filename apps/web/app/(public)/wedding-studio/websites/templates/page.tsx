import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function WebsiteTemplatesPlaceholderPage() {
  return (
    <main className="min-h-[70vh] bg-[#FBF8F4] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[#4A7C59]/10 flex items-center justify-center mb-6">
         <span className="text-2xl">✨</span>
      </div>
      <h1 className="font-serif text-3xl md:text-5xl text-neutral-900 mb-4">Website Templates</h1>
      <p className="text-neutral-600 mb-8 max-w-md">
        Our full template gallery is coming soon.
      </p>
      <Link 
        href="/wedding-studio"
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#4A7C59] hover:text-[#386044] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Wedding Studio
      </Link>
    </main>
  );
}
