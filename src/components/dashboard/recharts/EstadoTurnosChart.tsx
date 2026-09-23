import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";
import { turnService } from "../../../services/turn.service";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
      color: string;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="rounded-xl border border-teal-100 bg-white/95 backdrop-blur-sm p-3 md:p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="h-3 w-3 rounded-full shadow-sm"
            style={{ backgroundColor: data.color }}
          />
          <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">
            {data.name}
          </p>
        </div>
        <p className="text-base md:text-lg font-black text-slate-800">
          Total: <span style={{ color: data.color }}>{data.value}</span> turnos
        </p>
      </div>
    );
  }
  return null;
};

export default function EstadoTurnosChart() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([
    { name: "Atendidos", value: 0, color: "#0d9488" }, 
    { name: "Pendientes", value: 0, color: "#f59e0b" }, 
    { name: "Cancelados", value: 0, color: "#ef4444" }, 
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await turnService.getAllPaginated(0, 500);

        if (response.ok) {
          const turnos = response.data.content;
          
          let atendidos = 0;
          let pendientes = 0;
          let cancelados = 0;

          turnos.forEach((turno: { status?: string }) => {
            const status = turno.status?.toUpperCase() || "";

            if (status === "ATENDIDO" || status === "FINALIZADO" || status === "COMPLETADO") {
              atendidos++;
            } else if (status === "CANCELADO") {
              cancelados++;
            } else {
              pendientes++;
            }
          });

          setChartData([
            { name: "Atendidos", value: atendidos, color: "#0d9488" },
            { name: "Pendientes", value: pendientes, color: "#f59e0b" },
            { name: "Cancelados", value: cancelados, color: "#ef4444" },
          ]);
        }
      } catch (error) {
        console.error("Error al cargar los datos del gráfico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex w-full h-[300px] md:h-full min-h-[300px] items-center justify-center min-w-0">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  const totalTurnos = chartData.reduce((acc, curr) => acc + curr.value, 0);
  
  if (totalTurnos === 0) {
    return (
      <div className="flex w-full h-[300px] md:h-full min-h-[300px] flex-col items-center justify-center text-center px-4 min-w-0">
        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
          <PieChartIcon className="w-6 h-6 text-slate-300" />
        </div>
        <p className="font-bold text-slate-600">No hay turnos registrados</p>
        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">El gráfico se generará cuando hayan citas en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] md:h-full min-h-[300px] min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" 
            cy="45%" 
            // 🌟 Radios reducidos ligeramente (60/90 en lugar de 70/100) para que no se corte en pantallas de 320px
            innerRadius={60} 
            outerRadius={90}
            paddingAngle={4} 
            dataKey="value"
            stroke="none"
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                className="hover:opacity-80 transition-opacity outline-none"
              />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />

          {/* Leyenda responsiva */}
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="font-bold text-xs md:text-sm text-slate-600 ml-1">{value}</span>
            )}
            wrapperStyle={{ paddingTop: "4px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}