import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Search, 
  AlertCircle, 
  Loader2, 
  Lock, 
  Unlock,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

import { AdminLayout } from "../../../components/adminLayout";
import { ReceptionLayout } from "../../../components/receptionLayout";
import { useAuth } from "../../../context/authContext";

import { patientService } from '../../../services/patient.service';
import type { PatientDTO } from '../../../models/patient/patientDTO';
import type { PatientRequestDTO } from '../../../models/patient/patientRequestDTO';
import { toast } from "sonner";

type UserWithRole = {
  role?: { name: string };
  rol?: { name: string };
};

const translateError = (err: unknown, defaultMsg: string) => {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("409")) return "Ya existe un paciente registrado con este DNI o Correo.";
    if (msg.includes("400")) return "Los datos ingresados no son válidos. Verifica los campos.";
    if (msg.includes("404")) return "El paciente solicitado no fue encontrado.";
    if (msg.includes("500") || msg.includes("502")) return "El servidor de la clínica está en mantenimiento.";
    if (msg.includes("network") || msg.includes("failed to fetch")) return "No hay conexión con el servidor. Revisa tu internet.";
    return err.message;
  }
  return defaultMsg;
};

export default function DashboardPacientes() {
  const { user } = useAuth();

  const uData = user as unknown as UserWithRole;
  const roleName = uData?.role?.name || uData?.rol?.name || "";
  const isAdmin = roleName === "ROLE_ADMIN" || roleName === "ADMIN";

  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientDTO | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [patientToToggle, setPatientToToggle] = useState<PatientDTO | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const [formData, setFormData] = useState({
    dni: '',
    name: '',
    last_name: '',
    phone: '',
    email: '',
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getAllPaginated(0, 100);
      if (response.ok) {
        setPatients(response.data.content || response.data);
      } else {
        throw new Error(response.message || "Error al cargar pacientes");
      }
    } catch (err: unknown) {
      console.error(err);
      const friendlyError = translateError(err, 'Error de red al cargar los pacientes.');
      setError(friendlyError);
      toast.error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.dni.includes(searchTerm)
  );

  const handleOpenModal = (patient?: PatientDTO) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        dni: patient.dni,
        name: patient.name,
        last_name: patient.last_name,
        phone: patient.phone || '',
        email: patient.email || '',
      });
    } else {
      setEditingPatient(null);
      setFormData({
        dni: '',
        name: '',
        last_name: '',
        phone: '',
        email: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dni.trim() || !formData.name.trim() || !formData.last_name.trim()) {
      toast.warning("Por favor complete los campos obligatorios (DNI, Nombre, Apellido).");
      return;
    }

    if (editingPatient) {
      const hasChanges = 
        formData.dni.trim() !== editingPatient.dni ||
        formData.name.trim() !== editingPatient.name ||
        formData.last_name.trim() !== editingPatient.last_name ||
        (formData.phone || "").trim() !== (editingPatient.phone || "") ||
        (formData.email || "").trim() !== (editingPatient.email || "");

      if (!hasChanges) {
        toast.info("No se detectaron cambios en el expediente del paciente.");
        handleCloseModal();
        return;
      }
    }

    try {
      setIsSaving(true);
      const payload: PatientRequestDTO = {
        dni: formData.dni.trim(),
        name: formData.name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        isActive: editingPatient ? editingPatient.isActive : true, 
      };

      if (editingPatient) {
        const res = await patientService.update(editingPatient.id, payload);
        if (!res.ok) throw new Error(res.message || "400");
        toast.success('Paciente actualizado correctamente');
      } else {
        const res = await patientService.save(payload);
        if (!res.ok) throw new Error(res.message || "400");
        toast.success('Paciente registrado correctamente');
      }
      
      fetchPatients();
      handleCloseModal();
    } catch (err: unknown) {
      console.error(err);
      const friendlyError = translateError(err, 'Error al guardar el paciente');
      toast.error(friendlyError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenConfirm = (patient: PatientDTO) => {
    setPatientToToggle(patient);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (isToggling) return;
    setIsConfirmOpen(false);
    setPatientToToggle(null);
  };

  const executeToggleLock = async () => {
    if (!patientToToggle) return;
    
    const nuevoEstado = !patientToToggle.isActive;
    
    try {
      setIsToggling(true);
      const res = await patientService.update(patientToToggle.id, {
        dni: patientToToggle.dni,
        name: patientToToggle.name,
        last_name: patientToToggle.last_name,
        phone: patientToToggle.phone || undefined,
        email: patientToToggle.email || undefined,
        isActive: nuevoEstado,
      });

      if (res.ok) {
        toast.success(`Expediente ${nuevoEstado ? 'activado' : 'desactivado'} con éxito`);
        fetchPatients();
        handleCloseConfirm();
      } else {
        throw new Error(res.message || "400");
      }
    } catch (err: unknown) {
      console.error(err);
      const friendlyError = translateError(err, "Error al cambiar el estado del paciente");
      toast.error(friendlyError);
    } finally {
      setIsToggling(false);
    }
  };

  const pageContent = (
    <>
      {/*  Contenedor anti-desborde para todo el layout */}
      <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-full min-w-0">
        
        {/* Header Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">Gestión de Pacientes</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1 truncate">Administra el expediente de pacientes</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-bold hover:-translate-y-0.5 w-full sm:w-auto shrink-0"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span>Nuevo Paciente</span>
          </button>
        </div>

        {/*  Tarjetas de Estadísticas Responsivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 truncate">Total Pacientes</p>
              <p className="text-2xl font-black text-slate-900 truncate">{patients.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 truncate">Expedientes Activos</p>
              <p className="text-2xl font-black text-emerald-600 truncate">
                {patients.filter(p => p.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 truncate">Inactivos</p>
              <p className="text-2xl font-black text-red-500 truncate">
                {patients.filter(p => !p.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <UserX className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Search Bar Adaptable */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white shadow-sm transition-all text-sm truncate"
          />
        </div>

        {/*  Contenedor de la Tabla con scroll horizontal */}
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm w-full overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Cargando pacientes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 px-4">
              <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button 
                onClick={fetchPatients}
                className="px-6 py-2.5 bg-teal-50 text-teal-700 font-bold rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Reintentar
              </button>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium text-lg">No se encontraron pacientes</p>
              <p className="text-slate-400 text-sm mt-1">Prueba con otro DNI o nombre.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">DNI</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Nombre</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Apellido</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Teléfono</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Email</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Estado</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-cyan-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm font-bold text-slate-700 font-mono whitespace-nowrap">{patient.dni}</td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900 whitespace-nowrap">{patient.name}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">{patient.last_name}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">{patient.phone || <span className="text-slate-400 italic">No registra</span>}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">{patient.email || <span className="text-slate-400 italic">No registra</span>}</td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${patient.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {patient.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(patient)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-200"
                            title="Editar Paciente"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenConfirm(patient)} 
                            className={`p-2 rounded-xl transition-all border border-transparent ${
                              patient.isActive ? "hover:bg-amber-100 text-amber-600 hover:border-amber-200" : "hover:bg-emerald-100 text-emerald-600 hover:border-emerald-200"
                            }`}
                            title={patient.isActive ? "Desactivar Paciente" : "Activar Paciente"}
                          >
                            {patient.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
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

      {/*  Modal Formulario RESPONSIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-t-3xl flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-teal-100 shrink-0">
                {editingPatient ? <Edit2 className="w-5 h-5 text-teal-600"/> : <Plus className="w-5 h-5 text-teal-600"/>}
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">DNI</label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  required
                  disabled={isSaving}
                  min={1}
                  maxLength={9}
                  placeholder="Número de documento"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 font-mono text-sm shadow-sm"
                />
              </div>

              {/* Apilado en móvil, columnas en PC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isSaving}
                    placeholder="Ej: Juan Carlos"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apellido</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    disabled={isSaving}
                    placeholder="Ej: Pérez"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Teléfono <span className="text-xs text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isSaving}
                  min={1}
                  maxLength={9}
                  placeholder="Ej: +51 987654321"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email <span className="text-xs text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSaving}
                  placeholder="juan.perez@correo.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                />
              </div>

              <div className="flex gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-bold disabled:opacity-50 text-sm md:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] px-4 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-sm md:text-base"
                >
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin"/> Procesando...</> : editingPatient ? 'Actualizar' : 'Registrar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*  Modal de Confirmación Elegante para Desactivar Paciente */}
      {isConfirmOpen && patientToToggle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleCloseConfirm} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${patientToToggle.isActive ? 'bg-amber-100 border-amber-50 border-4' : 'bg-emerald-100 border-emerald-50 border-4'}`}>
              {patientToToggle.isActive ? (
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              ) : (
                <Unlock className="h-8 w-8 text-emerald-500" />
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {patientToToggle.isActive ? "Desactivar Paciente" : "Activar Paciente"}
            </h3>
            
            <p className="text-sm text-slate-500 mb-6 px-2 leading-relaxed">
              ¿Estás seguro de que deseas {patientToToggle.isActive ? "desactivar" : "activar"} el paciente <span className="font-bold text-slate-800">{patientToToggle.name} {patientToToggle.last_name}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCloseConfirm}
                disabled={isToggling}
                className="flex-1 rounded-xl px-4 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={executeToggleLock}
                disabled={isToggling}
                className={`flex-1 rounded-xl px-4 py-3 font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
                  patientToToggle.isActive 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isToggling ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  patientToToggle.isActive ? "Sí, Desactivar" : "Sí, Activar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return isAdmin ? (
    <AdminLayout currentPage="pacientes">
      {pageContent}
    </AdminLayout>
  ) : (
    <ReceptionLayout currentPage="pacientes">
      {pageContent}
    </ReceptionLayout>
  );
}