"use client";
import { useEffect, useState } from "react";
import { useProjects } from "../store/useProjects";

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
            className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
            onClick={start}
          >
            ● Record
          </button>
        ) : (
          <button
            className="mt-4 flex items-center gap-2 rounded-lg bg-neutral-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-600"
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