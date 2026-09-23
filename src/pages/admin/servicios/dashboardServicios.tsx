import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Search, 
  AlertCircle, 
  DollarSign, 
  Loader2, 
  Lock, 
  Unlock,
  RefreshCw,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { AdminLayout } from "../../../components/adminLayout";
import { treatmentService } from '../../../services/treatment.service';
import type { ServiceDTO } from '../../../models/service/serviceDTO';
import { toast } from "sonner"; 

const translateError = (err: unknown, defaultMsg: string) => {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("409")) return "Ya existe un servicio registrado con ese nombre.";
    if (msg.includes("400")) return "Los datos del servicio no son válidos. Revisa el precio.";
    if (msg.includes("404")) return "El servicio solicitado no fue encontrado.";
    if (msg.includes("500") || msg.includes("502")) return "El servidor de la clínica está en mantenimiento.";
    if (msg.includes("network") || msg.includes("failed to fetch")) return "No hay conexión con el servidor. Revisa tu internet.";
    return err.message;
  }
  return defaultMsg;
};

export default function DasboardServicios() {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDTO | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [serviceToToggle, setServiceToToggle] = useState<ServiceDTO | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    basePrice: '',
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await treatmentService.getAllPaginated(0, 100);
      if (response.ok) {
        setServices(response.data.content || response.data); 
      } else {
        throw new Error(response.message || "Error al cargar datos");
      }
    } catch (err: unknown) {
      console.error(err);
      const friendlyError = translateError(err, 'Error de red al cargar los servicios.');
      setError(friendlyError);
      toast.error(friendlyError);
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
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.basePrice) {
      toast.warning("Por favor complete todos los campos requeridos.");
      return;
    }

    if (editingService) {
      const hasChanges = 
        formData.name.trim() !== editingService.name ||
        parseFloat(formData.basePrice) !== editingService.basePrice;

      if (!hasChanges) {
        toast.info("No se detectaron cambios en el servicio.");
        handleCloseModal();
        return;
      }
    }

    try {
      setIsSaving(true);
      const serviceData: ServiceDTO = {
        id: formData.id,
        name: formData.name.trim(),
        basePrice: parseFloat(formData.basePrice),
        isActive: editingService ? editingService.isActive : true,
      };

      if (editingService) {
        const res = await treatmentService.update(serviceData.id, serviceData);
        if (!res.ok) throw new Error(res.message || "400");
        toast.success("Servicio actualizado correctamente");
      } else {
        const res = await treatmentService.save(serviceData);
        if (!res.ok) throw new Error(res.message || "400");
        toast.success("Servicio registrado correctamente");
      }
      
      fetchServices();
      handleCloseModal();
    } catch (err: unknown) {
      console.error(err);
      const friendlyError = translateError(err, 'Error al guardar el servicio');
      toast.error(friendlyError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenConfirm = (service: ServiceDTO) => {
    setServiceToToggle(service);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (isToggling) return;
    setIsConfirmOpen(false);
    setServiceToToggle(null);
  };

  const executeToggleLock = async () => {
    if (!serviceToToggle) return;

    const nuevoEstado = !serviceToToggle.isActive; 
    
    try {
      setIsToggling(true);
      const res = await treatmentService.update(serviceToToggle.id, { 
        id: serviceToToggle.id,
        name: serviceToToggle.name,
        basePrice: serviceToToggle.basePrice,
        isActive: nuevoEstado,
      });

      if (res.ok) {
        toast.success(`Servicio ${nuevoEstado ? 'activado' : 'desactivado'} con éxito`);
        fetchServices();
        handleCloseConfirm();
      } else {
        throw new Error(res.message || "400");
      }
    } catch (err: unknown) {
      console.error(err);
      const friendlyError = translateError(err, `Error al cambiar el estado del servicio`);
      toast.error(friendlyError);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <AdminLayout currentPage="servicios">
      {/* Contenedor principal con max-w-full y min-w-0 para evitar desbordes */}
      <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-full min-w-0">
        
        {/* Header Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">Gestión de Servicios</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1 truncate">Administra tratamientos y precios</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold w-full sm:w-auto shrink-0"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span>Nuevo Servicio</span>
          </button>
        </div>

        {/*  Stats Cards (Grilla Responsive) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 truncate">Total de Servicios</p>
              <p className="text-2xl font-black text-slate-900 truncate">{services.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-cyan-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between min-w-0">
            <div className="min-w-0 mr-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 truncate">Precio Promedio</p>
              <p className="text-2xl font-black text-slate-900 flex items-baseline gap-1 truncate">
                <span className="text-lg text-teal-500">$</span>
                {services.length > 0 
                  ? (services.reduce((sum, s) => sum + s.basePrice, 0) / services.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Search Bar - 100% width adaptable */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre de tratamiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white shadow-sm transition-all text-sm truncate"
          />
        </div>

        {/* Table Container - Control estricto de overflow */}
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm w-full overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Cargando servicios...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 px-4">
              <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button 
                onClick={fetchServices}
                className="px-6 py-2.5 bg-teal-50 text-teal-700 font-bold rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Reintentar
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium text-lg">No se encontraron servicios</p>
              <p className="text-slate-400 text-sm mt-1">Intenta con otra búsqueda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">ID</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Servicio</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Precio Base</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">Estado</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-cyan-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm text-slate-500 font-mono whitespace-nowrap">#{service.id}</td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900 whitespace-nowrap">{service.name}</td>
                      <td className="px-5 py-4 text-sm font-black text-teal-600 whitespace-nowrap">${service.basePrice.toFixed(2)}</td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${service.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {service.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(service)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-200"
                            title="Editar Servicio"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenConfirm(service)} 
                            className={`p-2 rounded-xl transition-all border border-transparent ${
                              service.isActive ? "hover:bg-amber-100 text-amber-600 hover:border-amber-200" : "hover:bg-emerald-100 text-emerald-600 hover:border-emerald-200"
                            }`}
                            title={service.isActive ? "Desactivar Servicio" : "Activar Servicio"}
                          >
                            {service.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
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
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="px-6 py-5 border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-t-3xl flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-teal-100 shrink-0">
                {editingService ? <Edit2 className="w-5 h-5 text-teal-600"/> : <Plus className="w-5 h-5 text-teal-600"/>}
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del Servicio</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSaving}
                  placeholder="Ej. Limpieza Dental"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Precio Base ($)</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  required
                  disabled={isSaving}
                  step="0.01"
                  min="1"
                  max="100000.00"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50 text-sm shadow-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
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
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin"/> Procesando...</> : editingService ? 'Actualizar' : 'Guardar Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*  Modal de Confirmación Elegante */}
      {isConfirmOpen && serviceToToggle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleCloseConfirm} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${serviceToToggle.isActive ? 'bg-amber-100 border-amber-50 border-4' : 'bg-emerald-100 border-emerald-50 border-4'}`}>
              {serviceToToggle.isActive ? (
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              ) : (
                <Unlock className="h-8 w-8 text-emerald-500" />
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {serviceToToggle.isActive ? "Desactivar Servicio" : "Activar Servicio"}
            </h3>
            
            <p className="text-sm text-slate-500 mb-6 px-2 leading-relaxed">
              ¿Estás seguro de que deseas {serviceToToggle.isActive ? "ocultar" : "habilitar"} el servicio <span className="font-bold text-slate-800">{serviceToToggle.name}</span> en el formulario de citas?
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
                  serviceToToggle.isActive 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isToggling ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  serviceToToggle.isActive ? "Sí, Desactivar" : "Sí, Activar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}