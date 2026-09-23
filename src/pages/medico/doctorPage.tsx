import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Printer,
  History,
  Activity,
  RefreshCw,
  User,
  ListTodo
} from "lucide-react";
import DoctorLayout from "../../components/doctorLayout";

import { doctorService } from "../../services/doctor.service";
import { turnService } from "../../services/turn.service";
import { clinicalService } from "../../services/clinical.service";
import { patientService } from "../../services/patient.service";
import type { TurnResponseDTO } from "../../models/turn/turnResponseDTO";
import type { PatientDTO } from "../../models/patient/patientDTO";
import { useAuth } from "../../context/authContext";
import { toast } from "sonner";

export default function DoctorPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [turns, setTurns] = useState<TurnResponseDTO[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState<TurnResponseDTO | null>(null);

  const [patientData, setPatientData] = useState<PatientDTO | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [clinicalData, setClinicalData] = useState({
    diagnosis: "",
    treatmentNotes: "",
  });

  const fetchAgenda = async (isSilent = false) => {
    if (!user || !user.id) return;
    try {
      if (!isSilent) setLoading(true);
      setError(null);

      const doctorRes = await doctorService.getByUserId(user.id);

      if (!doctorRes.ok || !doctorRes.data) {
        throw new Error("Su usuario no tiene un perfil de doctor asignado en el sistema.");
      }

      const realDoctorId = doctorRes.data.id;
      const response = await turnService.getByDoctorAndDate(
        realDoctorId,
        selectedDate,
      );

      if (response.ok) {
        setTurns(response.data);
      } else {
        throw new Error(response.message || "No se pudieron obtener los turnos.");
      }
    } catch (err: unknown) {
      console.error("Error obteniendo agenda:", err);
      if (!isSilent) {
        const errorMessage = err instanceof Error ? err.message : "Error de conexión al cargar la agenda.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
    const intervalId = setInterval(() => {
      if (selectedDate === new Date().toISOString().split("T")[0]) {
        fetchAgenda(true);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, user]);

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenHistory = async (turn: TurnResponseDTO) => {
    setSelectedTurn(turn);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await patientService.getById(turn.patientId);
      if (res.ok && res.data) {
        setPatientData(res.data); 
      } else {
        throw new Error(res.message || "No se encontró el paciente.");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      toast.error("No se pudo cargar la información del paciente: " + errorMessage);
      setPatientData(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenModal = (turn: TurnResponseDTO) => {
    setSelectedTurn(turn);
    setClinicalData({ diagnosis: "", treatmentNotes: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setIsHistoryModalOpen(false);
    setSelectedTurn(null);
  };

  const handleClinicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTurn) return;

    if (!clinicalData.diagnosis.trim() || !clinicalData.treatmentNotes.trim()) {
      toast.warning("Por favor complete el diagnóstico y las notas del tratamiento.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        turnId: selectedTurn.id,
        diagnosis: clinicalData.diagnosis.trim(),
        treatmentNotes: clinicalData.treatmentNotes.trim(),
      };

      const res = await clinicalService.save(payload);
      
      if (res.ok || res.message === "Success" || !res.message) {
        toast.success("Turno completado y guardado en la historia clínica.");
        fetchAgenda(true);
        handleCloseModal();
      } else {
        throw new Error(res.message || "Error al completar el turno");
      }
    } catch (err: unknown) {
      console.error("Error guardando clínica:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Ocurrió un error de red al guardar el registro clínico.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const metrics = {
    total: turns.length,
    completed: turns.filter((t) => t.status === "COMPLETADO").length,
    pending: turns.filter(
      (t) => t.status !== "COMPLETADO" && t.status !== "CANCELADO",
    ).length,
  };

  const filteredTurns = turns.filter((t) => {
    if (filter === "PENDING")
      return t.status !== "COMPLETADO" && t.status !== "CANCELADO";
    if (filter === "COMPLETED") return t.status === "COMPLETADO";
    return true;
  });

  const checkIsDelayed = (turnDateStr: string, status: string) => {
    if (status === "COMPLETADO" || status === "CANCELADO") return false;
    const turnTime = new Date(turnDateStr).getTime();
    const now = new Date().getTime();
    return now > turnTime; 
  };

  return (
    <DoctorLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Header with Date Navigation */}
        <div className="print:hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-teal-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Mi Agenda</h2>
            <p className="text-slate-500 mt-1">
              Visualiza y gestiona tus turnos del día
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 lg:pb-0">
            <button
              onClick={handlePrint}
              disabled={loading || error !== null}
              className="p-2.5 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition-colors disabled:opacity-50 shrink-0"
              title="Exportar a PDF / Imprimir"
            >
              <Printer className="w-5 h-5" />
            </button>
            <div className="w-px h-8 bg-slate-200 mx-1 shrink-0"></div>
            <button
              onClick={() => changeDate(-1)}
              className="p-2.5 hover:bg-teal-50 rounded-xl border border-teal-100 transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-teal-600" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 rounded-xl border border-teal-200 focus-within:ring-2 focus-within:ring-teal-400 shrink-0">
              <Calendar className="w-4 h-4 text-teal-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm font-bold text-teal-800 cursor-pointer"
              />
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2.5 hover:bg-teal-50 rounded-xl border border-teal-100 transition-colors shrink-0"
            >
              <ChevronRight className="w-5 h-5 text-teal-600" />
            </button>
          </div>
        </div>

        {/* 📊 Métricas Rediseñadas en Grid Responsive */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Turnos</p>
                <p className="text-2xl font-black text-slate-900">{metrics.total}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                <ListTodo className="w-6 h-6 text-slate-400" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Atendidos</p>
                <p className="text-2xl font-black text-emerald-700">{metrics.completed}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Pendientes</p>
                <p className="text-2xl font-black text-amber-700">{metrics.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </div>
        )}

        {/* 🔍 Filtro Estilo Tabs */}
        {!loading && !error && (
          <div className="print:hidden w-full overflow-x-auto hide-scrollbar">
            <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 w-max mx-auto sm:mx-0">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${filter === "ALL" ? "bg-white shadow-sm text-teal-700" : "text-slate-500 hover:text-slate-800"}`}
              >
                Todos los Turnos
              </button>
              <button
                onClick={() => setFilter("PENDING")}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${filter === "PENDING" ? "bg-white shadow-sm text-amber-600" : "text-slate-500 hover:text-slate-800"}`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilter("COMPLETED")}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${filter === "COMPLETED" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-800"}`}
              >
                Completados
              </button>
            </div>
          </div>
        )}

        {/* Encabezado de Impresión */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold">Agenda Diaria - Odontólogo</h1>
          <p className="text-gray-600">Fecha: {selectedDate.split("-").reverse().join("/")}</p>
          <hr className="my-4 border-slate-300" />
        </div>

        {/* Lista de Turnos */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-teal-100 shadow-sm">
              <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Cargando agenda de pacientes...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-teal-100 shadow-sm text-center px-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No se pudo cargar la agenda</h3>
              <p className="text-slate-600 mb-6 max-w-md">{error}</p>
              <button 
                onClick={() => fetchAgenda(false)}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar Conexión
              </button>
            </div>
          ) : filteredTurns.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-teal-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100">
                <Calendar className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-600 font-bold text-xl mb-1">Agenda Libre</p>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">No hay turnos registrados para esta fecha bajo el filtro actual.</p>
            </div>
          ) : (
            filteredTurns.map((turn) => {
              const timeDisplay = turn.appointmentDate
                ? turn.appointmentDate.split("T")[1].substring(0, 5)
                : "Sin hora";
              const isDelayed = checkIsDelayed(
                turn.appointmentDate,
                turn.status,
              );

              return (
                <div
                  key={turn.id}
                  className={`group bg-white p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 print:break-inside-avoid print:border-b print:rounded-none
                    ${isDelayed ? "border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.08)]" : "border-teal-100 hover:border-teal-300 hover:shadow-md"}`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center border transition-colors shrink-0 shadow-inner
                      ${isDelayed ? "bg-red-50 border-red-200" : "bg-gradient-to-br from-cyan-50 to-teal-50 border-teal-100 group-hover:from-teal-500 group-hover:to-teal-600 group-hover:border-teal-600"}`}
                    >
                      <Clock
                        className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${isDelayed ? "text-red-500" : "text-teal-600 group-hover:text-white"}`}
                      />
                      <span
                        className={`text-xs sm:text-sm font-bold ${isDelayed ? "text-red-700" : "text-teal-800 group-hover:text-white"}`}
                      >
                        {timeDisplay}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        <h4 className="text-lg font-bold text-slate-900 truncate">
                          {turn.patientName}
                        </h4>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                          {turn.patientDni}
                        </span>
                        {isDelayed && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full animate-pulse whitespace-nowrap border border-red-200">
                            En Espera
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {turn.services.map((t) => (
                          <span
                            key={t.id}
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-cyan-50 text-cyan-800 rounded-md border border-cyan-100 truncate max-w-[200px]"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-4 border-t border-slate-100 md:border-t-0 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                        Estado
                      </p>
                      <p
                        className={`text-sm font-black tracking-wide ${
                          turn.status === "COMPLETADO"
                            ? "text-emerald-600"
                            : turn.status === "CANCELADO"
                              ? "text-red-500"
                              : "text-amber-500"
                        }`}
                      >
                        {turn.status}
                      </p>
                    </div>

                    <div className="print:hidden flex gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenHistory(turn)}
                        className="flex items-center justify-center p-2.5 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        title="Ver Perfil del Paciente"
                      >
                        <History className="w-5 h-5" />
                      </button>

                      {turn.status !== "COMPLETADO" && turn.status !== "CANCELADO" && (
                        <button
                          onClick={() => handleOpenModal(turn)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        >
                          <Activity className="w-4 h-4 shrink-0" />
                          <span className="hidden sm:inline">Atender</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 🗂️ Modal de Perfil del Paciente */}
      {isHistoryModalOpen && selectedTurn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Expediente del Paciente
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Datos registrados en el sistema
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="sr-only">Cerrar</span>
                <AlertCircle className="w-5 h-5 opacity-0 absolute" /> 
                <span className="text-2xl leading-none block -mt-0.5">&times;</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 rounded-b-3xl">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Buscando expediente...</p>
                </div>
              ) : !patientData ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm px-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-bold text-lg mb-1">Perfil no disponible</p>
                  <p className="text-slate-400 text-sm">No se encontraron detalles ampliados para este paciente.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-indigo-700 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <User className="w-4 h-4" /> Información Personal
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                          Nombre Completo
                        </p>
                        <p className="text-base font-bold text-slate-800 break-words">
                          {patientData.name || selectedTurn.patientName}{" "}
                          {patientData.last_name || patientData.last_name || ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                          DNI
                        </p>
                        <p className="text-base font-bold text-slate-800 font-mono">
                          {patientData.dni || selectedTurn.patientDni}
                        </p>
                      </div>

                      {(patientData as PatientDTO & { email?: string }).email && (
                        <div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                            Correo Electrónico
                          </p>
                          <p className="text-base font-semibold text-slate-700 truncate" title={(patientData as PatientDTO & { email?: string }).email}>
                            {(patientData as PatientDTO & { email?: string }).email}
                          </p>
                        </div>
                      )}

                      {(patientData as PatientDTO & { phone?: string }).phone && (
                        <div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                            Teléfono
                          </p>
                          <p className="text-base font-semibold text-slate-700">
                            {(patientData as PatientDTO & { phone?: string }).phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100/50 text-center shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-indigo-50">
                      <History className="w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="text-sm text-indigo-900 font-medium">
                      El historial clínico completo se visualizará aquí en futuras actualizaciones del módulo de diagnósticos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🩺 Modal de Registro de Evolución */}
      {isModalOpen && selectedTurn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50 flex items-center gap-4 rounded-t-3xl">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-teal-100 shrink-0">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 truncate">
                  Evolución Médica
                </h2>
                <p className="text-sm text-teal-700 font-medium truncate">
                  Paciente: {selectedTurn.patientName}
                </p>
              </div>
            </div>

            <div className="px-6 pt-5">
              <div className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Activity className="w-6 h-6 opacity-50" />
                <p className="text-xs font-medium text-center max-w-xs">
                  Zona reservada para Odontograma Interactivo (Próximamente)
                </p>
              </div>
            </div>

            <form onSubmit={handleClinicalSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Diagnóstico Clínico
                </label>
                <textarea
                  value={clinicalData.diagnosis}
                  onChange={(e) =>
                    setClinicalData({
                      ...clinicalData,
                      diagnosis: e.target.value,
                    })
                  }
                  required
                  disabled={isSaving}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none transition-all shadow-sm disabled:opacity-60 disabled:bg-slate-50 text-sm font-medium"
                  placeholder="Ej: Caries profunda en pieza 46..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Notas del Tratamiento Realizado
                </label>
                <textarea
                  value={clinicalData.treatmentNotes}
                  onChange={(e) =>
                    setClinicalData({
                      ...clinicalData,
                      treatmentNotes: e.target.value,
                    })
                  }
                  required
                  disabled={isSaving}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none transition-all shadow-sm disabled:opacity-60 disabled:bg-slate-50 text-sm font-medium"
                  placeholder="Ej: Se aplica anestesia local, se retira tejido infectado, se coloca resina compuesta..."
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-bold disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !clinicalData.diagnosis.trim() || !clinicalData.treatmentNotes.trim()}
                  className="flex-[2] flex justify-center items-center gap-2 px-4 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando Evolución...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      Guardar y Finalizar Cita
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}