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
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

import { AdminLayout } from "../../../components/adminLayout";
import { ReceptionLayout } from "../../../components/receptionLayout";

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
import { toast } from "sonner"; 

type UserWithRole = {
  role?: { name: string };
  rol?: { name: string };
};

const translateError = (err: unknown, defaultMsg: string) => {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("409")) return "Conflicto de horario o datos duplicados.";
    if (msg.includes("400")) return "Los datos ingresados no son válidos. Verifica los campos.";
    if (msg.includes("403")) return "No tienes permisos para realizar esta acción.";
    if (msg.includes("404")) return "El registro solicitado no existe en el sistema.";
    if (msg.includes("500") || msg.includes("502")) return "El servidor está en mantenimiento. Inténtalo más tarde.";
    if (msg.includes("network") || msg.includes("failed to fetch")) return "No hay conexión con el servidor. Revisa tu internet.";
    return err.message;
  }
  return defaultMsg;
};

export default function DashboardTurnos() {
  const { user } = useAuth();
  const uData = user as unknown as UserWithRole;
  const roleName = uData?.role?.name || uData?.rol?.name || "";
  const isAdmin = roleName === "ROLE_ADMIN" || roleName === "ADMIN";

  const [turnos, setTurnos] = useState<TurnoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [turnToCancel, setTurnToCancel] = useState<number | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const [doctorsList, setDoctorsList] = useState<DoctorDTO[]>([]);
  const [patientsList, setPatientsList] = useState<PatientDTO[]>([]);
  const [servicesList, setServicesList] = useState<ServiceDTO[]>([]);

  const [patientSearch, setPatientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [foundPatient, setFoundPatient] = useState<PatientDTO | null>(null);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    serviceId: "",
    date: "",
    time: "",
  });

  const now = new Date();
  const localYear = now.getFullYear();
  const localMonth = String(now.getMonth() + 1).padStart(2, "0");
  const localDay = String(now.getDate()).padStart(2, "0");
  const today = `${localYear}-${localMonth}-${localDay}`;
  
  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${currentHours}:${currentMinutes}`;

  const fetchTurnos = async () => {
    try {
      setLoading(true);
      setError(null);
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
      } else {
        throw new Error(response.message || "Error al cargar la agenda.");
      }
    } catch (err: unknown) {
      console.error("Error al cargar agenda:", err);
      const friendlyError = translateError(err, "Error de red al cargar la agenda.");
      setError(friendlyError);
      toast.error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectData = async () => {
    try {
      const [docsRes, patsRes, servsRes] = await Promise.all([
        doctorService.getActiveList(),
        patientService.getAllPaginated(0, 500),
        treatmentService.getActiveList(),
      ]);

      if (docsRes.ok) setDoctorsList(docsRes.data || []);
      if (patsRes.ok) setPatientsList(patsRes.data.content || []);
      if (servsRes.ok) setServicesList(servsRes.data || []);
    } catch (err) {
      console.error("Error al cargar las listas:", err);
    }
  };

  useEffect(() => {
    fetchTurnos();
    fetchSelectData(); 
  }, []);

  useEffect(() => {
    if (formData.date === today && formData.time && formData.time < currentTime) {
      setFormData((prev) => ({ ...prev, time: "" }));
      toast.info("La hora seleccionada expiró. Por favor elige un nuevo horario.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date]);

  const filteredTurnos = turnos.filter((turno) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (turno.patientName || "").toLowerCase().includes(searchLower) ||
      (turno.doctorName || "").toLowerCase().includes(searchLower) ||
      (turno.date || "").toLowerCase().includes(searchLower)
    );
  });

  const filteredPatientsList = patientsList.filter((p) => {
    if (!patientSearch) return false;
    const searchLower = patientSearch.toLowerCase();
    const fullName = `${p.name} ${p.last_name || p.last_name || ""}`.toLowerCase();
    return p.dni.includes(patientSearch) || fullName.includes(searchLower);
  });

  const handleSelectPatient = (patient: PatientDTO) => {
    setFoundPatient(patient);
    setFormData((prev) => ({ ...prev, patientId: String(patient.id) }));
    setPatientSearch(patient.dni); 
    setShowDropdown(false); 
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPatientSearch(value);
    setShowDropdown(true);
    if (foundPatient && value !== foundPatient.dni) {
      setFoundPatient(null);
      setFormData((prev) => ({ ...prev, patientId: "" }));
    }
  };

  const formatState = (state: string) => {
    switch (state) {
      case "PENDIENTE": return "Pendiente";
      case "EN_PROGRESO": return "En Proceso";
      case "EN_ESPERA": return "En Espera";
      case "COMPLETADO": return "Completado";
      case "CANCELADO": return "Cancelado";
      default: return state;
    }
  };

  const handleOpenModal = () => {
    setFoundPatient(null);
    setPatientSearch("");
    setFormData({ patientId: "", doctorId: "", serviceId: "", date: "", time: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time || !formData.serviceId) {
      toast.warning("Por favor complete todos los campos obligatorios.");
      return;
    }

    if (formData.date === today && formData.time < currentTime) {
      toast.error("La hora seleccionada ya ha pasado. Por favor actualice el horario.");
      return;
    }

    try {
      setIsSaving(true);
      const payload: TurnRequestDTO = {
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        serviceIds: [Number(formData.serviceId)],
        appointmentDate: `${formData.date}T${formData.time}:00`,
      };

      const response = await turnService.save(payload, user?.id || 1);

      if (response.ok) {
        toast.success("Turno reservado exitosamente");
        fetchTurnos();
        handleCloseModal();
      } else {
        throw new Error(response.message || "400");
      }
    } catch (err: unknown) {
      const friendlyError = translateError(err, "Error al guardar el turno");
      toast.error(friendlyError);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenConfirm = (id: number) => {
    setTurnToCancel(id);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (isCanceling) return;
    setIsConfirmOpen(false);
    setTurnToCancel(null);
  };

  const executeCancelTurno = async () => {
    if (!turnToCancel) return;
    try {
      setIsCanceling(true);
      const response = await turnService.delete(turnToCancel);
      if (response.ok) {
        toast.success("Turno cancelado exitosamente");
        fetchTurnos();
        handleCloseConfirm();
      } else {
        throw new Error(response.message || "400");
      }
    } catch (err: unknown) {
      const friendlyError = translateError(err, "Error al cancelar el turno");
      toast.error(friendlyError);
      console.error(err);
    } finally {
      setIsCanceling(false);
    }
  };

  const hoyFormateado = `${localDay}/${localMonth}/${localYear}`;
  const turnosHoy = turnos.filter((t) => t.date === hoyFormateado).length;
  const turnosPendientes = turnos.filter((t) => t.status === "PROGRAMADO" || t.status === "PENDIENTE").length;
  const turnosCancelados = turnos.filter((t) => t.status === "CANCELADO").length;

  const pageContent = (
    <>
      {/* Contenedor principal con max-w-full y min-w-0 para evitar desbordes */}
      <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-full min-w-0">
        
        {/* Header Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">
              Agenda de Turnos
            </h1>
            <p className="mt-1 text-sm md:text-base text-slate-600 truncate">
              Gestión central de citas médicas
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 px-4 py-3 sm:py-2.5 font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto shrink-0"
          >
            <CalendarPlus className="h-5 w-5 shrink-0" />
            <span>Reservar Turno</span>
          </button>
        </div>

        {/* Stats Cards (Grilla Responsive y Premium) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Total Histórico</p>
              <p className="text-2xl font-black text-slate-900 truncate">{turnos.length}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center border border-cyan-100 shrink-0">
              <Activity className="w-6 h-6 text-cyan-600" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Turnos Hoy</p>
              <p className="text-2xl font-black text-slate-900 truncate">{turnosHoy}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shrink-0">
              <CalendarCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Pendientes</p>
              <p className="text-2xl font-black text-slate-900 truncate">{turnosPendientes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 shrink-0">
              <CalendarClock className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Cancelados</p>
              <p className="text-2xl font-black text-slate-900 truncate">{turnosCancelados}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center border border-red-100 shrink-0">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por paciente, doctor o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-teal-200 bg-white py-3 md:py-3.5 pl-12 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 shadow-sm transition-all text-sm truncate"
          />
        </div>

        {/* Table Container -  Estrictamente contenido y overflow-x-auto */}
        <div className="w-full rounded-2xl border border-teal-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-teal-500" />
              <p className="text-slate-500 font-medium animate-pulse">Cargando agenda...</p>
            </div>
          ) : error ? (
            <div className="px-4 py-20 text-center">
              <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
              <p className="font-medium text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchTurnos}
                className="mt-4 rounded-xl bg-teal-50 px-6 py-2.5 text-teal-700 font-bold transition-colors hover:bg-teal-100 mx-auto flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> Reintentar
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Fecha y Hora</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Paciente</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Odontólogo</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Estado</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50">
                  {filteredTurnos.map((turno) => (
                    <tr key={turno.id} className="transition-colors hover:bg-cyan-50/50">
                      <td className="px-5 py-4 text-sm text-slate-900 whitespace-nowrap">
                        <div className="font-bold">{turno.date}</div>
                        <div className="text-slate-500 font-medium">{turno.time}</div>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-teal-600 shrink-0" />
                          {turno.patientName}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-teal-500 shrink-0" />
                          Dr/a. {turno.doctorName}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <span className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider border ${
                          turno.status === "COMPLETADO" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          turno.status === "CANCELADO" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {formatState(turno.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap text-right">
                        {turno.status !== "CANCELADO" && turno.status !== "COMPLETADO" && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleOpenConfirm(turno.id)}
                              className="flex items-center gap-1.5 rounded-xl p-2 md:px-3 md:py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 border border-transparent hover:border-red-200"
                              title="Cancelar Turno"
                            >
                              <Trash2 className="h-4 w-4 shrink-0" /> 
                              <span className="hidden sm:inline">Cancelar</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTurnos.length === 0 && (
                <div className="py-20 text-center px-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <CalendarClock className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-bold text-lg">No hay turnos en este filtro</p>
                  <p className="text-slate-400 text-sm mt-1">Intenta buscar otro paciente o fecha.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/*  Modal Nueva Cita Mejorado (RESPONSIVE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-visible animate-in zoom-in-95 duration-200">
            <div className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-5 rounded-t-3xl flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-teal-100 shrink-0">
                <CalendarPlus className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Reservar Turno Rápido</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              
              {/* Buscador de Paciente Dinámico */}
              <div className="relative">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Paciente</label>
                <div className={`flex items-center bg-white border rounded-xl px-4 py-2.5 transition-all shadow-sm ${foundPatient ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200 focus-within:ring-2 focus-within:ring-teal-100 focus-within:border-teal-400'}`}>
                  <Search className={`w-5 h-5 mr-3 shrink-0 ${foundPatient ? 'text-emerald-500' : 'text-teal-400'}`} />
                  <input
                    type="text"
                    placeholder="Escriba DNI o Nombre..."
                    value={patientSearch}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    disabled={isSaving}
                    className="flex-1 w-full focus:outline-none text-sm text-slate-800 bg-transparent placeholder-slate-400 font-medium truncate"
                  />
                  {foundPatient && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2 shrink-0 animate-in zoom-in" />}
                </div>

                {showDropdown && patientSearch && !foundPatient && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-teal-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] max-h-60 overflow-y-auto animate-in slide-in-from-top-2">
                    {filteredPatientsList.length > 0 ? (
                      <div className="p-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Resultados</p>
                        {filteredPatientsList.map((p) => (
                          <div key={p.id} onClick={() => handleSelectPatient(p)} className="px-4 py-3 hover:bg-teal-50 rounded-xl cursor-pointer transition-colors flex flex-col gap-1.5">
                            <p className="font-bold text-slate-800 text-sm break-words">{p.name} {p.last_name || p.last_name}</p>
                            <p className="text-[11px] font-mono font-bold text-teal-700 bg-teal-100/50 self-start px-2 py-0.5 rounded border border-teal-100">DNI: {p.dni}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-sm text-slate-500 text-center">
                        No se encontraron resultados.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Doctor</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  required disabled={isSaving}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all bg-white disabled:opacity-60 disabled:bg-slate-50 text-sm font-medium text-slate-700 shadow-sm cursor-pointer"
                >
                  <option value="" disabled>Seleccione un doctor</option>
                  {doctorsList.map((d) => (
                    <option key={d.id} value={d.id}>Dr/a. {d.name} {d.lastName || d.last_name} - {d.specialty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Servicio Único</label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  required disabled={isSaving}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all bg-white disabled:opacity-60 disabled:bg-slate-50 text-sm font-medium text-slate-700 shadow-sm cursor-pointer"
                >
                  <option value="" disabled>Seleccione el servicio</option>
                  {servicesList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} (S/ {s.basePrice})</option>
                  ))}
                </select>
              </div>

              {/* 1 Columna en móvil, 2 en PC para la fecha/hora */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Fecha</label>
                  <input
                    type="date" min={today}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required disabled={isSaving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 cursor-pointer text-sm shadow-sm font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Hora</label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required disabled={!formData.date || isSaving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all bg-white disabled:opacity-60 disabled:bg-slate-50 cursor-pointer text-sm shadow-sm font-medium text-slate-700"
                  >
                    <option value="" disabled>Seleccionar hora</option>
                    {[
                      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
                    ].map((time) => {
                      const isPastTime = formData.date === today && time < currentTime;
                      return (
                        <option key={time} value={time} disabled={isPastTime} className={isPastTime ? "text-slate-300" : ""}>
                          {time} {isPastTime ? "(Expirado)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3.5 font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm md:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !foundPatient}
                  className="flex-[2] rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 px-4 py-3.5 font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 text-sm md:text-base"
                >
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</> : "Confirmar Reserva"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*  Modal de Confirmación Elegante para Cancelar */}
      {isConfirmOpen && turnToCancel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleCloseConfirm} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 bg-red-50 border-4 border-red-100">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">¿Cancelar Turno?</h3>
            <p className="text-sm text-slate-500 mb-6 px-2 leading-relaxed">
              Esta acción eliminará la reserva de la agenda y <span className="font-bold text-red-600">no se puede deshacer</span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCloseConfirm}
                disabled={isCanceling}
                className="flex-1 rounded-xl px-4 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Volver
              </button>
              <button
                onClick={executeCancelTurno}
                disabled={isCanceling}
                className="flex-1 rounded-xl px-4 py-3 font-bold text-white bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isCanceling ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sí, Cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return isAdmin ? (
    <AdminLayout currentPage="turnos">{pageContent}</AdminLayout>
  ) : (
    <ReceptionLayout currentPage="turnos">{pageContent}</ReceptionLayout>
  );
}