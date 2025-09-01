// lib/supabase-actions.ts
import { sb } from "@/lib/supabase";

export type ProjectRow = {
  id: string;
  user_id: string;
  title: string;
  bpm: number | null;
  song_key: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Create a short-lived signed URL for an audio file in the `clips` bucket.
 * @param storage_path - Path of the file in the `clips` bucket.
 * @param expiresSec - Expiration time in seconds (default 5 minutes).
 * @returns A temporary signed URL string.
 */
export async function getClipUrl(storage_path: string, expiresSec = 60 * 5): Promise<string> {
  const s = sb();
  const { data, error } = await s.storage
    .from("clips")
    .createSignedUrl(storage_path, expiresSec);
  if (error) throw new Error(`clip-url-failed:${error.message}`);
  return data.signedUrl;
}

/**
 * Inserts a new project for the signed-in user and ensures a notes row exists.
 * Uses `upsert` instead of `.onConflict()`.
 * @param title - Title of the project.
 * @param bpm - Optional BPM value.
 * @param song_key - Optional key.
 * @returns The created project row.
 */
export async function createProject(
  title: string,
  bpm?: number,
  song_key?: string
): Promise<ProjectRow> {
  const s = sb();

  const { data: userData, error: userErr } = await s.auth.getUser();
  if (userErr) throw new Error(`auth-failed:${userErr.message}`);
  const user = userData.user;
  if (!user) throw new Error("unauthenticated");

  const { data, error } = await s
    .from("projects")
    .insert({ user_id: user.id, title, bpm, song_key })
    .select("*")
    .single();

  if (error) {
    if (error.code === "42501") throw new Error("forbidden:policy");
    if (error.code === "23514") throw new Error("constraint-failed");
    throw new Error(`insert-failed:${error.message}`);
  }

  await s
    .from("notes")
    .upsert({ project_id: data.id, content: "" }, { onConflict: "project_id", ignoreDuplicates: true });

  return data as ProjectRow;
}