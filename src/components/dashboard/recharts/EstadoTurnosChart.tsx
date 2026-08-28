import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import { turnService } from "../../../services/turn.service";


// 🌟 En lugar de importarlo, usamos la interfaz personalizada que creamos
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
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <div className="flex items-center gap-2">
          {/* Bolita de color indicadora */}
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <p className="font-semibold text-slate-800">{data.name}</p>
        </div>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Total: <span className="text-slate-900">{data.value} turnos</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function EstadoTurnosChart() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([
    { name: "Atendidos", value: 0, color: "#0d9488" }, // teal-600 (Éxito)
    { name: "Pendientes", value: 0, color: "#f59e0b" }, // amber-500 (En espera)
    { name: "Cancelados", value: 0, color: "#ef4444" }, // red-500 (Pérdida)
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Traemos todos los turnos (ajusta el size si en tu clínica manejan miles por mes)
        const response = await turnService.getAllPaginated(0, 500);

        if (response.ok) {
          const turnos = response.data.content;
          
          let atendidos = 0;
          let pendientes = 0;
          let cancelados = 0;

          // Iteramos y agrupamos según el status que viene de Spring Boot
          turnos.forEach((turno) => {
            const status = turno.status?.toUpperCase() || "";

            if (status === "ATENDIDO" || status === "FINALIZADO" || status === "COMPLETADO") {
              atendidos++;
            } else if (status === "CANCELADO") {
              cancelados++;
            } else {
              // Cualquier otro estado (PROGRAMADO, PENDIENTE, etc.) lo contamos como pendiente
              pendientes++;
            }
          });

          // Actualizamos la data del gráfico
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

  // Mostrar un loader mientras se traen los datos
  if (loading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  // Si no hay ningún turno registrado aún, mostramos un mensaje amigable
  const totalTurnos = chartData.reduce((acc, curr) => acc + curr.value, 0);
  if (totalTurnos === 0) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center text-slate-500">
        <p>No hay turnos registrados para graficar.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" // Centrado horizontal
            cy="45%" // Un poco más arriba del centro para dejar espacio a la leyenda
            innerRadius={70} // Esto es lo que lo convierte en un "Donut"
            outerRadius={100}
            paddingAngle={3} // Espacio en blanco entre las rebanadas
            dataKey="value"
            stroke="none" // Quita el borde por defecto
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />

          {/* Leyenda en la parte inferior */}
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="font-medium text-slate-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}