import { create } from "zustand";
import axiosInstance from "../lib/axios";
import useAuthStore from "./useAuthstore";

interface useChatStoreInterface {
  allContacts: any[];
  isLoadingContacts: boolean;
  loadContacts: () => Promise<any>;
  allChats: any[];
  isLoadingChats: boolean;
  loadChats: () => Promise<any>;
  allChatMessages: any[];
  isLoadingChatMessages: boolean;
  loadChatMessages: (receiverId: string) => Promise<any>;
  activeTab: string;
  selectedUser: any;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  setActiveTab: (tab: string) => void;
  isSendingMessage: boolean;
  sendMessage: (receiverId: string, formData: FormData) => Promise<any>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
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
  isSendingMessage: false,
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
      set({ allChats: response.data.data });
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
      set({ allContacts: response.data.data });
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

  loadChatMessages: async (receiverId: string) => {
    set({ isLoadingChatMessages: true });
    try {
      const response = await axiosInstance.get(
        `/get-chat-messages/${receiverId}`,
      );
      set({ allChatMessages: response.data.data });
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

  sendMessage: async (receiverId: string, formData: FormData) => {
    set({ isSendingMessage: true });
    try {
      const response = await axiosInstance.post(
        `/send-message/${receiverId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const sentMessage = response.data.data;

      set((state) => ({
        allChatMessages: [...state.allChatMessages, sentMessage],
      }));

      return { success: true, data: sentMessage };
    } catch (err: any) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || {
        success: false,
        message: "Internal server error",
      };
      return { success: false, status, data: errorData };
    } finally {
      set({ isSendingMessage: false });
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (incomingMessage) => {
      const { selectedUser, allChatMessages } = get();

      const senderId = incomingMessage.sender?._id || incomingMessage.sender;
      const isOurActiveChat = selectedUser && senderId === selectedUser._id;
      console.log(isOurActiveChat, senderId, incomingMessage);
      if (isOurActiveChat) {
        set({
          allChatMessages: [...allChatMessages, incomingMessage],
        });
      }

      get().loadChats();
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
  },
}));

export default useChatStore;
