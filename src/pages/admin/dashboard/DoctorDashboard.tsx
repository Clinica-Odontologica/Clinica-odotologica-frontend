import { Card } from "../../../components/ui/card/card";
import { Button } from "../../../components/ui/button/button"; // Ajusta la ruta a tu botón real
import { 
  Clock, 
  CheckCircle2, 
  User, 
  FileText, 
  PlayCircle,
  AlertCircle
} from "lucide-react";

// 1. Datos simulados de la agenda del día (Luego vendrán de tu backend)
const turnosHoy = [
  {
    id: 1,
    paciente: "María Luisa Gómez",
    hora: "09:00 AM",
    tratamiento: "Control de Ortodoncia",
    estado: "atendido", // Ya pasó
    dni: "76543210"
  },
  {
    id: 2,
    paciente: "Juan Carlos Pérez",
    hora: "10:30 AM",
    tratamiento: "Limpieza con Ultrasonido",
    estado: "en_espera", // Está sentado en recepción AHORA
    dni: "45678912"
  },
  {
    id: 3,
    paciente: "Roberto Sánchez",
    hora: "11:45 AM",
    tratamiento: "Evaluación para Implante",
    estado: "programado", // Aún no llega
    dni: "12345678"
  },
];

export default function DoctorDashboard() {
  // Función helper para renderizar un "Badge" (etiqueta) visual según el estado del paciente
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "atendido":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <CheckCircle2 size={14} /> Atendido
          </span>
        );
      case "en_espera":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 animate-pulse">
            <AlertCircle size={14} /> En sala de espera
          </span>
        );
      case "programado":
      default:
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Clock size={14} /> Programado
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Tarjetas de Resumen Rápido (Exclusivas del Doctor) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-6 border border-border flex items-center gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <User size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pacientes Hoy</p>
            <p className="text-2xl font-bold text-slate-800">8</p>
          </div>
        </Card>
        
        <Card className="p-6 border border-border flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Atendidos</p>
            <p className="text-2xl font-bold text-slate-800">1</p>
          </div>
        </Card>

        <Card className="p-6 border border-border flex items-center gap-4">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">En Espera</p>
            <p className="text-2xl font-bold text-slate-800">1</p>
          </div>
        </Card>
      </div>

      {/* 2. Lista de Turnos del Día (La herramienta de trabajo principal) */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-800">Mi Agenda para Hoy</h2>
          <p className="text-sm text-slate-500">Haz clic en "Atender" para abrir la historia clínica.</p>
        </div>
        
        <div className="divide-y divide-slate-100 bg-white">
          {turnosHoy.map((turno) => (
            <div 
              key={turno.id} 
              className={`flex flex-col gap-4 p-6 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                turno.estado === "en_espera" ? "bg-amber-50/30" : "hover:bg-slate-50"
              }`}
            >
              {/* Info del Paciente y Hora */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center rounded-lg bg-slate-100 p-2 min-w-[80px]">
                  <Clock size={16} className="text-slate-500 mb-1" />
                  <span className="text-sm font-bold text-slate-800">{turno.hora}</span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-slate-800">{turno.paciente}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{turno.tratamiento}</p>
                  <p className="text-xs text-slate-400 mt-1">DNI: {turno.dni}</p>
                </div>
              </div>

              {/* Badges de Estado y Botones de Acción */}
              <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                {getEstadoBadge(turno.estado)}
                
                {/* 
                  Aquí usamos el componente Button con CVA que creamos antes.
                  Dependiendo del estado, le mostramos acciones distintas.
                */}
                {turno.estado === "en_espera" && (
                  <Button variant="solid" size="sm">
                    <PlayCircle size={16} />
                    Iniciar Atención
                  </Button>
                )}

                {turno.estado === "atendido" && (
                  <Button variant="outline" size="sm">
                    <FileText size={16} />
                    Ver Registro
                  </Button>
                )}

                {turno.estado === "programado" && (
                  <Button variant="ghost" size="sm" disabled>
                    Aún no llega
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      
    </div>
  );
}