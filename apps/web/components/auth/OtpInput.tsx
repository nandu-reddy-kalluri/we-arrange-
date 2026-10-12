"use client";

import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export default function OtpInput({ value, onChange, length = 6, disabled = false }: OtpInputProps) {
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!val) {
      e.preventDefault();
      return;
    }
    
    // Only allow numeric input
    if (!/^[0-9]+$/.test(val)) {
      return;
    }
    
    const newVal = val.substring(val.length - 1); // Get last typed character
    
    const otpArray = value.split("");
    otpArray[index] = newVal;
    const newOtp = otpArray.join("").padEnd(length, " ").substring(0, length);
    
    const cleanOtp = newOtp.replace(/ /g, "");
    onChange(cleanOtp);

    // Focus next input
    if (index < length - 1) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const otpArray = Array.from({ length }, (_, i) => value[i] || "");
      
      if (otpArray[index]) {
        otpArray[index] = "";
        onChange(otpArray.join(""));
      } else if (index > 0) {
        otpArray[index - 1] = "";
        onChange(otpArray.join(""));
        setActiveInput(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      setActiveInput(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOnPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
    if (!/^[0-9]+$/.test(pastedData)) return;

    onChange(pastedData);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, length - 1);
    setActiveInput(nextIndex);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-2">
      {Array.from({ length }, (_, index) => {
        const val = value[index] || "";
        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={val}
            onChange={(e) => handleOnChange(e, index)}
            onKeyDown={(e) => handleOnKeyDown(e, index)}
            onPaste={handleOnPaste}
            onFocus={() => setActiveInput(index)}
            autoFocus={index === 0}
            className="w-10 h-12 sm:w-12 sm:h-14 bg-[#1A1A1A] border border-white/5 rounded-lg text-center text-[#FDFBF7] text-xl font-medium focus:outline-none focus:border-[#C6934A]/50 focus:bg-[#222222] transition-colors disabled:opacity-50"
            aria-label={`Digit ${index + 1}`}
          />
        );
      })}
    </div>
  );
}
