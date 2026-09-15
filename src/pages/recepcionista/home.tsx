import { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Stethoscope,
  FileText,
  Search,
  CheckCircle2
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
  
  // 🌟 Nuevos estados para la búsqueda dinámica
  const [patientsList, setPatientsList] = useState<PatientDTO[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [foundPatient, setFoundPatient] = useState<PatientDTO | null>(null);
  
  const [formData, setFormData] = useState({
    patient_id: 0,
    doctor_id: 0,
    date: "",
    time: "",
    treatment_ids: [] as number[],
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🌟 Cargamos doctores, tratamientos y también la lista de pacientes de golpe
        const [docsRes, treatsRes, patsRes] = await Promise.all([
          doctorService.getActiveList(),
          treatmentService.getActiveList(),
          patientService.getAllPaginated(0, 500), // Traemos los pacientes
        ]);
        
        if (docsRes.ok) setDoctors(docsRes.data);
        if (treatsRes.ok) setTreatments(treatsRes.data);
        if (patsRes.ok) setPatientsList(patsRes.data.content || []);
        
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar datos iniciales");
      }
    };
    fetchData();
  }, []);

  // 🌟 Lógica de filtrado en tiempo real
  const filteredPatients = patientsList.filter((p) => {
    if (!patientSearch) return false;
    const searchLower = patientSearch.toLowerCase();
    const fullName = `${p.name} ${p.last_name || p.last_name || ""}`.toLowerCase();
    
    return (
      p.dni.includes(patientSearch) || 
      fullName.includes(searchLower)
    );
  });

  // 🌟 Función cuando el usuario hace clic en un paciente del dropdown
  const handleSelectPatient = (patient: PatientDTO) => {
    setFoundPatient(patient);
    setFormData((prev) => ({ ...prev, patient_id: patient.id }));
    setPatientSearch(patient.dni); // Rellenamos el input con el DNI
    setShowDropdown(false); // Ocultamos la lista
  };

  // 🌟 Función para manejar el cambio en el input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPatientSearch(value);
    setShowDropdown(true);
    
    // Si borra o cambia el texto, desvinculamos al paciente actual
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

    if (
      !formData.patient_id ||
      !formData.doctor_id ||
      !formData.date ||
      !formData.time ||
      formData.treatment_ids.length === 0
    ) {
      toast.warning("Por favor complete todos los campos obligatorios.");
      return;
    }

    if (!user || !user.id) {
      toast.error("Error de sesión. Vuelva a iniciar sesión.");
      return;
    }

    try {
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
        toast.success("Turno agendado con éxito");
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
        toast.error(res.message || "Error al agendar el turno");
      }
    } catch (err) {
      toast.error("Error crítico al agendar turno");
      console.error(err);
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

  return (
    <ReceptionLayout currentPage="agenda">
      <div className="space-y-6">
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
            
            {/* 🌟 Patient Search DINÁMICO */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Seleccionar Paciente
                </h3>
              </div>
              
              <div className="relative mb-4">
                {/* Input Buscador */}
                <div className="flex items-center bg-white border border-teal-200 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-teal-400 focus-within:border-teal-400 transition-all shadow-sm">
                  <Search className="w-5 h-5 text-teal-500 mr-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Escribe el DNI, Nombre o Apellido del paciente..."
                    value={patientSearch}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Retraso leve para permitir el clic
                    className="flex-1 focus:outline-none text-sm text-slate-800 bg-transparent placeholder-slate-400"
                  />
                  {foundPatient && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2 animate-in zoom-in" />
                  )}
                </div>

                {/* Dropdown de Resultados */}
                {showDropdown && patientSearch && !foundPatient && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-teal-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] max-h-64 overflow-y-auto animate-in slide-in-from-top-2">
                    {filteredPatients.length > 0 ? (
                      <div className="p-2">
                        <p className="text-xs font-bold text-slate-400 uppercase px-3 py-2">Resultados</p>
                        {filteredPatients.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPatient(p)}
                            className="px-4 py-3 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors flex flex-col gap-1"
                          >
                            <p className="font-bold text-slate-800 text-sm">
                              {p.name} {p.last_name || p.last_name}
                            </p>
                            <p className="text-xs font-mono text-teal-600 bg-teal-100/50 self-start px-2 py-0.5 rounded border border-teal-100">
                              DNI: {p.dni}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-sm text-slate-500 text-center flex flex-col items-center gap-2">
                        <User className="w-8 h-8 text-slate-300" />
                        <p>No se encontraron pacientes con <b>"{patientSearch}"</b></p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {foundPatient && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                  <div>
                    <p className="font-bold text-teal-900">
                      {foundPatient.name} {foundPatient.last_name || foundPatient.last_name}
                    </p>
                    <p className="text-sm text-teal-600 mt-0.5 font-medium">
                      DNI: {foundPatient.dni}
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 shadow-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Seleccionado
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Selection */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Seleccionar Odontólogo
                </h3>
              </div>

              {doctors.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No hay doctores disponibles.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, doctor_id: doctor.id })
                      }
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.doctor_id === doctor.id
                          ? "border-teal-500 bg-teal-50 shadow-sm"
                          : "border-teal-100 bg-white hover:border-teal-300"
                      }`}
                    >
                      <p className="font-semibold text-slate-900 text-sm">
                        Dr. {doctor.name} {doctor.lastName}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {doctor.specialty}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Fecha y Hora
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="date"
                  min={today}
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm cursor-pointer"
                />
                <select
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm bg-white cursor-pointer"
                >
                  <option value="" disabled>
                    Seleccionar hora
                  </option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
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
                <h3 className="text-lg font-semibold text-slate-900">
                  Tratamientos
                </h3>
              </div>

              {treatments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No hay tratamientos registrados.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {treatments.map((t) => {
                    const isSelected = formData.treatment_ids.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTreatment(t.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left flex flex-col justify-between h-full ${
                          isSelected
                            ? "border-teal-500 bg-teal-50 text-teal-900 shadow-sm"
                            : "border-teal-100 bg-white text-slate-700 hover:border-teal-300"
                        }`}
                      >
                        <span className="text-sm font-semibold line-clamp-2 leading-tight">
                          {t.name}
                        </span>
                        <span
                          className={`text-xs mt-2 font-bold ${isSelected ? "text-teal-700" : "text-slate-500"}`}
                        >
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
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm sticky top-24 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Resumen del Turno
              </h3>

              <div className="space-y-4 text-sm mt-4">
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                  <p className="text-xs text-teal-600 uppercase font-bold tracking-wider">
                    Paciente
                  </p>
                  <p className="font-semibold text-slate-900 mt-1 truncate">
                    {foundPatient
                      ? `${foundPatient.name} ${foundPatient.last_name || foundPatient.last_name || ""}`
                      : "No seleccionado"}
                  </p>
                </div>

                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                  <p className="text-xs text-cyan-600 uppercase font-bold tracking-wider">
                    Odontólogo
                  </p>
                  <p className="font-semibold text-slate-900 mt-1 truncate">
                    {selectedDoctor
                      ? `Dr. ${selectedDoctor.name} ${selectedDoctor.lastName}`
                      : "No seleccionado"}
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-600 uppercase font-bold tracking-wider">
                    Fecha y Hora
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                      {formData.date
                        ? formData.date.split("-").reverse().join("/")
                        : "DD/MM/AAAA"}
                    </p>
                    <span className="font-bold text-amber-400">-</span>
                    <p className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                      {formData.time || "--:--"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-700 uppercase font-bold tracking-wider">
                    Costo Total Estimado
                  </p>
                  <p className="text-2xl font-black text-teal-700 mt-1">
                    ${totalCost.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-teal-600 mt-1">
                    {selectedTreatments.length} tratamiento(s) seleccionados
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Confirmar Turno
              </button>
            </div>
          </div>
        </form>
      </div>
    </ReceptionLayout>
  );
}