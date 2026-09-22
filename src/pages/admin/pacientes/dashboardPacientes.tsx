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
    
    // Validación Frontend Básica
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
        dni: formData.dni,
        name: formData.name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
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
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Pacientes</h1>
            <p className="text-slate-600 mt-1">Administra el expediente de pacientes</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-medium hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Nuevo Paciente
          </button>
        </div>

        {/* Nuevas Tarjetas de Estadísticas para Pacientes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Pacientes</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{patients.length}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Expedientes Activos</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">
                  {patients.filter(p => p.isActive).length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Inactivos</p>
                <p className="text-3xl font-black text-red-500 mt-1">
                  {patients.filter(p => !p.isActive).length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white shadow-sm transition-all"
          />
        </div>

        <div className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
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
                className="px-6 py-2 bg-teal-50 text-teal-700 font-bold rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Reintentar
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">DNI</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Apellido</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-cyan-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700 font-mono">{patient.dni}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{patient.name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{patient.last_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{patient.phone || <span className="text-slate-400 italic">No registra</span>}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{patient.email || <span className="text-slate-400 italic">No registra</span>}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${patient.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {patient.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(patient)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                            title="Editar Paciente"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenConfirm(patient)} 
                            className={`p-2 rounded-lg transition-colors ${
                              patient.isActive ? "hover:bg-amber-100 text-amber-600" : "hover:bg-emerald-100 text-emerald-600"
                            }`}
                            title={patient.isActive ? "Desactivar Expediente" : "Activar Expediente"}
                          >
                            {patient.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPatients.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-medium text-lg">No se encontraron pacientes</p>
                  <p className="text-slate-400 text-sm mt-1">Prueba con otro DNI o nombre.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/*  Modal Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {editingPatient ? <Edit2 className="w-5 h-5 text-teal-600"/> : <Plus className="w-5 h-5 text-teal-600"/>}
                {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">DNI</label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  required
                  disabled={isSaving}
                  maxLength={15}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono <span className="text-xs text-slate-400 font-normal">(Opcional)</span></label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email <span className="text-xs text-slate-400 font-normal">(Opcional)</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50"
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
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin"/> Procesando...</> : editingPatient ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Elegante para Desactivar Paciente */}
      {isConfirmOpen && patientToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseConfirm} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${patientToToggle.isActive ? 'bg-amber-100 border-amber-200 border-4' : 'bg-emerald-100 border-emerald-200 border-4'}`}>
              {patientToToggle.isActive ? (
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              ) : (
                <Unlock className="h-8 w-8 text-emerald-600" />
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {patientToToggle.isActive ? "Desactivar Expediente" : "Activar Expediente"}
            </h3>
            
            <p className="text-sm text-slate-500 mb-6 px-2 leading-relaxed">
              ¿Estás seguro de que deseas {patientToToggle.isActive ? "ocultar" : "habilitar"} el perfil de <span className="font-bold text-slate-800">{patientToToggle.name} {patientToToggle.last_name}</span>?
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
                    ? 'bg-amber-600 hover:bg-amber-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
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