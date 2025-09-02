"use client";

import { useEffect, useRef, useState } from "react";
import { useProjects } from "../store/useProjects";
import type { Clip } from "../lib/db";

function AudioRecorder() {
  const { activeId, addClip, getClipsFor } = useProjects((s) => ({
    activeId: s.activeId,
    addClip: s.addClip,
    getClipsFor: s.getClipsFor,
  }));

  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  // Refs to avoid stale closures
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startMsRef = useRef<number>(0);

  // Load clips when active project changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (activeId == null) {
        setClips([]);
        return;
      }
      const list = await getClipsFor(activeId as number);
      if (mounted) setClips(list);
    })();
    return () => {
      mounted = false;
    };
  }, [activeId, getClipsFor]);

  // Revoke the latest preview URL on unmount/change
  useEffect(() => {
    return () => {
      if (lastUrl) URL.revokeObjectURL(lastUrl);
    };
  }, [lastUrl]);

  async function start() {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mime = "audio/webm;codecs=opus";
      let recorder: MediaRecorder;

      // Attempt to create MediaRecorder with opus codec, fallback to generic webm
      try {
        recorder = new MediaRecorder(stream, { mimeType: mime });
      } catch {
        mime = "audio/webm";
        recorder = new MediaRecorder(stream, { mimeType: mime });
      }

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        const durationMs = Date.now() - startMsRef.current;

        // Instant preview
        const url = URL.createObjectURL(blob);
        setLastUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });

        if (activeId != null) {
          setSaving(true);
          try {
            await addClip(activeId, {
              projectId: activeId,
              blob,
              durationMs,
              createdAt: Date.now(),
            });
            const list = await getClipsFor(activeId);
            setClips(list ?? []);
          } catch (err) {
            console.error("clip save failed", err);
          } finally {
            setSaving(false);
          }
        }

        // Stop tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      startMsRef.current = Date.now();
      recorder.start();
      mrRef.current = recorder;
      setRecording(true);
    } catch (err) {
      console.error("microphone error:", err);
      alert("Could not access microphone. Check browser permissions.");
    }
  }

  function stop() {
    if (!recording || !mrRef.current) return;
    try {
      mrRef.current.stop();
    } finally {
      setRecording(false);
    }
  }

  // Guard for empty project
  if (!activeId) {
    return (
      <div className="rounded border border-neutral-800 bg-neutral-900/40 p-3 text-sm text-neutral-400">
        Select or create a project to record audio.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-3">
        {!recording ? (
          <button
            className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
            onClick={start}
            disabled={activeId == null}
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
        {saving && <span className="text-xs text-neutral-400">Saving clip…</span>}
      </div>

      {lastUrl && (
        <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-2">
          <div className="mb-1 text-xs text-neutral-400">Last take (preview)</div>
          <audio src={lastUrl} controls className="w-full rounded border border-neutral-800" />
        </div>
      )}

      <div className="mt-3 space-y-2">
        {clips.length === 0 ? (
          <div className="text-xs text-neutral-500">No clips yet.</div>
        ) : (
          clips.map((c) => {
            const url = URL.createObjectURL(c.blob);
            const secs = Math.max(1, Math.round((c.durationMs ?? 0) / 1000));
            return (
              <div key={c.id ?? `${c.createdAt}-${c.durationMs}`} className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-2">
                <div className="mb-1 text-xs text-neutral-400">
                  {new Date(c.createdAt).toLocaleTimeString()} • {secs}s
                </div>
                <audio controls src={url} className="w-full rounded border border-neutral-800" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AudioRecorder;