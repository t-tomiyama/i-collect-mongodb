// src/config.js

const API_URL = import.meta.env.PROD
  ? "https://i-collect-mongodb-backend.vercel.app/"
  : "/api";

export default API_URL;
