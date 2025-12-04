import axios from "axios";

// Determine the correct API URL based on the environment (Vite handles import.meta.env)
const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://i-collect-mongodb-backend.vercel.app";

// 1. Create the base Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Add a request interceptor to attach the Authorization token
// This runs before every request is sent.
api.interceptors.request.use((config) => {
  // NOTE: In a Canvas environment, using Firestore for persistence is recommended
  // over localStorage, but keeping localStorage here to match your original structure.
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. API function exports grouped by domain
export const authAPI = {
  /**
   * Sends a login request with user credentials.
   * @param {object} credentials - { email, password }
   */
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  /**
   * Sends a registration request with new user data.
   * @param {object} userData - User registration details
   */
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
};

export const dashboardAPI = {
  /**
   * Fetches dashboard specific data for a user.
   * @param {string} userId - The ID of the user.
   */
  getDashboardData: async (userId) => {
    const response = await api.get(`/dashboard/${userId}`);
    return response.data;
  },
};

export const searchAPI = {
  /**
   * Performs a general search query.
   * @param {string} query - The search term.
   */
  search: async (query) => {
    // encodeURIComponent ensures the query string is correctly formatted
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  /**
   * Fetches detailed information for a specific item.
   * @param {string} type - The type of item (e.g., 'card', 'coin').
   * @param {string} id - The unique ID of the item.
   */
  getDetails: async (type, id) => {
    const response = await api.get(`/search/details/${type}/${id}`);
    return response.data;
  },
};

export const bindersAPI = {
  /**
   * Retrieves all collection binders for the authenticated user.
   */
  getBinders: async () => {
    const response = await api.get("/binders");
    return response.data;
  },
  // Add other binder functions like createBinder, deleteBinder, etc.
};

export const paymentsAPI = {
  /**
   * Sends a request to process specified payments.
   * @param {string[]} paymentIds - Array of payment IDs to process.
   * @param {string} method - The payment method to use.
   */
  processPayments: async (paymentIds, method) => {
    const response = await api.post("/payments/process", {
      paymentIds,
      method,
    });
    return response.data;
  },
};

export const ratingsAPI = {
  /**
   * Fetches the top-rated items.
   */
  getTopRatings: async () => {
    const response = await api.get("/ratings/top");
    return response.data;
  },
};

export default api;
