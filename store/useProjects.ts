import { create } from "zustand";
import { db, Project, Note, Clip } from "../lib/db";

type State = {
  projects: Project[];
  activeId: number | null;
  loading: boolean;
  loadAll: () => Promise<void>;
  addProject: (title: string) => Promise<number>;
  setActive: (id: number) => void;
  saveNote: (projectId: number, content: string) => Promise<void>;
  addClip: (projectId: number, clip: Omit<Clip, "id">) => Promise<void>;
  getNotesFor: (projectId: number) => Promise<Note | undefined>;
  getClipsFor: (projectId: number) => Promise<Clip[]>;
  setProjectMeta: (projectId: number, meta: { bpm?: number | null; song_key?: string | null }) => Promise<void>;
  activeProject: () => Project | undefined;
};

export const useProjects = create<State>((set, get) => ({
  projects: [],
  activeId: null,
  loading: false,

  // Load the full list (used on first mount or hard refresh)
  loadAll: async () => {
    try {
      set({ loading: true });
      const projects = await db.projects.orderBy("updatedAt").reverse().toArray();
      set({
        projects,
        loading: false,
        activeId: projects[0]?.id ?? null,
      });
    } catch (err) {
      console.error("loadAll failed:", err);
      set({ loading: false });
    }
  },

  // Create a project and optimistically append it to state
  addProject: async (title) => {
    const now = Date.now();
    try {
      const id = await db.projects.add({ title, createdAt: now, updatedAt: now });
      // Optimistically update state without reloading everything
      set((s) => ({
        projects: [{ id, title, createdAt: now, updatedAt: now }, ...s.projects].sort(
          (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
        ),
        activeId: id,
      }));
      return id;
    } catch (err) {
      console.error("addProject failed:", err);
      throw err;
    }
  },

  setActive: (id) => set({ activeId: id }),

  activeProject: () => {
    const { projects, activeId } = get();
    return projects.find(p => p.id === activeId);
  },

  // Save or create a note; bump project's updatedAt and patch state (no full reload)
  saveNote: async (projectId, content) => {
    const now = Date.now();
    try {
      const existing = await db.notes.where({ projectId }).first();
      if (existing) {
        await db.notes.update(existing.id!, { content, updatedAt: now });
      } else {
        await db.notes.add({ projectId, content, updatedAt: now });
      }
      await db.projects.update(projectId, { updatedAt: now });

      // Patch state: bump updatedAt for the touched project and resort
      set((s) => {
        const projects = s.projects.map((p) =>
          p.id === projectId ? { ...p, updatedAt: now } : p
        );
        projects.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        return { projects };
      });
    } catch (err) {
      console.error("saveNote failed:", err);
      throw err;
    }
  },

  setProjectMeta: async (projectId, meta) => {
    const now = Date.now();
    try {
      await db.projects.update(projectId, { ...meta, updatedAt: now });
      set((s) => {
        const projects = s.projects.map((p) =>
          p.id === projectId ? { ...p, ...meta, updatedAt: now } : p
        );
        projects.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        return { projects };
      });
    } catch (err) {
      console.error("setProjectMeta failed:", err);
      throw err;
    }
  },

  // Add a clip for a project; bump project's updatedAt and patch state
  addClip: async (projectId, clip) => {
    const now = Date.now();
    try {
      await db.clips.add({ ...clip, projectId });
      await db.projects.update(projectId, { updatedAt: now });

      set((s) => {
        const projects = s.projects.map((p) =>
          p.id === projectId ? { ...p, updatedAt: now } : p
        );
        projects.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        return { projects };
      });
    } catch (err) {
      console.error("addClip failed:", err);
      throw err;
    }
  },

  // Read helpers
  getNotesFor: async (projectId) => db.notes.where({ projectId }).first(),
  getClipsFor: async (projectId) =>
    db.clips.where({ projectId }).sortBy("createdAt").then((list) => list.reverse()),
}));