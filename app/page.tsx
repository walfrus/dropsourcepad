"use client";
import ProjectSidebar from "@/components/ProjectSidebar";
import AudioRecorder from "@/components/AudioRecorder";
import LyricEditor from "@/components/LyricEditor";
import { useProjects } from "@/store/useProjects";
import { useEffect, useState } from "react";

export default function Home() {
  const { activeId } = useProjects();
  const [bpm, setBpm] = useState<number | "">("");

  return (
    <main className="h-dvh flex">
      <ProjectSidebar />
      <section className="flex-1 p-4 space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-wide">DropSource — Song Sketchpad</h1>
          <div className="text-sm text-neutral-400">MVP • local only</div>
        </header>

        {activeId ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded border border-neutral-800 p-3 bg-neutral-900/40">
                <div className="text-sm text-neutral-400 mb-2">BPM</div>
                <input
                  className="w-full rounded bg-neutral-900 p-2 outline-none focus:ring-1 focus:ring-sky-500/40"
                  placeholder="tap or type"
                  type="number"
                  value={bpm}
                  onChange={(e)=>setBpm(Number(e.target.value)||"")}
                />
                {/* tap-to-bpm can come later; keep it simple */}
              </div>

              <div className="rounded border border-neutral-800 p-3 bg-neutral-900/40">
                <div className="text-sm text-neutral-400 mb-2">Key</div>
                <select
                  className="w-full rounded bg-neutral-900 p-2 outline-none focus:ring-1 focus:ring-sky-500/40"
                  defaultValue="C"
                >
                  {["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"].map(k=>(
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div className="rounded border border-neutral-800 p-3 bg-neutral-900/40">
                <div className="text-sm text-neutral-400 mb-2">Audio</div>
                <AudioRecorder />
              </div>
            </div>

            <div className="rounded border border-neutral-800 p-3 bg-neutral-900/40 h-[45vh]">
              <LyricEditor />
            </div>
          </>
        ) : (
          <div className="text-neutral-400">Create a project on the left to get rolling.</div>
        )}
      </section>
    </main>
  );
}