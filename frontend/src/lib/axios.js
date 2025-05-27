import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:5002/api'; // local with /api
  }
  // ensure /api is appended even if VITE_API_URL doesn't have it
  let prodUrl = import.meta.env.VITE_API_URL || 'https://chat-app-realtime-2.onrender.com';
  if (!prodUrl.endsWith('/api')) {
    prodUrl += '/api';
  }
  return prodUrl;
};

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request URL:', config.baseURL + config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
