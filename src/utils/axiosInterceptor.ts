import axios from "axios";

// 1. Creamos y exportamos la instancia única que usarán todos los servicios
export const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API,
});

// 2. INTERCEPTOR DE PETICIONES (Request)
// Se ejecuta ANTES de que cualquier petición salte a la red
api.interceptors.request.use(
  (config) => {
    // Tomamos el accessToken exactamente desde donde lo tienes en tu localStorage
    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. INTERCEPTOR DE RESPUESTAS (Response)
// Se ejecuta cuando el backend nos responde (aquí atrapamos los 401 y renovamos sesión)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el servidor responde 401 (Token vencido) y aún no hemos reintentado esta petición:
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No hay refresh token disponible");
        }

        // IMPORTANTE: Usamos 'axios.post' puro (sin interceptores) para renovar el token
        // y evitar bucles infinitos en caso de que el refresh también falle.
        const res = await axios.post<{
          data: { accessToken: string; refreshToken: string };
        }>(`${import.meta.env.VITE_URL_API}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          res.data.data;

        // 1. Guardamos los nuevos tokens sueltos en el localStorage
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // 2. Sincronizamos también el objeto "authUser" para que tu contexto no pierda los datos
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            parsedUser.accessToken = newAccessToken;
            parsedUser.refreshToken = newRefreshToken;
            localStorage.setItem("authUser", JSON.stringify(parsedUser));
          } catch (parseError) {
            console.error("Error al sincronizar authUser tras refresh", parseError);
          }
        }

        // 3. Le ponemos el nuevo token a la petición original que había fallado
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }

        // 4. Volvemos a disparar la petición original como si nada hubiera pasado
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh token también expiró o es inválido, limpiamos todo y cerramos sesión
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authUser");

        // Disparamos un evento global para que tu aplicación redirija al Login de inmediato
        window.dispatchEvent(new Event("auth/logout"));

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);