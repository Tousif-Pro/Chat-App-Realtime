// store/useAuthStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5003" 
  : "https://chat-app-realtime-2.onrender.com";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      console.log("🔍 Checking authentication status...");
      console.log("🍪 Current cookies:", document.cookie);
      
      const res = await axiosInstance.get("/auth/check");
      
      console.log("✅ Auth check successful:", res.data.email);
      set({ authUser: res.data, isCheckingAuth: false });
      get().connectSocket();
      
    } catch (error) {
      console.log("❌ Auth check failed:", error.response?.status, error.response?.data);
      
      // Clear auth state completely
      set({ 
        authUser: null, 
        isCheckingAuth: false 
      });
      
      // Clear any stored auth data
      localStorage.removeItem('auth-storage');
      
      // Disconnect socket
      get().disconnectSocket();
      
      // Redirect to login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        console.log("🔄 Redirecting to login...");
        window.location.href = '/login';
      }
    }
  },

  // Rest of your store methods...
  // Make sure login/signup set cookies properly
  
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      console.log("🔑 Logging in user:", data.email);
      const res = await axiosInstance.post("/auth/login", data);
      
      console.log("✅ Login successful");
      console.log("🍪 Cookies after login:", document.cookie);
      
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
      console.error("❌ Login error:", errorMessage);
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      console.log("👋 Logging out user...");
      await axiosInstance.post("/auth/logout");
      
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
      
      // Clear any stored data
      localStorage.removeItem('auth-storage');
      
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force logout even if API call fails
      set({ authUser: null });
      get().disconnectSocket();
      localStorage.removeItem('auth-storage');
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      console.log("📸 Updating profile...");
      const res = await axiosInstance.put("/auth/update-profile", data);
      
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Profile update failed";
      console.error("❌ Profile update error:", errorMessage);
      toast.error(errorMessage);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    console.log("🔌 Connecting to socket...");
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    
    socket.connect();
    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      console.log("👥 Online users updated:", userIds.length);
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    console.log("🔌 Disconnecting socket...");
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
    set({ socket: null });
  },
}));

  