// app/page.tsx
import { GoogleButton } from "@/components/GoogleButton";
import ProjectSidebar from "@/components/ProjectSidebar";
import LyricEditor from "@/components/LyricEditor";
import AudioRecorder from "@/components/AudioRecorder";

export default function Home() {
  return (
    <main className="flex h-screen">
      {/* Sidebar for project navigation */}
      <ProjectSidebar />

      {/* Main content */}
      <section className="flex-1 p-6 space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">DropSource — Song Sketchpad</h1>
          <GoogleButton />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded border border-neutral-800 p-3 bg-neutral-900/40">
            <div className="text-sm text-neutral-400 mb-2">BPM</div>
            {/* Placeholder for BPM input */}
            <input
              type="number"
              placeholder="Type BPM"
              className="w-full rounded bg-neutral-900 p-2 outline-none"
            />
          </div>
          <div className="rounded border border-neutral-800 p-3 bg-neutral-900/40">
            <div className="text-sm text-neutral-400 mb-2">Key</div>
            {/* Placeholder for Key select */}
            <select className="w-full rounded bg-neutral-900 p-2 outline-none" defaultValue="C">
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

        {/* Lyrics editor */}
        <div className="rounded border border-neutral-800 p-3 bg-neutral-900/40 h-[45vh]">
          <LyricEditor />
        </div>
      </section>
    </main>
  );
}