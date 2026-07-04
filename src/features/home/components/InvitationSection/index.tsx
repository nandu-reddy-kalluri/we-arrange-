import React from "react";
import { InvitationEditor } from "./InvitationEditor";

export default function InvitationSection() {
  return (
    <section className="py-20 lg:py-24 bg-neutral-cream relative border-t border-b border-neutral-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 flex flex-col items-center gap-3">
          <span className="font-sans text-[10px] font-black uppercase text-accent-gold tracking-[0.25em]">
            CHOOSE • Bespoke Digital Invitations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-charcoal">
            Bespoke Digital Invitations
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-neutral-muted max-w-lg leading-relaxed mt-1">
            Design stunning paperless drafts, customize themes, and manage RSVP collections in real-time.
          </p>
          <div className="w-14 h-[2px] bg-gradient-to-r from-accent-gold to-primary mt-2" />
        </div>
        <InvitationEditor />
      </div>
    </section>
  );
}
