import Dexie, { Table } from "dexie";

export type Project = {
  id?: number;
  title: string;
  bpm?: number | null;
  song_key?: string | null;
  createdAt: number;
  updatedAt: number;
};

export type Clip = {
  id?: number;
  projectId: number;
  blob: Blob;          // audio
  durationMs: number;
  createdAt: number;
};

export type Note = {
  id?: number;
  projectId: number;
  content: string;
  updatedAt: number;
};

class DSDB extends Dexie {
  projects!: Table<Project, number>;
  clips!: Table<Clip, number>;
  notes!: Table<Note, number>;
  constructor() {
    super("dropsource_db");
    this.version(1).stores({
      projects: "++id, title, updatedAt",
      clips: "++id, projectId, createdAt",
      notes: "++id, projectId, updatedAt",
    });
  }
}

export const db = new DSDB();