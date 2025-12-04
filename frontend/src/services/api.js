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
  search: async (query) => {
    // Ex: /search?q=Stray Kids
    const response = await api.get(`/search?q=${query}`);
    return response.data;
  },
  getDetails: async (type, id) => {
    // Ex: /search/details/photocard/123
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
  // Adicione outras funções de binder (delete, update) se precisar
};

export const paymentsAPI = {
  // Buscar TODOS os pagamentos
  getPayments: async (userId, filters = {}) => {
    try {
      const {
        status,
        page = 1,
        limit = 20,
        sortBy = "due_date",
        sortOrder = "asc",
      } = filters;

      let url = `${API_BASE_URL}/payments/${userId}?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

      if (status && status !== "todos") {
        url += `&status=${status}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },

  // Buscar histórico de pagamentos
  getPaymentHistory: async (userId, filters = {}) => {
    try {
      const {
        startDate,
        endDate,
        page = 1,
        limit = 20,
        status = "pago",
      } = filters;

      let url = `${API_BASE_URL}/payments/${userId}/history?page=${page}&limit=${limit}&status=${status}`;

      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      if (endDate) {
        url += `&endDate=${endDate}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching payment history:", error);
      throw error;
    }
  },

  // Marcar pagamento como pago
  markAsPaid: async (paymentId, paymentData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/${paymentId}/pay`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      throw error;
    }
  },

  // Buscar detalhes de um pagamento específico
  getPaymentDetail: async (paymentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/detail/${paymentId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching payment detail:", error);
      throw error;
    }
  },

  // Cancelar pagamento
  cancelPayment: async (paymentId, reason) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/${paymentId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error cancelling payment:", error);
      throw error;
    }
  },

  // Processar múltiplos pagamentos (nova função)
  processPayments: async (paymentIds, method) => {
    try {
      // Processa cada pagamento individualmente
      const results = await Promise.all(
        paymentIds.map(async (paymentId) => {
          const result = await paymentsAPI.markAsPaid(paymentId, {
            method,
            amount: null, // O backend calculará automaticamente
            notes: "Pagamento em lote via interface",
          });
          return { id: paymentId, success: result.success };
        })
      );

      return {
        success: results.every((r) => r.success),
        results,
      };
    } catch (error) {
      console.error("Error processing payments:", error);
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
