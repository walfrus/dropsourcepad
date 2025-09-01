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

  if (user)
    return <button onClick={() => s.auth.signOut()}>Sign out</button>;
  return (
    <button
      onClick={() =>
        s.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: location.origin },
        })
      }
    >
      Continue with Google
    </button>
  );
}