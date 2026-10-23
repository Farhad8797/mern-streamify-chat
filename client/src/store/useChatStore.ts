import { create } from "zustand";
import axiosInstance from "../lib/axios";

interface useChatStoreInterface {
  allContacts: any[];
  isLoadingContacts: boolean;
  loadContacts: () => Promise<any>;
  allChats: any[];
  isLoadingChats: boolean;
  loadChats: () => Promise<any>;
  allChatMessages: any[];
  isLoadingChatMessages: boolean;
  loadChatMessages: () => Promise<any>;
  activeTab: string;
  selectedUser: any;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  setActiveTab: (tab: string) => void;
}

const useChatStore = create<useChatStoreInterface>((set, get) => ({
  allChats: [],
  isLoadingChats: false,
  isLoadingContacts: false,
  isLoadingChatMessages: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  allContacts: [],
  allChatMessages: [],
  activeTab: "chats",
  selectedUser: null,
  toggleSound: () => {
    localStorage.setItem(
      "isSoundEnabled",
      JSON.stringify(!get().isSoundEnabled),
    );
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  loadChats: async () => {
    set({ isLoadingChats: true });
    try {
      const response = await axiosInstance.get("/get-chats");
      set({ allChats: response.data });
      return { ...response };
    } catch (err) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || {
        success: false,
        message: "Internal server error",
      };
      return { status, data: errorData };
    } finally {
      set({ isLoadingChats: false });
    }
  },

  loadContacts: async () => {
    set({ isLoadingContacts: true });
    try {
      const response = await axiosInstance.get("/get-contacts");
      set({ allContacts: response.data });
      return { ...response };
    } catch (err) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || {
        success: false,
        message: "Internal server error",
      };
      return { status, data: errorData };
    } finally {
      set({ isLoadingContacts: false });
    }
  },

  loadChatMessages: async () => {
    set({ isLoadingChatMessages: true });
    try {
      const response = await axiosInstance.get(
        "/get-chat-messages{/:receiverId}",
      );
      set({ allChatMessages: response.data });
      return { ...response };
    } catch (err) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || {
        success: false,
        message: "Internal server error",
      };
      return { status, data: errorData };
    } finally {
      set({ isLoadingChatMessages: false });
    }
  },
}));

export default useChatStore;
