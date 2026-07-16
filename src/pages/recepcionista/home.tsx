import { useState, useEffect } from "react";
import { Calendar, User, Stethoscope, FileText, Search, Loader2 } from "lucide-react";
import { ReceptionLayout } from "../../components/receptionLayout";
import { doctorService } from "../../services/doctor.service";
import { patientService } from "../../services/patient.service";
import { treatmentService } from "../../services/treatment.service";
import { turnService } from "../../services/turn.service";
import type { DoctorDTO } from "../../models/doctor/doctorDTO";
import type { PatientDTO } from "../../models/patient/patientDTO";
import type { ServiceDTO } from "../../models/service/serviceDTO";
import { toast } from "sonner";

export default function NuevoTurnoPage() {
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [treatments, setTreatments] = useState<ServiceDTO[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [foundPatient, setFoundPatient] = useState<PatientDTO | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_id: 0,
    doctor_id: 0,
    date: "",
    time: "",
    treatment_ids: [] as number[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, treatsRes] = await Promise.all([
          doctorService.getActiveList(),
          treatmentService.getActiveList()
        ]);
        if (docsRes.ok) setDoctors(docsRes.data);
        if (treatsRes.ok) setTreatments(treatsRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar datos iniciales");
      }
    };
    fetchData();
  }, []);

  const handleSearchPatient = async () => {
    if (!patientSearch) return;
    setLoadingPatient(true);
    try {
      const res = await patientService.getByDni(patientSearch);
      if (res.ok) {
        setFoundPatient(res.data);
        setFormData(prev => ({ ...prev, patient_id: res.data.id }));
        toast.success("Paciente encontrado");
      } else {
        toast.error("Paciente no encontrado");
        setFoundPatient(null);
      }
    } catch (err) {
      toast.error("Error al buscar paciente");
      console.error(err);
    } finally {
      setLoadingPatient(false);
    }
  };

  const toggleTreatment = (id: number) => {
    setFormData(prev => ({
      ...prev,
      treatment_ids: prev.treatment_ids.includes(id)
        ? prev.treatment_ids.filter(tid => tid !== id)
        : [...prev.treatment_ids, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.doctor_id || !formData.date || !formData.time || formData.treatment_ids.length === 0) {
      toast.warning("Por favor complete todos los campos");
      return;
    }

    try {
      const userStr = localStorage.getItem("authUser");
      const user = userStr ? JSON.parse(userStr) : { id: 1 };
      
      const res = await turnService.save(formData, user.id);
      if (res.ok) {
        toast.success("Turno agendado con éxito");
        // Reset form
        setFormData({
          patient_id: 0,
          doctor_id: 0,
          date: "",
          time: "",
          treatment_ids: [],
        });
        setFoundPatient(null);
        setPatientSearch("");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Error al agendar turno");
      console.error(err);
    }
  };

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  ];

  const selectedDoctor = doctors.find(d => d.id === formData.doctor_id);
  const selectedTreatments = treatments.filter(t => formData.treatment_ids.includes(t.id));
  const totalCost = selectedTreatments.reduce((sum, t) => sum + t.basePrice, 0);

  return (
    <ReceptionLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Agendar Nuevo Turno</h2>
          <p className="text-slate-600 mt-1">Complete los campos para registrar un nuevo turno</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Search */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Seleccionar Paciente</h3>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Ingrese DNI del paciente..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="flex-1 px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                />
                <button
                  type="button"
                  onClick={handleSearchPatient}
                  disabled={loadingPatient}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  {loadingPatient ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Buscar
                </button>
              </div>
              {foundPatient && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <p className="font-bold text-teal-800">{foundPatient.name} {foundPatient.last_name}</p>
                  <p className="text-sm text-teal-600">DNI: {foundPatient.dni}</p>
                </div>
              )}
            </div>

            {/* Doctor Selection */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Seleccionar Odontólogo</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, doctor_id: doctor.id })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.doctor_id === doctor.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-teal-100 bg-white hover:border-teal-300"
                    }`}
                  >
                    <p className="font-semibold text-slate-900 text-sm">{doctor.name} {doctor.lastName}</p>
                    <p className="text-xs text-slate-600 mt-1">{doctor.specialty}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Time */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Fecha y Hora</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                />
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                >
                  <option value="">Seleccionar hora</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Treatments */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Tratamientos</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {treatments.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTreatment(t.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                      formData.treatment_ids.includes(t.id)
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-teal-100 bg-white text-slate-700 hover:border-teal-300"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm sticky top-24 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Resumen del Turno</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                  <p className="text-xs text-teal-600 uppercase font-semibold">Paciente</p>
                  <p className="font-semibold text-slate-900 mt-1">{foundPatient ? `${foundPatient.name} ${foundPatient.last_name}` : "No seleccionado"}</p>
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                  <p className="text-xs text-cyan-600 uppercase font-semibold">Odontólogo</p>
                  <p className="font-semibold text-slate-900 mt-1">{selectedDoctor ? `${selectedDoctor.name} ${selectedDoctor.lastName}` : "No seleccionado"}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-600 uppercase font-semibold">Fecha y Hora</p>
                  <p className="font-semibold text-slate-900 mt-1">{formData.date || "No definida"}</p>
                  <p className="font-semibold text-slate-900">{formData.time || "- -: - -"}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-600 uppercase font-semibold">Costo Total</p>
                  <p className="text-xl font-bold text-teal-700 mt-1">${totalCost.toFixed(2)}</p>
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all"
              >
                Confirmar Turno
              </button>
            </div>
          </div>
        </form>
      </div>
    </ReceptionLayout>
  );
}
