import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/authContext";
import "../App.css";
import { EyeIcon, EyeOff } from "lucide-react";
import { routes } from "../utils/routes";
import { toast } from "sonner"; 

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { handleLogin, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.warning("Por favor, ingrese su correo y contraseña.");
      return;
    }
    
    try {
      const loggedUser = await handleLogin({ email: email, passwordd: password });

      if (loggedUser.rol?.id === 1) {
        toast.success("¡Bienvenido al panel de Administración!");
        navigate(routes.admin);
      } else if (loggedUser.rol?.id === 2) {
        toast.success("¡Bienvenido al panel de Recepción!");
        navigate(routes.recepcion);
      } else {
        toast.success(`¡Bienvenido Dr/a. ${loggedUser.username}!`);
        navigate(routes.doctor);
      }

    } catch (err: unknown) {
      console.error("Fallo al iniciar sesión", err);
      
      let errorMessage = "Ocurrió un problema inesperado. Por favor, inténtelo de nuevo.";
      
      if (err instanceof Error) {
        const rawMessage = err.message.toLowerCase();
        
        if (rawMessage.includes("400")) {
          errorMessage = "Los datos ingresados no son válidos. Verifica que no haya espacios extra.";
        } else if (rawMessage.includes("401") || rawMessage.includes("404")) {
          errorMessage = "El correo o la contraseña son incorrectos.";
        } else if (rawMessage.includes("403")) {
          errorMessage = "Tu cuenta está bloqueada o no tiene permisos de acceso.";
        } else if (rawMessage.includes("500") || rawMessage.includes("502")) {
          errorMessage = "El servidor de la clínica está en mantenimiento. Intenta en unos minutos.";
        } else if (rawMessage.includes("network") || rawMessage.includes("failed to fetch")) {
          errorMessage = "No hay conexión con el servidor. Por favor, revisa tu internet.";
        }
      }
      
      setPassword("");
      
      toast.error(errorMessage);
    }
  };

  const getFriendlyContextError = (rawError: string) => {
    const errorLower = rawError.toLowerCase();
    if (errorLower.includes("400")) return "Datos inválidos. Verifica tu correo y contraseña.";
    if (errorLower.includes("401")) return "Credenciales incorrectas.";
    if (errorLower.includes("network")) return "Error de conexión a internet.";
    return "Error al validar sus datos. Inténtelo de nuevo.";
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-teal-200/30 rounded-full blur-3xl"></div>

          {/* Card */}
          <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-teal-100 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-full text-xs font-semibold text-teal-700 mb-4 shadow-sm">
                Sistema de Gestión Dental
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent mb-2">
                Bienvenido
              </h1>
              <p className="text-slate-600 text-sm">
                Acceso seguro para profesionales
              </p>
            </div>

            {/* Renderizado de Errores del Contexto (Traducido) */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200 text-center animate-in slide-in-from-top-2">
                {getFriendlyContextError(error)}
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleForm}>
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Profesional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  placeholder="nombre@clinica.com"
                  className="w-full px-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-sm bg-teal-50/50 disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-sm bg-teal-50/50 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_8px_20px_rgba(13,148,136,0.3)] hover:shadow-[0_8px_25px_rgba(13,148,136,0.4)] mt-8 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 disabled:shadow-none hover:-translate-y-0.5 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Conectando...
                  </>
                ) : (
                  "Acceder al Sistema"
                )}
              </button>
            </form>

            {/* Security Info */}
            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
              <span className="text-teal-600 shrink-0">🔒</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700">Conexión Segura.</span> Tu información
                está protegida con encriptación de nivel médico.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;