"use client";
import { useEffect, useState } from "react";
import { useProjects } from "@/store/useProjects";

export default function LyricEditor() {
  const { activeId, getNotesFor, saveNote } = useProjects();
  const [text, setText] = useState("");

  useEffect(() => {
    (async () => {
      if (!activeId) return setText("");
      const n = await getNotesFor(activeId);
      setText(n?.content ?? "");
    })();
  }, [activeId, getNotesFor]);

  const syllables = (text.match(/[aeiouy]+/gi) ?? []).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between text-sm text-neutral-400 mb-2">
        <span>Lyrics / Notes</span>
        <span>Syllables: {syllables}</span>
      </div>
      <textarea
        className="flex-1 w-full resize-none rounded bg-neutral-900 p-3 outline-none focus:ring-1 focus:ring-sky-500/40"
        placeholder="write your idea..."
        value={text}
        onChange={(e)=>setText(e.target.value)}
        onBlur={async ()=>{
          if (!activeId) return;
          await saveNote(activeId, text);
        }}
      />
    </div>
  );
}