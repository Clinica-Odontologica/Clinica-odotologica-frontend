import IngresosCharts from "../../../components/dashboard/recharts/IngresosCharts";
import EstadoTurnosChart from "../../../components/dashboard/recharts/EstadoTurnosChart";
import RendimientoDoctores from "../../../components/dashboard/RendmientoDoctores";
import ContenedorKPIs from "../../../components/dashboard/ContenedorKPIS";
import { TrendingUp, PieChart } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Fila 1: KPIs Principales (Conectados al Backend automáticamente) */}
      <ContenedorKPIs />

      {/* Fila 2: Gráficos de Recharts (Grid de 2 columnas) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Contenedor REAL para IngresosCharts */}
        <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm transition-all hover:shadow-md flex flex-col">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Evolución de Ingresos
          </h3>
          <div className="h-[350px] w-full flex-1">
            <IngresosCharts />
          </div>
        </div>

        {/* Contenedor REAL para Gráfico de Donut */}
        <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm transition-all hover:shadow-md flex flex-col">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            <PieChart className="w-5 h-5 text-teal-600" />
            Estado de Turnos (Mes Actual)
          </h3>
          <div className="h-[350px] w-full flex-1">
            <EstadoTurnosChart />
          </div>
        </div>
      </div>

      {/* Fila 3: Tabla de Rendimiento */}
      <div className="mt-2">
        <RendimientoDoctores />
      </div>
      
    </div>
  );
}