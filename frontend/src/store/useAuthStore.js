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
      const res = await axiosInstance.get("/auth/check");
      
      console.log("✅ Auth check successful:", res.data.email);
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("❌ Auth check failed:", error.response?.data?.error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      console.log("👤 Signing up user:", data.email);
      const res = await axiosInstance.post("/auth/signup", data);
      
      console.log("✅ Signup successful");
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Signup failed";
      console.error("❌ Signup error:", errorMessage);
      toast.error(errorMessage);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      console.log("🔑 Logging in user:", data.email);
      const res = await axiosInstance.post("/auth/login", data);
      
      console.log("✅ Login successful");
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
    } catch (error) {
      console.error("❌ Logout error:", error);
      toast.error("Logout failed");
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

  