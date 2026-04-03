import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  // 🔹 Try Astro env first (build-time)
  const url = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;

  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

  // 🔹 Debug (only logs on server)
  if (!url || !key) {
    console.error("❌ Supabase ENV missing", {
      importMetaUrl: import.meta.env.PUBLIC_SUPABASE_URL,
      processUrl: process.env.PUBLIC_SUPABASE_URL,
    });

    throw new Error("Missing Supabase env vars");
  }

  // 🔹 Create client at runtime (NOT at import time)
  return createClient(url, key);
}
