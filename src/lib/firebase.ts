import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
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
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithGitHub() {
  const result = await signInWithPopup(auth, githubProvider);
  return result.user;
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

export { auth };