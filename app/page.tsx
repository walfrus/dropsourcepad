// app/page.tsx
import { GoogleButton } from "../components/GoogleButton";
import ProjectSidebar from "../components/ProjectSidebar";
import LyricEditor from "../components/LyricEditor";
import AudioRecorder from "../components/AudioRecorder";

export default function Home() {
  return (
    <main className="flex h-dvh">
      {/* Sidebar for project navigation */}
      <ProjectSidebar />

      {/* Main content */}
      <section className="flex-1 p-6 space-y-6 overflow-y-auto">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">DropSource — Song Sketchpad</h1>
          <GoogleButton />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400">BPM</label>
            <input
              type="number"
              placeholder="Type BPM"
              className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1 focus:border-brand focus:ring-1 focus:ring-brand/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400">Key</label>
            <select
              className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1 focus:border-brand focus:ring-1 focus:ring-brand/40"
              defaultValue="C"
            >
              {["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Audio</label>
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