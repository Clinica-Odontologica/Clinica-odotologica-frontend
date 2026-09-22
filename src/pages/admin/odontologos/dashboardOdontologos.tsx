import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Search,
  AlertCircle,
  Loader2,
  Lock,
  Unlock,
  Stethoscope,
  RefreshCw,
  AlertTriangle,
  EyeIcon,
  EyeOff,
} from "lucide-react";
import { AdminLayout } from "../../../components/adminLayout";
import { doctorService } from "../../../services/doctor.service";
import type { DoctorDTO } from "../../../models/doctor/doctorDTO";
import type { DoctorRequestDTO } from "../../../models/doctor/doctorRequestDTO";
import { toast } from "sonner"; // 🌟 Importamos Sonner

// 🌟 TRADUCTOR DE ERRORES CENTRALIZADO
const translateError = (err: unknown, defaultMsg: string) => {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("409")) return "El nombre de usuario o correo electrónico ya está registrado por otra persona.";
    if (msg.includes("400")) return "Los datos ingresados no son válidos. Verifica los campos.";
    if (msg.includes("404")) return "El odontólogo solicitado no fue encontrado en el sistema.";
    if (msg.includes("500") || msg.includes("502")) return "El servidor está en mantenimiento. Inténtalo de nuevo más tarde.";
    if (msg.includes("network") || msg.includes("failed to fetch")) return "No hay conexión con el servidor. Revisa tu internet.";
    return err.message;
  }
  return defaultMsg;
};

export default function DasboardOdontologos() {
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorDTO | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [doctorToToggle, setDoctorToToggle] = useState<DoctorDTO | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    specialty: "",
    username: "",
    password: "",
    email: "",
  });

  const getLastName = (d: DoctorDTO) => d.lastName || d.last_name || "";

  const normalizeDoctors = (raw: unknown[]): DoctorDTO[] => {
    return raw.map((d: unknown) => {
      const doc = d as Record<string, unknown>;
      return {
        id: doc.id as number,
        name: (doc.name as string) || "",
        lastName: (doc.lastName as string) || (doc.last_name as string) || "",
        last_name: (doc.last_name as string) || (doc.lastName as string) || "",
        specialty: (doc.specialty as string) || "",
        isActive: doc.isActive as boolean | undefined,
      };
    });
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorService.getAllPaginated(0, 100);
      if (response.ok) {
        setDoctors(normalizeDoctors(response.data.content || response.data));
      } else {
        throw new Error(response.message || "Error al cargar los doctores");
      }
    } catch (err: unknown) {
      console.error("Doctors fetch error:", err);
      const friendlyError = translateError(err, "Error de red al cargar los odontólogos.");
      setError(friendlyError);
      toast.error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLastName(doctor).toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const uniqueSpecialtiesCount = new Set(doctors.filter(d => d.isActive).map(d => d.specialty)).size;

  const handleOpenModal = (doctor?: DoctorDTO) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name,
        lastName: getLastName(doctor),
        specialty: doctor.specialty,
        username: "", 
        password: "",
        email: "",
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        name: "",
        lastName: "",
        specialty: "",
        username: "",
        password: "",
        email: "",
      });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.lastName.trim() || !formData.specialty) {
      toast.warning("Por favor complete los campos obligatorios del doctor.");
      return;
    }

    if (editingDoctor) {
      const hasChanges = 
        formData.name.trim() !== editingDoctor.name ||
        formData.lastName.trim() !== getLastName(editingDoctor) ||
        formData.specialty !== editingDoctor.specialty;

      if (!hasChanges) {
        toast.info("No se detectaron cambios en el perfil del doctor.");
        handleCloseModal();
        return;
      }
    } else {
      if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
        toast.warning("Para un nuevo doctor, debe completar los datos de acceso (Usuario, Email, Contraseña).");
        return;
      }
    }

    try {
      setIsSaving(true);
      const payload = {
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        specialty: formData.specialty,
        username: formData.username || undefined,
        password: formData.password || undefined,
        email: formData.email || undefined,
      };

      if (editingDoctor) {
        const response = await doctorService.update(editingDoctor.id, payload);
        if (!response.ok) throw new Error(response.message || "400");
        toast.success("Odontólogo actualizado correctamente");
      } else {
        const response = await doctorService.save(payload);
        if (!response.ok) throw new Error(response.message || "400");
        toast.success("Odontólogo registrado correctamente");
      }
      
      fetchDoctors();
      handleCloseModal();
    } catch (err: unknown) {
      console.error(err);
      const friendlyError = translateError(err, "Error al guardar el doctor");
      toast.error(friendlyError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenConfirm = (doctor: DoctorDTO) => {
    setDoctorToToggle(doctor);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (isToggling) return;
    setIsConfirmOpen(false);
    setDoctorToToggle(null);
  };

  const executeToggleLock = async () => {
    if (!doctorToToggle) return;
    
    const nuevoEstado = !doctorToToggle.isActive;
    
    try {
      setIsToggling(true);
      const payload = {
        id: doctorToToggle.id, 
        name: doctorToToggle.name,
        lastName: getLastName(doctorToToggle),
        specialty: doctorToToggle.specialty,
        isActive: nuevoEstado,
        active: nuevoEstado, 
      };
      
      const response = await doctorService.update(doctorToToggle.id, payload as DoctorRequestDTO);
      
      if (response.ok) {
        toast.success(`Odontólogo ${nuevoEstado ? 'activado' : 'desactivado'} con éxito`);
        fetchDoctors();
        handleCloseConfirm();
      } else {
        throw new Error(response.message || "400");
      }
    } catch (err: unknown) {
      console.error("Error cambiando estado:", err);
      const friendlyError = translateError(err, "Error al cambiar el estado del doctor");
      toast.error(friendlyError);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <AdminLayout currentPage="odontologos">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Gestión de Doctores
            </h1>
            <p className="text-slate-600 mt-1">
              Administra los odontólogos del sistema
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium justify-center"
          >
            <Plus className="w-5 h-5" />
            Nuevo Doctor
          </button>
        </div>

        {/* Nuevas Tarjetas de Estadísticas para Doctores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Equipo</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{doctors.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Doctores Activos</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">
              {doctors.filter((d) => d.isActive).length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Inactivos</p>
            <p className="text-3xl font-black text-red-500 mt-1">
              {doctors.filter((d) => !d.isActive).length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Especialidades</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">
              {uniqueSpecialtiesCount}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white shadow-sm transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Cargando odontólogos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 px-4">
              <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button
                onClick={fetchDoctors}
                className="mt-4 px-6 py-2 bg-teal-50 text-teal-700 font-bold rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Reintentar
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Apellido</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Especialidad</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100">
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-cyan-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        {doctor.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {getLastName(doctor)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold tracking-wide">
                          {doctor.specialty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            doctor.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {doctor.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(doctor)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                            title="Editar Doctor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenConfirm(doctor)}
                            className={`p-2 rounded-lg transition-colors ${
                              doctor.isActive
                                ? "text-amber-600 hover:bg-amber-100"
                                : "text-emerald-600 hover:bg-emerald-100"
                            }`}
                            title={doctor.isActive ? "Desactivar Doctor" : "Activar Doctor"}
                          >
                            {doctor.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDoctors.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-medium text-lg">No se encontraron odontólogos</p>
                  <p className="text-slate-400 text-sm mt-1">Prueba buscando otra especialidad o nombre.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {editingDoctor ? <Edit2 className="w-5 h-5 text-teal-600"/> : <Plus className="w-5 h-5 text-teal-600"/>}
                {editingDoctor ? "Editar Doctor" : "Nuevo Doctor"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Especialidad</label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  required
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all bg-white disabled:opacity-60 disabled:bg-slate-50 cursor-pointer"
                >
                  <option value="" disabled>Seleccionar especialidad</option>
                  <option value="Odontología General">Odontología General</option>
                  <option value="Ortodoncia">Ortodoncia</option>
                  <option value="Implantología">Implantología</option>
                  <option value="Endodoncia">Endodoncia</option>
                  <option value="Periodoncia">Periodoncia</option>
                </select>
              </div>

              {!editingDoctor && (
                <>
                  <div className="border-t border-teal-100 pt-5 mt-5">
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4" /> Datos de Acceso al Sistema
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Usuario (Username)</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required={!editingDoctor}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required={!editingDoctor}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingDoctor}
                        disabled={isSaving}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-sm disabled:opacity-60 disabled:bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSaving}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors disabled:opacity-50"
                      >
                        {showPassword ? <EyeOff size={20} /> : <EyeIcon size={20} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

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
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin"/> Procesando...</> : editingDoctor ? "Actualizar" : "Crear Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Elegante para Activar/Desactivar */}
      {isConfirmOpen && doctorToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseConfirm} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${doctorToToggle.isActive ? 'bg-amber-100 border-amber-200 border-4' : 'bg-emerald-100 border-emerald-200 border-4'}`}>
              {doctorToToggle.isActive ? (
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              ) : (
                <Unlock className="h-8 w-8 text-emerald-600" />
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {doctorToToggle.isActive ? "Desactivar Doctor" : "Activar Doctor"}
            </h3>
            
            <p className="text-sm text-slate-500 mb-6 px-2 leading-relaxed">
              ¿Estás seguro de que deseas {doctorToToggle.isActive ? "quitarle el acceso" : "permitirle el ingreso"} al sistema al Dr/a. <span className="font-bold text-slate-800">{doctorToToggle.name} {getLastName(doctorToToggle)}</span>?
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
                  doctorToToggle.isActive 
                    ? 'bg-amber-600 hover:bg-amber-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isToggling ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  doctorToToggle.isActive ? "Sí, Desactivar" : "Sí, Activar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}