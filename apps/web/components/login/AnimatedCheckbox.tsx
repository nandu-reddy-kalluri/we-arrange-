"use client";

import React from "react";
import { motion } from "framer-motion";
import { UseFormRegisterReturn } from "react-hook-form";

interface AnimatedCheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  register?: UseFormRegisterReturn;
  disabled?: boolean;
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  id,
  label,
  checked = false,
  onChange,
  register,
  disabled = false,
}) => {
  const [isChecked, setIsChecked] = React.useState(checked);

  React.useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleToggle = () => {
    if (disabled) return;
    const nextState = !isChecked;
    setIsChecked(nextState);
    if (onChange) onChange(nextState);
  };

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group text-left ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={isChecked}
          disabled={disabled}
          {...register}
          onChange={(e) => {
            setIsChecked(e.target.checked);
            if (onChange) onChange(e.target.checked);
            if (register?.onChange) register.onChange(e);
          }}
          className="sr-only"
        />

        {/* Outer Checkbox Frame */}
        <motion.div
          animate={{
            scale: isChecked ? 1.05 : 1,
            borderColor: isChecked ? "#C5A880" : "rgba(197,168,128,0.4)",
            backgroundColor: isChecked ? "#8B263E" : "rgba(255,255,255,0.6)",
          }}
          transition={{ duration: 0.2 }}
          className="w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 group-hover:border-[#C5A880] shadow-sm"
        >
          {/* Animated Gold SVG Checkmark */}
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M2.5 7L5.5 10L11.5 4"
              stroke="#C5A880"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: isChecked ? 1 : 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Label Text */}
      <span className="text-xs sm:text-sm font-medium text-[#6D6D6D] dark:text-[#D1C7BD] group-hover:text-[#8B263E] dark:group-hover:text-[#C5A880] transition-colors duration-200">
        {label}
      </span>
    </label>
  );
};

export default AnimatedCheckbox;
