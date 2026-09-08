import axios from "axios";
import { useError } from "../context/ErrorContext";

// Base URL from .env or fallback
<<<<<<< HEAD
const rawBase = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase.replace(/\/+$/, "")}/api`;
=======
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
<<<<<<< HEAD
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
=======
});

// Request interceptor → attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hook to inject global error handling
export const useApi = () => {
  const { setErrors } = useError();

  api.interceptors.response.use(
    (response) => {
      setErrors([]); // clear errors on success
      return response;
    },
    (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        if (Array.isArray(data.errors)) {
          setErrors(data.errors);
        } else if (typeof data.message === "string") {
          setErrors([data.message]);
        } else {
          setErrors(["An unexpected server error occurred."]);
        }
      } else {
        setErrors(["Network error. Please check your connection."]);
      }
      return Promise.reject(error);
    }
  );

  return api;
};

>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
export default api;
