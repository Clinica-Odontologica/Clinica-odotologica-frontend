import { Card } from "../../../components/ui/card/card";
import { Button } from "../../../components/ui/button/button";
import { 
  Users, 
  CalendarPlus, 
  Search, 
  UserCheck,
  Clock,
  UserPlus
} from "lucide-react";

// 1. Datos simulados de toda la clínica (Múltiples doctores)
const agendaGlobalHoy = [
  {
    id: 1,
    paciente: "Juan Carlos Pérez",
    doctor: "Dra. Ana Silva",
    hora: "10:30 AM",
    estado: "en_espera", // El paciente ya llegó y está en recepción
    dni: "45678912"
  },
  {
    id: 2,
    paciente: "Roberto Sánchez",
    doctor: "Dr. Carlos Ruiz",
    hora: "11:45 AM",
    estado: "programado", // Aún no llega
    dni: "12345678"
  },
  {
    id: 3,
    paciente: "María Luisa Gómez",
    doctor: "Dra. Ana Silva",
    hora: "12:15 PM",
    estado: "programado",
    dni: "76543210"
  },
];

export default function ReceptionDashboard() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Panel de Acciones Rápidas (Lo más usado por Recepción) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Button variant="solid" size="lg" className="h-20 text-lg shadow-md">
          <CalendarPlus size={24} className="mr-2" />
          Nuevo Turno
        </Button>
        
        <Button variant="soft" size="lg" className="h-20 text-lg border-2 border-teal-200">
          <UserPlus size={24} className="mr-2" />
          Registrar Paciente
        </Button>

        <Button variant="outline" size="lg" className="h-20 text-lg bg-white">
          <Search size={24} className="mr-2" />
          Buscar Historia
        </Button>
      </div>

      {/* 2. Tarjetas de Monitoreo Rápido */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-2">
        <Card className="p-5 border border-border flex items-center justify-between bg-white">
          <div>
            <p className="text-sm font-medium text-slate-500">En Sala de Espera</p>
            <p className="text-3xl font-bold text-amber-600">3</p>
          </div>
          <div className="rounded-full bg-amber-50 p-3 text-amber-600">
            <Users size={24} />
          </div>
        </Card>
        
        <Card className="p-5 border border-border flex items-center justify-between bg-white">
          <div>
            <p className="text-sm font-medium text-slate-500">Turnos Restantes Hoy</p>
            <p className="text-3xl font-bold text-slate-800">12</p>
          </div>
          <div className="rounded-full bg-blue-50 p-3 text-blue-600">
            <Clock size={24} />
          </div>
        </Card>

        <Card className="p-5 border border-border flex items-center justify-between bg-white">
          <div>
            <p className="text-sm font-medium text-slate-500">Atendidos Hoy</p>
            <p className="text-3xl font-bold text-emerald-600">8</p>
          </div>
          <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
            <UserCheck size={24} />
          </div>
        </Card>
      </div>

      {/* 3. Monitor Global de Turnos (La herramienta de control de tráfico) */}
      <Card className="border border-border shadow-sm overflow-hidden mt-2">
        <div className="border-b border-slate-100 bg-white p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Monitor de Tráfico del Día</h2>
            <p className="text-sm text-slate-500">Control de llegadas y asignación de consultorios.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Actualización en vivo
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Hora</th>
                <th className="px-6 py-4 font-medium">Paciente</th>
                <th className="px-6 py-4 font-medium">Odontólogo</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {agendaGlobalHoy.map((turno) => (
                <tr 
                  key={turno.id} 
                  className={`hover:bg-slate-50 transition-colors ${
                    turno.estado === "en_espera" ? "bg-amber-50/20" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                    {turno.hora}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{turno.paciente}</p>
                    <p className="text-xs text-slate-500">DNI: {turno.dni}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {turno.doctor}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {turno.estado === "en_espera" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                        En Recepción
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Por Llegar
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {turno.estado === "programado" ? (
                      <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                        Marcar Llegada
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        Avisado al Doctor
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
    </div>
  );
}