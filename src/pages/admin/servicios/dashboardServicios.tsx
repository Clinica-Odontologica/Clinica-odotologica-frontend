import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle, DollarSign } from 'lucide-react';
import { AdminLayout } from "../../../components/adminLayout";

interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  categoria: string;
}

const mockServices: Service[] = [
  {
    id: '1',
    nombre: 'Limpieza Dental',
    descripcion: 'Limpieza profesional de dientes',
    precio: 60,
    duracion: 45,
    categoria: 'Higiene',
  },
  {
    id: '2',
    nombre: 'Extracción Dental',
    descripcion: 'Extracción simple de diente',
    precio: 120,
    duracion: 30,
    categoria: 'Cirugía',
  },
  {
    id: '3',
    nombre: 'Tratamiento de Conducto',
    descripcion: 'Endodoncia completa',
    precio: 350,
    duracion: 90,
    categoria: 'Endodoncia',
  },
  {
    id: '4',
    nombre: 'Implante Dental',
    descripcion: 'Colocación de implante',
    precio: 800,
    duracion: 120,
    categoria: 'Implantología',
  },
  {
    id: '5',
    nombre: 'Blanqueamiento Dental',
    descripcion: 'Blanqueamiento profesional',
    precio: 150,
    duracion: 60,
    categoria: 'Estética',
  },
];

export default function DasboardServicios() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
    categoria: '',
  });

  const filteredServices = services.filter(
    (service) =>
      service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        nombre: service.nombre,
        descripcion: service.descripcion,
        precio: service.precio.toString(),
        duracion: service.duracion.toString(),
        categoria: service.categoria,
      });
    } else {
      setEditingService(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        duracion: '',
        categoria: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      duracion: '',
      categoria: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      setServices(
        services.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: parseFloat(formData.precio),
                duracion: parseInt(formData.duracion),
                categoria: formData.categoria,
              }
            : s
        )
      );
    } else {
      setServices([
        ...services,
        {
          id: Date.now().toString(),
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: parseFloat(formData.precio),
          duracion: parseInt(formData.duracion),
          categoria: formData.categoria,
        },
      ]);
    }
    handleCloseModal();
  };

  const handleDeleteService = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este servicio?')) {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  return (
    <AdminLayout currentPage="servicios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Servicios</h1>
            <p className="text-slate-600 mt-1">Administra tratamientos y precios</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Nuevo Servicio
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total de Servicios</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{services.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Precio Promedio</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  ${(services.reduce((sum, s) => sum + s.precio, 0) / services.length).toFixed(0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Ingresos Potenciales</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  ${services.reduce((sum, s) => sum + s.precio, 0).toFixed(0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Servicio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Categoría</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Descripción</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Duración</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Precio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-100">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-cyan-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{service.nombre}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">
                        {service.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{service.descripcion}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{service.duracion} min</td>
                    <td className="px-6 py-4 text-sm font-semibold text-teal-600">${service.precio}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(service)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
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

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No se encontraron servicios</p>
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
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h2>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Higiene">Higiene</option>
                    <option value="Cirugía">Cirugía</option>
                    <option value="Endodoncia">Endodoncia</option>
                    <option value="Implantología">Implantología</option>
                    <option value="Estética">Estética</option>
                    <option value="Ortodoncia">Ortodoncia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duración (min)</label>
                  <input
                    type="number"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Precio ($)</label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  required
                  step="0.01"
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
                  {editingService ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
