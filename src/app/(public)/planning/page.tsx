"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Calculator,
  Users,
  Clock,
  Mail,
  Heart,
  BookHeart,
} from "lucide-react";

const PLANNING_TOOLS = [
  {
    id: "checklist",
    title: "Wedding Checklist",
    description: "Track every task from engagement to reception",
    icon: CheckSquare,
    href: "/planning/checklist",
    color: "text-[#C8A165]",
    bg: "bg-[#FAF7F2]",
    border: "border-[#E8D8BC]/50",
  },
  {
    id: "budget",
    title: "Budget Planner",
    description: "Plan and track your wedding budget",
    icon: Calculator,
    href: "/planning/budget",
    color: "text-[#2D6A4F]",
    bg: "bg-[#F0F7F3]",
    border: "border-[#C5E1D1]/50",
  },
  {
    id: "guests",
    title: "Guest List",
    description: "Manage invitations and RSVPs",
    icon: Users,
    href: "/planning/guests",
    color: "text-[#4A3B69]",
    bg: "bg-[#F5F2F8]",
    border: "border-[#D6CDE3]/50",
  },
  {
    id: "timeline",
    title: "Timeline",
    description: "Build your day-of wedding schedule",
    icon: Clock,
    href: "/planning/timeline",
    color: "text-[#8B263E]",
    bg: "bg-[#FDF2F4]",
    border: "border-[#EACCD2]/50",
  },
  {
    id: "invitations",
    title: "Digital Invitations",
    description: "Create elegant digital save-the-dates",
    icon: Mail,
    href: "/planning/invitations",
    color: "text-[#C8A165]",
    bg: "bg-[#FAF7F2]",
    border: "border-[#E8D8BC]/50",
  },
  {
    id: "shortlist",
    title: "Vendor Shortlist",
    description: "Compare and finalize your vendor team",
    icon: Heart,
    href: "/planning/shortlist",
    color: "text-[#8B263E]",
    bg: "bg-[#FDF2F4]",
    border: "border-[#EACCD2]/50",
  },
  {
    id: "saved",
    title: "Saved Inspirations",
    description: "Review your curated mood boards",
    icon: BookHeart,
    href: "/planning/saved-inspirations",
    color: "text-[#4A3B69]",
    bg: "bg-[#F5F2F8]",
    border: "border-[#D6CDE3]/50",
  },
];

export default function PlanningPage() {
  return (
    <main className="min-h-screen bg-[#FBF7F2] pt-28 md:pt-36 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-10 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C8A165] block mb-3"
          >
            Your Wedding Journey
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl md:text-5xl font-bold text-neutral-900 mb-3"
          >
            Planning Tools
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-neutral-500 max-w-lg mx-auto"
          >
            Everything you need to plan your perfect celebration, from budget to
            guest list to timeline.
          </motion.p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {PLANNING_TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={tool.href}
                  className={`group block ${tool.bg} rounded-2xl p-5 md:p-6 border ${tool.border} hover:shadow-md transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`w-5 h-5 ${tool.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base md:text-lg font-bold text-neutral-900 mb-0.5 group-hover:text-[#8B263E] transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 ${tool.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-1`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Coming Soon Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-neutral-400 font-medium">
            Planning tools are being crafted for you. Stay tuned for a premium experience.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
