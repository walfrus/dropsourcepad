"use client";
import { useEffect, useState } from "react";
import { useProjects } from "../store/useProjects";

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
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="New project title"
          className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-500 focus:border-brand focus:ring-1 focus:ring-brand/40"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-black hover:bg-brand/80 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  className={`w-full text-left rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 shadow-sm hover:border-brand/50 ${
                    isActive ? "ring-1 ring-brand/40" : ""
                  } ${!canSelect ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (!canSelect) return;
                    // @ts-expect-error tolerate id type (number | string)
                    setActive(p.id);
                  }}
                >
                  <h2 className="mb-1 text-sm font-semibold truncate">{p.title}</h2>
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