import { AdminLayout } from "../../../components/adminLayout";
import { Card } from "../../../components/ui/card/card";
import { Button } from "../../../components/ui/button/button";
import { useAuth } from "../../../context/authContext";
import { Mail, Shield, Key, BadgeCheck, Edit, EyeIcon, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import type { UserResponseDTO } from "../../../models/usuario/userResponseDTO";
import type { UserUpdateRequestDTO } from "../../../models/usuario/userUpdateRequestDTO";
import { userService } from "../../../services/user.service";

type FlexData = {
  fullName?: string;
  fullname?: string;
  role?: { name: string };
  rol?: { name: string };
  isActive?: boolean;
  active?: boolean;
};

export default function Perfildashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<UserResponseDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await userService.getById(user.id);

      if (response.ok && response.data) {
        setProfileData(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Error al cargar el perfil");
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

const handleOpenModal = () => {
    // 🌟 TRUCO MÁGICO: Si profileData falló o no ha cargado, usamos el "user" del login
    const sourceData = profileData || user; 
    
    if (sourceData) {
      const sData = sourceData as unknown as FlexData & { username?: string; email?: string };
      const actualFullName = sData.fullName || sData.fullname || "";
      
      setFormData({
        fullname: actualFullName,
        username: sData.username || "",
        email: sData.email || "",
        password: "", // Siempre lo dejamos vacío por seguridad
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(prev => ({ ...prev, password: "" }));
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;

    try {
      setIsSaving(true);
      
      const pData = profileData as UserResponseDTO & FlexData;

      const payloadObj = {
        username: formData.username,
        fullname: formData.fullname,
        email: formData.email,
        
        // 🌟 CORRECCIÓN 1: Mandamos el objeto 'rol' o 'role', NO el 'id'
        rol: pData.rol || pData.role, 
        
        // 🌟 CORRECCIÓN 2: Si UserResponseDTO no devuelve contraseña, evitamos que sea undefined
        password: formData.password ? formData.password : ((pData as UserResponseDTO).password || ""), 
        
        // 🌟 CORRECCIÓN 3: Swagger pide 'isActive' exactamente
        isActive: pData.isActive ?? pData.active ?? true, 
      };

      const finalPayload = payloadObj as unknown as UserUpdateRequestDTO;

      const response = await userService.update(profileData.id, finalPayload);

      if (response.ok) {
        await fetchProfile();
        handleCloseModal();
        alert("Perfil actualizado correctamente");
      } else {
        alert("Error al actualizar: " + response.message);
      }
    } catch (err) {
      alert("Error al guardar los cambios");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Convertimos las variables de usuario al tipo seguro
  const uData = user as unknown as FlexData;
  const userRoleStr = uData?.role?.name || uData?.rol?.name || "";
  
  const formatRole =
    userRoleStr === "ROLE_ADMIN" ? "Administrador"
      : userRoleStr === "ROLE_DOCTOR" ? "Odontólogo"
      : userRoleStr === "ROLE_RECEPTIONIST" ? "Recepción"
      : "Usuario";

  const displayData = profileData || user;
  
  const pData = profileData as UserResponseDTO & FlexData;
  const userName = pData?.fullName || pData?.fullname || user?.username || "Usuario";
  const userInitial = userName.charAt(0).toUpperCase();

  const dData = displayData as unknown as FlexData;
  const displayRoleStr = dData?.role?.name || dData?.rol?.name || "";

  return (
    <AdminLayout currentPage={"perfil"}>
      <main className="mx-auto max-w-4xl p-6 flex flex-col gap-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Mi Perfil</h1>
            <p className="mt-1 text-slate-500">
              Gestiona tu información personal
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleOpenModal}>
            <Edit size={16} />
            Editar Datos
          </Button>
        </div>

        {/* Tarjeta 1: Banner y Avatar */}
        <Card className="overflow-hidden border border-border p-0 shadow-sm">
          <div className="h-24 w-full bg-gradient-to-r from-teal-500 to-cyan-600"></div>
          <div className="relative px-6 pb-6">
            <div className="absolute -top-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-4xl font-bold text-teal-700 shadow-md">
              {userInitial}
            </div>
            <div className="pt-14">
              <h2 className="text-2xl font-bold text-slate-800">{userName}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <Shield size={16} className="text-teal-600" />
                {formatRole}
              </p>
            </div>
          </div>
        </Card>

        {/* Tarjeta 2: Detalles de la Cuenta */}
        {loading && <p className="text-center text-slate-500">Cargando perfil...</p>}
        <Card className="border border-border p-6 shadow-sm">
          <h3 className="mb-6 border-b border-slate-100 pb-4 text-lg font-semibold text-slate-800">
            Detalles de la Cuenta
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-500">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Correo Electrónico
                </p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {displayData?.email || "Sin correo"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-500">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Nivel de Acceso
                </p>
                <div className="mt-1 inline-flex items-center rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  {displayRoleStr.replace("ROLE_", "") || "USUARIO"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-500">
                <Key size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Username</p>
                <p className="mt-0.5 font-mono font-semibold text-slate-800">
                  {displayData?.username}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-slate-500">
                <BadgeCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Estado de Cuenta
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  </span>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <p className="font-semibold text-emerald-600">
                    Autenticado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Modal Mejorado */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                <h2 className="text-xl font-bold text-slate-900">
                  Actualizar Datos
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) =>
                      setFormData({ ...formData, fullname: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between">
                    <span>Contraseña</span>
                    <span className="text-xs font-normal text-slate-400">Opcional (Dejar en blanco para mantener)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
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
                  <Button
                    variant="soft"
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="solid"
                    type="submit"
                    loading={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}