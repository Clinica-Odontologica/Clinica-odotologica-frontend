import { AdminLayout } from "../../../components/adminLayout";
import { Card } from "../../../components/ui/card/card";
import { Button } from "../../../components/ui/button/button";
import { useAuth } from "../../../context/authContext";
import { 
  Mail, 
  Shield, 
  Key, 
  BadgeCheck, 
  Edit, 
  EyeIcon, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  RefreshCw 
} from "lucide-react";
import { useState, useEffect } from "react";
import type { UserResponseDTO } from "../../../models/usuario/userResponseDTO";
import type { UserUpdateRequestDTO } from "../../../models/usuario/userUpdateRequestDTO";
import { userService } from "../../../services/user.service";
import { toast } from "sonner";

type FlexData = {
  fullName?: string;
  fullname?: string;
  role?: { name: string };
  rol?: { name: string };
  isActive?: boolean;
  active?: boolean;
};

const translateError = (err: unknown, defaultMsg: string) => {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("409")) return "El nombre de usuario o correo electrónico ya está registrado.";
    if (msg.includes("400")) return "Los datos ingresados no son válidos. Verifica los campos.";
    if (msg.includes("403")) return "No tienes permisos para modificar este perfil.";
    if (msg.includes("404")) return "El usuario solicitado no existe.";
    if (msg.includes("500") || msg.includes("502")) return "El servidor está en mantenimiento. Inténtalo de nuevo más tarde.";
    if (msg.includes("network") || msg.includes("failed to fetch")) return "No hay conexión con el servidor. Revisa tu internet.";
    
    return err.message; 
  }
  return defaultMsg;
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
      setError(null);
      const response = await userService.getById(user.id);

      if (response.ok && response.data) {
        setProfileData(response.data);
      } else {
        throw new Error(response.message || "400");
      }
    } catch (err: unknown) {
      console.error("Profile fetch error:", err);
      const friendlyError = translateError(err, "Error al cargar el perfil");
      setError(friendlyError);
      toast.error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = () => {
    const sourceData = profileData || user; 
    
    if (sourceData) {
      const sData = sourceData as unknown as FlexData & { username?: string; email?: string };
      const actualFullName = sData.fullName || sData.fullname || "";
      
      setFormData({
        fullname: actualFullName,
        username: sData.username || "",
        email: sData.email || "",
        password: "", 
      });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setFormData(prev => ({ ...prev, password: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;

    if (!formData.fullname.trim() || !formData.username.trim() || !formData.email.trim()) {
      toast.warning("Por favor, complete todos los campos obligatorios.");
      return;
    }

    const sData = (profileData || user) as unknown as FlexData & { username?: string; email?: string };
    const originalFullName = sData.fullName || sData.fullname || "";
    const originalUsername = sData.username || "";
    const originalEmail = sData.email || "";

    const hasChanges = 
      formData.fullname.trim() !== originalFullName ||
      formData.username.trim() !== originalUsername ||
      formData.email.trim() !== originalEmail ||
      formData.password !== ""; 
    if (!hasChanges) {
      toast.info("No se detectaron cambios en el perfil.");
      handleCloseModal();
      return;
    }

    try {
      setIsSaving(true);
      
      const pData = profileData as UserResponseDTO & FlexData;

      const payloadObj = {
        username: formData.username,
        fullname: formData.fullname,
        email: formData.email,
        rol: pData.rol || pData.role, 
        password: formData.password ? formData.password : ((pData as UserResponseDTO).password || ""), 
        isActive: pData.isActive ?? pData.active ?? true, 
      };

      const finalPayload = payloadObj as unknown as UserUpdateRequestDTO;
      const response = await userService.update(profileData.id, finalPayload);

      if (response.ok) {
        toast.success("Perfil actualizado correctamente");
        await fetchProfile();
        handleCloseModal();
      } else {
        throw new Error(response.message || "400");
      }
    } catch (err: unknown) {
      console.error(err);
      const friendlyError = translateError(err, "Error al guardar los cambios");
      toast.error(friendlyError);
    } finally {
      setIsSaving(false);
    }
  };

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

  if (error && !profileData) {
    return (
      <AdminLayout currentPage="perfil">
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">No se pudo cargar el perfil</h2>
          <p className="text-slate-600">{error}</p>
          <button 
            onClick={fetchProfile}
            className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar Conexión
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage={"perfil"}>
      <main className="mx-auto max-w-4xl p-4 md:p-6 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Mi Perfil</h1>
            <p className="mt-1 text-slate-500">
              Gestiona tu información personal
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenModal}
            disabled={loading}
            className="shadow-sm hover:shadow transition-all"
          >
            <Edit size={16} className="mr-2" />
            Editar Datos
          </Button>
        </div>

        {loading && !profileData ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Cargando tu perfil...</p>
          </div>
        ) : (
          <>
            {/* Tarjeta 1: Banner y Avatar */}
            <Card className="overflow-hidden border border-border p-0 shadow-sm transition-all hover:shadow-md">
              <div className="h-28 w-full bg-gradient-to-r from-teal-500 to-cyan-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
              </div>
              <div className="relative px-6 pb-8">
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
            <Card className="border border-border p-6 shadow-sm transition-all hover:shadow-md">
              <h3 className="mb-6 border-b border-slate-100 pb-4 text-lg font-semibold text-slate-800">
                Detalles de la Cuenta
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-slate-500 shadow-inner">
                    <Mail size={22} className="text-teal-600" />
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

                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-slate-500 shadow-inner">
                    <Shield size={22} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Nivel de Acceso
                    </p>
                    <div className="mt-1 inline-flex items-center rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                      {displayRoleStr.replace("ROLE_", "") || "USUARIO"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-slate-500 shadow-inner">
                    <Key size={22} className="text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Username</p>
                    <p className="mt-0.5 font-mono font-semibold text-slate-800">
                      {displayData?.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-slate-500 shadow-inner">
                    <BadgeCheck size={22} className="text-emerald-600" />
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
                      <p className="font-semibold text-emerald-600">
                        Autenticado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Modal de Edición Animado */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-teal-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Edit size={20} className="text-teal-600" />
                  Actualizar Datos
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50"
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
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50"
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
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-60 disabled:bg-slate-50"
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
                      disabled={isSaving}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-sm disabled:opacity-60 disabled:bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSaving}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeIcon size={20} />
                      ) : (
                        <EyeOff size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button
                    variant="soft"
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSaving}
                    className="flex-1 rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="solid"
                    type="submit"
                    loading={isSaving}
                    className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
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