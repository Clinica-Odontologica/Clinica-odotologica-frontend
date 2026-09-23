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
        {/* 🌟 Contenedor principal con max-w-full y min-w-0 para evitar desbordes horizontales */}
        <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-full min-w-0">
          
          {/* Header Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 w-full gap-3">
            <div className="min-w-0 w-full">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">
                {isAdmin ? "Panel General de Administración" : "Panel de Usuario"}
              </h1>
              <p className="mt-1 text-sm md:text-base text-slate-600 truncate">
                Bienvenido de vuelta, <span className="font-bold text-teal-700">{user?.username || "Usuario"}</span>
              </p>
            </div>
          </div>

          {/* Renderizado Dinámico por Rol con ajuste fluido */}
          <div className="mt-4 w-full">
            {isAdmin ? (
              <AdminDashboard />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 md:py-20 bg-white rounded-3xl border border-slate-200 shadow-sm text-center px-6 transition-all hover:shadow-md">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-5 border-4 border-amber-50/50">
                  <ShieldAlert className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
                <p className="text-sm md:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
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