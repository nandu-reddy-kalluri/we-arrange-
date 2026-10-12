import React from "react";
import { cn } from "@we-arrange/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "gold" | "success" | "neutral";
}

export function Badge({
  className,
  variant = "primary",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-[#8B263E]/10 text-[#8B263E]",
    gold: "bg-[#C5A880]/15 text-[#9E8158]",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    neutral: "bg-neutral-100 text-neutral-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
