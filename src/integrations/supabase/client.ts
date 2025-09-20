import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

// Create a function to get the Supabase client with proper SSR support
const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient;

  // Only access browser APIs when in the client environment
  if (typeof window !== 'undefined') {
    // Client-side: Create client with localStorage
    supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: window.localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } else {
    // Server-side: Create client without localStorage
    supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
};

export const supabase = getSupabaseClient();
