import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API,
});

api.interceptors.request.use(
  (config) => {
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No hay refresh token disponible");
        }

        const res = await axios.post<{
          data: { accessToken: string; refreshToken: string };
        }>(`${import.meta.env.VITE_URL_API}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          res.data.data;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

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

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authUser");

        window.dispatchEvent(new Event("auth/logout"));

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);