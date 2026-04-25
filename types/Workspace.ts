// ─── Weekly Plan ──────────────────────────────────────────────────────────────

/** Un día dentro de un plan semanal. El `dayIndex` es fijo (0=Lun … 6=Dom). */
export interface WorkoutDay {
  id: string;
  dayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Título libre: "Push Day", "Piernas", "", etc. */
  title: string;
  /** Descripción/notas cortas del día */
  description: string;
  isRestDay: boolean;
  /** Referencia a una Routine del pool global (null = sin rutina asignada) */
  routineId: string | null;
}

export interface WeeklyPlan {
  id: string;
  /** "Semana 1", "Mes de fuerza", etc. */
  name: string;
  createdAt: string;
  days: WorkoutDay[];
}

// ─── Workspace ──────────────────────────────────────────────────────────────────

export interface WorkspaceNote {
  id: string;
  text: string;
  createdAt: string;
}

export type IndividualPlan = {
  id: string;
  title: string;
  description: string;
  routineId: string | null;
};

export interface Workspace {
  id: string;
  name: string;
  avatarColor?: string;
  createdAt: string;
  individualPlans?: IndividualPlan[];
  weeklyPlans?: WeeklyPlan[];
  planType: "individual" | "weekly";
  notes: WorkspaceNote[];
  creatorId: string;
}
