import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle, Lock, Unlock } from 'lucide-react';
import { AdminLayout } from '../../../components/adminLayout';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: 'activo' | 'bloqueado';
  fechaRegistro: string;
  ultimoAcceso: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    nombre: 'Ana María García',
    email: 'ana.garcia@clinica.com',
    rol: 'ROLE_RECEPTIONIST',
    estado: 'activo',
    fechaRegistro: '2024-01-15',
    ultimoAcceso: '2024-02-11',
  },
  {
    id: '2',
    nombre: 'Carlos López Rodríguez',
    email: 'carlos.lopez@clinica.com',
    rol: 'ROLE_RECEPTIONIST',
    estado: 'activo',
    fechaRegistro: '2024-02-01',
    ultimoAcceso: '2024-02-10',
  },
  {
    id: '3',
    nombre: 'Marta Sánchez Pérez',
    email: 'marta.sanchez@clinica.com',
    rol: 'ROLE_ADMIN',
    estado: 'activo',
    fechaRegistro: '2023-12-20',
    ultimoAcceso: '2024-02-11',
  },
  {
    id: '4',
    nombre: 'José María Fernández',
    email: 'jose.fernandez@clinica.com',
    rol: 'ROLE_RECEPTIONIST',
    estado: 'bloqueado',
    fechaRegistro: '2024-01-10',
    ultimoAcceso: '2024-02-05',
  },
];

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
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: '',
  });

  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        email: '',
        rol: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      email: '',
      rol: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u))
      );
    } else {
      setUsers([
        ...users,
        {
          id: Date.now().toString(),
          ...formData,
          estado: 'activo',
          fechaRegistro: new Date().toISOString().split('T')[0],
          ultimoAcceso: new Date().toISOString().split('T')[0],
        },
      ]);
    }
    handleCloseModal();
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleToggleLock = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? {
              ...u,
              estado: u.estado === 'activo' ? 'bloqueado' : 'activo',
            }
          : u
      )
    );
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
            <Plus className="w-5 h-5" />
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
              {users.filter((u) => u.estado === 'activo').length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
            <p className="text-slate-600 text-sm font-medium">Bloqueados</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {users.filter((u) => u.estado === 'bloqueado').length}
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
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rol</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Último Acceso</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-cyan-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.nombre}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleBadgeColors[user.rol]}`}>
                        {roleLabels[user.rol]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleToggleLock(user.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          user.estado === 'activo'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {user.estado === 'activo' ? 'Activo' : 'Bloqueado'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.ultimoAcceso}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleLock(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.estado === 'activo'
                              ? 'hover:bg-yellow-100 text-yellow-600'
                              : 'hover:bg-green-100 text-green-600'
                          }`}
                          title={
                            user.estado === 'activo' ? 'Bloquear usuario' : 'Desbloquear usuario'
                          }
                        >
                          {user.estado === 'activo' ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
              <h2 className="text-xl font-bold text-slate-900">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                >
                  <option value="">Seleccionar rol</option>
                  <option value="ROLE_RECEPTIONIST">Recepcionista</option>
                  <option value="ROLE_ADMIN">Administrador</option>
                  <option value="ROLE_DOCTOR">Doctor</option>
                </select>
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
