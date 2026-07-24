import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// 1. Datos simulados de los estados de turnos del mes
const data = [
  { name: "Atendidos", value: 312, color: "#0d9488" }, // teal-600 (Éxito)
  { name: "Pendientes", value: 85, color: "#f59e0b" },  // amber-500 (En espera)
  { name: "Cancelados", value: 48, color: "#ef4444" },  // red-500 (Pérdida)
];

// 2. Tooltip personalizado para un diseño más limpio
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
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
  return (
    // Mantén la misma altura que el gráfico de ingresos para que se vean simétricos
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%" // Centrado horizontal
            cy="45%" // Un poco más arriba del centro para dejar espacio a la leyenda
            innerRadius={70} // Esto es lo que lo convierte en un "Donut" en vez de un "Pastel"
            outerRadius={100}
            paddingAngle={3} // Espacio en blanco entre las rebanadas
            dataKey="value"
            stroke="none" // Quita el borde por defecto para un look más moderno
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Leyenda en la parte inferior */}
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-slate-700 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}