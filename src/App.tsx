import { Route, Routes, useNavigate} from "react-router-dom";
import { Toaster } from "sonner";
import { ShieldAlert, ArrowLeft } from "lucide-react"; 
import "./App.css";
import { routes } from "./utils/routes";
import Login from "./pages/login";
import NuevoTurnoPage from "./pages/recepcionista/home";
import DoctorPage from "./pages/medico/doctorPage";
import AdminPage from "./pages/admin/dashboard/AdminPage";
import DasboardUsuarios from "./pages/admin/usuarios/dashboardUsuarios";
import DasboardOdontologos from "./pages/admin/odontologos/dashboardOdontologos";
import DasboardServicios from "./pages/admin/servicios/dashboardServicios";
import DashboardPacientes from "./pages/admin/pacientes/dashboardPacientes";
import { ProtectedRoute } from "./components/protectedRoute";
import Perfildashboard from "./pages/admin/perfil/perfildashboard";
import DashboardTurnos from "./pages/admin/turnos/dashboardTurnos";
import DashboardHistoria from "./pages/admin/historiaClinica/dashboardHistoria";

function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full animate-in zoom-in-95 duration-500">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 border-4 border-red-100 mb-6 shadow-sm">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">403</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Acceso Restringido
        </h2>
        <p className="text-slate-500 mb-8 leading-relaxed font-medium">
          Tu cuenta no tiene los permisos necesarios para ver esta página. Si crees que es un error, contacta al administrador del sistema.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a la página anterior
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        
        <Route path="/" element={<Login />} />

        {/* Public - Auth Page */}
        <Route path={routes.login} element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Reception / General Dashboard */}
        <Route
          path={routes.recepcion}
          element={
            <ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN"]}>
              <NuevoTurnoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.recepcion_turnos}
          element={
            <ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN"]}>
              <DashboardTurnos />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.recepcion_pacientes}
          element={
            <ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN"]}>
              <DashboardPacientes />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path={routes.doctor}
          element={
            <ProtectedRoute allowedRoles={["DOCTOR", "ADMIN"]}>
              <DoctorPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path={routes.admin}
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.dashboard_turnos}
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DashboardTurnos />
            </ProtectedRoute>
          }
        />

        <Route
          path={routes.dashboard_odontologos}
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DasboardOdontologos />
            </ProtectedRoute>
          }
        />

        <Route
          path={routes.dashboard_servicios}
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DasboardServicios />
            </ProtectedRoute>
          }
        />

        <Route
          path={routes.dashboard_users}
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DasboardUsuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path={routes.dashboard_pacientes}
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
              <DashboardPacientes />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.dashboard_historia_clinica}
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR", "RECEPTIONIST"]}>
              <DashboardHistoria/>
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.dashboard_profile}
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR", "RECEPTIONIST"]}>
              <Perfildashboard />
            </ProtectedRoute>
          }
        />

        {/* Ruta "Catch-all" para URLs inventadas o que no existen */}
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;