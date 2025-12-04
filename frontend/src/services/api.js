import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://i-collect-mongodb-backend.vercel.app";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post("/auth/login", data).then((res) => res.data),
  register: (data) => api.post("/auth/register", data).then((res) => res.data),
  getSocialMedias: () => api.get("/auth/social-medias").then((res) => res.data),
};
