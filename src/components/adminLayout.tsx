import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  Users,
  User,
  Pill,
  LogOut,
  Menu,
  X,
  Gauge,
  Calendar,
  BriefcaseMedical,
  LayoutDashboardIcon,
  ClipboardPlus,
  ArrowLeft, // 🌟 Nuevo ícono importado
} from "lucide-react";
import { useState } from "react";
import { routes } from "../utils/routes";
import { useAuth } from "../context/authContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage:
    | "odontologos"
    | "turnos"
    | "servicios"
    | "usuarios"
    | "historia-clinica"
    | "pacientes"
    | "dashboard"
    | "perfil";
}

export function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // 🌟 Agregamos el hook para poder navegar hacia atrás
  const navigate = useNavigate();
  
  // 1. Extraemos el "user" para saber su rol
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // 2. Evaluamos si es administrador
  const isAdmin = user?.rol?.name === "ROLE_ADMIN" || user?.rol?.name === "ADMIN";

  // 3. Definimos TODAS las rutas posibles
  const allNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Gauge,
      href: routes.admin,
    },
    {
      id: "turnos",
      label: "Gestión de Turnos",
      icon: Calendar,
      href: routes.dashboard_turnos,
    },
    {
      id: "odontologos",
      label: "Gestión de Doctores",
      icon: BriefcaseMedical,
      href: routes.dashboard_odontologos,
    },
    {
      id: "pacientes",
      label: "Gestión de Pacientes",
      icon: Users,
      href: routes.dashboard_pacientes,
    },
    {
      id: "historia-clinica",
      label: "Historia Clínica",
      icon: ClipboardPlus,
      href: routes.dashboard_historia_clinica,
    },
    {
      id: "servicios",
      label: "Gestión de Servicios",
      icon: Pill,
      href: routes.dashboard_servicios,
    },
    {
      id: "usuarios",
      label: "Gestión de Usuarios",
      icon: Settings,
      href: routes.dashboard_users,
    },
    {
      id: "perfil",
      label: "Mi Perfil",
      icon: User,
      href: routes.dashboard_profile,
    },
  ];

  // 4. MAGIA: Si es Admin, ve todo. Si no, filtramos para que solo vea "perfil"
  const navItems = isAdmin 
    ? allNavItems 
    : allNavItems.filter((item) => item.id === "perfil");

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-teal-100 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-teal-50 rounded-lg md:hidden transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-teal-600" />
              ) : (
                <Menu className="w-5 h-5 text-teal-600" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <LayoutDashboardIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 hidden sm:block">
                Clinica Odontológica
              </h1>
            </div>
          </div>

          {/* 🌟 Nueva sección de botones (Volver y Salir) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
              title="Volver a la página anterior"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Volver</span>
            </button>
            
            <div className="w-px h-6 bg-slate-200 hidden sm:block mx-1"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } transition-all duration-300 bg-white border-r border-teal-100 hidden md:block md:w-64`}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Link key={item.id} to={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md"
                        : "text-slate-700 hover:bg-teal-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-16 bottom-0 w-64 bg-white border-r border-teal-100 shadow-lg">
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md"
                            : "text-slate-700 hover:bg-teal-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}