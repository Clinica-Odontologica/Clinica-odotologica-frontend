import { AdminLayout } from "../../../components/adminLayout";
import { Card } from "../../../components/ui/card/card";
import { Button } from "../../../components/ui/button/button";
import { useAuth } from "../../../context/authContext";
import { Mail, Shield, Key, BadgeCheck, Edit } from "lucide-react";

export default function Perfildashboard() {
  const { user } = useAuth();

  // Función helper para que el rol no se vea como "ROLE_ADMIN" en crudo
  const formatRole = (role: string | undefined) => {
    if (role === "ROLE_ADMIN") return "Administrador del Sistema";
    if (role === "ROLE_DOCTOR") return "Odontólogo";
    if (role === "ROLE_RECEPTIONIST") return "Recepción";
    return role || "Usuario";
  };

  // Fallback seguro por si el nombre no carga al instante
  const userName = user?.username || "Joao";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <AdminLayout currentPage={"perfil"}>
      {/* Contenedor centralizado para que no ocupe todo el ancho en pantallas gigantes */}
      <main className="mx-auto max-w-4xl p-6 flex flex-col gap-6">
        
        {/* Encabezado de la página */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Mi Perfil</h1>
            <p className="mt-1 text-slate-500">Gestiona tu información personal y credenciales</p>
          </div>
          <Button variant="outline" size="sm">
            <Edit size={16} />
            Editar Datos
          </Button>
        </div>

        {/* Tarjeta 1: Presentación Visual (Banner y Avatar) */}
        <Card className="overflow-hidden border border-border p-0 shadow-sm">
          {/* Banner con el degradado de tu tema */}
          <div className="h-24 w-full bg-gradient-to-r from-teal-500 to-cyan-600"></div>
          
          <div className="relative px-6 pb-6">
            {/* Avatar Flotante */}
            <div className="absolute -top-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-4xl font-bold text-teal-700 shadow-md">
              {userInitial}
            </div>

            <div className="pt-14">
              <h2 className="text-2xl font-bold text-slate-800">{userName}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <Shield size={16} className="text-teal-600" />
                {formatRole(user?.rol.name)}
              </p>
            </div>
          </div>
        </Card>

        {/* Tarjeta 2: Detalles de la Cuenta */}
        <Card className="border border-border p-6 shadow-sm">
          <h3 className="mb-6 border-b border-slate-100 pb-4 text-lg font-semibold text-slate-800">
            Detalles de la Cuenta
          </h3>

          {/* Grid responsivo: 1 columna en móvil, 2 en PC */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            {/* Bloque: Email */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-500">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Correo Electrónico</p>
                <p className="mt-0.5 font-semibold text-slate-800">{user?.email}</p>
              </div>
            </div>

            {/* Bloque: Rol (Con el Badge de colores que ya tenías) */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-500">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Nivel de Acceso</p>
                <div className="mt-1 inline-flex items-center rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  {user?.rol.name}
                </div>
              </div>
            </div>

            {/* Bloque: ID */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-500">
                <Key size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">ID de Usuario</p>
                <p className="mt-0.5 font-mono font-semibold text-slate-800">{user?.id}</p>
              </div>
            </div>

            {/* Bloque: Estado */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-500">
                <BadgeCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Estado de Cuenta</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  </span>
                  <p className="font-semibold text-emerald-600">Autenticado</p>
                </div>
              </div>
            </div>

          </div>
        </Card>
        
      </main>
    </AdminLayout>
  );
}