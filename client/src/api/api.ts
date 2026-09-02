import axios from "axios";
import { useError } from "../context/ErrorContext";

// Base URL from .env or fallback
const rawBase = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase.replace(/\/+$/, "")}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor: attach token dynamically from localStorage
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

// Response interceptor: extract and format error messages cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hook to access API and optionally integrate with ErrorContext
export const useApi = () => {
  const { setErrors } = useError();

  const handleApiError = (error: any, fallbackMessage = "An unexpected error occurred.") => {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data;
      if (Array.isArray(data.errors)) {
        setErrors(data.errors);
      } else if (typeof data.message === "string") {
        setErrors([data.message]);
      } else {
        setErrors([fallbackMessage]);
      }
    } else if (error.message) {
      setErrors([error.message]);
    } else {
      setErrors([fallbackMessage]);
    }
  };

  return Object.assign(api, { handleApiError });
};

export { API_BASE };
export default api;
