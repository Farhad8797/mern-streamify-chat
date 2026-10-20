import { create } from "zustand";
import axiosInstance from "../lib/axios";

interface authStoreInterface {
  authUser: any;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<any>;
  isSigningIn: boolean;
  isSigningUp: boolean;
  signUpResponse: {
    success: boolean;
    message: string;
    statusCode?: number;
  } | null;
  signUp: (formData: FormData) => Promise<any>;
}

const useAuthStore = create<authStoreInterface>((set) => ({
  authUser: null,
  isCheckingAuth: false,
  isSigningIn: false,
  isSigningUp: false,
  signUpResponse: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const authenTicatedUser = await axiosInstance.get("/auth-check");
      set({ authUser: authenTicatedUser });
    } catch (err: any) {
      set({ authUser: null });
      console.log(`Error finding user: ${err}`);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (formData: FormData) => {
    set({ isSigningUp: true, signUpResponse: null });
    try {
      const response = await axiosInstance.post("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = response.data; // Assumes backend sends { statusCode, message, success, data }
      set({ signUpResponse: { ...result, statusCode: response.status } });
      return { status: response.status, data: result };
    } catch (err: any) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || {
        success: false,
        message: "Internal server error",
      };

      set({
        signUpResponse: {
          success: false,
          message: errorData.message || "Something went wrong",
          statusCode: status,
        },
      });
      return { status, data: errorData };
    } finally {
      set({ isSigningUp: false });
    }
  },
}));

export default useAuthStore;
