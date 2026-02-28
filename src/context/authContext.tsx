import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as loginService, register as registerService } from '../services/auth.service'; 
import type { LoginRequestDTO, LoginResponseDTO } from '../models/Auth/loginRequestDTO';
import type { RegisterRequestDTO } from '../models/Auth/registerDTO';

interface AuthContextType {
    user: LoginResponseDTO | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    handleLogin: (body: LoginRequestDTO) => Promise<void>;
    handleRegister: (body: RegisterRequestDTO) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Interfaz para Props
interface AuthProviderProps {
    children: ReactNode;
}

// Interfaz rápida para tipar los errores de Axios sin usar "any"
interface AxiosErrorType {
    response?: {
        data?: {
            message?: string;
        };
    };
}

// Exportamos el Provider quitando React.FC para mejor compatibilidad con React 18+
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<LoginResponseDTO | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const handleLogin = async (body: LoginRequestDTO) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await loginService(body);
            setUser(response);
            localStorage.setItem('authUser', JSON.stringify(response));
        } catch (error: unknown) {
            const err = error as AxiosErrorType; 
            const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
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
            const errorMessage = err.response?.data?.message || 'Error al registrar usuario';
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('authUser');
    };

    // Este objeto "value" ahora contiene todas las variables, eliminando los warnings de "no usadas"
    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        handleLogin,
        handleRegister,
        logout,
    };

    // ¡IMPORTANTE! El retorno del componente debe estar aquí
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};