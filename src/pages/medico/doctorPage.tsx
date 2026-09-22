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
  RefreshCw, // 🌟 Nuevo ícono para reintentar
  User
} from "lucide-react";
import DoctorLayout from "../../components/doctorLayout";

// Servicios y Modelos
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
  
  // 🌟 Estados de Carga y Error fortalecidos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); // Estado para el botón de guardar evolución

  // Filtros
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState<TurnResponseDTO | null>(null);

  const [patientData, setPatientData] = useState<PatientDTO | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [clinicalData, setClinicalData] = useState({
    diagnosis: "",
    treatmentNotes: "",
  });

  // 1. 🔄 Función de Carga 
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
        // 🌟 Validación estricta de Error
        const errorMessage = err instanceof Error ? err.message : "Error de conexión al cargar la agenda.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // 2. ⏳ Auto-actualización cada 60 segundos
  useEffect(() => {
    fetchAgenda();
    const intervalId = setInterval(() => {
      if (selectedDate === new Date().toISOString().split("T")[0]) {
        fetchAgenda(true);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [selectedDate, user]);

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  // 3. 📄 Imprimir Agenda
  const handlePrint = () => {
    window.print();
  };

  // 4. 🗂️ Ver Perfil / Historial del Paciente
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
    if (isSaving) return; // Evitar cerrar si está guardando
    setIsModalOpen(false);
    setIsHistoryModalOpen(false);
    setSelectedTurn(null);
  };

  const handleClinicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTurn) return;

    // 🌟 Validación Frontend
    if (!clinicalData.diagnosis.trim() || !clinicalData.treatmentNotes.trim()) {
      toast.warning("Por favor complete el diagnóstico y las notas del tratamiento.");
      return;
    }

    try {
      setIsSaving(true); // 🌟 Bloqueamos el botón
      const payload = {
        turnId: selectedTurn.id,
        diagnosis: clinicalData.diagnosis,
        treatmentNotes: clinicalData.treatmentNotes,
      };

      const res = await clinicalService.save(payload);
      
      if (res.ok || res.message === "Success" || !res.message) {
        toast.success("Turno completado y guardado en la historia clínica.");
        fetchAgenda(true); // Refresco silencioso
        handleCloseModal();
      } else {
        throw new Error(res.message || "Error al completar el turno");
      }
    } catch (err: unknown) {
      console.error("Error guardando clínica:", err);
      // 🌟 Manejo seguro del catch sin usar 'any'
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Ocurrió un error de red al guardar el registro clínico.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false); // 🌟 Liberamos el botón
    }
  };

  // 5. 📊 Métricas Calculadas
  const metrics = {
    total: turns.length,
    completed: turns.filter((t) => t.status === "COMPLETADO").length,
    pending: turns.filter(
      (t) => t.status !== "COMPLETADO" && t.status !== "CANCELADO",
    ).length,
  };

  // 6. 🔍 Filtro y Detección de Retrasos
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
        <div className="print:hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-teal-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Mi Agenda</h2>
            <p className="text-slate-500">
              Visualiza y gestiona tus turnos del día
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={loading || error !== null}
              className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-colors disabled:opacity-50"
              title="Exportar a PDF / Imprimir"
            >
              <Printer className="w-5 h-5" />
            </button>
            <div className="w-px h-8 bg-slate-200 mx-1"></div>
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-teal-50 rounded-lg border border-teal-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-teal-600" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-xl border border-teal-200 focus-within:ring-2 focus-within:ring-teal-400">
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
              className="p-2 hover:bg-teal-50 rounded-lg border border-teal-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-teal-600" />
            </button>
          </div>
        </div>

        {/* 📊 Métricas y Filtros */}
        {!loading && !error && (
          <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-4">
              <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Total: <b className="text-slate-900">{metrics.total}</b>
                </span>
              </div>
              <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-emerald-700">
                  Atendidos: <b>{metrics.completed}</b>
                </span>
              </div>
              <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-sm text-amber-700">
                  Pendientes: <b>{metrics.pending}</b>
                </span>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === "ALL" ? "bg-white shadow-sm text-teal-700" : "text-slate-500 hover:text-slate-700"}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter("PENDING")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === "PENDING" ? "bg-white shadow-sm text-amber-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilter("COMPLETED")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === "COMPLETED" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                Completados
              </button>
            </div>
          </div>
        )}

        {/* Encabezado visible SOLO al imprimir */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold">Agenda Diaria - Doctor</h1>
          <p className="text-gray-600">Fecha: {selectedDate.split("-").reverse().join("/")}</p>
          <hr className="my-4 border-slate-300" />
        </div>

        {/* Turns List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-teal-100 shadow-sm">
              <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Cargando agenda de pacientes...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-teal-100 shadow-sm text-center px-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No se pudo cargar la agenda</h3>
              <p className="text-slate-600 mb-6 max-w-md">{error}</p>
              <button 
                onClick={() => fetchAgenda(false)}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
            </div>
          ) : filteredTurns.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-teal-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium text-lg">Agenda Libre</p>
              <p className="text-slate-400 text-sm mt-1">No hay turnos registrados para esta fecha o filtro.</p>
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
                  className={`group bg-white p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 print:break-inside-avoid print:border-b print:rounded-none
                    ${isDelayed ? "border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.08)]" : "border-teal-100 hover:border-teal-300 hover:shadow-md"}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border transition-colors shrink-0
                      ${isDelayed ? "bg-red-50 border-red-200" : "bg-teal-50 border-teal-100 group-hover:bg-teal-600 group-hover:border-teal-600"}`}
                    >
                      <Clock
                        className={`w-4 h-4 mb-1 ${isDelayed ? "text-red-500" : "text-teal-600 group-hover:text-white"}`}
                      />
                      <span
                        className={`text-xs font-bold ${isDelayed ? "text-red-700" : "text-teal-800 group-hover:text-white"}`}
                      >
                        {timeDisplay}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-900">
                          {turn.patientName}{" "}
                          <span className="text-sm font-normal text-slate-500">
                            ({turn.patientDni})
                          </span>
                        </h4>
                        {isDelayed && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full animate-pulse whitespace-nowrap">
                            En Espera
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {turn.services.map((t) => (
                          <span
                            key={t.id}
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-md border border-cyan-100"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="text-right mr-4 hidden md:block">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                        Estado
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          turn.status === "COMPLETADO"
                            ? "text-emerald-600"
                            : turn.status === "CANCELADO"
                              ? "text-red-500"
                              : "text-amber-600"
                        }`}
                      >
                        {turn.status}
                      </p>
                    </div>

                    {/* Botones de acción ocultos en impresión */}
                    <div className="print:hidden flex gap-2">
                      <button
                        onClick={() => handleOpenHistory(turn)}
                        className="flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:shadow"
                        title="Ver Perfil del Paciente"
                      >
                        <History className="w-5 h-5" />
                      </button>

                      {turn.status !== "COMPLETADO" &&
                        turn.status !== "CANCELADO" && (
                          <button
                            onClick={() => handleOpenModal(turn)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Atender
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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <History className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Perfil del Paciente
                  </h2>
                  <p className="text-xs text-slate-500">
                    Datos registrados en el sistema
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                  <p className="text-sm text-slate-500">Buscando expediente...</p>
                </div>
              ) : !patientData ? (
                <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  No se encontraron detalles para este paciente.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tarjeta de Información Personal */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-indigo-700 mb-4 border-b border-slate-100 pb-2">
                      Información Personal
                    </h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                          Nombre Completo
                        </p>
                        <p className="text-sm font-bold text-slate-800 mt-1">
                          {patientData.name || selectedTurn.patientName}{" "}
                          {patientData.last_name || patientData.last_name || ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                          DNI
                        </p>
                        <p className="text-sm font-bold text-slate-800 mt-1">
                          {patientData.dni || selectedTurn.patientDni}
                        </p>
                      </div>

                      {(patientData as PatientDTO & { email?: string }).email && (
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                            Correo Electrónico
                          </p>
                          <p className="text-sm font-bold text-slate-800 mt-1">
                            {(patientData as PatientDTO & { email?: string }).email}
                          </p>
                        </div>
                      )}

                      {(patientData as PatientDTO & { phone?: string }).phone && (
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                            Teléfono
                          </p>
                          <p className="text-sm font-bold text-slate-800 mt-1">
                            {(patientData as PatientDTO & { phone?: string }).phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 text-center shadow-sm">
                    <p className="text-sm text-slate-500 font-medium">
                      Para ver las evoluciones pasadas (Historial Clínico), pronto conectaremos el módulo de diagnósticos.
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
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50 flex items-center gap-3 rounded-t-2xl">
              <FileText className="w-6 h-6 text-teal-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Nueva Evolución
                </h2>
                <p className="text-sm text-teal-700 font-medium">
                  Paciente: {selectedTurn.patientName}
                </p>
              </div>
            </div>

            <div className="px-6 pt-4">
              <div className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-lg p-3 text-center text-xs text-slate-400 font-medium">
                [ Zona reservada para Odontograma Interactivo en el futuro ]
              </div>
            </div>

            <form onSubmit={handleClinicalSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none transition-all shadow-sm disabled:opacity-60 disabled:bg-slate-50"
                  placeholder="Ej: Caries profunda en pieza 46..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none transition-all shadow-sm disabled:opacity-60 disabled:bg-slate-50"
                  placeholder="Ej: Se aplica anestesia local, se retira tejido infectado, se coloca resina compuesta..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-bold disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !clinicalData.diagnosis.trim() || !clinicalData.treatmentNotes.trim()}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar y Finalizar Cita"
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