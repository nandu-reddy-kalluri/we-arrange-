import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@we-arrange/auth";
import type { Database } from "./database.types";

const PLACEHOLDER_SERVICE_KEYS = new Set([
  "your-service-role-key",
  "your-server-only-service-role-key",
  "placeholder-service-role-key",
]);

function assertServerRuntime(context: string): void {
  if (typeof window !== "undefined") {
    throw new Error(`${context} cannot be called in a browser runtime.`);
  }
}

export function getSupabaseServiceRoleEnv(): { url: string; serviceRoleKey: string } {
  assertServerRuntime("getSupabaseServiceRoleEnv");

  const { url } = getSupabasePublicEnv();
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  if (!rawKey || PLACEHOLDER_SERVICE_KEYS.has(rawKey) || /[\r\n\s]/.test(rawKey)) {
    throw new Error(
      "Server Supabase service-role environment variable SUPABASE_SERVICE_ROLE_KEY is missing or invalid."
    );
  }

  return { url, serviceRoleKey: rawKey };
}

export function createPublicAnonClient(): SupabaseClient<Database> {
  const { url, anonKey } = getSupabasePublicEnv();
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createBearerSupabaseClient(accessToken: string): SupabaseClient<Database> {
  const token = accessToken.trim();
  if (!token || /[\r\n\s]/.test(token)) {
    throw new Error("A valid bearer access token is required.");
  }

  const { url, anonKey } = getSupabasePublicEnv();
  return createClient<Database>(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createServiceRoleClient(): SupabaseClient<Database> {
  assertServerRuntime("createServiceRoleClient");

  const { url, serviceRoleKey } = getSupabaseServiceRoleEnv();
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

