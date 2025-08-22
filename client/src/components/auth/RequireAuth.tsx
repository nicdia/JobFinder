import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  return <>{children}</>;
}
