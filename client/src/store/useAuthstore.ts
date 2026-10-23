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
  isSendingForgotPassword: boolean;
  forgotPasswordResponse: {
    success: boolean;
    message: string;
    statusCode?: number;
  } | null;
  forgotPassword: (email: string) => Promise<any>;
  isVerifyingResetToken: boolean;
  verifyResetToken: (token: string) => Promise<any>;
  isUpdatingPassword: boolean;
  updatePassword: (
    password: string,
    confirmPassword: string,
    token: string,
  ) => Promise<any>;
  isSigningOut: boolean;
  signOut: () => Promise<any>;
}

const useAuthStore = create<authStoreInterface>((set) => ({
  authUser: null,
  isCheckingAuth: false,
  isSigningIn: false,
  isSigningUp: false,
  signUpResponse: null,
  isSendingForgotPassword: false,
  forgotPasswordResponse: null,
  isVerifyingResetToken: false,
  isUpdatingPassword: false,
  isSigningOut: false,

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

      const result = response.data;
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
          message: errorData.message || "Something went wrong.",
          statusCode: status,
        },
      });
      return { status, data: errorData };
    } finally {
      set({ isSigningUp: false });
    }
  },

  forgotPassword: async (email: string) => {
    set({ isSendingForgotPassword: true, forgotPasswordResponse: null });
    try {
      const response = await axiosInstance.post("/reset-password", { email });
      const result = response.data;

      const resPayload = {
        success: result.success ?? true,
        message: result.message || "Recovery email sent successfully.",
        statusCode: response.status,
      };

      set({ forgotPasswordResponse: resPayload });
      return { status: response.status, data: result };
    } catch (err: any) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || {
        success: false,
        message: "Internal server error",
      };

      const resPayload = {
        success: false,
        message: errorData.message || "Something went wrong",
        statusCode: status,
      };

      set({ forgotPasswordResponse: resPayload });
      return { status, data: errorData };
    } finally {
      set({ isSendingForgotPassword: false });
    }
  },

  verifyResetToken: async (token: string) => {
    set({ isVerifyingResetToken: true });
    try {
      const response = await axiosInstance.get(
        `/verify-reset-password-email?token=${token}`,
      );
      return { status: response.status, data: response.data };
    } catch (err: any) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || {
        success: false,
        message: "Internal server error",
      };
      return { status, data: errorData };
    } finally {
      set({ isVerifyingResetToken: false });
    }
  },

  updatePassword: async (
    password: string,
    confirmPassword: string,
    token: string,
  ) => {
    set({ isUpdatingPassword: true });
    try {
      const response = await axiosInstance.post(
        `/update-password?token=${token}`,
        { password, confirmPassword },
      );
      return { status: response.status, data: response.data };
    } catch (err: any) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || {
        success: false,
        message: "Internal server error",
      };
      return { status, data: errorData };
    } finally {
      set({ isUpdatingPassword: false });
    }
  },

  signOut: async () => {
    set({ isSigningOut: false });
    try {
      const response = await axiosInstance.post("/sign-out");
      return { ...response };
    } catch (err) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || {
        success: false,
        message: "Internal server error",
      };
      return { status, data: errorData };
    } finally {
      set({ isSigningOut: false });
    }
  },
}));

export default useAuthStore;
