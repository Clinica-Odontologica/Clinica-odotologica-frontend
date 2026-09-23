import React from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

type UserWithRole = {
  role?: { name: string };
  rol?: { name: string };
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"ADMIN" | "RECEPTIONIST" | "DOCTOR">;
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center flex flex-col items-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-teal-600" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />; 
  }

  if (allowedRoles) {
    const uData = user as unknown as UserWithRole;
    const rawRoleName = uData?.role?.name || uData?.rol?.name || "";
    const cleanRoleName = rawRoleName.replace("ROLE_", "") as 
      | "ADMIN" 
      | "RECEPTIONIST" 
      | "DOCTOR";

    if (!allowedRoles.includes(cleanRoleName)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}