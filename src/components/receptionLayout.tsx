import { Calendar, Users, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../utils/routes";
import { useAuth } from "../context/authContext";

export function ReceptionLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-teal-100 transition-all duration-300 fixed h-full shadow-lg`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-teal-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-slate-900">Clínica Dental</span>
            )}
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-teal-100">
            <div className="text-sm">
              <p className="font-semibold text-slate-900">{auth.user?.username}</p>
              <p className="text-xs text-teal-600">{auth.user?.rol.name}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <Link
            to={routes.recepcion}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-100 to-teal-100 text-teal-700 font-medium transition-colors hover:from-cyan-200 hover:to-teal-200"
          >
            <Calendar className="w-5 h-5" />
            {sidebarOpen && "Agenda"}
          </Link>
          <Link
            to={routes.recepcion_pacientes}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-teal-50 transition-colors"
          >
            <Users className="w-5 h-5" />
            {sidebarOpen && "Pacientes"}
          </Link>
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-6 left-6 p-2 rounded-lg hover:bg-teal-50 transition-colors text-slate-700"
        >
          <Menu className="w-5 h-5" />
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={`${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}
      >
        {/* Header */}
        <header className="bg-white border-b border-teal-100 shadow-sm sticky top-0 z-40">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent">
              Gestión de Recepción
            </h1>
            <button className="p-2 rounded-lg hover:bg-teal-50 transition-colors text-slate-600 hover:text-slate-900">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
