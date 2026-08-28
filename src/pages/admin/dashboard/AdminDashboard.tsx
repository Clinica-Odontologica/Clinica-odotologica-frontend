// Ya no necesitamos importar TarjetaKPI ni los íconos aquí, porque el ContenedorKPIs se encarga de eso.
import IngresosCharts from "../../../components/dashboard/recharts/IngresosCharts";
import EstadoTurnosChart from "../../../components/dashboard/recharts/EstadoTurnosChart";
import RendimientoDoctores from "../../../components/dashboard/RendmientoDoctores";
import ContenedorKPIs from "../../../components/dashboard/ContenedorKPIS";

export default function AdminDashboard() {
  return (
    <main className="flex flex-col gap-6">
      {/* Fila 1: KPIs Principales (Conectados al Backend automáticamente) */}
      <ContenedorKPIs />

      {/* Fila 2: Gráficos de Recharts (Grid de 2 columnas) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contenedor REAL para IngresosCharts */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Evolución de Ingresos
          </h3>
          <IngresosCharts />
        </div>

        {/* Contenedor REAL para Gráfico de Donut */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Estado de Turnos (Mes Actual)
          </h3>
          <EstadoTurnosChart />
        </div>
      </div>

      {/* Fila 3: Tabla de Rendimiento */}
      <div className="mt-2">
        <RendimientoDoctores />
      </div>
    </main>
  );
}