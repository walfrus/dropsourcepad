"use client";
import { useEffect, useState } from "react";
import { useProjects } from "@/store/useProjects";

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

  const syllables = (text.match(/[aeiouy]+/gi) ?? []).length;

  async function handleSave() {
    if (!activeId) return;
    setSaving(true);
    try {
      await saveNote(activeId, text);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between text-sm text-neutral-400 mb-2">
        <span>Lyrics / Notes</span>
        <span>
          Syllables: {syllables}
          {saving && <span className="ml-2 text-xs">(saving…)</span>}
        </span>
      </div>
      <textarea
        className="flex-1 w-full resize-none rounded bg-neutral-900 p-3 outline-none focus:ring-1 focus:ring-sky-500/40"
        placeholder="write your idea..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
      />
    </div>
  );
}