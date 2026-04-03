import { createServerClient } from "@supabase/ssr";

export function createSupabaseServerClient(Astro: any) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env variables");
  }

  return createServerClient(url, key, {
    cookies: {
      get: (name) => Astro.cookies.get(name)?.value,
      set: (name, value, options) => Astro.cookies.set(name, value, options),
      remove: (name, options) => Astro.cookies.delete(name, options),
    },
  });
}
