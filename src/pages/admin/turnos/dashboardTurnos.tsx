import { useState, useEffect } from "react";
import {
  CalendarPlus,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
  CalendarClock,
  User,
  Stethoscope,
  CalendarCheck,
  Activity,
  XCircle,
} from "lucide-react";
import { AdminLayout } from "../../../components/adminLayout";
import { turnService } from "../../../services/turn.service";
import type { TurnResponseDTO } from "../../../models/turn/turnResponseDTO";
import type { TurnRequestDTO } from "../../../models/turn/turnRequestDTO";
import { useAuth } from "../../../context/authContext";
import type { TurnoDTO } from "../../../models/turn/turnDTO";
import { doctorService } from "../../../services/doctor.service";
import { patientService } from "../../../services/patient.service";
import { treatmentService } from "../../../services/treatment.service";
import type { DoctorDTO } from "../../../models/doctor/doctorDTO";
import type { PatientDTO } from "../../../models/patient/patientDTO";
import type { ServiceDTO } from "../../../models/service/serviceDTO";



export default function DashboardTurnos() {
  const [turnos, setTurnos] = useState<TurnoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const [doctorsList, setDoctorsList] = useState<DoctorDTO[]>([]);
  const [patientsList, setPatientsList] = useState<PatientDTO[]>([]);
  const [servicesList, setServicesList] = useState<ServiceDTO[]>([]);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    serviceId: "",
    date: "",
    time: "",
  });

const fetchTurnos = async () => {
    try {
      setLoading(true);
      const response = await turnService.getAllPaginated(0, 100);
      if (response.ok) {
        const turnosNormalizados = response.data.content.map((t: TurnResponseDTO) => {
          const rawDate = t.appointmentDate || "";
          const [fechaPart, horaPart] = rawDate.split("T");

          let fechaFormateada = "Sin fecha";
          if (fechaPart) {
            const [year, month, day] = fechaPart.split("-");
            fechaFormateada = `${day}/${month}/${year}`;
          }

          return {
            id: t.id,
            patientName: t.patientName || "Paciente Desconocido",
            doctorName: t.doctorName || "Doctor Desconocido",
            date: fechaFormateada, 
            time: horaPart ? horaPart.substring(0, 5) : "Sin hora",
            status: t.status || "PROGRAMADO",
          };
        });

        setTurnos(turnosNormalizados);
        console.log("Turnos cargados:", turnosNormalizados);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Error al cargar la agenda");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectData = async () => {
    try {
      const [docsRes, patsRes, servsRes] = await Promise.all([
        doctorService.getAllPaginated(0, 100),
        patientService.getAllPaginated(0, 100),
        treatmentService.getAllPaginated(0, 100),
      ]);

      if (docsRes.ok) setDoctorsList(docsRes.data.content || []);
      if (patsRes.ok) setPatientsList(patsRes.data.content || []);
      if (servsRes.ok) setServicesList(servsRes.data.content || []);
    } catch (err) {
      console.error("Error al cargar las listas desplegables:", err);
    }
  };

  useEffect(() => {
    fetchTurnos();
    fetchSelectData(); 
  }, []);

  const filteredTurnos = turnos.filter((turno) => {
    const searchLower = searchTerm.toLowerCase();
    const patientMatch = (turno.patientName || "")
      .toLowerCase()
      .includes(searchLower);
    const doctorMatch = (turno.doctorName || "")
      .toLowerCase()
      .includes(searchLower);
    const dateMatch = (turno.date || "").toLowerCase().includes(searchLower);
    return patientMatch || doctorMatch || dateMatch;
  });

  const formatState = (state: string) => {
    switch (state) {
      case "PENDIENTE":
        return "Pendiente";
      case "EN_PROGRESO":
        return "En Proceso";
      case "EN_ESPERA":
        return "En Espera";
      case "COMPLETADO":
        return "Completado";
      case "CANCELADO":
        return "Cancelado";
      default:
        return state;
    }
  };

  const handleOpenModal = () => {
    setFormData({
      patientId: "",
      doctorId: "",
      serviceId: "",
      date: "",
      time: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: TurnRequestDTO = {
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        serviceIds: [Number(formData.serviceId)],
        appointmentDate: `${formData.date}T${formData.time}:00`,
      };

      const response = await turnService.save(payload, user?.id || 1);

      if (response.ok) {
        alert("Turno reservado exitosamente");
        fetchTurnos();
        handleCloseModal();
      } else {
        alert("Error al reservar: " + response.message);
      }
    } catch (err) {
      alert("Error de red al guardar el turno");
      console.error(err);
    }
  };

  const handleCancelTurno = async (id: number) => {
    if (
      confirm(
        "¿Está seguro de que desea CANCELAR este turno? Esta acción no se puede deshacer.",
      )
    ) {
      try {
        const response = await turnService.delete(id);
        if (response.ok) {
          fetchTurnos();
        } else {
          alert("Error al cancelar el turno: " + response.message);
        }
      } catch (err) {
        alert("Error al cancelar el turno");
        console.error(err);
      }
    }
  };

  const fechaActual = new Date();
  
  const dia = String(fechaActual.getDate()).padStart(2, '0');
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); 
  const anio = fechaActual.getFullYear();
  
  const hoyFormateado = `${dia}/${mes}/${anio}`;

  const turnosHoy = turnos.filter((t) => t.date === hoyFormateado).length;
  const turnosPendientes = turnos.filter((t) => t.status === "PROGRAMADO" || t.status === "PENDIENTE").length;
  const turnosCancelados = turnos.filter((t) => t.status === "CANCELADO").length;

  return (
    <AdminLayout currentPage="turnos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Agenda de Turnos
            </h1>
            <p className="mt-1 text-slate-600">
              Gestión central de citas médicas
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 px-4 py-3 font-medium text-white transition-all hover:shadow-lg"
          >
            <CalendarPlus className="h-5 w-5" />
            Reservar Turno
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Histórico
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {turnos.length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50">
                <Activity className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Turnos para Hoy
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {turnosHoy}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <CalendarCheck className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pendientes
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {turnosPendientes}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <CalendarClock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Cancelados</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {turnosCancelados}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por paciente, doctor o fecha (YYYY-MM-DD)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-teal-200 bg-white py-3 pl-12 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-teal-500" />
              <p className="text-slate-500">Cargando agenda...</p>
            </div>
          ) : error ? (
            <div className="px-4 py-20 text-center">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
              <p className="font-medium text-red-600">{error}</p>
              <button
                onClick={fetchTurnos}
                className="mt-4 rounded-lg bg-teal-100 px-4 py-2 text-teal-700 transition-colors hover:bg-teal-200"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Odontólogo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100">
                  {filteredTurnos.map((turno) => (
                    <tr
                      key={turno.id}
                      className="transition-colors hover:bg-cyan-50/50"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900">
                        <div className="font-semibold">{turno.date}</div>
                        <div className="text-slate-500">{turno.time}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          {turno.patientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-teal-500" />
                          Dr/a. {turno.doctorName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {formatState(turno.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleCancelTurno(turno.id)}
                          className="flex items-center gap-1 rounded-lg p-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                          title="Cancelar Turno"
                        >
                          <Trash2 className="h-4 w-4" /> Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTurnos.length === 0 && (
                <div className="py-12 text-center">
                  <CalendarClock className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                  <p className="text-slate-600">No hay turnos programados</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Nueva Cita */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseModal}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <CalendarPlus className="h-5 w-5 text-teal-600" /> Reservar
                Turno
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {/* Select Dinámico de Paciente */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Paciente
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) =>
                    setFormData({ ...formData, patientId: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-teal-200 px-4 py-2 focus:border-teal-500 focus:outline-none"
                >
                  <option value="" disabled>
                    Seleccione un paciente
                  </option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.last_name} ({p.dni})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Dinámico de Doctor */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Doctor
                </label>
                <select
                  value={formData.doctorId}
                  onChange={(e) =>
                    setFormData({ ...formData, doctorId: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-teal-200 px-4 py-2 focus:border-teal-500 focus:outline-none"
                >
                  <option value="" disabled>
                    Seleccione un doctor
                  </option>
                  {doctorsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr/a. {d.name} {d.lastName || d.last_name} - {d.specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Dinámico de Servicio */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Servicio
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceId: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-teal-200 px-4 py-2 focus:border-teal-500 focus:outline-none"
                >
                  <option value="" disabled>
                    Seleccione el servicio a realizar
                  </option>
                  {servicesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (S/ {s.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-teal-200 px-4 py-2 focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-teal-200 px-4 py-2 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-teal-200 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-teal-50"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-600 px-4 py-2 font-medium text-white transition-all hover:shadow-lg"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
