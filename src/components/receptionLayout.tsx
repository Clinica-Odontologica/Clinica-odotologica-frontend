import { 
  Calendar, 
  Users, 
  LogOut, 
  FileText, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
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
  const [isMobileOpen, setIsMobileOpen] = useState(false); 
  
  // 🌟 Nuevo estado para el modal de cerrar sesión
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const auth = useAuth();

  const uData = auth.user as unknown as UserWithRole;
  const roleName = uData?.role?.name || uData?.rol?.name || "Sin rol";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // 🌟 Función para confirmar el cierre de sesión
  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50">
      
      {/* OVERLAY OSCURO PARA MÓVIL */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar (Responsive) */}
      <aside
        className={`
          ${sidebarOpen ? "w-72" : "w-20"} 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-white border-r border-teal-100 transition-all duration-300 fixed z-50 h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col
        `}
      >
        <div className="p-6 border-b border-teal-50/50 flex items-center justify-between shrink-0 h-20">
          <div className="flex items-center gap-3 w-full overflow-hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-teal-200">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-xl text-slate-800 tracking-tight truncate transition-opacity duration-300">
                Clínica Dental
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Link 
                key={item.id} 
                to={item.href} 
                title={!sidebarOpen ? item.label : ""}
                onClick={() => setIsMobileOpen(false)} 
              >
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

        <div className="p-4 border-t border-teal-50 hidden lg:block">
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
        className={`transition-all duration-300 flex flex-col min-h-screen ${
          sidebarOpen ? "lg:ml-72" : "lg:ml-20"
        }`}
      >
        <header className="bg-white/80 backdrop-blur-md border-b border-teal-100 shadow-sm sticky top-0 z-30">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between">
            
            <div className="flex items-center gap-3 overflow-hidden mr-4">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 hidden sm:block" />
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate">
                <span className="sm:hidden">Hola, {uData?.username}</span>
                <span className="hidden sm:inline">
                  Bienvenido {uData?.username ? `${uData.username}` : ""}, espero que tengas un excelente día.
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all font-medium"
                title="Volver a la página anterior"
              >
                <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="text-sm hidden md:inline">Volver</span>
              </button>
              
              <div className="w-px h-5 bg-slate-200 hidden sm:block mx-1"></div>

              {/* 🌟 Botón modificado para abrir el modal */}
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all font-medium"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="text-sm hidden sm:inline">Salir</span>
              </button>
            </div>

          </div>
        </header>

        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>
      </div>

      {/* 🌟 MODAL DE CONFIRMACIÓN DE CERRAR SESIÓN */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsLogoutModalOpen(false)}
          />
          
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 bg-red-100 border-4 border-red-50">
              <LogOut className="h-8 w-8 text-red-500 ml-1" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Cerrar Sesión
            </h3>
            
            <p className="text-sm text-slate-500 mb-6 px-2 leading-relaxed">
              ¿Estás seguro de que deseas salir de tu cuenta? Tendrás que volver a ingresar tus credenciales.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 rounded-xl px-4 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 rounded-xl px-4 py-3 font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Sí, Salir
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}