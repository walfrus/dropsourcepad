// utils/uploadClip.ts
import { sb } from "@/lib/supabase";

export async function uploadClip(projectId: string, blob: Blob, durationMs = 0) {
  const s = sb();
  const { data: { user }, error: uErr } = await s.auth.getUser();
  if (uErr || !user) throw new Error("Not signed in");

  const clipId = crypto.randomUUID();
  const path = `clips/${user.id}/${projectId}/${clipId}.webm`;

  // 1) upload file
  const up = await s.storage.from("clips").upload(path, blob, {
    contentType: "audio/webm",
    upsert: false,
  });
  if (up.error) throw up.error;

  // 2) insert row
  const ins = await s.from("clips").insert({
    id: clipId, project_id: projectId, storage_path: path, duration_ms: durationMs
  }).select().single();
  if (ins.error) throw ins.error;

  return ins.data; // { id, storage_path, ... }
}