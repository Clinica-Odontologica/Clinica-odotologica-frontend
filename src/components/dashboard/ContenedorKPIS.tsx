import { useState, useEffect } from "react";
import { DollarSign, Users, CalendarCheck, TrendingDown, Loader2 } from "lucide-react";
import TarjetaKPI from "./TarjetaKPI"; // 👈 Asegúrate de que la ruta apunte a tu archivo TarjetaKPI.tsx
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

        // 1. Llamamos a los servicios de turnos y pacientes al mismo tiempo
        const [turnsRes, patsRes] = await Promise.all([
          turnService.getAllPaginated(0, 1000),
          patientService.getAllPaginated(0, 1000),
        ]);

        if (turnsRes.ok && patsRes.ok) {
          const turnos: TurnResponseDTO[] = turnsRes.data.content;
          
          // --- PREPARAMOS LAS FECHAS ACTUALES ---
          const fechaActual = new Date();
          const anio = fechaActual.getFullYear();
          const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
          const dia = String(fechaActual.getDate()).padStart(2, "0");
          
          const hoyStr = `${anio}-${mes}-${dia}`; // Ejemplo: "2026-08-28"
          const mesActualStr = `${anio}-${mes}`; // Ejemplo: "2026-08"

          // --- VARIABLES PARA CONTAR ---
          let ingresosMes = 0;
          let citasHoy = 0;
          let turnosCancelados = 0;

          // 2. Analizamos turno por turno
          turnos.forEach((turno) => {
            const rawDate = turno.appointmentDate || ""; 
            const [fechaPart] = rawDate.split("T"); // "2026-08-28"

            // A. Citas para hoy (que no estén canceladas)
            if (fechaPart === hoyStr && turno.status !== "CANCELADO") {
              citasHoy++;
            }

            // B. Ingresos del mes actual (sumamos los que son de este mes y no están cancelados)
            if (fechaPart.startsWith(mesActualStr) && turno.status !== "CANCELADO") {
              ingresosMes += turno.totalCost || 0;
            }

            // C. Conteo de cancelaciones (histórico global)
            if (turno.status === "CANCELADO") {
              turnosCancelados++;
            }
          });

          // 3. Calculamos la tasa de cancelación
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <TarjetaKPI
        title="Ingresos del Mes"
        value={`S/ ${metrics.ingresosMes.toLocaleString("es-PE")}`}
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
        title="Tasa de Cancelación"
        value={`${metrics.tasaCancelacion}%`}
        icon={<TrendingDown className="w-5 h-5" />}
        description="Histórico de cancelaciones"
        trendDirection={metrics.tasaCancelacion > 15 ? "down" : "up"}
      />
    </div>
  );
}