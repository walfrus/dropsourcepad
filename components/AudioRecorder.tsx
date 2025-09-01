"use client";
import { useEffect, useState } from "react";
import { useProjects } from "@/store/useProjects";

export default function AudioRecorder() {
  const { activeId, addClip } = useProjects();
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [url, setUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);

  // revoke URL when component unmounts or url changes
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      setChunks([]);
      mr.ondataavailable = (e) => setChunks((prev) => prev.concat(e.data));
      mr.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const dur = await estimateDuration(blob);
        const u = URL.createObjectURL(blob);
        setUrl(u);
        if (activeId) {
          setSaving(true);
          try {
            await addClip(activeId, {
              projectId: activeId,
              blob,
              durationMs: dur,
              createdAt: Date.now(),
            });
          } finally {
            setSaving(false);
          }
        }
      };
      mr.start();
      setRec(mr);
      setRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }
  };

  const stop = () => {
    rec?.stop();
    rec?.stream.getTracks().forEach((t) => t.stop());
    setRec(null);
    setRecording(false);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-3">
        {!recording ? (
          <button
            className="rounded bg-sky-500/80 px-4 py-2 hover:bg-sky-500"
            onClick={start}
          >
            ● Record
          </button>
        ) : (
          <button
            className="rounded bg-rose-500/80 px-4 py-2 hover:bg-rose-500"
            onClick={stop}
          >
            ■ Stop
          </button>
        )}
        {saving && (
          <span className="text-xs text-neutral-400">Saving clip…</span>
        )}
      </div>
      {url && (
        <audio src={url} controls className="w-full rounded border border-neutral-800" />
      )}
    </div>
  );
}

// lightweight duration estimate
async function estimateDuration(blob: Blob): Promise<number> {
  return new Promise((res) => {
    const a = document.createElement("audio");
    a.src = URL.createObjectURL(blob);
    a.addEventListener("loadedmetadata", () => {
      res((a.duration || 0) * 1000);
    });
  });
}