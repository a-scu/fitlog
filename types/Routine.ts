/** Un día dentro de una rutina. El `dayIndex` es fijo (0=Lun … 6=Dom). */
export interface RoutineDay {
  dayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Título libre: "Push Day", "Piernas", "", etc. */
  title: string;
  /** Descripción/notas cortas del día */
  description: string;
  isRestDay: boolean;
  /** Referencia a un Workout del pool global (null = sin entrenamiento asignado) */
  workoutId: string | null;
}

export interface Routine {
  id: string;
  /** "Semana 1", "Mes de fuerza", etc. */
  name: string;
  createdAt: string;
  days: RoutineDay[];
}
