import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Stethoscope } from "lucide-react";
import { useAuth } from "../context/authContext";
import { routes } from "../utils/routes";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  
  // 🌟 Estado para el modal de cerrar sesión
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // 🌟 Función para confirmar el cierre de sesión
  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      
      {/* Header Responsive */}
      <header className="border-b border-teal-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          
          {/* Logo y Nombre */}
          <div className="flex items-center gap-8 min-w-0">
            <Link 
              to={routes.dashboard_profile} 
              className="flex items-center gap-3 group transition-transform hover:-translate-y-0.5 min-w-0"
              title="Ir al perfil"
            >
              <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-all">
                <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  Dr. {auth.user?.fullname || auth.user?.username}
                </p>
                <p className="text-sm md:text-base font-black bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent truncate">
                  Clínica Dental
                </p>
              </div>
            </Link>
          </div>

          {/* Botón de Logout Responsive */}
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm transition-all hover:shadow-sm shrink-0"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex-1">
        {children}
      </main>

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