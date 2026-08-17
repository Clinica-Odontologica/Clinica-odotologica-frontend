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
} from "lucide-react";
import { AdminLayout } from "../../../components/adminLayout";
import { userService } from "../../../services/user.service";
import type { UserResponseDTO } from "../../../models/usuario/userResponseDTO";

const roleLabels: Record<string, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_RECEPTIONIST: "Recepcionista",
  ROLE_DOCTOR: "Doctor",
};

const roleBadgeColors: Record<string, string> = {
  ROLE_ADMIN: "bg-purple-100 text-purple-700",
  ROLE_RECEPTIONIST: "bg-cyan-100 text-cyan-700",
  ROLE_DOCTOR: "bg-teal-100 text-teal-700",
};

const getRoleObject = (roleName: string) => {
  if (roleName === "ROLE_ADMIN") return { id: 1, name: "ROLE_ADMIN" };
  if (roleName === "ROLE_RECEPTIONIST")
    return { id: 2, name: "ROLE_RECEPTIONIST" };
  if (roleName === "ROLE_DOCTOR") return { id: 3, name: "ROLE_DOCTOR" };
  return { id: 0, name: roleName }; 
};

export default function DasboardUsuarios() {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseDTO | null>(null);

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
      const response = await userService.getAllPaginated(0, 100);
      if (response.ok) {
        setUsers(response.data.content);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Error al cargar los usuarios");
      console.error(err);
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roleObj = getRoleObject(formData.rol);
      if (editingUser) {
        await userService.update(editingUser.id, {
          fullname: formData.fullname,
          username: formData.username,
          email: formData.email,
          rol: roleObj,
          isActive: formData.isActive,
          password: formData.password
            ? formData.password
            : editingUser.password,
        });
      } else {
        await userService.save({
          fullname: formData.fullname,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: roleObj,
        });
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      alert("Error al guardar el usuario");
      console.error(err);
    }
  };

  const handleToggleLock = async (user: UserResponseDTO) => {
    if (!confirm(`¿Estás seguro de ${user.active ? "desactivar" : "activar"} a ${user.fullname}?`)) {
      return;
    }
    try {
      await userService.update(user.id, {
        fullname: user.fullname,
        username: user.username,
        password: user.password,
        email: user.email,
        rol: user.rol,
        isActive: !user.active,
      });
      fetchUsers();
    } catch (err) {
      alert("Error al cambiar el estado del usuario");
      console.error(err);
    }
  };

  return (
    <AdminLayout currentPage="usuarios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Gestión de Usuarios
            </h1>
            <p className="mt-1 text-slate-600">
              Administra accesos y permisos del sistema
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 px-4 py-3 font-medium text-white transition-all hover:shadow-lg"
          >
            <UserPlus className="h-5 w-5" />
            Nuevo Usuario
          </button>
        </div>

        {/* Stats Cards - Corrección de 'isActive' a 'active' */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Total Usuarios</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {users.length}
            </p>
          </div>

          <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Activos</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {users.filter((u) => u.active).length}
            </p>
          </div>

          <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Inactivos</p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {users.filter((u) => !u.active).length}
            </p>
          </div>

          <div className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">
              Administradores
            </p>
            <p className="mt-2 text-2xl font-bold text-purple-600">
              {users.filter((u) => u.rol?.name === "ROLE_ADMIN").length}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-teal-200 bg-white py-3 pl-12 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-teal-500" />
              <p className="text-slate-500">Cargando usuarios...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100">
                  {filteredUsers.map((user) => {
                    const roleName = user.rol?.name || "UNKNOWN";

                    return (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-cyan-50/50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {user.fullname}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${roleBadgeColors[roleName] || "bg-gray-100 text-gray-700"}`}
                          >
                            {roleLabels[roleName] || roleName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModal(user)}
                              className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-100"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleLock(user)}
                              className={`rounded-lg p-2 transition-colors ${
                                user.active
                                  ? "text-yellow-600 hover:bg-yellow-100"
                                  : "text-green-600 hover:bg-green-100"
                              }`}
                              title={user.active ? "Desactivar" : "Activar"}
                            >
                              {user.active ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseModal}
          />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                {editingUser ? (
                  <UserPen className="ml-2 inline-block h-5 w-5 text-slate-600" />
                ) : (
                  <UserPlus className="ml-2 inline-block h-5 w-5 text-slate-600" />
                )}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-teal-200 px-4 py-2 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-teal-200 px-4 py-2 focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Rol
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) =>
                      setFormData({ ...formData, rol: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-teal-200 px-4 py-2 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="">Seleccionar</option>
                    <option value="ROLE_ADMIN">Admin</option>
                    <option value="ROLE_RECEPTIONIST">Recepción</option>
                    <option value="ROLE_DOCTOR">Doctor</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-teal-200 px-4 py-2 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-sm bg-teal-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeIcon size={20} />
                    ) : (
                      <EyeOff size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-teal-200 px-4 py-2 font-medium text-slate-700 hover:bg-teal-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-600 px-4 py-2 font-medium text-white hover:shadow-lg"
                >
                  {editingUser ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
