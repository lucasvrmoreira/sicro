// src/api.js
import axios from "axios";

const isProd = import.meta.env.MODE === "production";

// Em dev: usa 127.0.0.1 por padrão. Se quiser, pode sobrescrever com VITE_API_URL.
// Em prod: usa VITE_API_URL, senão cai no domínio do Render.
const baseURL = isProd
  ? (import.meta.env.VITE_API_URL || "https://sicro.onrender.com")
  : (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000");

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        const refreshResp = await axios.post(
          `${baseURL}/api/refresh`, {}, { withCredentials: true }
        );
        const newToken = refreshResp.data.access_token;
        localStorage.setItem("access_token", newToken);
        localStorage.setItem("expires_in", refreshResp.data.expires_in);
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
