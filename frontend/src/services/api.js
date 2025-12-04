import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://i-collect-mongodb-backend.vercel.app";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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
    const response = await api.get(`/search?q=${query}`);
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
};

export const ratingsAPI = {
  getTopRatings: async () => {
    const response = await api.get("/ratings/top");
    return response.data;
  },
};

export default api;
