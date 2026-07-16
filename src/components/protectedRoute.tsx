import React, { useEffect } from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"ADMIN" | "RECEPTIONIST" | "DOCTOR">;
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        <Navigate to="/unauthorized" />;
        return;
      }

      if (allowedRoles && user && user.rol) {
        const userRoleName = user.rol.name.replace("ROLE_", "") as
          | "ADMIN"
          | "RECEPTIONIST"
          | "DOCTOR";

        if (!allowedRoles.includes(userRoleName)) {
          <Navigate to="/unauthorized" />;
          return;
        }
      }
    }
  }, [isAuthenticated, user, isLoading, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && user && user.rol) {
    const userRoleName = user.rol.name.replace("ROLE_", "") as
      | "ADMIN"
      | "RECEPTIONIST"
      | "DOCTOR";
    if (!allowedRoles.includes(userRoleName)) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{children}</>;
}
