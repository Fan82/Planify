import { createClient } from "@supabase/supabase-js";

let _client = null;

export function getSupabase() {
  if (_client) return _client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  _client = createClient(url, key);
  return _client;
}

// Export for direct imports; callers should handle null in demo mode.
export const supabase = new Proxy(
  {},
  {
    get(_, prop) {
      const client = getSupabase();
      if (!client) {
        console.warn(
          `Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local`,
        );
        return () => ({
          data: null,
          error: { message: "Supabase not configured" },
        });
      }
      return client[prop];
    },
  },
);
