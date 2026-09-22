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
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Historias Clínicas
            </h1>
            <p className="mt-1 text-slate-600">
              Registro de evoluciones y diagnósticos de pacientes
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3 font-medium text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            Registrar Evolución
          </button>
        </div>

        {/* Tarjetas de Estadísticas Coherentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Registros Clínicos</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{historias.length}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Turnos por Evolucionar</p>
                <p className="text-3xl font-black text-amber-600 mt-1">{turnosDisponibles.length}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID de turno, diagnóstico o palabras clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-teal-200 bg-white py-3 pl-12 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 shadow-sm transition-all"
          />
        </div>

        {/* Tabla de Historias */}
        <div className="overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-teal-500" />
              <p className="text-slate-500 font-medium animate-pulse">Cargando registros médicos...</p>
            </div>
          ) : error ? (
            <div className="px-4 py-20 text-center">
              <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
              <p className="font-medium text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchAllData}
                className="mt-4 flex items-center gap-2 mx-auto rounded-lg bg-teal-50 px-6 py-2.5 font-bold text-teal-700 transition-colors hover:bg-teal-100"
              >
                <RefreshCw className="w-4 h-4" /> Reintentar
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50 text-xs uppercase tracking-wider font-bold text-slate-800">
                    <th className="px-6 py-4">Turno</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Diagnóstico</th>
                    <th className="px-6 py-4">Notas de Tratamiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50">
                  {filteredHistorias.map((historia, index) => (
                    <tr key={index} className="transition-colors hover:bg-cyan-50/50">
                      <td className="px-6 py-4 text-sm font-bold text-teal-700 font-mono">
                        #{historia.turnId}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {historia.dateFormatted}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        <div className="flex items-start gap-2">
                          <Stethoscope className="h-4 w-4 text-teal-500 mt-0.5" />
                          <span className="line-clamp-2 max-w-xs leading-relaxed">{historia.diagnosis}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-start gap-2">
                          <ClipboardList className="h-4 w-4 text-slate-400 mt-0.5" />
                          <span className="line-clamp-2 max-w-sm leading-relaxed">{historia.treatmentNotes}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredHistorias.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <FileText className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-medium text-lg">No se encontraron historias clínicas.</p>
                  <p className="text-slate-400 text-sm mt-1">Intenta con otra búsqueda.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para Nueva Evolución (Mejorado) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 rounded-t-2xl">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <FileText className="h-6 w-6 text-teal-600" />
                Registrar Evolución Médica
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <label className="mb-2 block text-sm font-bold text-amber-900">
                  1. Seleccionar Turno Pendiente
                </label>
                <select
                  value={formData.turnId}
                  onChange={(e) => setFormData({ ...formData, turnId: e.target.value })}
                  required
                  disabled={isSaving}
                  className="w-full rounded-xl border border-amber-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white text-slate-800 font-medium transition-all disabled:opacity-60 cursor-pointer"
                >
                  <option value="" disabled>Seleccione el turno a completar...</option>
                  {turnosDisponibles.map((turno) => (
                    <option key={turno.id} value={turno.id}>
                      T-#{turno.id} | Paciente: {turno.patientName} | Dr: {turno.doctorName}
                    </option>
                  ))}
                </select>
                {turnosDisponibles.length === 0 ? (
                  <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5"/> No hay turnos pendientes en la agenda.
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-amber-700 font-medium">
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
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 shadow-sm"
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
                  placeholder="Describa los procedimientos realizados, medicamentos recetados, recomendaciones, etc."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 shadow-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !formData.turnId}
                  className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3 font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Guardando...
                    </>
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