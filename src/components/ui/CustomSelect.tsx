"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function CustomSelect({
  icon,
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;
  const focused = isOpen;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 min-h-[54px] relative group transition-all duration-300 cursor-pointer"
        style={{
          background: focused ? "rgba(255,255,255,0.95)" : "rgba(255,252,248,0.85)",
          backdropFilter: "blur(12px)",
          borderRadius: "12px",
          border: `1px solid ${focused ? "rgba(200,161,101,0.6)" : "rgba(200,161,101,0.20)"}`,
          boxShadow: focused
            ? "0 0 0 4px rgba(200,161,101,0.1), 0 8px 24px -4px rgba(200,161,101,0.15)"
            : "0 2px 8px -2px rgba(0,0,0,0.05)",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = "rgba(255,255,255,0.95)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = "rgba(255,252,248,0.85)";
          }
        }}
      >
        <span
          style={{
            color: focused ? "#C8A165" : "#8B6B35",
            transition: "color 300ms ease-out, transform 300ms ease-out",
            flexShrink: 0,
            display: "flex",
            transform: focused ? "scale(1.1)" : "scale(1)",
          }}
        >
          {icon}
        </span>
        <div className="flex-grow text-left relative z-10">
          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.18em] block transition-colors duration-300 group-hover:text-neutral-700">
            {label}
          </span>
          <span className={`text-sm font-bold block mt-0.5 ${!selectedOption ? 'text-neutral-400' : 'text-neutral-charcoal'}`}>
            {displayValue}
          </span>
        </div>
        <span 
          className="text-[#C8A165] opacity-50 group-hover:opacity-100 transition-all duration-300 pointer-events-none absolute right-4"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ChevronDown className="w-4 h-4" />
        </span>
      </div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-[calc(100%+8px)] left-0 right-0 w-full md:w-[92%] md:left-[4%] z-50 overflow-hidden"
            style={{
              background: "rgba(255, 252, 248, 0.96)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "10px",
              border: "1px solid rgba(200, 161, 101, 0.3)",
              boxShadow: "0 10px 30px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset",
            }}
          >
            <div className="py-1 px-1 max-h-[200px] overflow-y-auto scrollbar-none">
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <div
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className="group relative flex items-center justify-between px-3 py-2.5 mb-[2px] last:mb-0 rounded-md cursor-pointer transition-all duration-200"
                  >
                    {/* Background (Selected Only) */}
                    {isSelected && (
                      <div className="absolute inset-0 rounded-md bg-[#E8C97A]/20" />
                    )}
                    
                    <span 
                      className={`relative z-10 text-[11px] transition-all duration-200 group-hover:translate-x-1 ${
                        isSelected ? "font-bold text-[#6F1D2C]" : "font-medium text-neutral-600 group-hover:text-[#6F1D2C]"
                      }`}
                    >
                      {option.label}
                    </span>
                    
                    {isSelected && (
                      <motion.span 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="relative z-10 text-[#C8A165]"
                      >
                        <Check className="w-4 h-4" />
                      </motion.span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
