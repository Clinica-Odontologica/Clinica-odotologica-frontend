import { ProtectedRoute } from "../../../components/protectedRoute";
import { useAuth } from "../../../context/authContext";
import { AdminLayout } from "../../../components/adminLayout";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const { user } = useAuth();
  const role = user?.rol.name;

  return (
    <ProtectedRoute>
      <AdminLayout currentPage={"dashboard"}>
        <main className="min-h-screen bg-background p-6">
          <div className="mx-auto max-w-6xl">
            {/* Header Común */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {role === "ROLE_ADMIN" && "Panel General de Administración"}
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Bienvenido, <span className="font-semibold">{user?.username}</span>
                </p>
              </div>
            </div>

            {/* Renderizado Dinámico por Rol */}
            <div className="mt-8">
              {role === "ROLE_ADMIN" && <AdminDashboard />}
            </div>
          </div>
        </main>
      </AdminLayout>
    </ProtectedRoute>
  );
}