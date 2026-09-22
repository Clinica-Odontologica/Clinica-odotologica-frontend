import { ProtectedRoute } from "../../../components/protectedRoute";
import { useAuth } from "../../../context/authContext";
import { AdminLayout } from "../../../components/adminLayout";
import AdminDashboard from "./AdminDashboard";
import { ShieldAlert } from "lucide-react"; 

type UserWithRole = {
  role?: { name: string };
  rol?: { name: string };
  username?: string;
};

export default function AdminPage() {
  const { user } = useAuth();
  
  const uData = user as unknown as UserWithRole;
  const roleName = uData?.role?.name || uData?.rol?.name || "";
  const isAdmin = roleName === "ROLE_ADMIN" || roleName === "ADMIN";

  return (
    <ProtectedRoute>
      <AdminLayout currentPage="dashboard">
        <div className="space-y-6 animate-in fade-in duration-500">
          
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isAdmin ? "Panel General de Administración" : "Panel de Usuario"}
              </h1>
              <p className="mt-1 text-slate-600">
                Bienvenido de vuelta, <span className="font-bold text-teal-700">{user?.username || "Usuario"}</span>
              </p>
            </div>
          </div>

          {/* Renderizado Dinámico por Rol */}
          <div className="mt-4">
            {isAdmin ? (
              <AdminDashboard />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-center px-4">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                  <ShieldAlert className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Acceso Restringido</h2>
                <p className="text-slate-500 mt-2 max-w-md">
                  No tienes los permisos de Administrador necesarios para ver el contenido de este panel.
                </p>
              </div>
            )}
          </div>
          
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}