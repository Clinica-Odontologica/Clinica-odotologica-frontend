import { useState, useEffect } from 'react';
import {  Edit2, Trash2, Search, AlertCircle, Lock, Unlock, Loader2, UserPlus, UserPen } from 'lucide-react';
import { AdminLayout } from '../../../components/adminLayout';
import { userService } from '../../../services/user.service';
import type { UserResponseDTO } from '../../../models/usuario/userResponseDTO';

const roleLabels: { [key: string]: string } = {
  ROLE_ADMIN: 'Administrador',
  ROLE_RECEPTIONIST: 'Recepcionista',
  ROLE_DOCTOR: 'Doctor',
};

const roleBadgeColors: { [key: string]: string } = {
  ROLE_ADMIN: 'bg-purple-100 text-purple-700',
  ROLE_RECEPTIONIST: 'bg-cyan-100 text-cyan-700',
  ROLE_DOCTOR: 'bg-teal-100 text-teal-700',
};

export default function DasboardUsuarios() {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseDTO | null>(null);
  
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    rol: '',
    isActive: true
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
      setError('Error al cargar los usuarios');
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
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user?: UserResponseDTO) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        password: '',
        rol: user.rol,
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullname: '',
        username: '',
        email: '',
        password: '',
        rol: '',
        isActive: true
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
      if (editingUser) {
        await userService.update(editingUser.id, {
          fullname: formData.fullname,
          username: formData.username,
          email: formData.email,
          rol: formData.rol,
          isActive: formData.isActive,
          password: formData.password || undefined
        });
      } else {
        await userService.save({
          fullname: formData.fullname,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.rol
        });
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      alert('Error al guardar el usuario');
      console.error(err); 
    }
  };

  const handleToggleLock = async (user: UserResponseDTO) => {
    try {
      await userService.update(user.id, {
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        rol: user.rol,
        isActive: !user.isActive
      });
      fetchUsers();
    } catch (err) {
      alert('Error al cambiar el estado del usuario');
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        await userService.delete(id);
        fetchUsers();
      } catch (err) {
        alert('Error al eliminar el usuario');
        console.error(err);
      }
    }
  };

  return (
    <AdminLayout currentPage="usuarios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
            <p className="text-slate-600 mt-1">Administra accesos y permisos del sistema</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <UserPlus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
            <p className="text-slate-600 text-sm font-medium">Total Usuarios</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{users.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
            <p className="text-slate-600 text-sm font-medium">Activos</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {users.filter((u) => u.isActive).length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
            <p className="text-slate-600 text-sm font-medium">Inactivos</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {users.filter((u) => !u.isActive).length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
            <p className="text-slate-600 text-sm font-medium">Administradores</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {users.filter((u) => u.rol === 'ROLE_ADMIN').length}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500">Cargando usuarios...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Usuario</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rol</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-cyan-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.fullname}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleBadgeColors[user.rol]}`}>
                          {roleLabels[user.rol]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleLock(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isActive
                                ? 'hover:bg-yellow-100 text-yellow-600'
                                : 'hover:bg-green-100 text-green-600'
                            }`}
                            title={user.isActive ? 'Desactivar' : 'Activar'}
                          >
                            {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
              <h2 className="text-xl font-bold text-slate-900">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'} 
                {editingUser? <UserPen className="w-5 h-5 inline-block ml-2 text-slate-600" /> : <UserPlus className="w-5 h-5 inline-block ml-2 text-slate-600" />}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Rol</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="ROLE_ADMIN">Admin</option>
                    <option value="ROLE_RECEPTIONIST">Recepción</option>
                    <option value="ROLE_DOCTOR">Doctor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {editingUser ? 'Contraseña (vacío para no cambiar)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-teal-200 text-slate-700 rounded-lg hover:bg-teal-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg hover:shadow-lg font-medium"
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
