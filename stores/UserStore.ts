import { create } from "zustand";
import auth, {
  signOut,
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  onAuthStateChanged,
  updateProfile as updateFirebaseAuthProfile,
} from "@react-native-firebase/auth";
import firestore, {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "@react-native-firebase/firestore";
import { User } from "../types/User";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

interface UserState {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  signInWithGoogle: () => Promise<{ isNewUser: boolean }>;
  signInWithApple: () => Promise<{ isNewUser: boolean }>;
  signInWithPhoneNumber: (phoneNumber: string) => Promise<any>;
  confirmPhoneNumberCode: (confirmation: any, code: string) => Promise<{ isNewUser: boolean }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initialize: () => () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),

  signInWithGoogle: async () => {
    try {
      set({ loading: true });
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();

      // Try the new style of google sign in result, or fallback to the old style
      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        // fallback if using older version
        idToken = signInResult.data?.idToken;
      }

      if (!idToken) {
        throw new Error("No ID token found");
      }

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(
        getAuth(),
        googleCredential,
      );

      const firebaseUser = userCredential.user;

      const db = getFirestore();
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const hasUsername =
        userData?.username && userData.username.trim().length > 0;
      const isNewUser = !userSnap.exists() || !hasUsername;

      console.log("[UserStore] signInWithGoogle debug:", {
        uid: firebaseUser.uid,
        exists: userSnap.exists(),
        hasUsername,
        isNewUser,
        username: userData?.username,
      });

      const user: User = userSnap.exists()
        ? (userData as User)
        : {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: "athlete",
            createdAt: Date.now(),
          };

      if (isNewUser) {
        await setDoc(userRef, user);
      }

      set({ user });
      return { isNewUser };
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signInWithApple: async () => {
    try {
      set({ loading: true });
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure Apple returned a user identity token
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error("Apple Sign-In failed - no identify token returned");
      }

      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      // Sign the user in with the credential
      const userCredential = await auth().signInWithCredential(appleCredential);

      const firebaseUser = userCredential.user;

      const db = getFirestore();
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const hasUsername =
        userData?.username && userData.username.trim().length > 0;
      const isNewUser = !userSnap.exists() || !hasUsername;

      console.log("[UserStore] signInWithApple debug:", {
        uid: firebaseUser.uid,
        exists: userSnap.exists(),
        hasUsername,
        isNewUser,
        username: userData?.username,
      });

      const profile: User = userSnap.exists()
        ? (userData as User)
        : {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName:
              firebaseUser.displayName ||
              (appleAuthRequestResponse.fullName?.givenName
                ? `${appleAuthRequestResponse.fullName?.givenName} ${appleAuthRequestResponse.fullName?.familyName}`
                : null),
            photoURL: firebaseUser.photoURL,
            role: "athlete",
            createdAt: Date.now(),
          };

      if (!userSnap.exists()) {
        // Ensure user document exists in Firestore for new users
        await setDoc(userRef, profile);
      }

      console.log("[UserStore] setting user to:", profile);
      set({ user: profile });
      return { isNewUser };
    } catch (error) {
      console.error("Apple Sign-In Error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signInWithPhoneNumber: async (phoneNumber: string) => {
    try {
      set({ loading: true });
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      return confirmation;
    } catch (error) {
      console.error("Phone Sign-In Error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  confirmPhoneNumberCode: async (confirmation: any, code: string) => {
    try {
      set({ loading: true });
      const userCredential = await confirmation.confirm(code);
      if (!userCredential) {
        throw new Error("No user credential returned");
      }

      const firebaseUser = userCredential.user;

      const db = getFirestore();
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const hasUsername =
        userData?.username && userData.username.trim().length > 0;
      const isNewUser = !userSnap.exists() || !hasUsername;

      console.log("[UserStore] confirmPhoneNumberCode debug:", {
        uid: firebaseUser.uid,
        exists: userSnap.exists(),
        hasUsername,
        isNewUser,
        username: userData?.username,
      });

      const user: User = userSnap.exists()
        ? (userData as User)
        : {
            uid: firebaseUser.uid,
            email: firebaseUser.email || null,
            displayName: firebaseUser.displayName || null,
            photoURL: firebaseUser.photoURL || null,
            role: "athlete",
            createdAt: Date.now(),
          };

      if (isNewUser) {
        await setDoc(userRef, user);
      }

      set({ user });
      return { isNewUser };
    } catch (error) {
      console.error("Confirm Phone Code Error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      // Clear Firebase Auth session
      await signOut(auth());
      // Clear Google Sign In session to allow account selection
      await GoogleSignin.revokeAccess().catch(() => {});
      await GoogleSignin.signOut().catch(() => {});
      set({ user: null });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      set({ loading: false });
    }
  },

  deleteAccount: async () => {
    const currentUser = get().user;
    if (!currentUser) return;

    try {
      set({ loading: true });

      // 1. Delete from Firestore
      await firestore().collection("users").doc(currentUser.uid).delete();

      // 2. Delete from Firebase Auth
      const firebaseUser = auth().currentUser;
      if (firebaseUser) {
        await firebaseUser.delete();
      }

      // 3. Clear Google Session
      await GoogleSignin.revokeAccess().catch(() => {});
      await GoogleSignin.signOut().catch(() => {});

      set({ user: null });
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    set({ loading: true });
    try {
      // Filter out undefined values to avoid Firestore errors
      const sanitizedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined),
      );

      // 1. Update Firestore (Use set with merge to avoid 'not-found' errors)
      const db = getFirestore();
      await setDoc(doc(db, "users", currentUser.uid), sanitizedData, {
        merge: true,
      });

      // 2. Update Firebase Auth if displayName or photoURL changed
      const firebaseUser = auth().currentUser;
      if (
        firebaseUser &&
        (data.displayName !== undefined || data.photoURL !== undefined)
      ) {
        await updateFirebaseAuthProfile(firebaseUser, {
          displayName: data.displayName ?? firebaseUser.displayName,
          photoURL: data.photoURL ?? firebaseUser.photoURL,
        });
      }

      // 3. Update local state
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      }));
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth(), async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch full profile from Firestore
          const db = getFirestore();
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();

          if (userSnap.exists() && userData) {
            console.log(
              "[UserStore] initialize: found Firestore data:",
              userData,
            );
            set({ user: userData as User, isInitialized: true });
          } else {
            // Fallback to auth data if Firestore doc doesn't exist
            const fallbackUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: "athlete",
              createdAt: Date.now(),
            };
            console.log(
              "[UserStore] initialize: using fallback data:",
              fallbackUser,
            );
            set({ user: fallbackUser, isInitialized: true });
          }
        } catch (error) {
          console.error("[UserStore] initialize error:", error);
          // Still fallback to auth data if Firestore fails
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: "athlete",
              createdAt: Date.now(),
            },
            isInitialized: true,
          });
        }
      } else {
        console.log(
          "[UserStore] initialize: no firebaseUser, setting user to null",
        );
        set({ user: null, isInitialized: true });
      }
    });
    return unsubscribe;
  },
}));
