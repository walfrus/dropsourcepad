// lib/supabase-actions.ts
import { sb } from "@/lib/supabase";

/**
 * Create a short-lived signed URL for an audio file in the `clips` bucket.
 * Returns a URL valid for 5 minutes.
 */
export async function getClipUrl(storage_path: string): Promise<string> {
  const s = sb();
  const { data, error } = await s.storage
    .from("clips")
    .createSignedUrl(storage_path, 60 * 5);
  if (error) throw error;
  return data.signedUrl;
}

/**
 * Inserts a new project for the signed-in user and ensures a notes row exists.
 * Uses `upsert` (with onConflict) instead of the unsupported `.onConflict()` chain.
 */
export async function createProject(
  title: string,
  bpm?: number,
  song_key?: string
) {
  const s = sb();

  // must be signed in
  const {
    data: { user },
    error: userErr,
  } = await s.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("Not signed in");

  // create project
  const { data, error } = await s
    .from("projects")
    .insert({ user_id: user.id, title, bpm, song_key })
    .select("*")
    .single();
  if (error) throw error;

  // ensure there's always a notes row for this project_id
  await s
    .from("notes")
    .upsert(
      { project_id: data.id, content: "" },
      { onConflict: "project_id", ignoreDuplicates: true }
    );

  return data; // { id, user_id, title, ... }
}