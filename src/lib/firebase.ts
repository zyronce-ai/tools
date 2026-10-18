// Firebase auth removed - will be rebuilt later
// This file is kept for future implementation

export const auth = null;

export async function signInWithGoogle() {
  throw new Error("Auth system not implemented yet");
}

export async function signInWithGitHub() {
  throw new Error("Auth system not implemented yet");
}

export async function signOut() {}

export function onAuthChange(cb: (user: null) => void) {
  cb(null);
  return () => {};
}

export async function getFirebaseToken(): Promise<string> {
  throw new Error("Auth system not implemented yet");
}
