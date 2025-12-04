// services/api.js - Verifique se está completo
import axios from "axios";

// Configuração base da API
const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://i-collect-mongodb-backend.vercel.app";

console.log("API_URL configurada para:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Adicione timeout
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// --- Definição das Chamadas da API ---
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  getSocialMedias: async () => {
    const response = await api.get("/auth/social-medias");
    return response.data;
  },
};

export const dashboardAPI = {
  getDashboardData: async (userId) => {
    const response = await api.get(`/dashboard/${userId}`);
    return response.data;
  },
};

export const searchAPI = {
  search: async (query) => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  getDetails: async (type, id) => {
    const response = await api.get(`/search/details/${type}/${id}`);
    return response.data;
  },
};

export const bindersAPI = {
  getBinders: async () => {
    const response = await api.get("/binders");
    return response.data;
  },
  createBinder: async (binderData) => {
    const response = await api.post("/binders", binderData);
    return response.data;
  },
};

export const paymentsAPI = {
  processPayments: async (paymentIds, method) => {
    const response = await api.post("/payments/process", {
      paymentIds,
      method,
    });
    return response.data;
  },
  getAllPayments: async (userId) => {
    try {
      const response = await api.get(`/payments/all/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar todos os pagamentos:", error);
      throw error;
    }
  },
  getPayments: async (userId) => {
    try {
      const response = await api.get(`/payments/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
      throw error;
    }
  },
};

export const ratingsAPI = {
  getTopRatings: async () => {
    try {
      const response = await api.get("/ratings/top");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar ratings:", error);
      return { topGoms: [], topCollectors: [] };
    }
  },
};

export default api;
