"use client";
import { useEffect, useState } from "react";
import { useProjects } from "@/store/useProjects";

export default function ProjectSidebar() {
  const { projects, activeId, setActive, addProject, loadAll } = useProjects();
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  // Load once on mount. If lint complains about deps, it's fine here.
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd() {
    const name = title.trim();
    if (!name || adding) return;
    setAdding(true);
    try {
      const id = await addProject(name);
      setTitle("");
      // guard in case addProject didn't return an id
      if (id !== undefined && id !== null) {
        setActive(id);
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <aside className="w-72 shrink-0 border-r border-neutral-800 p-3 bg-neutral-900/40">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded bg-neutral-800 px-2 py-1 outline-none"
          placeholder="New project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button
          className="rounded bg-sky-500/80 px-3 py-1 hover:bg-sky-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleAdd}
          disabled={!title.trim() || adding}
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="mt-6 text-sm text-neutral-400">
          No projects yet. Create your first idea →
        </div>
      ) : (
        <ul className="mt-4 space-y-1">
          {projects.map((p, idx) => {
            const isActive = activeId === p.id;
            const ts = p?.updatedAt
              ? new Date(p.updatedAt).toLocaleString()
              : "";
            const canSelect = p?.id !== undefined && p?.id !== null;

            return (
              <li key={(p as any).id ?? `p-${idx}`}>
                <button
                  className={`w-full text-left px-2 py-1 rounded hover:bg-neutral-800 ${
                    isActive ? "bg-neutral-800 ring-1 ring-sky-500/40" : ""
                  } ${!canSelect ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (!canSelect) return;
                    // @ts-expect-error tolerate id type (number | string)
                    setActive(p.id);
                  }}
                >
                  <div className="text-sm truncate">{p.title}</div>
                  <div className="text-xs text-neutral-400">{ts}</div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}