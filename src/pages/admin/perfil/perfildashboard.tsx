import { AdminLayout } from "../../../components/adminLayout";
import { Card } from "../../../components/ui/card/card";
import { useAuth } from "../../../context/authContext";

export default function Perfildashboard() {
  const { user } = useAuth();

  return (
    <AdminLayout currentPage={"perfil"}>
      <main>
        {/* User Info Card */}
        <Card className="p-6 border border-border">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Información de Usuario
          </h2>
          <div className="grid grid-cols-4 gap-4 md:grid-cols-2 max-sm:grid-cols-1">
            <div>
              <p className="text-max-sm text-muted-foreground">Email</p>
              <p className="font-semibold text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-max-sm text-muted-foreground">Rol</p>
              <div className="mt-1 inline-block rounded bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
                {user?.rol.name}
              </div>
            </div>
            <div>
              <p className="text-max-sm text-muted-foreground">ID Usuario</p>
              <p className="font-semibold text-foreground">{user?.id}</p>
            </div>
            <div>
              <p className="text-max-sm text-muted-foreground">Estado</p>
              <p className="font-semibold text-green-600">Autenticado</p>
            </div>
          </div>
        </Card>
      </main>
    </AdminLayout>
  );
}
