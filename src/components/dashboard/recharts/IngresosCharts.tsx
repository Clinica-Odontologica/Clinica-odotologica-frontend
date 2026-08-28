import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { turnService } from "../../../services/turn.service";
import type { TurnResponseDTO } from "../../../models/turn/turnResponseDTO";

// 🌟 Interfaz personalizada para el Tooltip para evitar el error de "any"
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <p className="mb-1 font-semibold text-slate-800">{label}</p>
        <p className="font-medium text-teal-600">
          Ingresos: S/ {payload[0].value.toLocaleString("es-PE")}
        </p>
      </div>
    );
  }
  return null;
};

export default function IngresosCharts() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ month: string; ingresos: number }[]>([]);

  useEffect(() => {
    const fetchIngresos = async () => {
      try {
        setLoading(true);
        // Traemos los turnos. Ajusta el límite si es necesario.
        const response = await turnService.getAllPaginated(0, 500);

        if (response.ok) {
          const turnos = response.data.content;

          // 1. Preparamos nuestro molde de meses en 0
          const mesesEstructura = [
            { month: "Ene", ingresos: 0 },
            { month: "Feb", ingresos: 0 },
            { month: "Mar", ingresos: 0 },
            { month: "Abr", ingresos: 0 },
            { month: "May", ingresos: 0 },
            { month: "Jun", ingresos: 0 },
            { month: "Jul", ingresos: 0 },
            { month: "Ago", ingresos: 0 },
            { month: "Sep", ingresos: 0 },
            { month: "Oct", ingresos: 0 },
            { month: "Nov", ingresos: 0 },
            { month: "Dic", ingresos: 0 },
          ];

          // 2. Iteramos cada turno y sumamos su costo al mes correspondiente
          turnos.forEach((turno: TurnResponseDTO) => {
            // Ignoramos los turnos cancelados para calcular el ingreso real
            if (turno.status !== "CANCELADO" && turno.appointmentDate) {
              // appointmentDate viene como "2026-08-31T16:46:00", así que extraemos el mes (índice 1 tras hacer split por "-")
              const monthString = turno.appointmentDate.split("-")[1]; 
              const monthIndex = parseInt(monthString, 10) - 1; // Le restamos 1 porque Enero es 0 en arreglos

              // Verificamos que el índice sea válido (0-11) y sumamos el totalCost
              if (monthIndex >= 0 && monthIndex <= 11) {
                mesesEstructura[monthIndex].ingresos += turno.totalCost || 0;
              }
            }
          });

          // 3. Actualizamos el estado con la data procesada
          setChartData(mesesEstructura);
        }
      } catch (error) {
        console.error("Error al cargar los datos de ingresos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngresos();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          {/* Definimos el gradiente de color para el relleno del gráfico */}
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Cuadrícula de fondo (solo líneas horizontales para mayor limpieza) */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

          {/* Eje X (Meses) */}
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            dy={10}
          />

          {/* Eje Y (Montos) */}
          <YAxis
            tickFormatter={(value) => `S/ ${value / 1000}k`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "5 5" }}
          />

          {/* La línea y el área con el gradiente */}
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="#0d9488" /* Color teal-600 de Tailwind */
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIngresos)"
            activeDot={{ r: 6, fill: "#0d9488", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}