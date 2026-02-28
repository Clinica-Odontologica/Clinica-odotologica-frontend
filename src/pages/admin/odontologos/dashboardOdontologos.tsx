import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';
import { AdminLayout } from "../../../components/adminLayout";

interface Doctor {
  id: string;
  nombre: string;
  matricula: string;
  especialidad: string;
  email: string;
  telefono: string;
  activo: boolean;
}

const mockDoctors: Doctor[] = [
  {
    id: '1',
    nombre: 'Dr. Juan García',
    matricula: 'MAT-2023-001',
    especialidad: 'Odontología General',
    email: 'juan.garcia@clinica.com',
    telefono: '+34 912 34 56 78',
    activo: true,
  },
  {
    id: '2',
    nombre: 'Dra. María López',
    matricula: 'MAT-2023-002',
    especialidad: 'Ortodoncia',
    email: 'maria.lopez@clinica.com',
    telefono: '+34 912 34 56 79',
    activo: true,
  },
  {
    id: '3',
    nombre: 'Dr. Carlos Rodríguez',
    matricula: 'MAT-2023-003',
    especialidad: 'Implantología',
    email: 'carlos.rodriguez@clinica.com',
    telefono: '+34 912 34 56 80',
    activo: true,
  },
];

export default function DasboardOdontologos() {
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    matricula: '',
    especialidad: '',
    email: '',
    telefono: '',
  });

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        nombre: doctor.nombre,
        matricula: doctor.matricula,
        especialidad: doctor.especialidad,
        email: doctor.email,
        telefono: doctor.telefono,
      });
    } else {
      setEditingDoctor(null);
      setFormData({ nombre: '', matricula: '', especialidad: '', email: '', telefono: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
    setFormData({ nombre: '', matricula: '', especialidad: '', email: '', telefono: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctor) {
      setDoctors(
        doctors.map((d) => (d.id === editingDoctor.id ? { ...d, ...formData } : d))
      );
    } else {
      setDoctors([
        ...doctors,
        { id: Date.now().toString(), ...formData, activo: true },
      ]);
    }
    handleCloseModal();
  };

  const handleDeleteDoctor = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este doctor?')) {
      setDoctors(doctors.filter((d) => d.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setDoctors(
      doctors.map((d) => (d.id === id ? { ...d, activo: !d.activo } : d))
    );
  };

  return (
    <AdminLayout currentPage="odontologos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Doctores</h1>
            <p className="text-slate-600 mt-1">Administra los odontólogos del sistema</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Nuevo Doctor
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, matrícula o especialidad..."
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Matrícula</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Especialidad</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-100">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-cyan-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{doctor.nombre}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doctor.matricula}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                        {doctor.especialidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doctor.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleToggleActive(doctor.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          doctor.activo
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {doctor.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(doctor)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doctor.id)}
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

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No se encontraron doctores</p>
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
                {editingDoctor ? 'Editar Doctor' : 'Nuevo Doctor'}
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Matrícula</label>
                <input
                  type="text"
                  value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Especialidad</label>
                <select
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                >
                  <option value="">Seleccionar especialidad</option>
                  <option value="Odontología General">Odontología General</option>
                  <option value="Ortodoncia">Ortodoncia</option>
                  <option value="Implantología">Implantología</option>
                  <option value="Endodoncia">Endodoncia</option>
                  <option value="Periodoncia">Periodoncia</option>
                </select>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
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
                  {editingDoctor ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
