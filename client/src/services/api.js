import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Adjunta el token automáticamente en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expiró en una request autenticada (401), limpia la sesión y redirige al login.
// Solo aplica cuando el request tenía un Bearer token — evita loops en login/register.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const teníaToken = !!error.config?.headers?.Authorization;
    if (error.response?.status === 401 && teníaToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login?expired=1';
    }
    return Promise.reject(error);
  }
);

export default api;
