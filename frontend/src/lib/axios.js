// STEP 1: Replace your lib/axios.js with this:
import axios from "axios";

const API_BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5003/api" 
  : "https://chat-app-realtime-2.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL!
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// STEP 2: Add this to your backend server.js (BEFORE your routes):
// import cors from 'cors';
// 
// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'http://localhost:3000', 
//     'https://your-frontend-domain.netlify.app', // Add your actual frontend domain
//   ],
//   credentials: true, // CRITICAL!
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
// }));

// STEP 3: In your auth controller, make sure cookies are set like this:
// res.cookie("jwt", token, {
//   maxAge: 15 * 24 * 60 * 60 * 1000,
//   httpOnly: true,
//   sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
//   secure: process.env.NODE_ENV === "production",
// });

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - redirecting to login');
      // Clear any auth state
      if (window.useAuthStore) {
        window.useAuthStore.getState().logout();
      }
      // Redirect if not on auth page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;