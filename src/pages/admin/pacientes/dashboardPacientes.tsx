import { useState, useEffect } from 'react';
import { Plus, Edit2, Search, AlertCircle, Loader2, Lock, Unlock} from 'lucide-react';
import { AdminLayout } from "../../../components/adminLayout";
import { patientService } from '../../../services/patient.service';
import type { PatientDTO } from '../../../models/patient/patientDTO';
import type { PatientRequestDTO } from '../../../models/patient/patientRequestDTO';

export default function DashboardPacientes() {
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientDTO | null>(null);
  
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
      const response = await patientService.getAllPaginated(0, 100);
      if (response.ok) {
        setPatients(response.data.content);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Error al cargar los pacientes');
      console.error(err);
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
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setFormData({
      dni: '',
      name: '',
      last_name: '',
      phone: '',
      email: '',
    });
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: PatientRequestDTO = {
        dni: formData.dni,
        name: formData.name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        isActive: editingPatient ? editingPatient.isActive : true, 
      };

      if (editingPatient) {
        await patientService.update(editingPatient.id, payload);
        alert('Paciente actualizado correctamente');
      } else {
        await patientService.save(payload);
        alert('Paciente registrado correctamente');
      }
      
      fetchPatients();
      handleCloseModal();
    } catch (err) {
      alert('Error al guardar o actualizar el paciente');
      console.error(err);
    }
  };

  const handleToggleLock = async (patient: PatientDTO) => {
    if (!confirm(`¿Estás seguro de ${patient.isActive ? "desactivar" : "activar"} a ${patient.name} ${patient.last_name}?`)) {
      return;
    }
    try {
      await patientService.update(patient.id, {
        dni: patient.dni,
        name: patient.name,
        last_name: patient.last_name,
        phone: patient.phone || undefined,
        email: patient.email || undefined,
        isActive: !patient.isActive,
      });
      fetchPatients();
    } catch (err) {
      alert("Error al cambiar el estado del paciente");
      console.error(err);
    }
  };

  return (
    <AdminLayout currentPage="pacientes">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Pacientes</h1>
            <p className="text-slate-600 mt-1">Administra el expediente de pacientes</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Nuevo Paciente
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white"
          />
        </div>

        <div className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500">Cargando pacientes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 px-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">DNI</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Apellido</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Teléfono</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-cyan-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{patient.dni}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{patient.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{patient.last_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{patient.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{patient.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {patient.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(patient)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                            <button
                              onClick={() => handleToggleLock(patient)}
                              className={`rounded-lg p-2 transition-colors ${
                                patient.isActive        
                                  ? "text-yellow-600 hover:bg-yellow-100"
                                  : "text-green-600 hover:bg-green-100"
                              }`}
                              title={patient.isActive ? "Desactivar" : "Activar"}
                            >
                              {patient.isActive ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No se encontraron pacientes</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
              <h2 className="text-xl font-bold text-slate-900">
                {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">DNI</label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Apellido</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  {editingPatient ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
