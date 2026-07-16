import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  login as loginService,
  register as registerService,
} from "../services/auth.service";
import type { LoginRequestDTO } from "../models/Auth/loginRequestDTO";
import type { RegisterRequestDTO } from "../models/Auth/registerRequestDTO";
import type { LoginResponseDTO } from "../models/Auth/loginResponseDTO";

interface AuthContextType {
  user: LoginResponseDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  handleLogin: (body: LoginRequestDTO) => Promise<LoginResponseDTO>;
  handleRegister: (body: RegisterRequestDTO) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

interface AxiosErrorType {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<LoginResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Carga inicial de sesión y auto-reparación de tokens sueltos
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (!localStorage.getItem("accessToken")) {
          localStorage.setItem("accessToken", parsed.accessToken);
          localStorage.setItem("refreshToken", parsed.refreshToken);
        }
      } catch (e) {
        console.error("Error al parsear usuario del localStorage", e);
      }
    }
    setIsLoading(false);

    // 2. Escuchamos el evento de expiración que dispara el interceptor de Axios
    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener("auth/logout", handleLogoutEvent);

    // 3. Limpieza del listener al desmontar el componente
    return () => {
      window.removeEventListener("auth/logout", handleLogoutEvent);
    };
  }, []);

  const handleLogin = async (
    body: LoginRequestDTO,
  ): Promise<LoginResponseDTO> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginService(body);
      setUser(response);
      localStorage.setItem("authUser", JSON.stringify(response));
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      return response;
    } catch (error: unknown) {
      const err = error as AxiosErrorType;
      const errorMessage =
        err.response?.data?.message || "Error al iniciar sesión";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (body: RegisterRequestDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerService(body);
    } catch (error: unknown) {
      const err = error as AxiosErrorType;
      const errorMessage =
        err.response?.data?.message || "Error al registrar usuario";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    handleLogin,
    handleRegister,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};