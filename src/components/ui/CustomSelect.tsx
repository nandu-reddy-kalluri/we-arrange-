"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, X } from "lucide-react";

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
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export function CustomSelect({
  icon,
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
  isOpen: controlledIsOpen,
  onToggle,
  onClose,
}: CustomSelectProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onToggle && controlledIsOpen) {
      onToggle();
    } else {
      setInternalIsOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [controlledIsOpen]);

  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;
  const focused = isOpen;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={handleToggle}
        className="flex items-center gap-3 px-4 py-3 min-h-[50px] md:min-h-[54px] relative group transition-all duration-300 cursor-pointer"
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
          <span className={`text-xs md:text-sm font-bold block mt-0.5 ${!selectedOption ? 'text-neutral-400' : 'text-neutral-charcoal'}`}>
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

      {/* Mobile Bottom Sheet (md:hidden) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[160] bg-[#FAF9F6] rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col"
              style={{ paddingBottom: "env(safe-area-inset-bottom)", maxHeight: "85vh" }}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
                <span className="font-serif text-lg font-bold text-neutral-800">{label}</span>
                <button onClick={handleClose} className="p-2 -mr-2 text-neutral-500 hover:text-neutral-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-3 overflow-y-auto">
                {options.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        onChange(option.value);
                        handleClose();
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-xl mb-2 last:mb-0 transition-colors"
                      style={{
                        backgroundColor: isSelected ? "rgba(139, 38, 62, 0.05)" : "transparent",
                      }}
                    >
                      <span className={`text-[15px] ${isSelected ? "font-bold text-[#8B263E]" : "font-medium text-neutral-700"}`}>
                        {option.label}
                      </span>
                      {isSelected && <Check className="w-5 h-5 text-[#8B263E]" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Dropdown (hidden md:block) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="hidden md:block absolute top-[calc(100%+6px)] left-0 right-0 w-full z-[80] overflow-hidden shadow-xl"
            style={{
              background: "rgba(255, 252, 248, 0.98)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: "12px",
              border: "1px solid rgba(200, 161, 101, 0.35)",
              boxShadow: "0 14px 36px -8px rgba(0,0,0,0.25)",
            }}
          >
            <div className="py-1 px-1 max-h-[190px] overflow-y-auto scrollbar-none">
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <div
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      handleClose();
                    }}
                    className="group relative flex items-center justify-between px-3.5 py-2.5 mb-[2px] last:mb-0 rounded-lg cursor-pointer transition-all duration-200"
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
