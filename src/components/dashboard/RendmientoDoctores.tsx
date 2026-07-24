import { Card } from "../ui/card/card";

// 1. Datos simulados (que luego vendrán de tu backend Spring Boot)
const doctoresData = [
  {
    id: 1,
    name: "Dra. Ana Silva",
    specialty: "Ortodoncia",
    patients: 145,
    revenue: 12500,
    status: "excelente", // Para pintar un indicador visual
  },
  {
    id: 2,
    name: "Dr. Carlos Ruiz",
    specialty: "Implantología",
    patients: 82,
    revenue: 18400, // Menos pacientes, pero tratamientos más caros
    status: "bueno",
  },
  {
    id: 3,
    name: "Dra. Laura Gómez",
    specialty: "Odontopediatría",
    patients: 110,
    revenue: 8200,
    status: "bueno",
  },
  {
    id: 4,
    name: "Dr. Miguel Torres",
    specialty: "Odontología General",
    patients: 95,
    revenue: 5600,
    status: "regular",
  },
];

export default function RendimientoDoctores() {
  return (
    <Card className="p-0 overflow-hidden border border-border shadow-sm">
      {/* Encabezado de la Tabla */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Rendimiento por Odontólogo
          </h3>
          <p className="text-sm text-slate-500">
            Métricas de productividad del mes actual
          </p>
        </div>
      </div>

      {/* Contenedor responsivo para la tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Doctor</th>
              <th className="px-6 py-4 font-medium">Especialidad</th>
              <th className="px-6 py-4 font-medium text-center">Pacientes Atendidos</th>
              <th className="px-6 py-4 font-medium text-right">Ingresos Generados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {doctoresData.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                
                {/* Columna: Nombre y Avatar */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar circular con las iniciales */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-semibold text-xs">
                      {doc.name.split(" ")[1][0]}{doc.name.split(" ")[2]?.[0] || ""}
                    </div>
                    <span className="font-medium text-slate-800">{doc.name}</span>
                  </div>
                </td>

                {/* Columna: Especialidad con Badge */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {doc.specialty}
                  </span>
                </td>

                {/* Columna: Pacientes (Centrado) */}
                <td className="px-6 py-4 text-center font-medium text-slate-700">
                  {doc.patients}
                </td>

                {/* Columna: Ingresos (Alineado a la derecha) */}
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-teal-600">
                    S/ {doc.revenue.toLocaleString("es-PE")}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}