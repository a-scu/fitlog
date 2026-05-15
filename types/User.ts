export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  nickname?: string;
  username?: string; // unique username
  role: 'athlete' | 'coach' | 'admin';
  coachId?: string; // Si tiene un coach asignado
  createdAt: number;
}
