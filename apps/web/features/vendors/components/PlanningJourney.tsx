"use client";

import React from "react";
import { ArrowDown } from "lucide-react";

export function PlanningJourney() {
  const steps = [
    { num: "01", title: "Initial Consultation" },
    { num: "02", title: "Understand Your Vision" },
    { num: "03", title: "Style & Budget Planning" },
    { num: "04", title: "Personalized Proposal" },
    { num: "05", title: "Wedding Day Experience" },
  ];

  return (
    <div className="border-t border-gray-150 pt-6 mt-6">
      <span className="text-[9px] font-black uppercase text-neutral-muted block tracking-widest mb-4">
        How We Work Together
      </span>
      <div className="flex flex-col items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center text-center">
              <span className="text-[9px] font-black uppercase text-[#C5A880] tracking-widest mb-1">
                {step.num}
              </span>
              <span className="font-serif text-sm font-bold text-neutral-charcoal">
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="my-3 text-[#C5A880]/40">
                <ArrowDown className="w-4 h-4" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
