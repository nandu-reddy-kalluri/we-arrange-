import React from "react";
import { cn } from "@we-arrange/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold uppercase tracking-wider rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B263E]/30";

    const variantStyles = {
      primary:
        "bg-[#8B263E] hover:bg-[#701E31] text-white shadow-sm hover:shadow-md",
      secondary:
        "bg-[#F5EEE7] hover:bg-[#EBDDCF] text-[#8B263E]",
      outline:
        "border border-neutral-200 hover:border-[#8B263E]/40 text-neutral-800 bg-white hover:bg-neutral-50 shadow-sm",
      ghost:
        "text-neutral-600 hover:text-[#8B263E] hover:bg-[#F5EEE7]",
    };

    const sizeStyles = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-2.5 text-xs lg:text-sm",
      lg: "px-8 py-3.5 text-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
