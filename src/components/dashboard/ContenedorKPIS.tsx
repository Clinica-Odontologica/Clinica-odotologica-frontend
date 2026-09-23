import { useState, useEffect } from "react";
import { DollarSign, Users, CalendarCheck, TrendingDown } from "lucide-react";
import TarjetaKPI from "./TarjetaKPI"; 
import { turnService } from "../../services/turn.service";
import { patientService } from "../../services/patient.service";
import type { TurnResponseDTO } from "../../models/turn/turnResponseDTO";

export default function ContenedorKPIs() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    ingresosMes: 0,
    totalPacientes: 0,
    citasHoy: 0,
    tasaCancelacion: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);

        const [turnsRes, patsRes] = await Promise.all([
          turnService.getAllPaginated(0, 1000),
          patientService.getAllPaginated(0, 1000),
        ]);

        if (turnsRes.ok && patsRes.ok) {
          const turnos: TurnResponseDTO[] = turnsRes.data.content;
          
          const fechaActual = new Date();
          const anio = fechaActual.getFullYear();
          const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
          const dia = String(fechaActual.getDate()).padStart(2, "0");
          
          const hoyStr = `${anio}-${mes}-${dia}`;
          const mesActualStr = `${anio}-${mes}`; 

          let ingresosMes = 0;
          let citasHoy = 0;
          let turnosCancelados = 0;

          turnos.forEach((turno) => {
            const rawDate = turno.appointmentDate || ""; 
            const [fechaPart] = rawDate.split("T"); 
            if (fechaPart === hoyStr && turno.status !== "CANCELADO") {
              citasHoy++;
            }

            if (fechaPart.startsWith(mesActualStr) && turno.status !== "CANCELADO") {
              ingresosMes += turno.totalCost || 0;
            }

            if (turno.status === "CANCELADO") {
              turnosCancelados++;
            }
          });

          const totalTurnos = turnos.length;
          const tasaCancelacion = totalTurnos > 0 
            ? Math.round((turnosCancelados / totalTurnos) * 100) 
            : 0;

          setMetrics({
            ingresosMes,
            totalPacientes: patsRes.data.content.length,
            citasHoy,
            tasaCancelacion,
          });
        }
      } catch (error) {
        console.error("Error al cargar KPIs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-2 md:mb-6 w-full min-w-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 md:h-32 rounded-2xl md:rounded-3xl border border-teal-100 bg-white p-5 flex flex-col justify-between shadow-sm min-w-0">
            <div className="flex justify-between items-center w-full">
              <div className="h-4 w-1/2 bg-slate-100 rounded-md animate-pulse"></div>
              <div className="h-10 w-10 bg-slate-100 rounded-xl animate-pulse"></div>
            </div>
            <div className="h-8 w-2/3 bg-slate-100 rounded-lg animate-pulse mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-2 md:mb-6 w-full min-w-0">
      <TarjetaKPI
        title="Ingresos del Mes"
        value={`S/ ${metrics.ingresosMes.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
        icon={<DollarSign className="w-5 h-5" />}
        description="Recaudación actual"
        trendDirection="neutral"
      />

      <TarjetaKPI
        title="Pacientes Registrados"
        value={metrics.totalPacientes}
        icon={<Users className="w-5 h-5" />}
        description="En la base de datos"
        trendDirection="neutral"
      />

      <TarjetaKPI
        title="Citas para Hoy"
        value={metrics.citasHoy}
        icon={<CalendarCheck className="w-5 h-5" />}
        description="Citas programadas"
        trendDirection={metrics.citasHoy > 0 ? "up" : "neutral"}
      />

      <TarjetaKPI
        title="Tasa Cancelación"
        value={`${metrics.tasaCancelacion}%`}
        icon={<TrendingDown className="w-5 h-5" />}
        description="Histórico de turnos"
        trendDirection={metrics.tasaCancelacion > 15 ? "down" : "up"}
      />
    </div>
  );
}