import { Route, Routes } from "react-router-dom";
import "./App.css";
import { routes } from "./utils/routes";
import Login from "./pages/login";
import NuevoTurnoPage from "./pages/home";
import DoctorPage from "./pages/medico/doctorPage";
import AdminPage from "./pages/admin/dashboard/AdminPage";
import DasboardUsuarios from "./pages/admin/usuarios/dashboardUsuarios";
import DasboardOdontologos from "./pages/admin/odontologos/dashboardOdontologos";
import DasboardServicios from "./pages/admin/servicios/dashboardServicios";

function App() {


  return (
    <>

      <Routes>
        {/* Auth Page */}
        <Route path={routes.login} element={<Login />} />

        {/* Reception*/}
        <Route path={routes.recepcion} element={<NuevoTurnoPage/>} />

        {/* Doctor */}
        <Route path={routes.doctor} element={<DoctorPage/>} />

        {/* Admin routes */}
        <Route path={routes.admin} element={<AdminPage />} />
        <Route path={routes.dashboard_odontologos} element={<DasboardOdontologos />} />
        <Route path={routes.dashboard_servicios} element={<DasboardServicios />} />
        <Route path={routes.dashboard_user} element={<DasboardUsuarios />} />
      </Routes>

    </>
  );
}

export default App;
