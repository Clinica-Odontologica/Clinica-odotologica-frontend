import { Link } from "react-router-dom";
import { LogOut, Calendar, Stethoscope } from "lucide-react";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="border-b border-teal-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/medico/agenda" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Dr. Sistema
                </p>
                <p className="text-sm font-bold bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent">
                  Clínica Dental
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/medico/agenda"
                className="flex items-center gap-2 text-slate-600 hover:text-cyan-700 transition-colors font-medium text-sm"
              >
                <Calendar className="w-4 h-4" />
                Mi Agenda
              </Link>
            </nav>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-teal-100 bg-white/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-600">
          <p>
            © 2024 Sistema de Gestión Clínica Dental. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
