import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  Stethoscope,
  ClipboardList
} from "lucide-react";
import { AdminLayout } from "../../../components/adminLayout";

import { clinicalService } from "../../../services/clinical.service";
// 🌟 Importamos el servicio de turnos para llenar el select
import { turnService } from "../../../services/turn.service";
import type { ClinicalEntryRequestDTO } from "../../../models/clinical/clinicalEntryRequestDTO";
import type { ClinicalEntryResponseDTO } from "../../../models/clinical/clinicalEntryResponseDTO";
import type { TurnResponseDTO } from "../../../models/turn/turnResponseDTO";

interface HistoriaUI extends ClinicalEntryResponseDTO {
  dateFormatted: string;
}

const DashboardHistoria = () => {
  const [historias, setHistorias] = useState<HistoriaUI[]>([]);
  // 🌟 Nuevo estado para guardar los turnos disponibles en el select
  const [turnosDisponibles, setTurnosDisponibles] = useState<TurnResponseDTO[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    turnId: "",
    diagnosis: "",
    treatmentNotes: "",
    attachmentUrl: "",
  });

  // Función combinada para cargar historias Y los turnos pendientes
  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Hacemos las dos peticiones al mismo tiempo para que sea rápido
      const [histRes, turnosRes] = await Promise.all([
        clinicalService.getAllPaginated(0, 100),
        turnService.getAllPaginated(0, 200) // Traemos turnos para el select
      ]);

      // 1. Procesar Historias (Tabla)
      if (histRes && histRes.data) {
        const dataArray = histRes.data.content || [];
        const historiasNormalizadas: HistoriaUI[] = dataArray.map((h) => {
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
        setError(histRes.message || "No se pudo cargar la data de historias.");
      }

      // 2. Procesar Turnos (Select del Modal)
      if (turnosRes.ok) {
        // Filtramos para mostrar SOLO los turnos que no estén completados ni cancelados
        const turnosPendientes = turnosRes.data.content.filter(
          (t: TurnResponseDTO) => t.status !== "COMPLETADO" && t.status !== "CANCELADO"
        );
        setTurnosDisponibles(turnosPendientes);
      }

    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || "Error de conexión con el servidor.");
      console.error(error);
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

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: ClinicalEntryRequestDTO = {
        turnId: Number(formData.turnId),
        diagnosis: formData.diagnosis,
        treatmentNotes: formData.treatmentNotes,
        attachmentUrl: formData.attachmentUrl || undefined,
      };

      const response = await clinicalService.save(payload);

      if (response && (response.ok || response.message === "Success" || !response.message)) {
        alert("¡Evolución registrada! El turno ha sido marcado como COMPLETADO.");
        fetchAllData(); // Recargamos para actualizar tabla y limpiar el select
        handleCloseModal();
      } else {
        alert("Error al guardar: " + (response.message || "Error desconocido"));
      }
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert("Error al registrar la evolución: " + (axiosError?.response?.data?.message || "Error de red"));
      console.error(error);
    }
  };

  return (
    <AdminLayout currentPage="historia-clinica">
      <div className="space-y-6">
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
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3 font-medium text-white transition-all hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Registrar Evolución
          </button>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID de turno, diagnóstico o palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-teal-200 bg-white py-3 pl-12 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>

        {/* Tabla de Historias */}
        <div className="overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-teal-500" />
              <p className="text-slate-500">Cargando registros médicos...</p>
            </div>
          ) : error ? (
            <div className="px-4 py-20 text-center">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
              <p className="font-medium text-red-600">{error}</p>
              <button
                onClick={fetchAllData}
                className="mt-4 rounded-lg bg-teal-100 px-4 py-2 text-teal-700 transition-colors hover:bg-teal-200"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50 text-sm font-semibold text-slate-900">
                    <th className="px-6 py-4">ID Turno</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Diagnóstico</th>
                    <th className="px-6 py-4">Notas de Tratamiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50">
                  {filteredHistorias.map((historia, index) => (
                    <tr key={index} className="transition-colors hover:bg-teal-50/30">
                      <td className="px-6 py-4 text-sm font-semibold text-teal-700">
                        #{historia.turnId}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {historia.dateFormatted}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800">
                        <div className="flex items-start gap-2">
                          <Stethoscope className="h-4 w-4 text-teal-500 mt-0.5" shrink-0 />
                          <span className="line-clamp-2 max-w-xs">{historia.diagnosis}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-start gap-2">
                          <ClipboardList className="h-4 w-4 text-slate-400 mt-0.5" shrink-0 />
                          <span className="line-clamp-2 max-w-sm">{historia.treatmentNotes}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredHistorias.length === 0 && (
                <div className="py-12 text-center">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                  <p className="text-slate-600">No se encontraron historias clínicas.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para Nueva Evolución */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 rounded-t-xl">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <FileText className="h-5 w-5 text-teal-600" />
                Registrar Evolución Médica
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              
              {/* 🌟 AQUÍ ESTÁ TU IDEA BRILLANTE: EL SELECT DE PACIENTES/TURNOS 🌟 */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Seleccionar Paciente (Turno Pendiente)
                </label>
                <select
                  value={formData.turnId}
                  onChange={(e) => setFormData({ ...formData, turnId: e.target.value })}
                  required
                  className="w-full rounded-lg border border-teal-200 px-4 py-2.5 focus:border-teal-500 focus:outline-none bg-white text-slate-700"
                >
                  <option value="">Seleccione el turno a completar...</option>
                  {turnosDisponibles.map((turno) => (
                    <option key={turno.id} value={turno.id}>
                      Turno #{turno.id} - Paciente: {turno.patientName} (Dr. {turno.doctorName})
                    </option>
                  ))}
                </select>
                {turnosDisponibles.length === 0 && (
                  <p className="mt-1 text-xs font-medium text-amber-600">
                    No hay turnos pendientes para registrar evolución.
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  * El estado de este turno cambiará automáticamente a COMPLETADO.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Diagnóstico
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describa el diagnóstico del paciente..."
                  className="w-full resize-none rounded-lg border border-teal-200 px-4 py-2 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notas de Tratamiento
                </label>
                <textarea
                  value={formData.treatmentNotes}
                  onChange={(e) => setFormData({ ...formData, treatmentNotes: e.target.value })}
                  required
                  rows={4}
                  placeholder="Describa los procedimientos realizados, medicamentos recetados, etc."
                  className="w-full resize-none rounded-lg border border-teal-200 px-4 py-2 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formData.turnId} // Bloquear el botón si no hay turno seleccionado
                  className="flex-1 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar y Completar
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