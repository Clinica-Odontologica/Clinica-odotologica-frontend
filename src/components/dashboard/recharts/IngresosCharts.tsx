import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 1. Datos simulados (Luego los reemplazarás con los datos reales de tu backend)
const data = [
  { month: "Ene", ingresos: 18500 },
  { month: "Feb", ingresos: 19200 },
  { month: "Mar", ingresos: 21000 },
  { month: "Abr", ingresos: 20500 },
  { month: "May", ingresos: 23400 },
  { month: "Jun", ingresos: 22800 },
  { month: "Jul", ingresos: 25600 },
  { month: "Ago", ingresos: 24500 },
  { month: "Sep", ingresos: 26800 },
  { month: "Oct", ingresos: 28000 },
  { month: "Nov", ingresos: 29500 },
  { month: "Dic", ingresos: 32000 },
];

// 2. Custom Tooltip para darle un diseño limpio al pasar el mouse
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
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
  return (
    // Es vital que el contenedor tenga un alto definido (h-[300px]) para que ResponsiveContainer funcione
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
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

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} />

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