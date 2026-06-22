import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    if (auth.currentUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}