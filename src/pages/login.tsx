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
      {/* 🌟 100dvh asegura que el fondo no se rompa cuando aparece el teclado en iOS/Android */}
      <main className="min-h-[100dvh] bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative">
        
        {/* Decorative elements - Movidos atrás con z-0 */}
        <div className="absolute top-10 right-10 w-32 h-32 md:w-64 md:h-64 bg-cyan-200/30 rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 md:w-72 md:h-72 bg-teal-200/30 rounded-full blur-3xl z-0 pointer-events-none"></div>

        {/* 🌟 Contenedor de la Tarjeta con z-10 para estar por encima de los decorados */}
        <div className="w-full max-w-[400px] z-10">
          
          <div className="bg-white rounded-3xl shadow-xl shadow-teal-900/5 p-6 sm:p-8 md:p-10 border border-teal-100/50 animate-in fade-in zoom-in-95 duration-500 backdrop-blur-sm relative overflow-hidden">
            
            {/* Brillo decorativo sutil dentro de la tarjeta */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-500"></div>

            {/* Header */}
            <div className="mb-8 text-center sm:text-left">
              <div className="inline-flex px-3 py-1 bg-teal-50 border border-teal-100/50 rounded-full text-[11px] font-bold tracking-wider uppercase text-teal-600 mb-4 shadow-sm mx-auto sm:mx-0">
                Clínica Odontológica
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-1">
                Bienvenido
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Ingresa tus credenciales para acceder.
              </p>
            </div>

            {/* Renderizado de Errores del Contexto */}
            {error && (
              <div className="mb-6 p-3.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 flex items-center justify-center text-center animate-in slide-in-from-top-2">
                {getFriendlyContextError(error)}
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleForm}>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                  Email Profesional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  placeholder="nombre@clinica.com"
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-sm bg-slate-50/50 hover:bg-slate-50 disabled:opacity-60 shadow-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
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
                    className="w-full px-4 py-3.5 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-sm bg-slate-50/50 hover:bg-slate-50 disabled:opacity-60 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold tracking-wide py-3.5 rounded-xl transition-all shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 mt-8 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 disabled:shadow-none hover:-translate-y-0.5 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Autenticando...
                  </>
                ) : (
                  "Acceder al Sistema"
                )}
              </button>
            </form>

            {/* Security Info */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
                <span className="text-teal-600 text-sm">🔒</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                <span className="font-bold text-slate-700 block mb-0.5">Conexión Segura</span> 
                Información protegida con encriptación para entornos médicos.
              </p>
            </div>
            
          </div>
          
          {/* Footer Text */}
          <div className="text-center mt-6">
            <p className="text-[11px] font-medium text-slate-400">
              &copy; {new Date().getFullYear()} Clínica Odontológica. Todos los derechos reservados.
            </p>
          </div>
          
        </div>
      </main>
    </>
  );
}

export default Login;