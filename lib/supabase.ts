// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

let _sb: ReturnType<typeof createClient> | null = null;

// Return a singleton Supabase client. Call as `sb()` from other modules.
export function sb() {
  if (_sb) return _sb;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  _sb = createClient(url, key);
  return _sb;
}