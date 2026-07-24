import TarjetaKPI from "../../../components/dashboard/TarjetaKPI";
import { DollarSign, Users, CalendarX, UserPlus } from "lucide-react";
import IngresosCharts from "../../../components/dashboard/recharts/IngresosCharts";
import EstadoTurnosChart from "../../../components/dashboard/recharts/EstadoTurnosChart";
import RendimientoDoctores from "../../../components/dashboard/RendmientoDoctores";

export default function AdminDashboard() {
  return (
    <main className="flex flex-col gap-6">
      {/* Fila 1: KPIs Principales (Grid de 4 columnas) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaKPI
          title="Ingresos del Mes"
          value="S/ 24,500"
          icon={<DollarSign size={20} />}
          trend="+12%"
          trendDirection="up"
          description="vs. mes anterior"
        />

        <TarjetaKPI
          title="Pacientes Nuevos"
          value="45"
          icon={<UserPlus size={20} />}
          trend="+5%"
          trendDirection="up"
          description="vs. mes anterior"
        />

        <TarjetaKPI
          title="Turnos Atendidos"
          value="312"
          icon={<Users size={20} />}
          trend="-2%"
          trendDirection="down"
          description="vs. mes anterior"
        />

        <TarjetaKPI
          title="Tasa de Ausentismo"
          value="12%"
          icon={<CalendarX size={20} />}
          trend="-1.5%"
          trendDirection="up"
          description="Pacientes que no asistieron"
        />
      </div>

      {/* Fila 2: Gráficos de Recharts (Grid de 2 columnas) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contenedor REAL para IngresosCharts */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Evolución de Ingresos
          </h3>
          {/* Aquí llamamos al componente */}
          <IngresosCharts />
        </div>

        {/* Contenedor temporal para Gráfico de Donut */}
        {/* Contenedor REAL para Gráfico de Donut */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Estado de Turnos (Mes Actual)
          </h3>
          {/* Aquí llamamos al componente Donut */}
          <EstadoTurnosChart />
        </div>
      </div>

      <div className="mt-2">
        <RendimientoDoctores />
      </div>
    </main>
  );
}
