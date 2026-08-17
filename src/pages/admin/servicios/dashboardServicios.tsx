import { useState, useEffect } from 'react';
import { Plus, Edit2, Search, AlertCircle, DollarSign, Loader2, Lock, Unlock } from 'lucide-react';
import { AdminLayout } from "../../../components/adminLayout";
import { treatmentService } from '../../../services/treatment.service';
import type { ServiceDTO } from '../../../models/service/serviceDTO';

export default function DasboardServicios() {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDTO | null>(null);
  
  const [formData, setFormData] = useState({
    id:0 ,
    name: '',
    basePrice: '',
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await treatmentService.getAllPaginated(0, 100);
      if (response.ok) {
        setServices(response.data.content);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Error al cargar los servicios');
      console.error(err);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (service?: ServiceDTO) => {
    if (service) {
      setEditingService(service);
      setFormData({
        id: service.id,
        name: service.name,
        basePrice: service.basePrice.toString(),
      });
    } else {
      setEditingService(null);
      setFormData({
        id: 0,
        name: '',
        basePrice: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const serviceData: ServiceDTO = {
        id: formData.id,
        name: formData.name,
        basePrice: parseFloat(formData.basePrice),
        isActive: true,
      };
      if (editingService) {
        await treatmentService.update(serviceData.id, serviceData);
      } else {
        await treatmentService.save(serviceData);
      }
      fetchServices();
      handleCloseModal();
    } catch (err) {
      alert('Error al guardar el servicio');
      console.error(err);
    }
  };

  const handleDeleteService = async (service: ServiceDTO) => {
    const accion = service.isActive ? 'desactivar' : 'activar';
    const nuevoEstado = !service.isActive; 

    if (confirm(`¿Está seguro de que desea ${accion} este servicio?`)) {

      try {
        await treatmentService.update(service.id, { 
          id: service.id,
          name: service.name,
          basePrice: service.basePrice,
          isActive: nuevoEstado,
        });
        fetchServices();
      } catch (err) {
        alert(`Error al ${accion} el servicio`);
        console.error(err);
      }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  ${services.length > 0 
                    ? (services.reduce((sum, s) => sum + s.basePrice, 0) / services.length).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
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
              <p className="text-slate-500">Cargando servicios...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Servicio</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Precio Base</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-cyan-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">#{service.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{service.name}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-teal-600">${service.basePrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {service.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(service)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                          {service.isActive ? <Lock/> : <Unlock/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredServices.length === 0 && (
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Servicio</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Precio Base ($)</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  required
                  step="0.01"
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  max="100000.00"
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
