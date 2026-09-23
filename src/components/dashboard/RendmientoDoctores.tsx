import { useState, useEffect } from "react";
import { Card } from "../ui/card/card";
import { Loader2, Trophy, Users } from "lucide-react";
import { doctorService } from "../../services/doctor.service";
import { turnService } from "../../services/turn.service";
import type { DoctorDTO } from "../../models/doctor/doctorDTO";
import type { TurnResponseDTO } from "../../models/turn/turnResponseDTO";

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
        
        const [docsRes, turnsRes] = await Promise.all([
          doctorService.getAllPaginated(0, 100),
          turnService.getAllPaginated(0, 500),
        ]);

        if (docsRes.ok && turnsRes.ok) {
          const doctors: DoctorDTO[] = docsRes.data.content;
          const turns: TurnResponseDTO[] = turnsRes.data.content;

          const performanceData = doctors.map((doc) => {
            const doctorTurns = turns.filter(
              (t) => t.doctorId === doc.id && t.status !== "CANCELADO"
            );

            const revenue = doctorTurns.reduce(
              (acc, curr) => acc + (curr.totalCost || 0),
              0
            );

            const apellido = doc.lastName || doc.last_name || "";

            return {
              id: doc.id,
              name: `Dr/a. ${doc.name} ${apellido}`.trim(),
              specialty: doc.specialty || "Odontología General",
              patients: doctorTurns.length, 
              revenue: revenue,
            };
          });

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

  const getInitials = (fullName: string) => {
    const parts = fullName.replace("Dr/a. ", "").split(" ");
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  };

  return (
    <Card className="p-0 overflow-hidden border border-teal-100 shadow-sm w-full min-w-0 rounded-2xl md:rounded-3xl">
      
      {/* Encabezado de la Tabla Responsivo */}
      <div className="p-4 md:p-6 border-b border-teal-100 flex items-center gap-3 bg-white">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center shrink-0 border border-amber-200">
          <Trophy className="w-5 h-5 text-amber-600" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900 truncate">
            Rendimiento por Odontólogo
          </h3>
          <p className="text-sm text-slate-500 truncate">
            Métricas de productividad basadas en citas
          </p>
        </div>
      </div>

      {/* Contenedor con Scroll Lateral Seguro */}
      <div className="overflow-x-auto w-full bg-white">
        {loading ? (
          <div className="flex h-48 w-full items-center justify-center flex-col gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Analizando Rendimiento...</p>
          </div>
        ) : doctoresData.length === 0 ? (
          <div className="flex flex-col h-48 w-full items-center justify-center text-slate-500 px-4 text-center">
            <Users className="w-10 h-10 text-slate-300 mb-2" />
            <p className="font-medium text-slate-600">No hay datos registrados aún.</p>
            <p className="text-xs text-slate-400 mt-1">El rendimiento aparecerá cuando los doctores atiendan citas.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">
                  Doctor
                </th>
                <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">
                  Especialidad
                </th>
                <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap text-center">
                  Citas Atendidas
                </th>
                <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap text-right">
                  Ingresos Generados
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {doctoresData.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-cyan-50/50 transition-colors"
                >
                  {/* Columna: Nombre y Avatar */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* Avatar Premium */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-xs shadow-sm shrink-0">
                        {getInitials(doc.name)}
                      </div>
                      <span className="font-bold text-slate-900">
                        {doc.name}
                      </span>
                    </div>
                  </td>

                  {/* Columna: Especialidad */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-indigo-700">
                      {doc.specialty}
                    </span>
                  </td>

                  {/* Columna: Pacientes (Centrado) */}
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                      {doc.patients}
                    </span>
                  </td>

                  {/* Columna: Ingresos (Alineado a la derecha) */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <span className="font-black text-teal-600 text-base">
                      S/ {doc.revenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
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