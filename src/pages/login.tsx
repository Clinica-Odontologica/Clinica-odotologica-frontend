import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/authContext";
import "../App.css";
import { EyeIcon, EyeOff } from "lucide-react";
import { routes } from "../utils/routes";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { handleLogin, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      await handleLogin({ email: email, passwordd: password }); 
      
      navigate(routes.recepcion); 
      
    } catch (err) {

      console.error("Fallo al iniciar sesión", err);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-teal-200/30 rounded-full blur-3xl"></div>

          {/* Card */}
          <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-teal-100">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-full text-xs font-semibold text-teal-700 mb-4">
                Sistema de Gestión Dental
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent mb-2">
                Bienvenido
              </h1>
              <p className="text-slate-600 text-sm">
                Acceso seguro para profesionales
              </p>
            </div>

            {/* Renderizado de Errores (Si el backend dice "Credenciales incorrectas") */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center">
                {error}
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
                  required
                  placeholder="nombre@clinica.com"
                  className="w-full px-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-sm bg-teal-50/50"
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
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-sm bg-teal-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    {showPassword ? <EyeIcon size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-105 mt-8 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Conectando...
                  </span>
                ) : (
                  "Acceder al Sistema"
                )}
              </button>
            </form>

            {/* Security Info */}
            <div className="mt-6 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <p className="text-xs text-cyan-700">
                <span className="font-semibold">🔒 Seguro:</span> Tu información
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