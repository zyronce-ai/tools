import { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { onAuthChange, signOut as fbSignOut, auth } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  firebaseUid: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

function userFromSession(session: any): UserData | null {
  if (!session?.user) return null;
  const meta = session.user.user_metadata || {};
  return {
    id: session.user.id,
    email: session.user.email || "",
    displayName: meta.full_name || session.user.email?.split("@")[0] || "",
    avatarUrl: meta.avatar_url || "",
    firebaseUid: meta.firebase_uid || "",
  };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const syncing = useRef(false);
  const supabaseDone = useRef(false);
  const firebaseDone = useRef(false);

  const tryFinish = useCallback(() => {
    if (supabaseDone.current && firebaseDone.current) {
      setLoading(false);
    }
  }, []);

  // Sync Firebase user to Supabase
  const syncToSupabase = useCallback(async (firebaseUser: any) => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseToken: token }),
      });
      const data = await res.json();
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
    } catch (e) {
      console.error("Supabase sync error:", e);
    } finally {
      syncing.current = false;
    }
  }, []);

  // On mount: check Supabase first, then Firebase
  useEffect(() => {
    // Step 1: Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(userFromSession(session));
        firebaseDone.current = true;
        supabaseDone.current = true;
        setLoading(false);
      } else {
        supabaseDone.current = true;
        tryFinish();
      }
    });

    // Step 2: Listen to Supabase auth changes (for email/password)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(userFromSession(session));
      } else if (!auth.currentUser && firebaseDone.current) {
        setUser(null);
      }
    });

    // Step 3: Listen to Firebase auth (for OAuth)
    const unsubFirebase = onAuthChange(async (fbUser) => {
      if (fbUser) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await syncToSupabase(fbUser);
        }
        firebaseDone.current = true;
        tryFinish();
      } else {
        firebaseDone.current = true;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && supabaseDone.current) {
          setUser(null);
        }
        tryFinish();
      }
    });

    return () => {
      subscription.unsubscribe();
      unsubFirebase();
    };
  }, [syncToSupabase, tryFinish]);

  const signOut = async () => {
    await fbSignOut();
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);