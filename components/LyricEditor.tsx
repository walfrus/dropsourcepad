"use client";
import { useProjects } from "../store/useProjects";
import { useEffect, useState } from "react";

export default function LyricEditor() {
  const { activeId, getNotesFor, saveNote } = useProjects();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

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
    return () => {
      mounted = false;
    };
  }, [activeId, getNotesFor]);

  useEffect(() => {
    if (!activeId) return;
    setSaving(true);
    const t = setTimeout(async () => {
      try {
        await saveNote(activeId, text);
      } finally {
        setSaving(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [text, activeId, saveNote]);

  async function handleSave() {
    if (!activeId) return;
    setSaving(true);
    try {
      await saveNote(activeId, text);
    } finally {
      setSaving(false);
    }
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

  const syllables = (text.match(/[aeiouy]+/gi) ?? []).length;

  // Guard for empty project
  if (!activeId) {
    return (
      <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
        Select or create a project to start writing.
      </div>
    );
  }

  return (
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
  );
}