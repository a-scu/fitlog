export interface WorkspaceNotes {
  id: string;
  text: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  routineId: string;
  notes: WorkspaceNotes[];
  isShared: boolean;
  createdAt: string;
  coachId: string | null;
  athleteId: string | null;
}
