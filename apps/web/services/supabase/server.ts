import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { getSupabasePublicEnv } from "@we-arrange/auth";
import type { Database } from "@we-arrange/database/types";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");
  const { url, anonKey } = getSupabasePublicEnv();

  return createServerClient<Database>(url, anonKey, {
    ...(authHeader && authHeader.toLowerCase().startsWith("bearer ")
      ? { global: { headers: { Authorization: authHeader } } }
      : {}),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Server Components cannot mutate cookies; Route Handlers and Server Actions can.
          const message = error instanceof Error ? error.message : "";
          if (
            !message.includes(
              "Cookies can only be modified in a Server Action or Route Handler"
            )
          ) {
            throw error;
          }
        }
      },
    },
  });
}
