// lib/axios.js - Fixed with proper token handling
import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:5003/api';
  }
  
  let prodUrl = import.meta.env.VITE_API_URL || 'https://chat-app-realtime-2.onrender.com';
  if (!prodUrl.endsWith('/api')) {
    prodUrl += '/api';
  }
  return prodUrl;
};

const baseURL = getBaseURL();
console.log('🔧 Axios Base URL:', baseURL);

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - THIS IS THE KEY FIX
axiosInstance.interceptors.request.use(
  (config) => {
    const fullUrl = config.baseURL + config.url;
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to:`, fullUrl);
    
    // Get token from localStorage (adjust this based on how you store the token)
    const token = localStorage.getItem('chat-token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('token');
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token added to request');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    
    if (config.data) {
      console.log('📤 Request data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Response interceptor error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });

    // Handle 401 errors specifically
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized - Token may be invalid or expired');
      // Clear invalid token
      localStorage.removeItem('chat-token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      
      // Redirect to login (adjust based on your routing)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    
    // Handle other specific error cases
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout - server may be slow to respond');
    } else if (error.response?.status === 404) {
      console.error('❌ 404 - Endpoint not found. Check your API routes.');
    } else if (error.response?.status === 500) {
      console.error('❌ 500 - Server error. Check server logs.');
    } else if (!error.response) {
      console.error('❌ Network error - cannot reach server');
    }

    return Promise.reject(error);
  }
);

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🧪 Testing API connection...');
    const response = await axiosInstance.get('/test');
    console.log('✅ API connection test successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API connection test failed:', error.message);
    return false;
  }
};