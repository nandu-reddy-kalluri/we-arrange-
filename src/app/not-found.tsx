import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-cream flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
        <h1 className="font-serif text-[120px] font-bold text-accent-gold leading-none">404</h1>
        <h2 className="font-serif text-h3 font-bold text-neutral-charcoal">Page Not Found</h2>
        <p className="text-sm font-semibold text-neutral-muted max-w-sm">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="mt-4 px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-primary hover:bg-primary-dark transition-all duration-300 shadow-sm"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
