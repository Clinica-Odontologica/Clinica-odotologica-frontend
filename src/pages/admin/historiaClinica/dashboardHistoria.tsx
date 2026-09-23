import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  Stethoscope,
  ClipboardList,
  RefreshCw,
  Clock
} from "lucide-react";
import { AdminLayout } from "../../../components/adminLayout";

import { clinicalService } from "../../../services/clinical.service";
import { turnService } from "../../../services/turn.service";
import type { ClinicalEntryRequestDTO } from "../../../models/clinical/clinicalEntryRequestDTO";
import type { ClinicalEntryResponseDTO } from "../../../models/clinical/clinicalEntryResponseDTO";
import type { TurnResponseDTO } from "../../../models/turn/turnResponseDTO";
import { toast } from "sonner"; 

interface HistoriaUI extends ClinicalEntryResponseDTO {
  dateFormatted: string;
}

const translateError = (err: unknown, defaultMsg: string) => {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("409")) return "Este turno ya tiene una evolución médica registrada.";
    if (msg.includes("400")) return "Los datos ingresados no son válidos. Verifica los campos.";
    if (msg.includes("404")) return "El turno solicitado no fue encontrado en el sistema.";
    if (msg.includes("500") || msg.includes("502")) return "El servidor de la clínica está en mantenimiento. Inténtalo más tarde.";
    if (msg.includes("network") || msg.includes("failed to fetch")) return "No hay conexión con el servidor. Revisa tu internet.";
    return err.message;
  }
  return defaultMsg;
};

const DashboardHistoria = () => {
  const [historias, setHistorias] = useState<HistoriaUI[]>([]);
  const [turnosDisponibles, setTurnosDisponibles] = useState<TurnResponseDTO[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 

  const [formData, setFormData] = useState({
    turnId: "",
    diagnosis: "",
    treatmentNotes: "",
    attachmentUrl: "",
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [histRes, turnosRes] = await Promise.all([
        clinicalService.getAllPaginated(0, 100),
        turnService.getAllPaginated(0, 200) 
      ]);

      if (histRes && (histRes.ok || histRes.data)) {
        const dataArray = histRes.data.content || histRes.data || [];
        const historiasNormalizadas: HistoriaUI[] = dataArray.map((h: ClinicalEntryResponseDTO) => {
          const rawDate = h.createdAt || "";
          const [fechaPart] = rawDate.split("T");
          let fechaFormateada = "Sin fecha";
          
          if (fechaPart) {
            const [year, month, day] = fechaPart.split("-");
            fechaFormateada = `${day}/${month}/${year}`;
          }

          return { ...h, dateFormatted: fechaFormateada };
        });
        setHistorias(historiasNormalizadas);
      } else {
        throw new Error(histRes.message || "No se pudo cargar la data de historias.");
      }

      if (turnosRes.ok) {
        const turnosPendientes = (turnosRes.data.content || []).filter(
          (t: TurnResponseDTO) => t.status !== "COMPLETADO" && t.status !== "CANCELADO"
        );
        setTurnosDisponibles(turnosPendientes);
      }

    } catch (err: unknown) {
      console.error(err);
      const friendlyError = translateError(err, "Error de conexión con el servidor al cargar registros.");
      setError(friendlyError);
      toast.error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredHistorias = historias.filter((h) => {
    const searchLower = searchTerm.toLowerCase();
    const diagMatch = (h.diagnosis || "").toLowerCase().includes(searchLower);
    const notesMatch = (h.treatmentNotes || "").toLowerCase().includes(searchLower);
    const turnMatch = h.turnId.toString().includes(searchLower);
    
    return diagMatch || notesMatch || turnMatch;
  });

  const handleOpenModal = () => {
    setFormData({ turnId: "", diagnosis: "", treatmentNotes: "", attachmentUrl: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return; 
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.turnId || !formData.diagnosis.trim() || !formData.treatmentNotes.trim()) {
      toast.warning("Por favor complete todos los campos obligatorios.");
      return;
    }

    try {
      setIsSaving(true);
      const payload: ClinicalEntryRequestDTO = {
        turnId: Number(formData.turnId),
        diagnosis: formData.diagnosis.trim(),
        treatmentNotes: formData.treatmentNotes.trim(),
        attachmentUrl: formData.attachmentUrl || undefined,
      };

      const response = await clinicalService.save(payload);

      if (response && (response.ok || response.message === "Success" || !response.message)) {
        toast.success("¡Evolución médica registrada exitosamente!");
        toast.info("El turno ha sido marcado como COMPLETADO automáticamente.");
        fetchAllData(); 
        handleCloseModal();
      } else {
        throw new Error(response.message || "400");
      }
    } catch (err: unknown) {
      console.error("Fallo al guardar historia:", err);
      const friendlyError = translateError(err, "Error al registrar la evolución médica.");
      toast.error(friendlyError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout currentPage="historia-clinica">
      {/* 🌟 Contenedor principal con max-w-full y min-w-0 para evitar desbordes */}
      <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-full min-w-0">
        
        {/* Header Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">
              Historias Clínicas
            </h1>
            <p className="mt-1 text-sm md:text-base text-slate-600 truncate">
              Registro de evoluciones y diagnósticos
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3 sm:py-2.5 font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto shrink-0"
          >
            <Plus className="h-5 w-5 shrink-0" />
            <span>Registrar Evolución</span>
          </button>
        </div>

        {/* 🌟 Tarjetas de Estadísticas Responsivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 truncate">Total Registros Clínicos</p>
              <p className="text-2xl font-black text-slate-900 truncate">{historias.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 truncate">Turnos por Evolucionar</p>
              <p className="text-2xl font-black text-amber-600 truncate">{turnosDisponibles.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Buscador Responsive */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por ID de turno o diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white shadow-sm transition-all text-sm truncate"
          />
        </div>

        {/* 🌟 Tabla de Historias (Contenedor con scroll lateral) */}
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm w-full overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Cargando registros médicos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 px-4">
              <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button
                onClick={fetchAllData}
                className="mt-4 flex items-center gap-2 mx-auto rounded-xl bg-teal-50 px-6 py-2.5 font-bold text-teal-700 transition-colors hover:bg-teal-100 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> Reintentar
              </button>
            </div>
          ) : filteredHistorias.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium text-lg">No se encontraron historias clínicas</p>
              <p className="text-slate-400 text-sm mt-1">Intenta con otra búsqueda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50">
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Turno</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Fecha</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Diagnóstico</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Notas de Tratamiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50">
                  {filteredHistorias.map((historia, index) => (
                    <tr key={index} className="transition-colors hover:bg-cyan-50/50">
                      <td className="px-5 py-4 text-sm font-bold text-teal-700 font-mono whitespace-nowrap">
                        #{historia.turnId}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                          {historia.dateFormatted}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-teal-500 shrink-0" />
                          <div className="max-w-[200px] sm:max-w-xs truncate" title={historia.diagnosis}>
                            {historia.diagnosis}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-slate-400 shrink-0" />
                          <div className="max-w-[200px] sm:max-w-sm truncate" title={historia.treatmentNotes}>
                            {historia.treatmentNotes}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 🌟 Modal para Nueva Evolución RESPONSIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleCloseModal} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-t-3xl flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-teal-100 shrink-0">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 truncate">
                Registrar Evolución
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="bg-amber-50 p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm">
                <label className="mb-2 block text-sm font-bold text-amber-900">
                  1. Seleccionar Turno Pendiente
                </label>
                <select
                  value={formData.turnId}
                  onChange={(e) => setFormData({ ...formData, turnId: e.target.value })}
                  required
                  disabled={isSaving}
                  className="w-full rounded-xl border border-amber-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white text-slate-800 font-medium transition-all disabled:opacity-60 cursor-pointer text-sm shadow-sm"
                >
                  <option value="" disabled>Seleccione el turno a completar...</option>
                  {turnosDisponibles.map((turno) => (
                    <option key={turno.id} value={turno.id}>
                      T-#{turno.id} | Paciente: {turno.patientName} | Dr: {turno.doctorName}
                    </option>
                  ))}
                </select>
                {turnosDisponibles.length === 0 ? (
                  <p className="mt-2.5 text-xs font-bold text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0"/> No hay turnos pendientes en la agenda.
                  </p>
                ) : (
                  <p className="mt-2.5 text-xs text-amber-700 font-medium leading-relaxed">
                    * El estado de la cita cambiará automáticamente a COMPLETADO tras guardar.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  2. Diagnóstico Clínico
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                  disabled={isSaving}
                  rows={3}
                  placeholder="Describa el diagnóstico detallado del paciente..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  3. Notas de Tratamiento
                </label>
                <textarea
                  value={formData.treatmentNotes}
                  onChange={(e) => setFormData({ ...formData, treatmentNotes: e.target.value })}
                  required
                  disabled={isSaving}
                  rows={4}
                  placeholder="Procedimientos, recetas médicas, recomendaciones, etc."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3.5 font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !formData.turnId}
                  className="flex-[2] rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3.5 font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 text-sm sm:text-base"
                >
                  {isSaving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
                  ) : (
                    "Guardar y Completar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DashboardHistoria;