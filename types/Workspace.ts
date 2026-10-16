export interface WorkspaceNotes {
  id: string;
  text: string;
  createdAt: string;
}

export interface PersonalWorkspace {
  id: string;
  name: string;
  routineId: string | null;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  routineId: string | null;
  notes: WorkspaceNotes[];
  isShared: boolean;
  createdAt: string;
  coachId: string | null;
  athleteId: string | null;
  coachName?: string | null;
  athleteName?: string | null;
}

export interface Invitation {
  id: string;
  workspaceId: string;
  coachId: string;
  coachName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: number;
}
