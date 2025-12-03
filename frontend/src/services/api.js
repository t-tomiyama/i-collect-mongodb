import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
    console.error("API Error:", error.response?.data || error.message);

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn("Sessão expirada ou não autorizada.");
    }

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
    // Retorna a lista estática ou do banco
    const response = await api.get("/auth/social-medias");
    // Garante que retorna o array, independente se vier dentro de .data ou direto
    return response.data.data || response.data;
  },
};

export const dashboardAPI = {
  getDashboardData: async (userId) => {
    // userId pode ser o ID do Mongo (string) ou username, o backend trata ambos
    const response = await api.get(`/dashboard/${userId}`);
    return response.data;
  },
};

export const searchAPI = {
  search: async (category, query, limit = 18) => {
    const endpoint = category === "global" ? "photocards" : category;

    const response = await api.get(`/search/${endpoint}`, {
      params: { q: query, limit },
    });
    return response.data;
  },

  getUserCollection: async (username, socialMedia, query) => {
    const response = await api.get("/search/user-collection", {
      params: { username, socialMedia, q: query },
    });
    return response.data;
  },

  getUserWishlist: async (username, socialMedia, query) => {
    const response = await api.get("/search/user-wishlist", {
      params: { username, socialMedia, q: query },
    });
    return response.data;
  },

  getDetails: async (type, id) => {
    const response = await api.get(`/search/details/${type}/${id}`);
    return response.data.data || response.data;
  },

  addToWishlist: async (data) => {
    const response = await api.post("/search/wishlist/add", data);
    return response.data;
  },
};

export const bindersAPI = {
  getUserBinders: async (username, socialMediaId) => {
    if (!username) throw new Error("Username faltando");

    try {
      const response = await api.get(`/binders/${username}/${socialMediaId}`);

      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data || [];
    } catch (error) {
      console.error("Erro ao buscar binders:", error);
      if (error.response?.status === 404) return [];
      throw error;
    }
  },

  getBinderDetails: async (username, socialMediaId, binderId) => {
    if (!binderId) return null;

    try {
      const response = await api.get(
        `/binders/${username}/${socialMediaId}/${binderId}`
      );
      // Retorna o objeto do binder direto ou encapsulado
      return response.data.data || response.data;
    } catch (error) {
      console.error("Erro detalhes binder:", error);
      if (error.response?.status === 404)
        throw new Error("Binder não encontrado");
      throw error;
    }
  },

  getBinderStats: async (userId) => {
    return null;
  },

  getSleeveColors: async () => {
    try {
      return [];
    } catch {
      return [];
    }
  },

  createBinder: async (username, socialMediaId, binderData) => {
    const response = await api.post(
      `/binders/${username}/${socialMediaId}`,
      binderData
    );
    return response.data;
  },

  updateSlot: async (
    username,
    socialMediaId,
    binderId,
    pageNumber,
    slotData
  ) => {
    const response = await api.put(
      `/binders/${username}/${socialMediaId}/${binderId}/pages/${pageNumber}/slots`,
      slotData
    );
    return response.data;
  },

  getUserSocialMedias: async (userId) => {
    try {
      return [];
    } catch {
      return [];
    }
  },
};

export const paymentsAPI = {
  processPayments: async (paymentIds, paymentMethod) => {
    const response = await api.post("/payments/process", {
      paymentIds,
      paymentMethod,
    });
    return response.data;
  },

  getPayments: async (userId) => {
    // Agora busca do endpoint /dashboard ou /payments específico
    const response = await api.get(`/payments/${userId}`);
    return response.data.data || response.data;
  },
};

export const ratingsAPI = {
  getTopRatings: async () => {
    try {
      const response = await api.get("/ratings/top");
      return response.data.data || response.data;
    } catch (error) {
      return { topGoms: [], topCollectors: [] };
    }
  },
};

export const debugAPI = {
  testConnection: async () => {
    try {
      const response = await api.get("/"); // Rota raiz do backend
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
