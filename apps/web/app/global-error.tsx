"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured error logging for APM (OPS-002)
    console.error("[YMWA_GLOBAL_ERROR]", {
      message: error?.message,
      digest: error?.digest,
      stack: error?.stack,
      ts: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FBF7F2] flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border border-[#C5A880]/30 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#8B263E]/10 flex items-center justify-center text-[#8B263E]">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We encountered an unexpected error while loading YouMarriageWeArrange.
              Our operations team has been notified.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => reset()}
              className="flex-1 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-all cursor-pointer shadow-sm"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="flex-1 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-neutral-800 border border-neutral-300 hover:border-[#8B263E] transition-all text-center"
            >
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
