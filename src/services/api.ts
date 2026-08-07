import axios from 'axios';
import { getToken } from '../utils/authStorage';

// Create an Axios instance
// In local dev and production, the API is served from the same origin on `/api`
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global API errors here (e.g., 401 Unauthorized)
    return Promise.reject(error);
  }
);

export default api;
