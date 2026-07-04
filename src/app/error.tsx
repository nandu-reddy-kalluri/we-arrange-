"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-cream flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xxl p-8 shadow-md border border-neutral-border text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="font-serif text-h3 font-bold text-neutral-charcoal">Something went wrong</h2>
        <p className="text-sm font-semibold text-neutral-muted">
          We encountered an unexpected error while loading this page. Our team has been notified.
        </p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-neutral-charcoal border border-neutral-border hover:bg-neutral-cream transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
