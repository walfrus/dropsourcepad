// components/GoogleButton.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { sb } from "../lib/supabase";

export function GoogleButton() {
  const s = useMemo(() => sb(), []);
  const [user, setUser] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    s.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user);
    });

    const { data: { subscription } } = s.auth.onAuthStateChange((_e, sess) => {
      if (mounted) setUser(sess?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [s]);

  if (user) {
    return (
      <button
        onClick={async () => {
          try {
            setBusy(true);
            await s.auth.signOut();
          } finally {
            setBusy(false);
          }
        }}
        disabled={busy}
        className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600 disabled:opacity-60"
      >
        {busy ? "Signing out..." : "Sign out"}
      </button>
    );
  }

  return (
    <button
      onClick={async () => {
        try {
          setBusy(true);
          await s.auth.signInWithOAuth({
            provider: "google",
            // You can omit redirectTo and let Supabase use Site URL,
            // but this is fine:
            options: { redirectTo: `${location.origin}/` },
          });
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy}
      className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-black hover:bg-brand/80 disabled:opacity-60"
    >
      {busy ? "Opening Google..." : "Continue with Google"}
    </button>
  );
}