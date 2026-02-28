
import { Button } from '../../../components/ui/button/button';
import { ProtectedRoute } from '../../../components/protectedRoute';
import { useAuth } from '../../../context/authContext';
import { Card } from '../../../components/ui/card/card';

export default function AdminPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="mt-1 text-muted-foreground">
                Bienvenido, <span className="font-semibold">{user?.username}</span>
              </p>
            </div>
            <Button onClick={logout} variant="outline">
              Cerrar Sesión
            </Button>
          </div>

          {/* User Info Card */}
          <Card className="p-6 border border-border">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Información de Usuario</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold text-foreground">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <div className="mt-1 inline-block rounded bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
                  {user?.role.name}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID Usuario</p>
                <p className="font-semibold text-foreground">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-semibold text-green-600">Autenticado</p>
              </div>
            </div>
          </Card>

          {/* Role-specific content */}
          <div className="mt-8">
            {user?.role.name === 'ADMIN' && (
              <Card className="p-6 border border-border">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Panel de Administrador</h2>
                <p className="text-muted-foreground">
                  Aquí irán las funciones de administración del sistema...
                </p>
              </Card>
            )}

            {user?.role.name === 'DOCTOR' && (
              <Card className="p-6 border border-border">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Panel de Doctor</h2>
                <p className="text-muted-foreground">
                  Aquí irán las historias clínicas y datos de pacientes...
                </p>
              </Card>
            )}

            {user?.role.name === 'RECEPTIONIST' && (
              <Card className="p-6 border border-border">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Panel de Recepción</h2>
                <p className="text-muted-foreground">
                  Aquí irá el agendador de turnos...
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
