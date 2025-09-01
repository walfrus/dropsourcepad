// lib/supabase-server.ts  (SERVER, user-scoped)
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function sbServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );
}

export async function requireUser() {
  const s = sbServer();
  const { data: { user }, error } = await s.auth.getUser();
  if (error) throw new Error(`auth-failed:${error.message}`);
  if (!user) throw new Error("unauthenticated");
  return user;
}