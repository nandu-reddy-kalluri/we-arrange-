"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: string;
  register?: UseFormRegisterReturn;
  error?: FieldError | string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  register,
  error,
  className = "",
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
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
        {/* Lock Icon */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B263E]/60 dark:text-[#C5A880]/70 pointer-events-none transition-colors duration-200">
          <Lock className="w-4 h-4" />
        </div>

        {/* Input */}
        <input
          id={id}
          type={showPassword ? "text" : "password"}
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
            pt-6 pb-2.5 pl-11 pr-11
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
            absolute pointer-events-none transition-all duration-200 ease-out origin-left left-11
            ${
              isFloating
                ? "top-2.5 text-[11px] font-semibold text-[#8B263E] dark:text-[#C5A880]"
                : "top-1/2 -translate-y-1/2 text-sm text-[#6D6D6D] dark:text-[#A19890]"
            }
          `}
        >
          {label}
        </label>

        {/* Toggle Visibility Button */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#6D6D6D] dark:text-[#A19890] hover:text-[#8B263E] dark:hover:text-[#C5A880] focus:outline-none transition-colors duration-200 rounded-full"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>

        {/* Focus Line Animation */}
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

      {/* Error Message */}
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

export default PasswordInput;
