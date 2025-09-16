import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});


// Interceptor: adiciona token automaticamente em cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("🔑 Token usado:", token); // log para debug
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: captura erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      alert("⚠️ Sessão expirada. Faça login novamente.");
      localStorage.removeItem("token"); // remove o token salvo
      window.location.href = "/login";  // redireciona para tela de login
    }
    return Promise.reject(error);
  }
);

export default api;
