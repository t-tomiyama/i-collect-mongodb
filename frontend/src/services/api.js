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

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(
      error.response?.data || {
        success: false,
        error: "Erro de conexão com o servidor",
      }
    );
  }
);

export const authAPI = {
  login: async (credentials) => {
    try {
      // Debug log
      console.log("Login API call:", {
        email: credentials.email,
        endpoint: `${API_URL}/auth/login`,
      });

      const response = await api.post("/auth/login", credentials);
      return response;
    } catch (error) {
      console.error("Login API error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log("Register API call:", {
        username: userData.username,
        endpoint: `${API_URL}/auth/register`,
      });

      const response = await api.post("/auth/register", userData);
      return response;
    } catch (error) {
      console.error("Register API error:", error);
      throw error;
    }
  },

  getSocialMedias: async () => {
    try {
      const response = await api.get("/auth/social-medias");
      return response;
    } catch (error) {
      console.error("Social medias API error:", error);
      return {
        success: true,
        data: [
          { id: 1, name: "Instagram" },
          { id: 2, name: "Twitter/X" },
          { id: 3, name: "Facebook" },
          { id: 4, name: "TikTok" },
        ],
      };
    }
  },

  debugUsers: async () => {
    try {
      const response = await api.get("/auth/debug/users");
      return response;
    } catch (error) {
      console.error("Debug users error:", error);
      throw error;
    }
  },
};

export const dashboardAPI = {
  getDashboardData: async (userId) => {
    try {
      const response = await api.get(`/dashboard/${userId}`);
      return response;
    } catch (error) {
      console.error("Dashboard API error:", error);
      throw error;
    }
  },

  getCollectorStats: async (collectorId) => {
    try {
      const response = await api.get(`/dashboard/collector/${collectorId}`);
      return response;
    } catch (error) {
      console.error("Collector stats error:", error);
      throw error;
    }
  },
};

export const searchAPI = {
  search: async (query, type = "all") => {
    try {
      const response = await api.get(`/search?q=${query}&type=${type}`);
      return response;
    } catch (error) {
      console.error("Search API error:", error);
      throw error;
    }
  },

  getDetails: async (type, id) => {
    try {
      const response = await api.get(`/search/details/${type}/${id}`);
      return response;
    } catch (error) {
      console.error("Details API error:", error);
      throw error;
    }
  },

  getPhotocard: async (id) => {
    try {
      const response = await api.get(`/search/photocard/${id}`);
      return response;
    } catch (error) {
      console.error("Photocard API error:", error);
      throw error;
    }
  },
};

export const bindersAPI = {
  // Get all binders for user
  getBinders: async (userId) => {
    try {
      const response = await api.get(`/binders/user/${userId}`);
      return response;
    } catch (error) {
      console.error("Get binders error:", error);
      throw error;
    }
  },

  createBinder: async (binderData) => {
    try {
      const response = await api.post("/binders", binderData);
      return response;
    } catch (error) {
      console.error("Create binder error:", error);
      throw error;
    }
  },

  getBinder: async (binderId) => {
    try {
      const response = await api.get(`/binders/${binderId}`);
      return response;
    } catch (error) {
      console.error("Get binder error:", error);
      throw error;
    }
  },

  updateBinder: async (binderId, binderData) => {
    try {
      const response = await api.put(`/binders/${binderId}`, binderData);
      return response;
    } catch (error) {
      console.error("Update binder error:", error);
      throw error;
    }
  },
};

export const photocardsAPI = {
  getAllPhotocards: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/photocards?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error("Photocards API error:", error);
      throw error;
    }
  },

  getByArtist: async (artistId) => {
    try {
      const response = await api.get(`/photocards/artist/${artistId}`);
      return response;
    } catch (error) {
      console.error("Artist photocards error:", error);
      throw error;
    }
  },

  getByRelease: async (releaseId) => {
    try {
      const response = await api.get(`/photocards/release/${releaseId}`);
      return response;
    } catch (error) {
      console.error("Release photocards error:", error);
      throw error;
    }
  },
};

export const paymentsAPI = {
  processPayments: async (paymentIds, method) => {
    try {
      const response = await api.post("/payments/process", {
        paymentIds,
        method,
      });
      return response;
    } catch (error) {
      console.error("Payments API error:", error);
      throw error;
    }
  },

  getPaymentHistory: async (userId) => {
    try {
      const response = await api.get(`/payments/history/${userId}`);
      return response;
    } catch (error) {
      console.error("Payment history error:", error);
      throw error;
    }
  },
};

export const ratingsAPI = {
  getTopRatings: async (limit = 10) => {
    try {
      const response = await api.get(`/ratings/top?limit=${limit}`);
      return response;
    } catch (error) {
      console.error("Ratings API error:", error);
      throw error;
    }
  },

  submitRating: async (ratingData) => {
    try {
      const response = await api.post("/ratings", ratingData);
      return response;
    } catch (error) {
      console.error("Submit rating error:", error);
      throw error;
    }
  },

  getCollectorRatings: async (collectorId) => {
    try {
      const response = await api.get(`/ratings/collector/${collectorId}`);
      return response;
    } catch (error) {
      console.error("Collector ratings error:", error);
      throw error;
    }
  },
};

export const apiUtils = {
  checkHealth: async () => {
    try {
      const response = await api.get("/");
      return response;
    } catch (error) {
      console.error("Health check error:", error);
      return { success: false, error: "API offline" };
    }
  },

  testConnection: async () => {
    try {
      const response = await api.get("/test-db");
      return response;
    } catch (error) {
      console.error("DB test error:", error);
      return { success: false, error: "Database connection failed" };
    }
  },
};

export default api;
