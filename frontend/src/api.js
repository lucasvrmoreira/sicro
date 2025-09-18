// src/api.js
import axios from "axios";

const api = axios.create({
  // Em dev: deixe vazio para usar o proxy do Vite.
  // Em produção: defina VITE_API_URL, ex: https://sua-api
  baseURL: import.meta.env.VITE_API_URL || "",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // não force navegação aqui; deixa o RequireAuth cuidar
    }
    return Promise.reject(error);
  }
);

export default api;
