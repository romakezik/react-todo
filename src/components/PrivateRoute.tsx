import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className="empty-message">Загрузка…</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default PrivateRoute;
