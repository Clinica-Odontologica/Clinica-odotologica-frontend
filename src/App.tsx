import { Route, Routes, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
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
import   DashboardTurnos  from "./pages/admin/turnos/dashboardTurnos";

function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-teal-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-teal-100 max-w-md">
        <h1 className="text-4xl font-bold text-teal-600 mb-4">403</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Acceso Denegado
        </h2>
        <p className="text-slate-600 mb-6">
          No tienes los permisos necesarios para acceder a esta sección.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
        >
          Volver al Inicio
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
          path={routes.recepcion_nuevos_turnos}
          element={
            <ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN"]}>
              <NuevoTurnoPage />
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
          path={routes.dashboard_profile}
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR", "RECEPTIONIST"]}>
              <Perfildashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;
