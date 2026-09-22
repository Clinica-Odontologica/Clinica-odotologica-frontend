import { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Stethoscope,
  FileText,
  Search,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { ReceptionLayout } from "../../components/receptionLayout";
import { doctorService } from "../../services/doctor.service";
import { patientService } from "../../services/patient.service";
import { treatmentService } from "../../services/treatment.service";
import { turnService } from "../../services/turn.service";
import type { DoctorDTO } from "../../models/doctor/doctorDTO";
import type { PatientDTO } from "../../models/patient/patientDTO";
import type { ServiceDTO } from "../../models/service/serviceDTO";
import { toast } from "sonner";
import { useAuth } from "../../context/authContext";
import type { TurnRequestDTO } from "../../models/turn/turnRequestDTO";

export default function NuevoTurnoPage() {
  const { user } = useAuth();

  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [treatments, setTreatments] = useState<ServiceDTO[]>([]);
  const [patientsList, setPatientsList] = useState<PatientDTO[]>([]);
  
  const [patientSearch, setPatientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [foundPatient, setFoundPatient] = useState<PatientDTO | null>(null);
  
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: 0,
    doctor_id: 0,
    date: "",
    time: "",
    treatment_ids: [] as number[],
  });

  // 🌟 OBTENEMOS LA FECHA Y HORA LOCAL (Evita bugs de zona horaria)
  const now = new Date();
  const localYear = now.getFullYear();
  const localMonth = String(now.getMonth() + 1).padStart(2, "0");
  const localDay = String(now.getDate()).padStart(2, "0");
  const today = `${localYear}-${localMonth}-${localDay}`;
  
  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${currentHours}:${currentMinutes}`;

  const fetchInitialData = async () => {
    try {
      setIsPageLoading(true);
      setPageError(null);
      
      const [docsRes, treatsRes, patsRes] = await Promise.all([
        doctorService.getActiveList(),
        treatmentService.getActiveList(),
        patientService.getAllPaginated(0, 500), 
      ]);
      
      if (!docsRes.ok && !treatsRes.ok) {
        throw new Error("No se pudo conectar con el servidor de la clínica.");
      }

      if (docsRes.ok) setDoctors(docsRes.data || []);
      if (treatsRes.ok) setTreatments(treatsRes.data || []);
      if (patsRes.ok) setPatientsList(patsRes.data.content || []);
      
    } catch (err: unknown) {
      console.error("Error cargando datos:", err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Ocurrió un error inesperado al cargar los datos.";
        
      setPageError(errorMessage);
      toast.error("Error de conexión. Revisa tu internet o contacta a soporte.");
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // 🌟 Limpiar la hora si el usuario cambia a "hoy" y la hora que tenía elegida ya pasó
  useEffect(() => {
    if (formData.date === today && formData.time && formData.time < currentTime) {
      setFormData((prev) => ({ ...prev, time: "" }));
      toast.info("La hora seleccionada expiró. Por favor elige un nuevo horario.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date]);

  const filteredPatients = patientsList.filter((p) => {
    if (!patientSearch) return false;
    const searchLower = patientSearch.toLowerCase();
    const fullName = `${p.name} ${p.last_name || p.last_name || ""}`.toLowerCase();
    
    return (
      p.dni.includes(patientSearch) || 
      fullName.includes(searchLower)
    );
  });

  const handleSelectPatient = (patient: PatientDTO) => {
    setFoundPatient(patient);
    setFormData((prev) => ({ ...prev, patient_id: patient.id }));
    setPatientSearch(patient.dni); 
    setShowDropdown(false); 
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPatientSearch(value);
    setShowDropdown(true);
    
    if (foundPatient && value !== foundPatient.dni) {
      setFoundPatient(null);
      setFormData((prev) => ({ ...prev, patient_id: 0 }));
    }
  };

  const toggleTreatment = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      treatment_ids: prev.treatment_ids.includes(id)
        ? prev.treatment_ids.filter((tid) => tid !== id)
        : [...prev.treatment_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient_id) {
      toast.warning("Debe seleccionar un paciente de la lista.");
      return;
    }
    if (!formData.doctor_id) {
      toast.warning("Debe seleccionar un odontólogo.");
      return;
    }
    if (!formData.date || !formData.time) {
      toast.warning("Debe especificar fecha y hora.");
      return;
    }

    // 🌟 Doble validación de hora al enviar (por si dejó la pestaña abierta)
    if (formData.date === today && formData.time < currentTime) {
      toast.error("La hora seleccionada ya ha pasado. Por favor actualice el horario.");
      return;
    }

    if (formData.treatment_ids.length === 0) {
      toast.warning("Debe seleccionar al menos un tratamiento.");
      return;
    }

    if (!user || !user.id) {
      toast.error("Su sesión ha expirado. Vuelva a iniciar sesión.");
      return;
    }

    try {
      setIsSaving(true); 
      
      const combinedDateTime = `${formData.date}T${formData.time}:00`;

      const payloadFinal = {
        patientId: formData.patient_id,
        doctorId: formData.doctor_id,
        appointmentDate: combinedDateTime,
        serviceIds: formData.treatment_ids,
        status: "PROGRAMADO", 
      };

      const res = await turnService.save(
        payloadFinal as TurnRequestDTO,
        user.id,
      );

      if (res.ok) {
        toast.success("¡Turno agendado exitosamente!");
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
        toast.error(res.message || "Hubo un problema al agendar el turno.");
      }
    } catch (err) {
      toast.error("Error crítico de red. No se pudo agendar el turno.");
      console.error(err);
    } finally {
      setIsSaving(false); 
    }
  };

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30",
  ];

  const selectedDoctor = doctors.find((d) => d.id === formData.doctor_id);
  const selectedTreatments = treatments.filter((t) =>
    formData.treatment_ids.includes(t.id),
  );
  const totalCost = selectedTreatments.reduce(
    (sum, t) => sum + (t.basePrice || 0),
    0,
  );

  if (isPageLoading) {
    return (
      <ReceptionLayout currentPage="agenda">
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
          <p className="text-slate-600 font-medium animate-pulse">Cargando sistema de reservas...</p>
        </div>
      </ReceptionLayout>
    );
  }

  if (pageError) {
    return (
      <ReceptionLayout currentPage="agenda">
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Problema de Conexión</h2>
          <p className="text-slate-600">{pageError}</p>
          <button 
            onClick={fetchInitialData}
            className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar Conexión
          </button>
        </div>
      </ReceptionLayout>
    );
  }

  return (
    <ReceptionLayout currentPage="agenda">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Agendar Nuevo Turno
          </h2>
          <p className="text-slate-600 mt-1">
            Complete los campos para registrar un nuevo turno
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            
            {/* Patient Search */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center shadow-inner">
                  <User className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">1. Seleccionar Paciente</h3>
                  <p className="text-xs text-slate-500">Busque por DNI, Nombre o Apellido</p>
                </div>
              </div>
              
              <div className="relative mb-4">
                <div className={`flex items-center bg-white border rounded-xl px-4 py-3 transition-all shadow-sm ${foundPatient ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-teal-200 focus-within:ring-2 focus-within:ring-teal-100 focus-within:border-teal-400'}`}>
                  <Search className={`w-5 h-5 mr-3 shrink-0 ${foundPatient ? 'text-emerald-500' : 'text-teal-400'}`} />
                  <input
                    type="text"
                    placeholder="Escriba aquí..."
                    value={patientSearch}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    maxLength={50}
                    className="flex-1 focus:outline-none text-sm text-slate-800 bg-transparent placeholder-slate-400 font-medium"
                  />
                  {foundPatient && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2 animate-in zoom-in" />
                  )}
                </div>

                {showDropdown && patientSearch && !foundPatient && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-teal-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] max-h-64 overflow-y-auto animate-in slide-in-from-top-2">
                    {filteredPatients.length > 0 ? (
                      <div className="p-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Resultados ({filteredPatients.length})</p>
                        {filteredPatients.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPatient(p)}
                            className="px-4 py-3 hover:bg-teal-50/80 rounded-lg cursor-pointer transition-all flex flex-col gap-1.5"
                          >
                            <p className="font-bold text-slate-800 text-sm">
                              {p.name} {p.last_name || p.last_name}
                            </p>
                            <p className="text-[11px] font-mono font-semibold text-teal-700 bg-teal-100/50 self-start px-2 py-0.5 rounded border border-teal-100">
                              DNI: {p.dni}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-10 text-sm text-slate-500 text-center flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">No se encontraron pacientes</p>
                          <p className="text-xs mt-1">Verifique el nombre o DNI escrito</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {foundPatient && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-2 shadow-sm">
                  <div>
                    <p className="font-bold text-emerald-950 text-lg">
                      {foundPatient.name} {foundPatient.last_name || foundPatient.last_name}
                    </p>
                    <p className="text-sm text-emerald-700 mt-1 font-medium flex items-center gap-2">
                      <span className="opacity-70">DNI:</span> {foundPatient.dni}
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 shadow-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Paciente Confirmado
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Selection */}
            <div className={`bg-white rounded-xl border transition-colors duration-300 p-6 shadow-sm ${formData.patient_id ? 'border-teal-100' : 'border-slate-100 opacity-60 pointer-events-none'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-inner ${formData.patient_id ? 'bg-gradient-to-br from-cyan-100 to-teal-100' : 'bg-slate-100'}`}>
                  <Stethoscope className={`w-5 h-5 ${formData.patient_id ? 'text-teal-700' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${formData.patient_id ? 'text-slate-900' : 'text-slate-500'}`}>
                    2. Odontólogo
                  </h3>
                </div>
              </div>

              {doctors.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500">No hay doctores disponibles en este momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, doctor_id: doctor.id })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.doctor_id === doctor.id
                          ? "border-teal-500 bg-teal-50 shadow-sm ring-1 ring-teal-500/20"
                          : "border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50"
                      }`}
                    >
                      <p className="font-bold text-slate-800 text-sm">
                        Dr. {doctor.name} {doctor.lastName}
                      </p>
                      <p className={`text-xs mt-1.5 font-medium px-2 py-0.5 rounded inline-block ${formData.doctor_id === doctor.id ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                        {doctor.specialty}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div className={`bg-white rounded-xl border transition-colors duration-300 p-6 shadow-sm ${formData.doctor_id ? 'border-teal-100' : 'border-slate-100 opacity-60 pointer-events-none'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-inner ${formData.doctor_id ? 'bg-gradient-to-br from-cyan-100 to-teal-100' : 'bg-slate-100'}`}>
                  <Calendar className={`w-5 h-5 ${formData.doctor_id ? 'text-teal-700' : 'text-slate-400'}`} />
                </div>
                <h3 className={`text-lg font-semibold ${formData.doctor_id ? 'text-slate-900' : 'text-slate-500'}`}>
                  3. Fecha y Hora
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="date"
                  min={today}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 text-sm font-medium text-slate-700 shadow-sm cursor-pointer transition-all"
                />
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 text-sm font-medium text-slate-700 bg-white shadow-sm cursor-pointer transition-all disabled:opacity-50"
                  disabled={!formData.date}
                >
                  <option value="" disabled>Seleccione un horario</option>
                  {availableTimes.map((time) => {
                    // 🌟 Verificamos si la hora ya pasó (solo si la fecha es hoy)
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

            {/* Treatments */}
            <div className={`bg-white rounded-xl border transition-colors duration-300 p-6 shadow-sm ${formData.date && formData.time ? 'border-teal-100' : 'border-slate-100 opacity-60 pointer-events-none'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-inner ${formData.date && formData.time ? 'bg-gradient-to-br from-cyan-100 to-teal-100' : 'bg-slate-100'}`}>
                  <FileText className={`w-5 h-5 ${formData.date && formData.time ? 'text-teal-700' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${formData.date && formData.time ? 'text-slate-900' : 'text-slate-500'}`}>
                    4. Tratamientos
                  </h3>
                  <p className="text-xs text-slate-500">Puede seleccionar más de uno</p>
                </div>
              </div>

              {treatments.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500">No hay tratamientos configurados en el sistema.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {treatments.map((t) => {
                    const isSelected = formData.treatment_ids.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTreatment(t.id)}
                        className={`p-3.5 rounded-xl border-2 transition-all text-left flex flex-col justify-between min-h-[90px] ${
                          isSelected
                            ? "border-teal-500 bg-teal-50 shadow-sm ring-1 ring-teal-500/20"
                            : "border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`text-sm font-bold line-clamp-2 leading-snug ${isSelected ? 'text-teal-900' : 'text-slate-700'}`}>
                          {t.name}
                        </span>
                        <span className={`text-xs mt-3 font-black tracking-wide ${isSelected ? "text-teal-600" : "text-slate-400"}`}>
                          ${t.basePrice ? t.basePrice.toFixed(2) : "0.00"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary / Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sticky top-24 space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Resumen</span>
                {formData.treatment_ids.length > 0 && (
                  <span className="bg-teal-100 text-teal-800 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">Listo</span>
                )}
              </h3>

              <div className="space-y-3.5 text-sm mt-4">
                <div className={`p-3.5 rounded-xl border transition-colors ${foundPatient ? 'bg-teal-50/50 border-teal-100' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${foundPatient ? 'text-teal-600' : 'text-slate-400'}`}>
                    1. Paciente
                  </p>
                  <p className={`font-semibold mt-1 truncate ${foundPatient ? 'text-slate-900' : 'text-slate-400'}`}>
                    {foundPatient
                      ? `${foundPatient.name} ${foundPatient.last_name || foundPatient.last_name || ""}`
                      : "Pendiente"}
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border transition-colors ${selectedDoctor ? 'bg-cyan-50/50 border-cyan-100' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${selectedDoctor ? 'text-cyan-600' : 'text-slate-400'}`}>
                    2. Odontólogo
                  </p>
                  <p className={`font-semibold mt-1 truncate ${selectedDoctor ? 'text-slate-900' : 'text-slate-400'}`}>
                    {selectedDoctor
                      ? `Dr. ${selectedDoctor.name} ${selectedDoctor.lastName}`
                      : "Pendiente"}
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border transition-colors ${formData.date && formData.time ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${formData.date && formData.time ? 'text-amber-600' : 'text-slate-400'}`}>
                    3. Fecha y Hora
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`font-semibold px-2 py-0.5 rounded border ${formData.date ? 'bg-white border-amber-200 text-slate-900 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                      {formData.date
                        ? formData.date.split("-").reverse().join("/")
                        : "DD/MM/AAAA"}
                    </span>
                    <span className="font-bold text-slate-300">-</span>
                    <span className={`font-semibold px-2 py-0.5 rounded border ${formData.time ? 'bg-white border-amber-200 text-slate-900 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                      {formData.time || "--:--"}
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 shadow-lg mt-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest relative z-10">
                    Total Estimado
                  </p>
                  <p className="text-3xl font-black text-white mt-1 relative z-10 flex items-baseline gap-1">
                    <span className="text-xl text-teal-400">$</span>
                    {totalCost.toFixed(2)}
                  </p>
                  
                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center relative z-10">
                    <span className="text-xs font-medium text-slate-300">
                      {selectedTreatments.length} servicios
                    </span>
                    {selectedTreatments.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving || formData.treatment_ids.length === 0}
                className="w-full mt-2 px-4 py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(13,148,136,0.3)] hover:shadow-[0_8px_25px_rgba(13,148,136,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:transform-none"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Confirmar Turno
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ReceptionLayout>
  );
}