import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "../../../components/adminLayout";
import { doctorService } from "../../../services/doctor.service";
import type { DoctorDTO } from "../../../models/doctor/doctorDTO";

export default function DasboardOdontologos() {
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorDTO | null>(null);

  // Form state
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
      const response = await doctorService.getAllPaginated(0, 20);
      console.log("Doctors API response:", response);
      if (response.ok) {
        console.log("Doctors data:", response.data.content);
        console.log("Doctors content:", response.data.content);
        setDoctors(normalizeDoctors(response.data.content));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Error al cargar los doctores");
      console.error("Doctors fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLastName(doctor).toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenModal = (doctor?: DoctorDTO) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name,
        lastName: getLastName(doctor),
        specialty: doctor.specialty,
        username: "", // Username and password are usually not edited here for security
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
    setFormData({
      name: "",
      lastName: "",
      specialty: "",
      username: "",
      password: "",
      email: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        // For update, we only send the doctor details
        const response = await doctorService.update(editingDoctor.id, {
          name: formData.name,
          lastName: formData.lastName,
          specialty: formData.specialty,
        });
        if (response.ok) fetchDoctors();
      } else {
        const response = await doctorService.save(formData);
        if (response.ok) fetchDoctors();
      }
      handleCloseModal();
    } catch (err) {
      alert("Error al guardar el doctor");
      console.error(err);
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (confirm("¿Está seguro de que desea desactivar este doctor?")) {
      try {
        const response = await doctorService.delete(id);
        if (response.ok) fetchDoctors();
      } catch (err) {
        alert("Error al eliminar el doctor");
        console.error(err);
      }
    }
  };

  return (
    <AdminLayout currentPage="odontologos">
      <div className="space-y-6">
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
            placeholder="Buscar por nombre, apellido o especialidad..."
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
              <p className="text-slate-500">Cargando odontólogos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 px-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchDoctors}
                className="mt-4 px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Apellido
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Especialidad
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
                  {filteredDoctors.map((doctor) => (
                    <tr
                      key={doctor.id}
                      className="hover:bg-cyan-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {doctor.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getLastName(doctor)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                          {doctor.specialty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            doctor.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
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
              {filteredDoctors.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">
                    No se encontraron odontólogos
                  </p>
                </div>
              )}
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
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
              <h2 className="text-xl font-bold text-slate-900">
                {editingDoctor ? "Editar Doctor" : "Nuevo Doctor"}
              </h2>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Especialidad
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                >
                  <option value="">Seleccionar especialidad</option>
                  <option value="Odontología General">
                    Odontología General
                  </option>
                  <option value="Ortodoncia">Ortodoncia</option>
                  <option value="Implantología">Implantología</option>
                  <option value="Endodoncia">Endodoncia</option>
                  <option value="Periodoncia">Periodoncia</option>
                </select>
              </div>

              {!editingDoctor && (
                <>
                  <div className="border-t border-teal-100 pt-4 mt-4">
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-4">
                      Datos de Acceso (Usuario)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Usuario (Username)
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-teal-200 text-slate-700 rounded-lg hover:bg-teal-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg hover:shadow-lg font-medium transition-all"
                >
                  {editingDoctor ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
