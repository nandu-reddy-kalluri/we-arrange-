import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

let browserClient: SupabaseClient | undefined;

export function createSupabaseBrowserClient(): SupabaseClient {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}

function getOrCreateBrowserClient(): SupabaseClient {
  if (typeof window === "undefined") {
    return createSupabaseBrowserClient();
  }
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient();
  }
  return browserClient;
}

// Lazy proxy preserves existing `supabase` imports without crashing module evaluation
// during static build when env vars are absent, while still failing loudly on use.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getOrCreateBrowserClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
