// components/GoogleButton.tsx
"use client";
import { sb } from "../lib/supabase";
import { useEffect, useState } from "react";

export function GoogleButton() {
  const s = sb();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    s.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = s.auth.onAuthStateChange((_e, sess) =>
      setUser(sess?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (user) {
    return (
      <button
        onClick={() => s.auth.signOut()}
        className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
      >
        Sign out
      </button>
    );
  }
  return (
    <button
      onClick={() =>
        s.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${location.origin}/` }
        })
      }
      className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-black hover:bg-brand/80"
    >
      Continue with Google
    </button>
  );
}