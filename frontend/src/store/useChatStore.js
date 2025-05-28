// store/useChatStore.js - Fixed version
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      console.log('🔍 Fetching users...');
      const res = await axiosInstance.get("/messages/users");
      console.log('✅ Users fetched successfully:', res.data);
      set({ users: res.data });
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      
      // Better error handling
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch users';
      
      toast.error(errorMessage);
      
      // If it's a 401 error, clear users
      if (error.response?.status === 401) {
        set({ users: [] });
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      console.log('💬 Fetching messages for user:', userId);
      const res = await axiosInstance.get(`/messages/${userId}`);
      console.log('✅ Messages fetched successfully:', res.data);
      set({ messages: res.data });
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch messages';
      
      toast.error(errorMessage);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      console.log('📤 Sending message:', messageData);
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      console.log('✅ Message sent successfully:', res.data);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to send message';
      
      toast.error(errorMessage);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));