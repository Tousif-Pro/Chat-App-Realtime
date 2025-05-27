// src/lib/axios.js
import axios from 'axios';

// Determine the correct base URL based on environment
const getBaseURL = () => {
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:5002/api';  // localhost with /api
  }
  return import.meta.env.VITE_API_URL || 'https://chat-app-realtime-2.onrender.com/api/auth'; // Ensure /api is included
};

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL + config.url); // This will show the full URL
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

console.log("Current Base URL:", getBaseURL());