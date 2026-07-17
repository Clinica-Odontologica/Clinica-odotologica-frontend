import { ProtectedRoute } from "../../../components/protectedRoute";
import { useAuth } from "../../../context/authContext";
import { Card } from "../../../components/ui/card/card";
import { AdminLayout } from "../../../components/adminLayout";
import IngresosCharts from "../../../components/recharts/IngresosCharts";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <AdminLayout currentPage={"dashboard"}>
        <main className="min-h-screen bg-background p-6">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Panel de Administración
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Bienvenido,{" "}
                  <span className="font-semibold">{user?.username}</span>
                </p>
              </div>
            </div>

            {/* Role-specific content */}
            <div className="mt-8">
              {user?.rol.name === "ROLE_ADMIN" && (
                <IngresosCharts data={[]} name="DEMANDA" />
              )}

              {user?.rol.name === "ROLE_DOCTOR" && (
                <Card className="p-6 border border-border">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">
                    Panel de Doctor
                  </h2>
                  <p className="text-muted-foreground">
                    Aquí irán las historias clínicas y datos de pacientes...
                  </p>
                </Card>
              )}

              {user?.rol.name === "ROLE_RECEPTIONIST" && (
                <Card className="p-6 border border-border">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">
                    Panel de Recepción
                  </h2>
                  <p className="text-muted-foreground">
                    Aquí irá el agendador de turnos...
                  </p>
                </Card>
              )}
            </div>
          </div>
        </main>
      </AdminLayout>
    </ProtectedRoute>
  );
}
