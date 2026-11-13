const PLACEHOLDER_URLS = new Set([
  "https://your-project.supabase.co",
  "https://placeholder-project.supabase.co",
]);

const PLACEHOLDER_KEYS = new Set([
  "your-anon-key",
  "your-anon-or-publishable-key",
  "your-publishable-key",
  "placeholder-anon-key",
]);

export type SupabaseKeySource =
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export interface SupabaseConfigStatus {
  configured: boolean;
  url: string | null;
  keySource: SupabaseKeySource | null;
  missing: string[];
  invalidUrl: boolean;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  // Static property reads are required so Next.js inlines NEXT_PUBLIC_* vars in client bundles.
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const rawPublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

  const urlMissing = !rawUrl || PLACEHOLDER_URLS.has(rawUrl);
  const invalidUrl = !urlMissing && !isValidHttpUrl(rawUrl);

  const hasAnonKey = Boolean(rawAnonKey && !PLACEHOLDER_KEYS.has(rawAnonKey));
  const hasPublishableKey = Boolean(
    rawPublishableKey && !PLACEHOLDER_KEYS.has(rawPublishableKey)
  );

  const keySource: SupabaseKeySource | null = hasAnonKey
    ? "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    : hasPublishableKey
      ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      : null;

  const missing: string[] = [];
  if (urlMissing) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!keySource) {
    missing.push(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)"
    );
  }

  return {
    configured: !urlMissing && !invalidUrl && keySource !== null,
    url: !urlMissing && !invalidUrl ? rawUrl : null,
    keySource,
    missing,
    invalidUrl,
  };
}

export function hasSupabasePublicEnv(): boolean {
  return getSupabaseConfigStatus().configured;
}

export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const status = getSupabaseConfigStatus();
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const rawPublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  const anonKey =
    status.keySource === "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      ? rawAnonKey
      : status.keySource === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
        ? rawPublishableKey
        : "";

  if (!status.configured || !status.url || !anonKey) {
    const reasons: string[] = [];
    if (status.missing.length > 0) {
      reasons.push(`missing ${status.missing.join(", ")}`);
    }
    if (status.invalidUrl) {
      reasons.push("NEXT_PUBLIC_SUPABASE_URL is not a valid http(s) URL");
    }
    throw new Error(
      `Supabase environment is not configured: ${reasons.join("; ")}.`
    );
  }

  return { url: status.url, anonKey };
}

