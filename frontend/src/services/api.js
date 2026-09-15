import axios from "axios";

// Use VITE_API_URL env var (set in Vercel/local .env), fallback to localhost for dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 120 seconds for long ML / streaming requests
});

// Request interceptor to attach JWT token (harmless when absent)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mindcare_token") || localStorage.getItem("access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — silently warn on 401, never redirect to /login (open access)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("API returned 401 — operating in guest/open-access mode.");
    }
    return Promise.reject(error);
  }
);

export default api;
