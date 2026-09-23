import { useState, useEffect } from "react";
import {
  Edit2,
  Search,
  AlertCircle,
  Lock,
  Unlock,
  Loader2,
  UserPlus,
  UserPen,
  EyeIcon,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Users,
  Shield,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { AdminLayout } from "../../../components/adminLayout";
import { userService } from "../../../services/user.service";
import type { UserResponseDTO } from "../../../models/usuario/userResponseDTO";
import { toast } from "sonner"; 

const roleLabels: Record<string, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_RECEPTIONIST: "Recepcionista",
  ROLE_DOCTOR: "Doctor",
};

const roleBadgeColors: Record<string, string> = {
  ROLE_ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  ROLE_RECEPTIONIST: "bg-cyan-50 text-cyan-700 border-cyan-200",
  ROLE_DOCTOR: "bg-teal-50 text-teal-700 border-teal-200",
};

const getRoleObject = (roleName: string) => {
  if (roleName === "ROLE_ADMIN") return { id: 1, name: "ROLE_ADMIN" };
  if (roleName === "ROLE_RECEPTIONIST") return { id: 2, name: "ROLE_RECEPTIONIST" };
  if (roleName === "ROLE_DOCTOR") return { id: 3, name: "ROLE_DOCTOR" };
  return { id: 0, name: roleName }; 
};

const translateError = (err: unknown, defaultMsg: string) => {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("409")) return "El nombre de usuario o correo electrónico ya está registrado por otra persona.";
    if (msg.includes("400")) return "Los datos ingresados no son válidos. Verifica los campos.";
    if (msg.includes("403")) return "No tienes permisos suficientes para realizar esta acción.";
    if (msg.includes("404")) return "El usuario solicitado ya no existe en el sistema.";
    if (msg.includes("500") || msg.includes("502")) return "El servidor está en mantenimiento. Inténtalo de nuevo más tarde.";
    if (msg.includes("network") || msg.includes("failed to fetch")) return "No hay conexión con el servidor. Revisa tu internet.";
    
    return err.message; 
  }
  return defaultMsg;
};

export default function DasboardUsuarios() {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseDTO | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<UserResponseDTO | null>(null);
  const [isToggling, setIsToggling] = useState(false); 

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    rol: "",
    isActive: true,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllPaginated(0, 100);
      
      if (response.ok) {
        setUsers(response.data.content || response.data);
      } else {
        throw new Error(response.message || "No se pudieron cargar los usuarios.");
      }
    } catch (err: unknown) {
      console.error("Error al obtener usuarios:", err);
      const friendlyError = translateError(err, "Error de red al cargar usuarios.");
      setError(friendlyError);
      toast.error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenModal = (user?: UserResponseDTO) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        password: "",
        rol: user.rol?.name || "",
        isActive: user.active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullname: "",
        username: "",
        email: "",
        password: "",
        rol: "",
        isActive: true,
      });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullname.trim() || !formData.username.trim() || !formData.email.trim() || !formData.rol) {
      toast.warning("Por favor, complete todos los campos obligatorios.");
      return;
    }

    if (editingUser) {
      const hasChanges = 
        formData.fullname.trim() !== editingUser.fullname ||
        formData.username.trim() !== editingUser.username ||
        formData.email.trim() !== editingUser.email ||
        formData.rol !== (editingUser.rol?.name || "") ||
        formData.password !== ""; 

      if (!hasChanges) {
        toast.info("No se detectaron cambios en el usuario.");
        handleCloseModal();
        return;
      }
    }

    try {
      setIsSaving(true);
      const roleObj = getRoleObject(formData.rol);
      
      if (editingUser) {
        const response = await userService.update(editingUser.id, {
          fullname: formData.fullname.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          rol: roleObj,
          isActive: formData.isActive,
          password: formData.password ? formData.password : editingUser.password,
        });
        
        if (response.ok) {
          toast.success("Usuario actualizado correctamente");
          fetchUsers();
          handleCloseModal();
        } else {
          throw new Error(response.message || "400"); 
        }
      } else {
        const response = await userService.save({
          fullname: formData.fullname.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: roleObj, 
        });
        
        if (response.ok) {
          toast.success("Usuario registrado correctamente");
          fetchUsers();
          handleCloseModal();
        } else {
          throw new Error(response.message || "400"); 
        }
      }
      
    } catch (err: unknown) {
      console.error("Fallo al guardar:", err);
      const friendlyError = translateError(err, "Ocurrió un problema al guardar el usuario.");
      toast.error(friendlyError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenConfirm = (user: UserResponseDTO) => {
    setUserToToggle(user);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (isToggling) return;
    setIsConfirmOpen(false);
    setUserToToggle(null);
  };

  const executeToggleLock = async () => {
    if (!userToToggle) return;
    
    try {
      setIsToggling(true);
      const res = await userService.update(userToToggle.id, {
        fullname: userToToggle.fullname,
        username: userToToggle.username,
        password: userToToggle.password,
        email: userToToggle.email,
        rol: userToToggle.rol,
        isActive: !userToToggle.active,
      });
      
      if (res.ok) {
        toast.success(`Usuario ${!userToToggle.active ? 'activado' : 'desactivado'} con éxito`);
        fetchUsers();
        handleCloseConfirm();
      } else {
        throw new Error(res.message || "400");
      }
    } catch (err: unknown) {
      console.error("Fallo al cambiar estado:", err);
      const friendlyError = translateError(err, "Error al cambiar el estado del usuario.");
      toast.error(friendlyError);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <AdminLayout currentPage="usuarios">
      {/* 🌟 Contenedor principal con max-w-full y min-w-0 para evitar desbordes */}
      <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-full min-w-0">
        
        {/* Header Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">
              Gestión de Usuarios
            </h1>
            <p className="mt-1 text-sm md:text-base text-slate-600 truncate">
              Administra accesos y permisos
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 px-4 py-3 sm:py-2.5 font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto shrink-0"
          >
            <UserPlus className="h-5 w-5 shrink-0" />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {/* Stats Cards (Grilla Responsive y Premium) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Total Usuarios</p>
              <p className="text-2xl font-black text-slate-900 truncate">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shrink-0">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 truncate">Activos</p>
              <p className="text-2xl font-black text-emerald-700 truncate">
                {users.filter((u) => u.active).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1 truncate">Inactivos</p>
              <p className="text-2xl font-black text-red-600 truncate">
                {users.filter((u) => !u.active).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center border border-red-100 shrink-0">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1 truncate">Admins</p>
              <p className="text-2xl font-black text-purple-700 truncate">
                {users.filter((u) => u.rol?.name === "ROLE_ADMIN").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100 shrink-0">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search Bar - 🌟 Placeholder y padding ajustados para no empujar bordes */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar usuario o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-teal-200 bg-white py-3 pl-12 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 shadow-sm transition-all text-sm truncate"
          />
        </div>

        {/* Table Container - 🌟 Estrictamente contenido */}
        <div className="w-full rounded-2xl border border-teal-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-teal-500" />
              <p className="text-slate-500 font-medium animate-pulse">Cargando usuarios...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center px-4">
              <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button 
                onClick={fetchUsers}
                className="px-6 py-2.5 bg-teal-50 text-teal-700 font-bold rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Reintentar
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium text-lg">No se encontraron usuarios</p>
              <p className="text-slate-400 text-sm mt-1">Prueba buscando con otro término.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">
                      Usuario
                    </th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">
                      Username
                    </th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">
                      Rol
                    </th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">
                      Estado
                    </th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50">
                  {filteredUsers.map((user) => {
                    const roleName = user.rol?.name || "UNKNOWN";

                    return (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-cyan-50/50"
                      >
                        <td className="px-5 py-4 text-sm font-bold text-slate-900 whitespace-nowrap">
                          {user.fullname}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                          {user.username}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap hidden sm:table-cell">
                          {user.email}
                        </td>
                        <td className="px-5 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider border ${roleBadgeColors[roleName] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                          >
                            {roleLabels[roleName] || roleName}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold border ${
                              user.active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {user.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(user)}
                              className="rounded-xl p-2 text-blue-600 transition-all hover:bg-blue-100 border border-transparent hover:border-blue-200"
                              title="Editar Usuario"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenConfirm(user)}
                              className={`rounded-xl p-2 transition-all border border-transparent ${
                                user.active
                                  ? "text-amber-600 hover:bg-amber-100 hover:border-amber-200"
                                  : "text-emerald-600 hover:bg-emerald-100 hover:border-emerald-200"
                              }`}
                              title={user.active ? "Bloquear Usuario" : "Desbloquear Usuario"}
                            >
                              {user.active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Formulario (Crear/Editar) RESPONSIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-5 rounded-t-3xl flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-teal-100 shrink-0">
                {editingUser ? (
                  <UserPen className="h-5 w-5 text-teal-600" />
                ) : (
                  <UserPlus className="h-5 w-5 text-teal-600" />
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                  required
                  disabled={isSaving}
                  placeholder="Ej: Ana María Pérez"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    disabled={isSaving}
                    placeholder="Ej: aperez"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Rol en Sistema
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) =>
                      setFormData({ ...formData, rol: e.target.value })
                    }
                    required
                    disabled={isSaving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all bg-white disabled:opacity-60 disabled:bg-slate-50 cursor-pointer text-sm shadow-sm font-medium text-slate-700"
                  >
                    <option value="" disabled>Seleccionar Rol</option>
                    <option value="ROLE_ADMIN">Administrador</option>
                    <option value="ROLE_RECEPTIONIST">Recepcionista</option>
                    <option value="ROLE_DOCTOR">Doctor / Odontólogo</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={isSaving}
                  placeholder="ana.perez@clinica.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {editingUser ? "Nueva Contraseña (opcional)" : "Contraseña de Acceso"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    disabled={isSaving}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSaving}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors disabled:opacity-50 p-1"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <EyeIcon size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3.5 font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm md:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 px-4 py-3.5 font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 text-sm md:text-base"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {editingUser ? "Guardando..." : "Creando..."}
                    </>
                  ) : (
                    editingUser ? "Guardar Cambios" : "Crear Usuario"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Elegante */}
      {isConfirmOpen && userToToggle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseConfirm}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${userToToggle.active ? 'bg-amber-100 border-4 border-amber-50' : 'bg-emerald-100 border-4 border-emerald-50'}`}>
              {userToToggle.active ? (
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              ) : (
                <Unlock className="h-8 w-8 text-emerald-500" />
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {userToToggle.active ? "Bloquear Acceso" : "Desbloquear Acceso"}
            </h3>
            
            <p className="text-sm text-slate-500 mb-6 px-2 leading-relaxed">
              ¿Estás seguro de que deseas {userToToggle.active ? "revocarle el acceso" : "permitirle el ingreso"} al sistema a <span className="font-bold text-slate-800">{userToToggle.fullname}</span>?
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
                  userToToggle.active 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isToggling ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  userToToggle.active ? "Sí, Bloquear" : "Sí, Permitir"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}