"use client";
import { useEffect, useRef, useState } from "react";
import { useProjects } from "../store/useProjects";

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-neutral-800 text-white px-4 py-2 rounded shadow z-50 text-xs animate-fade-in">
      {message}
    </div>
  );
}

export default function ProjectSidebar() {
  const { activeId, getNotesFor, saveNote, projects, setProjectMeta, addProject, setActive } = useProjects();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bpmInput, setBpmInput] = useState<string>("");
  const bpmTimeout = useRef<NodeJS.Timeout | null>(null);

  const active = projects?.find?.((p) => p.id === activeId);

  useEffect(() => {
    setBpmInput(active?.bpm?.toString() ?? "");
  }, [active?.bpm]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!activeId) {
        if (mounted) setText("");
        return;
      }
      const n = await getNotesFor(activeId);
      if (mounted) setText(n?.content ?? "");
    })();
    return () => { mounted = false; };
  }, [activeId, getNotesFor]);

  useEffect(() => {
    if (!activeId) return;
    setSaving(true);
    const t = setTimeout(async () => {
      try { 
        await saveNote(activeId, text); 
        setToast("Notes saved");
        setTimeout(() => setToast(null), 1200);
      }
      finally { setSaving(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [text, activeId, saveNote]);

  async function handleSave() {
    if (!activeId) return;
    setSaving(true);
    try { 
      await saveNote(activeId, text); 
      setToast("Notes saved");
      setTimeout(() => setToast(null), 1200);
    }
    finally { setSaving(false); }
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, text]);

  function handleBpmChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.currentTarget.value;
    setBpmInput(val);
    if (bpmTimeout.current) clearTimeout(bpmTimeout.current);
    bpmTimeout.current = setTimeout(() => {
      const v = val === "" ? null : Number(val);
      if (active?.id != null) {
        setProjectMeta(active.id, { bpm: v });
        setToast("BPM saved");
        setTimeout(() => setToast(null), 1200);
      }
    }, 400);
  }

  const syllables = (text.match(/[aeiouy]+/gi) ?? []).length;

  return (
    <aside className="w-72 shrink-0 border-r border-neutral-800 p-3 bg-neutral-900/40">
      {/* Project creation input */}
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 rounded bg-neutral-800 px-2 py-1 outline-none"
          placeholder="New project title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />
        <button
          className="rounded bg-sky-500/80 px-3 py-1 hover:bg-sky-500 transition"
          onClick={async ()=>{
            if (!title.trim()) return;
            const id = await addProject(title.trim());
            setTitle("");
            setActive(id);
          }}
        >Add</button>
      </div>

      {/* Project list */}
      <ul className="space-y-1">
        {projects.map(p=>(
          <li key={p.id}>
            <button
              className={`w-full text-left px-2 py-1 rounded hover:bg-neutral-800 ${
                activeId===p.id ? "bg-neutral-800 ring-1 ring-sky-500/40" : ""
              }`}
              onClick={() => p.id !== undefined && setActive(p.id)}
            >
              <div className="text-sm">{p.title}</div>
              <div className="text-xs text-neutral-400">
                {new Date(p.updatedAt).toLocaleString()}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* Only show meta/notes if a project is selected */}
      {activeId && active ? (
        <>
          {/* BPM and Key controls */}
          <div className="mt-4 space-y-2">
            <div>
              <label className="block text-xs font-medium text-neutral-400">BPM</label>
              <input
                type="number"
                value={bpmInput}
                onChange={handleBpmChange}
                className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1 focus:border-brand focus:ring-1 focus:ring-brand/40"
                placeholder="Type BPM"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400">Key</label>
              <select
                value={active?.song_key ?? "C"}
                onChange={(e) => {
                  if (active?.id !== undefined) {
                    setProjectMeta(active.id, { song_key: e.currentTarget.value });
                    setToast("Key saved");
                    setTimeout(() => setToast(null), 1200);
                  }
                }}
                className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1 focus:border-brand focus:ring-1 focus:ring-brand/40"
              >
                {["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"].map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lyrics / Notes section */}
          <div className="mt-6 flex flex-col h-full">
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Lyrics / Notes
            </label>
            <textarea
              rows={8}
              className="flex-1 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-900 p-3 font-mono text-sm focus:border-brand focus:ring-1 focus:ring-brand/40"
              placeholder="write your idea..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleSave}
            />
            <div className="mt-1 text-xs text-neutral-500">
              Syllables: {syllables}
              {saving && <span className="ml-2 text-xs">(saving…)</span>}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
          Select or create a project to start writing.
        </div>
      )}
      {toast && <Toast message={toast} />}
    </aside>
  );
}