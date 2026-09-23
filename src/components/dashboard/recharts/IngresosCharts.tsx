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
      <div className="rounded-xl border border-teal-100 bg-white/95 backdrop-blur-sm p-3 md:p-4 shadow-xl">
        <p className="mb-1 text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-base md:text-lg font-black text-teal-600">
          Ingresos: S/ {payload[0].value.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
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
        const response = await turnService.getAllPaginated(0, 500);

        if (response.ok) {
          const turnos = response.data.content;

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

          turnos.forEach((turno: TurnResponseDTO) => {
            if (turno.status !== "CANCELADO" && turno.appointmentDate) {
              const monthString = turno.appointmentDate.split("-")[1]; 
              const monthIndex = parseInt(monthString, 10) - 1; 

              if (monthIndex >= 0 && monthIndex <= 11) {
                mesesEstructura[monthIndex].ingresos += turno.totalCost || 0;
              }
            }
          });

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
      <div className="flex h-[300px] w-full items-center justify-center min-w-0">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] md:h-full min-h-[300px] min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
            dy={10}
            minTickGap={15} 
          />

          <YAxis
            tickFormatter={(value) => `S/${value > 0 ? value / 1000 + 'k' : 0}`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
            dx={-5}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
          />

          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="#0d9488"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIngresos)"
            activeDot={{ r: 6, fill: "#0d9488", stroke: "#ffffff", strokeWidth: 2 }}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}