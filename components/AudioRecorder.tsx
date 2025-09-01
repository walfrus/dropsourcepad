"use client";
import { useEffect, useRef, useState } from "react";
import { useProjects } from "@/store/useProjects";

export default function AudioRecorder() {
  const { activeId, addClip } = useProjects();
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [url]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    setChunks([]);
    mr.ondataavailable = (e) => setChunks(prev => prev.concat(e.data));
    mr.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const dur = await estimateDuration(blob);
      const u = URL.createObjectURL(blob);
      setUrl(u);
      if (activeId) {
        await addClip(activeId, { projectId: activeId, blob, durationMs: dur, createdAt: Date.now() });
      }
    };
    mr.start();
    setRec(mr);
  };

  const stop = () => {
    rec?.stop();
    rec?.stream.getTracks().forEach(t => t.stop());
    setRec(null);
  };

  return (
    <div className="flex items-center gap-3">
      {!rec ? (
        <button className="rounded bg-sky-500/80 px-4 py-2 hover:bg-sky-500" onClick={start}>
          ● Record
        </button>
      ) : (
        <button className="rounded bg-rose-500/80 px-4 py-2 hover:bg-rose-500" onClick={stop}>
          ■ Stop
        </button>
      )}
      {url && (
        <audio src={url} controls className="w-full" />
      )}
    </div>
  );
}

// lightweight duration estimate
async function estimateDuration(blob: Blob): Promise<number> {
  return new Promise(res => {
    const a = document.createElement("audio");
    a.src = URL.createObjectURL(blob);
    a.addEventListener("loadedmetadata", () => {
      res((a.duration || 0) * 1000);
    });
  });
}