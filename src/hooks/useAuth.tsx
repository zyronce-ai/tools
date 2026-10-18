import { useState, useEffect, createContext, useContext } from "react";
import { onAuthChange, signOut as fbSignOut, auth } from "@/lib/firebase";

interface UserData {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
          avatarUrl: firebaseUser.photoURL || "",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await fbSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
