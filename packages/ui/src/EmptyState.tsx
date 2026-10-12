import React from "react";
import { cn } from "@we-arrange/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-3xl border border-[#8B263E]/10 p-8 md:p-12 text-center max-w-lg mx-auto shadow-sm my-6",
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-[#FAF9F6] flex items-center justify-center mx-auto mb-4 text-[#8B263E] text-2xl">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-xl font-bold text-[#2D2D2D] mb-2">{title}</h3>
      <p className="text-neutral-600 text-xs md:text-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
