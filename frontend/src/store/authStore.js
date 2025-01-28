import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isLoading: true,
    isSigningUp: false,
    isLoggingIn: false,

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isLoading: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/register", data);
            console.log("API yanıtı:", res);
            set({
                authUser: res.data.user,
                isSigningUp: false
            });
            toast.success("Account created successfully!");
            return true;
        } catch (error) {
            console.error("Signup error:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Signup failed");
            set({ isSigningUp: false });
            return false;
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data.user });
            toast.success("Logged in successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully!");
        } catch (error) {
            toast.error(error.response.data.message || "Logout failed.");
        }
    },
}));
