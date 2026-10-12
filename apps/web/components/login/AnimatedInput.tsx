"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { AlertCircle } from "lucide-react";

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  register?: UseFormRegisterReturn;
  error?: FieldError | string;
  icon?: React.ReactNode;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  id,
  label,
  register,
  error,
  icon,
  type = "text",
  className = "",
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(
    value || defaultValue || ""
  );

  const errorMessage = typeof error === "string" ? error : error?.message;
  const hasValue = Boolean(internalValue || value);
  const isFloating = isFocused || hasValue;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
    if (register?.onBlur) register.onBlur(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    if (onChange) onChange(e);
    if (register?.onChange) register.onChange(e);
  };

  return (
    <div className="w-full space-y-1.5 text-left">
      <div className="relative flex items-center">
        {/* Left Icon Container */}
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B263E]/60 dark:text-[#C5A880]/70 pointer-events-none transition-colors duration-200">
            {icon}
          </div>
        )}

        {/* Input Element */}
        <input
          id={id}
          type={type}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? `${id}-error` : undefined}
          {...register}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full rounded-2xl bg-white/60 dark:bg-zinc-900/60
            text-sm text-[#2D2D2D] dark:text-[#FAF9F6]
            placeholder-transparent
            pt-6 pb-2.5 ${icon ? "pl-11" : "pl-4"} pr-4
            border transition-all duration-300 outline-none
            ${
              errorMessage
                ? "border-rose-400/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-200/50"
                : isFocused
                ? "border-[#C5A880] ring-2 ring-[#C5A880]/20 bg-white/90 dark:bg-zinc-900/90 shadow-[0_0_15px_rgba(197,168,128,0.25)]"
                : "border-[#C5A880]/30 hover:border-[#C5A880]/60"
            }
            ${className}
          `}
          {...props}
        />

        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`
            absolute pointer-events-none transition-all duration-200 ease-out origin-left
            ${icon ? "left-11" : "left-4"}
            ${
              isFloating
                ? "top-2.5 text-[11px] font-semibold text-[#8B263E] dark:text-[#C5A880]"
                : "top-1/2 -translate-y-1/2 text-sm text-[#6D6D6D] dark:text-[#A19890]"
            }
          `}
        >
          {label}
        </label>

        {/* Focus Border Glow Animation */}
        <motion.div
          initial={false}
          animate={{
            scaleX: isFocused ? 1 : 0,
            opacity: isFocused ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-[#8B263E] via-[#C5A880] to-[#8B263E] rounded-full pointer-events-none origin-left"
        />
      </div>

      {/* Inline Error Message */}
      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            id={`${id}-error`}
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium pl-1"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedInput;
