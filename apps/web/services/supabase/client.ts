import { createClient } from "@supabase/supabase-js";

// Ensure this client is only instantiated on the client-side or where environment variables are safely exposed to the browser.
// If variables are missing, we still create the client but API calls will fail gracefully, which the UI will catch.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co", // Fallback to prevent immediate crash if missing
  supabaseAnonKey || "placeholder-anon-key"
);
