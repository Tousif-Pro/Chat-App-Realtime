import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// Socket base URL
const SOCKET_URL = 'https://chat-app-realtime-2.onrender.com/api';

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/api/auth/signup', data);
      set({ authUser: res.data });
      toast.success('Account created successfully');
      get().connectSocket();
    } catch (error) {
      const msg = error.response?.data?.message || 'Signup failed';
      toast.error(msg);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/api/auth/login', data);
      set({ authUser: res.data });
      toast.success('Logged in successfully');
      get().connectSocket();
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const socketConnection = io(SOCKET_URL, {
      query: { userId: authUser._id },
      withCredentials: true,
    });

    socketConnection.connect();

    set({ socket: socketConnection });

    socketConnection.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
