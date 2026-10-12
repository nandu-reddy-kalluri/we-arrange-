"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  Shield,
  Flag,
  Globe,
} from "lucide-react";
import { adminDataService, AdminPageRecord, PageSectionContent } from "@/services/admin/adminDataService";

export default function AdminPageEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const slug = resolvedParams.slug;

  const [page, setPage] = useState<AdminPageRecord | null>(null);
  const [content, setContent] = useState<PageSectionContent | null>(null);
  const [originalContent, setOriginalContent] = useState<PageSectionContent | null>(null);
  const [openSection, setOpenSection] = useState<string>("hero");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await adminDataService.getPageBySlug(slug);
      if (data) {
        setPage(data);
        setContent(JSON.parse(JSON.stringify(data.content)));
        setOriginalContent(JSON.parse(JSON.stringify(data.content)));
      }
    }
    load();
  }, [slug]);

  if (!page || !content) {
    return (
      <div className="py-12 text-center text-neutral-400 font-medium">
        Loading editor for {slug}...
      </div>
    );
  }

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? "" : id);
  };

  const handleDiscard = () => {
    if (originalContent) {
      setContent(JSON.parse(JSON.stringify(originalContent)));
      setToastMessage("Changes reverted to last saved state.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    setIsSaving(true);
    const res = await adminDataService.savePageContent(slug, content);
    setIsSaving(false);
    setOriginalContent(JSON.parse(JSON.stringify(content)));
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-28 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#8B263E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C8A165]/50 text-xs font-bold flex items-center gap-2.5 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-[#C8A165]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/concierge-portal/pages"
            className="p-2 rounded-xl bg-white border border-[#E5E0D8] text-neutral-600 hover:text-neutral-900 transition-colors"
            title="Back to Pages Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-2xl text-neutral-900 tracking-tight">
                {page.title}
              </h1>
              <span className="text-[11px] font-mono text-[#8B263E] bg-[#FAF5ED] px-2 py-0.5 rounded-md">
                {page.routeUrl}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Modify layout copy, imagery, promotions, and metadata.
            </p>
          </div>
        </div>

        <Link
          href={page.routeUrl}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E0D8] text-neutral-700 hover:text-[#8B263E] text-xs font-semibold shadow-sm transition-colors"
        >
          <span>Preview Live Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Accordion Editor Blocks */}
      <div className="space-y-4">
        {/* 1. HERO SECTION ACCORDION */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("hero")}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-[#FAF9F6] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FAF5ED] flex items-center justify-center text-[#8B263E] font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-neutral-900">
                  Hero Section
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Primary banner headline, subtitle, badge, and hero photograph.
                </p>
              </div>
            </div>
            {openSection === "hero" ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {openSection === "hero" && (
            <div className="px-6 pb-6 pt-2 border-t border-[#E5E0D8] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Category / Tagline Badge
                  </label>
                  <input
                    type="text"
                    value={content.hero.badge}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={content.hero.ctaText}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, ctaText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={content.hero.headline}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, headline: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Subheading Description
                </label>
                <textarea
                  rows={3}
                  value={content.hero.subhead}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, subhead: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                />
              </div>

              {/* Hero Image & Live Preview */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Hero Image URL
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <input
                    type="text"
                    value={content.hero.heroImage}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, heroImage: e.target.value },
                      })
                    }
                    className="flex-1 w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                  />
                  {content.hero.heroImage && (
                    <div className="relative w-28 h-16 rounded-xl overflow-hidden border border-[#E5E0D8] bg-neutral-100 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={content.hero.heroImage}
                        alt="Hero preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. TRUST STRIP ACCORDION */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("trust")}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-[#FAF9F6] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FAF5ED] flex items-center justify-center text-[#8B263E] font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-neutral-900">
                  Trust Strip &amp; Guarantee Badges
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Key metrics, client savings proof, and verified quality promise.
                </p>
              </div>
            </div>
            {openSection === "trust" ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {openSection === "trust" && (
            <div className="px-6 pb-6 pt-2 border-t border-[#E5E0D8] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Statistic 1 (Number)
                  </label>
                  <input
                    type="text"
                    value={content.trustStrip.stat1Number}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        trustStrip: {
                          ...content.trustStrip,
                          stat1Number: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Statistic 1 Label
                  </label>
                  <input
                    type="text"
                    value={content.trustStrip.stat1Label}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        trustStrip: {
                          ...content.trustStrip,
                          stat1Label: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Statistic 2 (Number)
                  </label>
                  <input
                    type="text"
                    value={content.trustStrip.stat2Number}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        trustStrip: {
                          ...content.trustStrip,
                          stat2Number: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Statistic 2 Label
                  </label>
                  <input
                    type="text"
                    value={content.trustStrip.stat2Label}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        trustStrip: {
                          ...content.trustStrip,
                          stat2Label: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Guarantee / Promise Statement
                </label>
                <input
                  type="text"
                  value={content.trustStrip.guaranteeText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      trustStrip: {
                        ...content.trustStrip,
                        guaranteeText: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. PROMOTIONAL BANNERS ACCORDION */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("banners")}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-[#FAF9F6] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FAF5ED] flex items-center justify-center text-[#8B263E] font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-neutral-900">
                  Promotional Banners
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Seasonal discounts, wedding season announcements, and CTAs.
                </p>
              </div>
            </div>
            {openSection === "banners" ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {openSection === "banners" && (
            <div className="px-6 pb-6 pt-2 border-t border-[#E5E0D8] space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8]">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-800">
                    Banner Active Status
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Toggle banner visibility on the public page.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={content.banners.active}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      banners: { ...content.banners, active: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-[#8B263E] rounded border-[#E5E0D8] focus:ring-[#8B263E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Banner Title
                </label>
                <input
                  type="text"
                  value={content.banners.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      banners: { ...content.banners, title: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Banner Subtitle / Copy
                </label>
                <input
                  type="text"
                  value={content.banners.subtitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      banners: { ...content.banners, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Destination Link URL
                  </label>
                  <input
                    type="text"
                    value={content.banners.linkUrl}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        banners: { ...content.banners, linkUrl: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Banner Background Image
                  </label>
                  <input
                    type="text"
                    value={content.banners.bannerImage}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        banners: {
                          ...content.banners,
                          bannerImage: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. CONCIERGE JOURNEY ACCORDION */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("journey")}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-[#FAF9F6] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FAF5ED] flex items-center justify-center text-[#8B263E] font-bold text-xs">
                4
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-neutral-900">
                  Concierge 3-Step Journey
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Step titles and brief descriptions explaining the concierge flow.
                </p>
              </div>
            </div>
            {openSection === "journey" ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {openSection === "journey" && (
            <div className="px-6 pb-6 pt-2 border-t border-[#E5E0D8] space-y-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8] space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#8B263E]">Step 1</span>
                <input
                  type="text"
                  placeholder="Step 1 Title"
                  value={content.conciergeJourney.step1Title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      conciergeJourney: {
                        ...content.conciergeJourney,
                        step1Title: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg font-bold"
                />
                <textarea
                  rows={2}
                  placeholder="Step 1 Description"
                  value={content.conciergeJourney.step1Desc}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      conciergeJourney: {
                        ...content.conciergeJourney,
                        step1Desc: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg font-medium"
                />
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8] space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#8B263E]">Step 2</span>
                <input
                  type="text"
                  placeholder="Step 2 Title"
                  value={content.conciergeJourney.step2Title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      conciergeJourney: {
                        ...content.conciergeJourney,
                        step2Title: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg font-bold"
                />
                <textarea
                  rows={2}
                  placeholder="Step 2 Description"
                  value={content.conciergeJourney.step2Desc}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      conciergeJourney: {
                        ...content.conciergeJourney,
                        step2Desc: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg font-medium"
                />
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8] space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#8B263E]">Step 3</span>
                <input
                  type="text"
                  placeholder="Step 3 Title"
                  value={content.conciergeJourney.step3Title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      conciergeJourney: {
                        ...content.conciergeJourney,
                        step3Title: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg font-bold"
                />
                <textarea
                  rows={2}
                  placeholder="Step 3 Description"
                  value={content.conciergeJourney.step3Desc}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      conciergeJourney: {
                        ...content.conciergeJourney,
                        step3Desc: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-lg font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. SEO METADATA ACCORDION */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("seo")}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-[#FAF9F6] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FAF5ED] flex items-center justify-center text-[#8B263E] font-bold text-xs">
                5
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-neutral-900">
                  SEO &amp; OpenGraph Metadata
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Search engine title, meta description, indexing keywords, and social preview card.
                </p>
              </div>
            </div>
            {openSection === "seo" ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {openSection === "seo" && (
            <div className="px-6 pb-6 pt-2 border-t border-[#E5E0D8] space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Page Meta Title
                </label>
                <input
                  type="text"
                  value={content.seo.metaTitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      seo: { ...content.seo, metaTitle: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={content.seo.metaDescription}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      seo: { ...content.seo, metaDescription: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={content.seo.keywords}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      seo: { ...content.seo, keywords: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Social Share Image URL (OG:Image)
                </label>
                <input
                  type="text"
                  value={content.seo.ogImage}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      seo: { ...content.seo, ogImage: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xs text-neutral-500 hidden sm:block">
            Editing <span className="font-bold text-neutral-900">{page.title}</span> content template
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDiscard}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-[#8B263E] hover:bg-[#721f33] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
