import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText
} from "lucide-react";
import DoctorLayout from "../../components/doctorLayout";
import { doctorService } from "../../services/doctor.service";
import { turnService } from "../../services/turn.service";
import { clinicalService } from "../../services/clinical.service";
import type { TurnResponseDTO } from "../../models/turn/turnResponseDTO";
import { useAuth } from "../../context/authContext";
import { toast } from "sonner";

export default function DoctorPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [turns, setTurns] = useState<TurnResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState<TurnResponseDTO | null>(null);
  const [clinicalData, setClinicalData] = useState({
    diagnosis: '',
    treatmentNotes: ''
  });

  const fetchAgenda = async () => {
    if (!user || !user.id) return;
    try {
      setLoading(true);
      setError(null);

      const doctorRes = await doctorService.getByUserId(user.id);
      
      if (!doctorRes.ok || !doctorRes.data) {
        setError("Este usuario no tiene un perfil de doctor asociado.");
        setLoading(false);
        return;
      }

      const realDoctorId = doctorRes.data.id;

      const response = await turnService.getByDoctorAndDate(realDoctorId, selectedDate);
      if (response.ok) {
        setTurns(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar la agenda");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, [selectedDate, user]);

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleOpenModal = (turn: TurnResponseDTO) => {
    setSelectedTurn(turn);
    setClinicalData({ diagnosis: '', treatmentNotes: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTurn(null);
  };

  const handleClinicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTurn) return;

    try {
      const payload = {
        turnId: selectedTurn.id,
        diagnosis: clinicalData.diagnosis,
        treatmentNotes: clinicalData.treatmentNotes
      };
      
      const res = await clinicalService.save(payload);
      if (res.ok || res.message === "Success" || !res.message) {
        toast.success("Turno completado y guardado en la historia clínica.");
        fetchAgenda(); // Refrescar turnos
        handleCloseModal();
      } else {
        toast.error(res.message || "Error al completar el turno");
      }
    } catch (error) {
      console.error(error);
      // Le explicamos a TypeScript la forma exacta que tiene el error de Axios
      const axiosError = error as { response?: { data?: { message?: string } } };
      
      // Ahora sí nos dejará leer el mensaje sin marcar error en rojo
      const errorMsg = axiosError?.response?.data?.message || "Ocurrió un error al guardar el registro clínico.";
      toast.error(errorMsg);
    }
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header with Date Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-teal-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Mi Agenda</h2>
            <p className="text-slate-500">Visualiza y gestiona tus turnos del día</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-teal-50 rounded-lg border border-teal-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-teal-600" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-xl border border-teal-200">
              <Calendar className="w-4 h-4 text-teal-600" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm font-bold text-teal-800"
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

        {/* Turns List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-teal-100">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500">Cargando turnos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-teal-100">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : turns.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-teal-100">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No hay turnos programados para esta fecha</p>
            </div>
          ) : (
            turns.map((turn) => {
              const timeDisplay = turn.appointmentDate ? turn.appointmentDate.split('T')[1].substring(0, 5) : 'Sin hora';

              return (
                <div 
                  key={turn.id}
                  className="group bg-white p-5 rounded-2xl border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-teal-50 rounded-xl flex flex-col items-center justify-center border border-teal-100 group-hover:bg-teal-600 group-hover:border-teal-600 transition-colors">
                      <Clock className="w-4 h-4 text-teal-600 group-hover:text-white mb-1" />
                      <span className="text-xs font-bold text-teal-800 group-hover:text-white">{timeDisplay}</span>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{turn.patientName} <span className="text-sm font-normal text-slate-500">({turn.patientDni})</span></h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {turn.services.map(t => (
                          <span key={t.id} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-md border border-cyan-100">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="text-right mr-4 hidden md:block">
                      <p className="text-xs text-slate-500 font-medium">Estado</p>
                      <p className={`text-sm font-bold ${
                        turn.status === 'COMPLETADO' ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {turn.status}
                      </p>
                    </div>
                    
                    {turn.status !== 'COMPLETADO' && turn.status !== 'CANCELADO' && (
                      <button 
                        onClick={() => handleOpenModal(turn)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Atender
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Clinical Entry Modal */}
      {isModalOpen && selectedTurn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50 flex items-center gap-3 rounded-t-xl">
              <FileText className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Atención Médica - {selectedTurn.patientName}
              </h2>
            </div>

            <form onSubmit={handleClinicalSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Diagnóstico</label>
                <textarea
                  value={clinicalData.diagnosis}
                  onChange={(e) => setClinicalData({ ...clinicalData, diagnosis: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none"
                  placeholder="Ingrese el diagnóstico del paciente..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notas del Tratamiento</label>
                <textarea
                  value={clinicalData.treatmentNotes}
                  onChange={(e) => setClinicalData({ ...clinicalData, treatmentNotes: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none"
                  placeholder="Describa el procedimiento realizado, medicamentos recetados o indicaciones..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-teal-200 text-slate-700 rounded-lg hover:bg-teal-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Finalizar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}