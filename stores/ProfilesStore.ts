import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/User";
import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore";

interface CachedProfile {
  profile: User;
  lastFetched: number;
}

interface ProfilesStore {
  profiles: Record<string, CachedProfile>;
  fetchProfile: (uid: string, force?: boolean) => Promise<User | null>;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const useProfilesStore = create<ProfilesStore>()(
  persist(
    (set, get) => ({
      profiles: {},

      fetchProfile: async (uid, force = false) => {
        if (!uid) return null;

        const { profiles } = get();
        const cached = profiles[uid];
        const now = Date.now();

        // Si tenemos cache y no ha expirado, lo devolvemos
        if (!force && cached && now - cached.lastFetched < CACHE_TTL) {
          return cached.profile;
        }

        try {
          const docRef = doc(getFirestore(), "users", uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists) {
            const profile = docSnap.data() as User;
            set((state) => ({
              profiles: {
                ...state.profiles,
                [uid]: { profile, lastFetched: now },
              },
            }));
            return profile;
          }
          return null;
        } catch (error) {
          console.error("Error fetching profile:", error);
          // Si falla la red, devolvemos el cache aunque esté expirado
          return cached?.profile || null;
        }
      },
    }),
    {
      name: "profiles-cache",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
