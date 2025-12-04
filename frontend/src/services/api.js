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

// --- Definição das Chamadas da API ---

export const authAPI = {
  login: async (credentials) => {
    // credentials = { email, password }
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  register: async (userData) => {
    // userData = { name, email, password, username, ... }
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  // Opcional: Se você tiver rota para pegar redes sociais no cadastro
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
};

export const bindersAPI = {
  getUserBinders: async (username, socialMediaId) => {
    if (!username || !socialMediaId) {
      console.error("Username ou socialMediaId faltando:", {
        username,
        socialMediaId,
      });
      throw new Error("Dados do usuário incompletos");
    }

    try {
      console.log("Buscando binders para:", username, socialMediaId);
      const response = await api.get(`/binders/${username}/${socialMediaId}`);

      if (response.data && response.data.success !== undefined) {
        return response.data.data || [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Erro ao buscar binders:", error);

      if (error.response?.status === 404) {
        throw new Error("Usuário não encontrado para esta rede social");
      }
      if (error.response?.status === 400) {
        throw new Error("Dados inválidos para buscar binders");
      }

      throw error;
    }
  },

  getBinderDetails: async (username, socialMediaId, binderId) => {
    if (!username || !socialMediaId || !binderId) {
      console.error("Dados faltando para buscar binder:", {
        username,
        socialMediaId,
        binderId,
      });
      return null;
    }

    try {
      const response = await api.get(
        `/binders/${username}/${socialMediaId}/${binderId}`
      );

      if (response.data && response.data.success !== undefined) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar detalhes do binder:", error);

      if (error.response?.status === 404) {
        throw new Error("Binder não encontrado");
      }

      throw error;
    }
  },

  getBinderStats: async (userId) => {
    if (!userId) return null;

    try {
      const response = await api.get(`/binders/stats/${userId}`);

      if (response.data && response.data.success !== undefined) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return null;
    }
  },

  getSleeveColors: async () => {
    try {
      const response = await api.get("/binders/sleeve-colors");

      if (response.data && response.data.success !== undefined) {
        return response.data.data;
      }

      return response.data;
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
      console.log("Criando binder:", { username, socialMediaId, binderData });
      const response = await api.post(
        `/binders/${username}/${socialMediaId}`,
        binderData
      );

      if (response.data && response.data.success !== undefined) {
        return response.data;
      }

      // Fallback
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erro ao criar binder:", error);

      // Tratamento específico de erros
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || "Erro ao criar binder";
        throw new Error(errorMsg);
      }

      if (error.response?.status === 404) {
        throw new Error("Usuário não encontrado para esta rede social");
      }

      throw error;
    }
  },

  getUserSocialMedias: async (userId) => {
    if (!userId) return [];

    try {
      const response = await api.get(`/user/${userId}/social-medias`);

      if (response.data && response.data.success !== undefined) {
        return response.data.data;
      }

      return response.data || [];
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

      if (response.data && response.data.success !== undefined) {
        return response.data;
      }

      return response.data;
    } catch (error) {
      console.error("Erro ao processar pagamentos:", error);
      throw error;
    }
  },

  getPayments: async (userId) => {
    try {
      const response = await api.get(`/payments/${userId}`);

      if (response.data && response.data.success !== undefined) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
      throw error;
    }
  },

  getPayments: async (userId) => {
    try {
      const response = await api.get(`/payments/${userId}`);

      if (response.data && response.data.success !== undefined) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
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
