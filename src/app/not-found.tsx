import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center bg-neutral-cream px-6 py-12 relative overflow-hidden">
      
      {/* Decorative luxury mesh background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#C5A880]/10 via-[#8B263E]/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-lg text-center space-y-6">
        
        {/* Subtle branded 404 badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FAF9F6] border border-[#C5A880]/40 shadow-sm text-2xl font-serif font-extrabold text-[#C5A880]">
          404
        </div>
        
        <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[#2D2D2D] leading-tight">
          Something went off the path.
        </h1>
        
        <p className="text-sm md:text-base text-neutral-muted leading-relaxed font-sans max-w-md">
          The celebration is still here, but the page you are looking for seems to have moved or doesn&apos;t exist. 
          Let our concierge guide you back.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
          <Link
            href="/venues"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#8B263E] text-white font-bold text-[11px] uppercase tracking-wider shadow-[0_8px_20px_rgba(139,38,62,0.2)] hover:bg-[#6e1c2f] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Explore Venues
          </Link>
          
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-[#C5A880]/50 text-neutral-charcoal hover:bg-neutral-50 hover:border-[#C5A880] font-bold text-[11px] uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back Home
          </Link>
        </div>
        
      </div>
    </main>
  );
}
