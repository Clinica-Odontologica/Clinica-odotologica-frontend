import { 
  Calendar, 
  Users, 
  LogOut, 
  FileText, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles 
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../utils/routes";
import { useAuth } from "../context/authContext";

interface ReceptionLayoutProps {
  children: React.ReactNode;
  currentPage: "agenda" | "pacientes" | "turnos" | "perfil"; 
}

type UserWithRole = {
  username?: string;
  role?: { name: string };
  rol?: { name: string };
};

export function ReceptionLayout({ children, currentPage }: ReceptionLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const auth = useAuth();

  const uData = auth.user as unknown as UserWithRole;
  const roleName = uData?.role?.name || uData?.rol?.name || "Sin rol";

  const navItems = [
    {
      id: "agenda",
      label: "Agenda",
      icon: Calendar,
      href: routes.recepcion,
    },
    {
      id: "pacientes",
      label: "Pacientes",
      icon: Users,
      href: routes.recepcion_pacientes,
    },
    {
      id: "turnos",
      label: "Turnos",
      icon: FileText,
      href: routes.recepcion_turnos, 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50">
      
      {/* Sidebar Mejorado */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } bg-white border-r border-teal-100 transition-all duration-300 fixed z-50 h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-teal-50/50 flex items-center justify-center shrink-0 h-20">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-teal-200">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-xl text-slate-800 tracking-tight truncate transition-opacity duration-300">
                Clínica Dental
              </span>
            )}
          </div>
        </div>

        {/* User Info Compacto */}
        <div className={`p-4 mx-3 mt-4 mb-2 rounded-2xl transition-all duration-300 ${sidebarOpen ? 'bg-slate-50 border border-slate-100' : 'bg-transparent px-0'}`}>
          <div className="flex items-center gap-3">
            {sidebarOpen ? (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{uData?.username?.toUpperCase()}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <p className="text-xs font-medium text-slate-500 truncate">
                    {roleName.replaceAll("ROLE_", "")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-400" title={`Conectado como ${uData?.username}`}></div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Dinámica */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Link key={item.id} to={item.href} title={!sidebarOpen ? item.label : ""}>
                <div
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ease-in-out ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md shadow-cyan-500/20"
                      : "text-slate-600 hover:bg-teal-50/80 hover:text-teal-700 hover:translate-x-1"
                  } ${!sidebarOpen && "justify-center px-0"}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'}`} />
                  {sidebarOpen && <span className="font-semibold text-sm tracking-wide">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button al Footer */}
        <div className="p-4 border-t border-teal-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center p-3 rounded-xl transition-colors hover:bg-slate-100 text-slate-500 hover:text-slate-800 ${sidebarOpen ? 'w-full justify-between' : 'justify-center w-full'}`}
            title={sidebarOpen ? "Colapsar menú" : "Expandir menú"}
          >
            {sidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">Ocultar Menú</span>}
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`${sidebarOpen ? "ml-72" : "ml-20"} transition-all duration-300 flex flex-col min-h-screen`}
      >
        {/* Header Mejorado */}
        <header className="bg-white/80 backdrop-blur-md border-b border-teal-100 shadow-sm sticky top-0 z-40">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between">
            
            {/* Saludo Responsivo */}
            <div className="flex items-center gap-2 overflow-hidden mr-4">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 hidden sm:block" />
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate">
                <span className="sm:hidden">Hola, {uData?.username}</span>
                <span className="hidden sm:inline">
                  Bienvenido {uData?.username ? `${uData.username}` : ""}, espero que tengas un excelente día.
                </span>
              </h1>
            </div>

            {/* Sección de botones (Volver y Salir) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all font-medium"
                title="Volver a la página anterior"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm hidden md:inline">Volver</span>
              </button>
              
              <div className="w-px h-5 bg-slate-200 hidden sm:block mx-1"></div>

              <button
                onClick={() => auth.logout()}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Salir</span>
              </button>
            </div>

          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}