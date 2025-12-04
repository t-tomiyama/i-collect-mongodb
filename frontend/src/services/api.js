import axios from "axios";

// NA VERCEL: Não precisamos de URL base completa, pois o backend está no mesmo domínio.
// Apenas "/api" é suficiente. O vercel.json fará o redirecionamento.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptores mantidos iguais (são ótimos!)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se der erro 401 (Não autorizado), pode ser token expirado
    if (error.response?.status === 401) {
      console.warn("Sessão expirada ou inválida");
      // Opcional: localStorage.removeItem("token");
      // Opcional: window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ... (Mantenha o resto das funções authAPI, dashboardAPI, etc. iguais)

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  register: async (userData) => {
    // Agora enviamos o objeto no formato que o Mongo espera
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  // ... resto igual
};

// ... Mantenha o restante do arquivo (dashboardAPI, bindersAPI, etc) ...

export default api;
