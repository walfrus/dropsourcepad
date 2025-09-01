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
  addClip: (projectId: number, clip: Omit<Clip,"id">) => Promise<void>;
  getNotesFor: (projectId: number) => Promise<Note | undefined>;
  getClipsFor: (projectId: number) => Promise<Clip[]>;
};

export const useProjects = create<State>((set, get) => ({
  projects: [],
  activeId: null,
  loading: false,
  loadAll: async () => {
    set({ loading: true });
    const projects = await db.projects.orderBy("updatedAt").reverse().toArray();
    set({ projects, loading: false, activeId: projects[0]?.id ?? null });
  },
  addProject: async (title) => {
    const now = Date.now();
    const id = await db.projects.add({ title, createdAt: now, updatedAt: now });
    await get().loadAll();
    return id;
  },
  setActive: (id) => set({ activeId: id }),
  saveNote: async (projectId, content) => {
    const existing = await db.notes.where({ projectId }).first();
    const now = Date.now();
    if (existing) {
      await db.notes.update(existing.id!, { content, updatedAt: now });
    } else {
      await db.notes.add({ projectId, content, updatedAt: now });
    }
    await db.projects.update(projectId, { updatedAt: now });
    await get().loadAll();
  },
  addClip: async (projectId, clip) => {
    await db.clips.add({ ...clip, projectId });
    await db.projects.update(projectId, { updatedAt: Date.now() });
    await get().loadAll();
  },
  getNotesFor: async (projectId) =>
    db.notes.where({ projectId }).first(),
  getClipsFor: async (projectId) =>
    db.clips.where({ projectId }).sortBy("createdAt").then(list => list.reverse()),
}));