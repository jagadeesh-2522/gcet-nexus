import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types";

// Used in Client Components. Reads the anon key only — never the
// service role key, which must stay server-side.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
