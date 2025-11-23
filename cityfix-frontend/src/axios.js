import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor para agregar el token en TODAS las requests
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

// ✅ Manejo global de respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Ver si estamos en la pantalla de login
    const isLoginPage = window.location.pathname === "/login";

    if (status === 401 && !isLoginPage) {
      // Si el usuario está navegando normal → cerrar sesión
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.warn("Sesión expirada o token inválido.");
    }

    // ⚠️ NO redirigir ni refrescar en login
    // React maneja el error y lo muestra sin refresh
    return Promise.reject(error);
  }
);

export default api;
