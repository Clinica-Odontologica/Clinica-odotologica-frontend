import IngresosCharts from "../../../components/dashboard/recharts/IngresosCharts";
import EstadoTurnosChart from "../../../components/dashboard/recharts/EstadoTurnosChart";
import RendimientoDoctores from "../../../components/dashboard/RendmientoDoctores";
import ContenedorKPIs from "../../../components/dashboard/ContenedorKPIS";
import { TrendingUp, PieChart } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-full min-w-0">
      
      {/* Fila 1: KPIs Principales */}
      <div className="w-full min-w-0">
        <ContenedorKPIs />
      </div>

      {/* Fila 2: Gráficos de Recharts (Grid Responsive) */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 w-full min-w-0">
        
        {/* Contenedor REAL para IngresosCharts */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-teal-100 p-4 md:p-6 shadow-sm transition-all hover:shadow-md flex flex-col min-w-0 w-full overflow-hidden">
          <h3 className="mb-4 flex items-center gap-2 text-base md:text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            <TrendingUp className="w-5 h-5 text-teal-600 shrink-0" />
            <span className="truncate">Evolución de Ingresos</span>
          </h3>
          {/* Altura adaptativa: más compacta en móvil para mejor navegación */}
          <div className="h-[280px] md:h-[350px] w-full flex-1 min-w-0 relative">
            <IngresosCharts />
          </div>
        </div>

        {/* Contenedor REAL para Gráfico de Donut */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-teal-100 p-4 md:p-6 shadow-sm transition-all hover:shadow-md flex flex-col min-w-0 w-full overflow-hidden">
          <h3 className="mb-4 flex items-center gap-2 text-base md:text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            <PieChart className="w-5 h-5 text-teal-600 shrink-0" />
            <span className="truncate">Estado de Turnos (Mes Actual)</span>
          </h3>
          {/* Altura adaptativa */}
          <div className="h-[280px] md:h-[350px] w-full flex-1 min-w-0 relative">
            <EstadoTurnosChart />
          </div>
        </div>
      </div>

      {/* Fila 3: Tabla de Rendimiento */}
      <div className="mt-2 md:mt-4 w-full min-w-0 overflow-hidden">
        <RendimientoDoctores />
      </div>
      
    </div>
  );
}