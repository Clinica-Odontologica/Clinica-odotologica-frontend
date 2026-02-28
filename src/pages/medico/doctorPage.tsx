import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  Play,
} from "lucide-react";
import DoctorLayout from "../../components/doctorLayout";

// Mock data for today's appointments
const todayAppointments = [
  {
    id: 1,
    patientName: "Juan García López",
    patientAge: 35,
    patientPhone: "+34 612 345 678",
    time: "09:00 AM",
    treatmentType: "Consulta General",
    status: "pending", // pending, attending, completed
  },
  {
    id: 2,
    patientName: "María Rodríguez",
    patientAge: 28,
    patientPhone: "+34 698 765 432",
    time: "09:30 AM",
    treatmentType: "Limpieza Dental",
    status: "completed",
  },
  {
    id: 3,
    patientName: "Carlos Fernández",
    patientAge: 45,
    patientPhone: "+34 654 321 098",
    time: "10:30 AM",
    treatmentType: "Endodoncia",
    status: "pending",
  },
  {
    id: 4,
    patientName: "Laura Martínez",
    patientAge: 32,
    patientPhone: "+34 687 543 210",
    time: "11:00 AM",
    treatmentType: "Ortodoncia",
    status: "attending",
  },
  {
    id: 5,
    patientName: "Jorge López",
    patientAge: 50,
    patientPhone: "+34 623 456 789",
    time: "12:00 PM",
    treatmentType: "Extracciones",
    status: "pending",
  },
];

export default function DoctorPage() {
  const [appointments, setAppointments] = useState(todayAppointments);

  console.log(
    "Cargando agenda del médico con los siguientes turnos:",
    setAppointments,
  );
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "attending":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "pending":
        return "bg-amber-50 border-amber-200 text-amber-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "attending":
        return "En Atención";
      case "pending":
        return "Pendiente";
      default:
        return "Desconocido";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5" />;
      case "attending":
        return <AlertCircle className="w-5 h-5" />;
      case "pending":
        return <Clock className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent">
            Mi Agenda
          </h1>
          <p className="text-slate-600 mt-2">Turnos asignados para hoy</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-teal-100 p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">
              Total de Turnos
            </p>
            <p className="text-2xl font-bold text-cyan-700">
              {appointments.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-teal-100 p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">
              Pendientes
            </p>
            <p className="text-2xl font-bold text-amber-600">
              {appointments.filter((a) => a.status === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-teal-100 p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">
              En Atención
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {appointments.filter((a) => a.status === "attending").length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-teal-100 p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">
              Completados
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {appointments.filter((a) => a.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`border rounded-xl p-5 bg-white transition-all hover:shadow-md ${getStatusColor(appointment.status)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {appointment.patientName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {appointment.patientAge} años
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-teal-600" />
                      <span>{appointment.patientPhone}</span>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <span className="inline-block bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-lg">
                        {appointment.treatmentType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/80 border border-current text-sm font-medium">
                    {getStatusIcon(appointment.status)}
                    <span>{getStatusLabel(appointment.status)}</span>
                  </div>

                  {appointment.status === "pending" && (
                    <Link
                      to={`/medico/atencion/${appointment.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-medium text-sm rounded-lg transition-all transform hover:scale-105"
                    >
                      <Play className="w-4 h-4" />
                      Atender
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {appointments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-teal-100">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No hay turnos para hoy</p>
            <p className="text-sm text-slate-500 mt-1">
              Vuelve más tarde para ver tus próximas citas
            </p>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
