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
    return response.data.data;
  },

  addToWishlist: async (data) => {
    const response = await api.post("/search/wishlist/add", data);
    return response.data;
  },
};

export const bindersAPI = {
  getUserBinders: async (username, socialMediaId) => {
    if (!username || !socialMediaId) {
      throw new Error("Dados do usuário incompletos");
    }

    try {
      const response = await api.get(`/binders/${username}/${socialMediaId}`);
      return response.data.data || [];
    } catch (error) {
      console.error("Erro ao buscar binders:", error);
      throw error;
    }
  },

  getBinderDetails: async (username, socialMediaId, binderId) => {
    if (!username || !socialMediaId || !binderId) {
      return null;
    }

    try {
      const response = await api.get(
        `/binders/${username}/${socialMediaId}/${binderId}`
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Erro ao buscar detalhes do binder:", error);
      throw error;
    }
  },

  getBinderStats: async (userId) => {
    if (!userId) return null;
    try {
      const response = await api.get(`/binders/stats/${userId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return null;
    }
  },

  getSleeveColors: async () => {
    try {
      const response = await api.get("/binders/sleeve-colors");
      return response.data.data || response.data;
    } catch (error) {
      console.error("Erro ao buscar cores de sleeves:", error);
      return [];
    }
  },

  createBinder: async (username, socialMediaId, binderData) => {
    if (!username || !socialMediaId) {
      throw new Error("Username e socialMediaId são obrigatórios");
    }

    if (!binderData?.name || !binderData?.rows || !binderData?.columns) {
      throw new Error("Nome, linhas e colunas são obrigatórios");
    }

    try {
      const response = await api.post(
        `/binders/${username}/${socialMediaId}`,
        binderData
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar binder:", error);
      throw error;
    }
  },

  getUserSocialMedias: async (userId) => {
    if (!userId) return [];
    try {
      const response = await api.get(`/user/${userId}/social-medias`);
      return response.data.data || [];
    } catch (error) {
      console.error("Erro ao buscar redes sociais do usuário:", error);
      return [];
    }
  },
};

export const paymentsAPI = {
  processPayments: async (paymentIds, paymentMethod) => {
    try {
      const response = await api.post("/payments/process", {
        paymentIds,
        paymentMethod,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao processar pagamentos:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.error || "Erro ao processar pagamentos"
      );
    }
  },

  getPayments: async (userId, params = {}) => {
    try {
      const response = await api.get(`/payments/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
      throw error;
    }
  },

  getPaymentHistory: async (userId, params = {}) => {
    try {
      const response = await api.get(`/payments/${userId}/history`, { params });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      throw error;
    }
  },

  getPaymentDetail: async (paymentId) => {
    try {
      const response = await api.get(`/payments/detail/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
      throw error;
    }
  },

  markAsPaid: async (paymentId, data) => {
    try {
      const response = await api.post(`/payments/${paymentId}/pay`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
      throw error;
    }
  },

  cancelPayment: async (paymentId, reason) => {
    try {
      const response = await api.post(`/payments/${paymentId}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      throw error;
    }
  },
};

export const ratingsAPI = {
  getTopRatings: async () => {
    const response = await api.get("/ratings/top");
    return response.data;
  },
};

export default api;
