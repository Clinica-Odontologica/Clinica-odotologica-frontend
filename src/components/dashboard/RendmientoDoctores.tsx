import { useState, useEffect } from "react";
import { Card } from "../ui/card/card";
import { Loader2 } from "lucide-react";
import { doctorService } from "../../services/doctor.service";
import { turnService } from "../../services/turn.service";
import type { DoctorDTO } from "../../models/doctor/doctorDTO";
import type { TurnResponseDTO } from "../../models/turn/turnResponseDTO";

// 🌟 Interfaz estricta para nuestra tabla procesada
interface DoctorPerformance {
  id: number;
  name: string;
  specialty: string;
  patients: number;
  revenue: number;
}

export default function RendimientoDoctores() {
  const [loading, setLoading] = useState(true);
  const [doctoresData, setDoctoresData] = useState<DoctorPerformance[]>([]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        
        // 1. Traemos doctores y turnos en paralelo para mayor velocidad
        const [docsRes, turnsRes] = await Promise.all([
          doctorService.getAllPaginated(0, 100),
          turnService.getAllPaginated(0, 500),
        ]);

        if (docsRes.ok && turnsRes.ok) {
          const doctors: DoctorDTO[] = docsRes.data.content;
          const turns: TurnResponseDTO[] = turnsRes.data.content;

          // 2. Mapeamos cada doctor para calcular sus estadísticas
          const performanceData = doctors.map((doc) => {
            // Filtramos solo los turnos que pertenecen a este doctor y que NO estén cancelados
            const doctorTurns = turns.filter(
              (t) => t.doctorId === doc.id && t.status !== "CANCELADO"
            );

            // Sumamos el total de esos turnos
            const revenue = doctorTurns.reduce(
              (acc, curr) => acc + (curr.totalCost || 0),
              0
            );

            // Para asegurar compatibilidad con diferentes nombres de variables en el backend
            const apellido = doc.lastName || doc.last_name || "";

            return {
              id: doc.id,
              name: `Dr/a. ${doc.name} ${apellido}`.trim(),
              specialty: doc.specialty || "Odontología General",
              patients: doctorTurns.length, // Cada turno equivale a un paciente atendido/programado
              revenue: revenue,
            };
          });

          // 3. Ordenamos de mayor a menor ingreso (Ranking)
          performanceData.sort((a, b) => b.revenue - a.revenue);

          setDoctoresData(performanceData);
        }
      } catch (error) {
        console.error("Error al cargar el rendimiento de doctores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  // Función segura para extraer iniciales (evita errores si falta el apellido)
  const getInitials = (fullName: string) => {
    const parts = fullName.replace("Dr/a. ", "").split(" ");
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  };

  return (
    <Card className="p-0 overflow-hidden border border-border shadow-sm">
      {/* Encabezado de la Tabla */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Rendimiento por Odontólogo
          </h3>
          <p className="text-sm text-slate-500">
            Métricas de productividad basadas en citas programadas y atendidas
          </p>
        </div>
      </div>

      {/* Contenedor responsivo para la tabla */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex h-48 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        ) : doctoresData.length === 0 ? (
          <div className="flex h-48 w-full items-center justify-center text-slate-500">
            No hay doctores registrados aún.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Doctor</th>
                <th className="px-6 py-4 font-medium">Especialidad</th>
                <th className="px-6 py-4 font-medium text-center">
                  Citas
                </th>
                <th className="px-6 py-4 font-medium text-right">
                  Ingresos Generados
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {doctoresData.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Columna: Nombre y Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar circular con iniciales generadas dinámicamente */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-semibold text-xs">
                        {getInitials(doc.name)}
                      </div>
                      <span className="font-medium text-slate-800">
                        {doc.name}
                      </span>
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
        )}
      </div>
    </Card>
  );
}