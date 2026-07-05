import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined) ||
  import.meta.env.VITE_SUPABASE_URL;

const supabaseKey =
  (typeof process !== "undefined" ? process.env.SUPABASE_ANON_KEY : undefined) ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL and Anon Key must be configured in environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getSupabaseClient(getToken: (options?: { template?: string }) => Promise<string | null>) {
  try {
    const token = await getToken({ template: "supabase" });
    if (token) {
      return createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    }
  } catch (e) {
    console.error("Error getting Supabase JWT token:", e);
  }
  return supabase;
}
