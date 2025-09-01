"use client";
import { useEffect, useState } from "react";
import { useProjects } from "@/store/useProjects";

export default function ProjectSidebar() {
  const { projects, activeId, setActive, addProject, loadAll } = useProjects();
  const [title, setTitle] = useState("");

  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <aside className="w-72 shrink-0 border-r border-neutral-800 p-3 bg-neutral-900/40">
      <div className="flex gap-2">
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

      <ul className="mt-4 space-y-1">
        {projects.map(p=>(
          <li key={p.id}>
            <button
              className={`w-full text-left px-2 py-1 rounded hover:bg-neutral-800 ${
                activeId===p.id ? "bg-neutral-800 ring-1 ring-sky-500/40" : ""
              }`}
              onClick={()=>setActive(p.id!)}
            >
              <div className="text-sm">{p.title}</div>
              <div className="text-xs text-neutral-400">
                {new Date(p.updatedAt).toLocaleString()}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}