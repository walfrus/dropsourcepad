/**
 * utils/uploadClip.ts
 * Uploads an audio Blob to the private `clips` bucket, then inserts a row in `clips`.
 * Returns the inserted DB row (not a signed URL).
 */
import { sb } from "../lib/supabase";

export type ClipRow = {
  id: string;
  project_id: string;
  storage_path: string;
  duration_ms: number;
  created_at: string;
};

export async function uploadClip(
  projectId: string,
  blob: Blob,
  durationMs = 0
): Promise<ClipRow> {
  const s = sb();

  // auth
  const { data: userData, error: userErr } = await s.auth.getUser();
  if (userErr) throw new Error(`auth-failed:${userErr.message}`);
  const user = userData.user;
  if (!user) throw new Error("unauthenticated");

  // basic guards
  if (!projectId) throw new Error("invalid-project");
  if (!(blob instanceof Blob) || blob.size === 0) throw new Error("invalid-blob");

  const clipId = crypto.randomUUID();
  const path = `clips/${user.id}/${projectId}/${clipId}.webm`;

  // 1) upload file to storage (no upsert — path should be unique)
  const uploadRes = await s.storage.from("clips").upload(path, blob, {
    contentType: "audio/webm",
    upsert: false,
  });
  if (uploadRes.error) {
    // StorageError exposes `statusCode` (not `status`)
    const code = (uploadRes.error as { statusCode?: number }).statusCode;
    if (code === 409) throw new Error("storage-conflict"); // path exists
    if (code === 413) throw new Error("storage-too-large"); // file too big
    throw new Error(`storage-upload-failed:${uploadRes.error.message}`);
  }

  // 2) insert DB row
  const clipsTable = s.from("clips") as any;
  const { data, error } = await clipsTable
    .insert({
      id: clipId,
      project_id: projectId,
      storage_path: path,
      duration_ms: durationMs,
    })
    .select("*")
    .single();

  if (error) {
    // (Optional) best effort rollback of storage if DB insert fails
    await s.storage.from("clips").remove([path]).catch(() => {});
    if (error.code === "42501") throw new Error("forbidden:policy");
    throw new Error(`db-insert-failed:${error.message}`);
  }

  return data as ClipRow;
}