import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMyHnIk251JOVumStKpc8aiZOZJBV9sXg",
  authDomain: "zyronce-12.firebaseapp.com",
  projectId: "zyronce-12",
  storageBucket: "zyronce-12.firebasestorage.app",
  messagingSenderId: "1063158139850",
  appId: "1:1063158139850:web:81eaad0a592d0f0b949d33",
  measurementId: "G-DY9Z87GLZQ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google sign in error:", error);
    throw error;
  }
}

export async function signOut() {
  await fbSignOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function getFirebaseToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return user.getIdToken();
}
