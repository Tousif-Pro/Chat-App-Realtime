import axios from "axios";

const API_BASE_URL = "https://chat-app-realtime-2.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add this request interceptor to debug
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('🚀 Making request to:', config.url);
    console.log('🍪 WithCredentials:', config.withCredentials);
    console.log('🍪 Document cookies:', document.cookie);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Request failed:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔒 401 Error - Not authenticated');
      // Redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;