import axios from "axios";

export const setupAxiosInterceptors = () => {
  // Request interceptor to add auth token
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // Response interceptor to handle token refresh on 401
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If we get a 401 and haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }
          
          // Call refresh token endpoint
          const res = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
            `${import.meta.env.VITE_URL_API}/auth/refresh-token`,
            { refreshToken }
          );
          
          // Update tokens in localStorage
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          
          // Update header and retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          
          // You might want to dispatch a logout event or redirect here
          window.dispatchEvent(new Event("auth/logout"));
          
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};