// store/useChatStore.js
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
      console.log('🔍 Fetching users for sidebar...');
      const res = await axiosInstance.get("/messages/users");
      
      console.log('✅ Users fetched successfully:', res.data.length, 'users');
      set({ users: res.data });
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         error.message || 
                         'Failed to fetch users';
      
      toast.error(errorMessage);
      set({ users: [] });
      
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      console.log('💬 Fetching messages for user:', userId);
      const res = await axiosInstance.get(`/messages/${userId}`);
      
      console.log('✅ Messages fetched:', res.data.length, 'messages');
      set({ messages: res.data });
      
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         'Failed to fetch messages';
      
      toast.error(errorMessage);
      set({ messages: [] });
      
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      console.log('📤 Sending message to:', selectedUser.fullName);
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      
      console.log('✅ Message sent successfully');
      set({ messages: [...messages, res.data] });
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         'Failed to send message';
      
      toast.error(errorMessage);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    console.log('🔔 Subscribing to messages for:', selectedUser.fullName);

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      console.log('📨 New message received:', newMessage);
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      console.log('🔕 Unsubscribing from messages');
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => {
    console.log('👤 Selected user:', selectedUser?.fullName);
    set({ selectedUser });
  },

  // Clear all data (useful for logout)
  clearChatData: () => {
    set({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
    });
  },
}));