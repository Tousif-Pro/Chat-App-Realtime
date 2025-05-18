import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from 'react-toastify';
import { io } from "socket.io-client"

const BASE_URL = "http://localhost:5002"

export const useAuthStore = create((set,get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    error: null,
     onlineUsers :[],
   socket:null,
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data.user, error: null });
            get().connectSocket();
        } catch (error) {
            // Don't set error for 401 during checkAuth as it's expected when not logged in
            if (error.response?.status !== 401) {
                set({ error: error.response?.data?.message || "An error occurred" });
            }
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    login: async (email, password) => {
        set({ isLoggingIn: true, error: null });
        try {
            const res = await axiosInstance.post("/auth/login", { email, password });
            set({ authUser: res.data, error: null });
            toast.success("Logged in successfully");

            get().connectSocket();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed";
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isLoggingIn: false });
        }
    },

    signup: async (userData) => {
        set({ isSigningUp: true, error: null });
        try {
            const res = await axiosInstance.post("/auth/signup", userData);
            set({ authUser: res.data, error: null });
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Signup failed";
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null, error: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Logout failed";
            set({ error: errorMessage });
            toast.error(errorMessage);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("profile updated successfully");
            return res.data;
        } catch (error) {
            console.log("Error in update profile:", error);
            toast.error(error.response.data.message)
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    clearError: () => set({ error: null }),

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || (get().socket && get().socket.connected)) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            }
        });
        set({ socket });
        socket.connect();

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },
    
    disconnectSocket: () =>{
        const { socket } = get()
        if (socket) {
            socket.disconnect()
            set({ socket: null })
        }
    },
}));


export const useSocketConnectionCheck = () => {
    const { socket, authUser } = useAuthStore();
    
    useEffect(() => {
      if (!socket && authUser?._id) {
        console.log("Socket not connected, reconnecting...");
        useAuthStore.getState().connectSocket(authUser._id);
      }
      
      // Verify socket is connected
      if (socket && !socket.connected && authUser?._id) {
        console.log("Socket disconnected, reconnecting...");
        socket.connect();
      }
      
      // Set up disconnect handler
      if (socket) {
        socket.on("disconnect", () => {
          console.log("Socket disconnected unexpectedly");
          if (authUser?._id) {
            setTimeout(() => {
              console.log("Attempting reconnection...");
              socket.connect();
            }, 1000);
          }
        });
      }
      
      return () => {
        if (socket) {
          socket.off("disconnect");
        }
      };
    }, [socket, authUser]);
  };