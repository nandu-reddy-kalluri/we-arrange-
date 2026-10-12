import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { realWeddingDetails } from "@/mock-data/real-weddings";
import { realWeddings } from "@/mock-data/inspiration";
import { InspirationCard } from "@/features/inspiration/components/InspirationCard";
import { MapPin, Calendar, Camera, Palette, Scissors, Users, Utensils, IndianRupee, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { typography, spacing, layout } from "@/styles";


export default async function RealWeddingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wedding = realWeddingDetails[slug];

  if (!wedding) {
    notFound();
  }

  // Get related weddings (excluding current one)
  const relatedWeddings = realWeddings.filter(w => w.slug !== wedding.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FBF9F6] pb-0">
      {/* Breadcrumbs */}
      <div className="border-b border-[#E8D8BC]/30 bg-white/80 backdrop-blur-md sticky top-[72px] md:top-[88px] z-40">
        <div className={`${layout.maxWidth} px-4 sm:px-6 py-3 flex items-center text-xs font-medium text-neutral-500`}>
          <Link href="/" className="hover:text-[#C8A165] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2 opacity-50" />
          <Link href="/inspiration" className="hover:text-[#C8A165] transition-colors">Inspiration</Link>
          <ChevronRight className="w-3 h-3 mx-2 opacity-50" />
          <Link href="/inspiration" className="hover:text-[#C8A165] transition-colors">Real Weddings</Link>
          <ChevronRight className="w-3 h-3 mx-2 opacity-50" />
          <span className="text-neutral-900 font-bold">{wedding.coupleNames}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[70vh] bg-neutral-900 overflow-hidden">
        <Image
          src={wedding.heroImage}
          alt={wedding.title}
          fill
          unoptimized
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-24">
          <div className={`${layout.maxWidth} px-4 sm:px-6 w-full`}>
            <span className="text-[10px] sm:text-xs font-black uppercase text-[#C8A165] tracking-[0.3em] mb-4 block">
              Real Wedding • {wedding.theme}
            </span>
            <h1 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">
              {wedding.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base font-medium">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#C8A165]" />
                {wedding.coupleNames}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C8A165]" />
                {wedding.venue}, {wedding.city}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C8A165]" />
                {wedding.date}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${layout.maxWidth} px-4 sm:px-6 mt-16 md:mt-24`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Story & Gallery */}
          <div className="lg:col-span-8 flex flex-col gap-16">
            
            {/* Story */}
            <section>
              <h2 className="font-serif text-3xl text-neutral-900 mb-6">Their Love Story</h2>
              <p className="text-neutral-600 text-lg leading-relaxed">
                {wedding.story}
              </p>
            </section>

            {/* Highlights */}
            <section className="bg-white p-8 md:p-12 rounded-[20px] border border-[#E8D8BC]/30 shadow-sm">
              <h3 className="font-serif text-2xl text-neutral-900 mb-8 border-b border-[#E8D8BC]/30 pb-4">
                Style & Details
              </h3>
              
              <div className="flex flex-col gap-8">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#C8A165]" /> Decor Highlights
                  </h4>
                  <p className="text-neutral-600 leading-relaxed">{wedding.decorHighlights}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-[#C8A165]" /> Bridal Outfit
                    </h4>
                    <p className="text-neutral-600 leading-relaxed text-sm">{wedding.bridalOutfitDetails}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-[#C8A165]" /> Groom Outfit
                    </h4>
                    <p className="text-neutral-600 leading-relaxed text-sm">{wedding.groomOutfitDetails}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Image Gallery (Masonry Style) */}
            <section>
              <h2 className="font-serif text-3xl text-neutral-900 mb-8 flex items-center justify-between">
                Wedding Album
                <span className="text-sm font-sans font-medium text-neutral-500 uppercase tracking-widest">
                  {wedding.gallery.length} Photos
                </span>
              </h2>
              
              <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                {wedding.gallery.map((img, index) => (
                  <div key={index} className="break-inside-avoid relative rounded-xl overflow-hidden group">
                    <Image
                      src={img}
                      alt={`${wedding.coupleNames} wedding photo ${index + 1}`}
                      width={600}
                      height={800}
                      unoptimized
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Vendors & Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-[140px] flex flex-col gap-8">
              
              {/* Vendors Box */}
              <div className="bg-white rounded-[20px] border border-[#E8D8BC]/50 shadow-lg shadow-[#C8A165]/5 p-8">
                <h3 className="font-serif text-2xl text-neutral-900 mb-6 pb-4 border-b border-[#E8D8BC]/30">
                  The Dream Team
                </h3>
                
                <ul className="flex flex-col gap-5">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#C8A165]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">Venue</span>
                      <span className="text-sm font-bold text-neutral-900">{wedding.vendors.venue}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4 text-[#C8A165]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">Photography</span>
                      <span className="text-sm font-bold text-neutral-900">{wedding.vendors.photographer}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center shrink-0">
                      <Palette className="w-4 h-4 text-[#C8A165]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">Decor & Design</span>
                      <span className="text-sm font-bold text-neutral-900">{wedding.vendors.decorator}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-[#C8A165]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">Makeup & Hair</span>
                      <span className="text-sm font-bold text-neutral-900">{wedding.vendors.makeupArtist}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center shrink-0">
                      <Utensils className="w-4 h-4 text-[#C8A165]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">Catering</span>
                      <span className="text-sm font-bold text-neutral-900">{wedding.vendors.catering}</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Budget Box */}
              <div className="bg-[#FAF7F2] rounded-[20px] border border-[#E8D8BC]/30 p-8 flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <IndianRupee className="w-5 h-5 text-[#8B263E]" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-neutral-500 tracking-widest block mb-1">Estimated Budget</span>
                  <span className="font-serif text-xl font-bold text-neutral-900">{wedding.budget}</span>
                </div>
              </div>

              {/* Back Button */}
              <Link 
                href="/inspiration"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Inspirations
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Real Weddings */}
      {relatedWeddings.length > 0 && (
        <div className="bg-white border-t border-[#E8D8BC]/30 mt-16 md:mt-24 pt-16 md:pt-20 pb-10 md:pb-16">
          <div className={`${layout.maxWidth} px-4 sm:px-6`}>
            <div className="flex flex-col mb-12 text-center items-center">
              <span className="font-sans text-[10px] font-black uppercase text-[#C8A165] tracking-[0.25em] block mb-3">
                More Inspiration
              </span>
              <h2 className="font-serif text-4xl text-neutral-900">
                Other Real Weddings
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {relatedWeddings.map(item => (
                <InspirationCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
