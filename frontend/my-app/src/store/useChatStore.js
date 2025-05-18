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
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();
    
    // Create a temporary message with local ID
    const tempMessage = {
      ...messageData,
      _id: `temp-${Date.now()}`,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      createdAt: new Date().toISOString()
    };
    
    // Update UI immediately with temp message
    set({ messages: [...messages, tempMessage] });
    
    try {
      // Send to server
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const newMessage = res.data;
      
      // Replace temp message with real one from server
      set({ 
        messages: messages
          .filter(msg => msg._id !== tempMessage._id)
          .concat(newMessage)
      });
      
    } catch (error) {
      // Remove temp message on error
      set({ 
        messages: messages.filter(msg => msg._id !== tempMessage._id)
      });
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },
  
  addNewMessage: (message) => {
    const { messages, selectedUser } = get();
    const { authUser } = useAuthStore.getState();
    
    // Check if this message relates to current chat
    if (selectedUser && 
        ((message.senderId === selectedUser._id && message.receiverId === authUser._id) || 
         (message.senderId === authUser._id && message.receiverId === selectedUser._id))) {
      
      // Check if message already exists to prevent duplicates
      const exists = messages.some(m => m._id === message._id);
      if (!exists) {
        set({ messages: [...messages, message] });
        console.log("Message added to state:", message);
      }
    }
  },
  
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));