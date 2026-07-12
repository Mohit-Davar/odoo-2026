import { create } from "zustand";
import axiosInstance, { setAccessToken, getAccessToken } from "../lib/axiosInstance.js";
import { persist } from "zustand/middleware";

// Track whether session restoration has completed
let sessionRestored = false;
let sessionRestorePromise = null;

export const waitForSession = () => sessionRestorePromise;
export const isSessionRestored = () => sessionRestored;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      pendingEmail: null,
      pendingAction: null,

      restoreSession: async () => {
        // Prevent duplicate restore calls
        if (sessionRestorePromise) {
          return sessionRestorePromise;
        }

        sessionRestorePromise = (async () => {
          try {
            const res = await axiosInstance.get("/auth/refresh");
            const accessToken = res.data.accessToken;
            setAccessToken(accessToken);

            const userRes = await axiosInstance.get("/auth/me");
            set({ user: userRes.data, loading: false });
          } catch (error) {
            // Silent fail - no active session is expected when user is logged out
            setAccessToken(null);
            set({ user: null, loading: false });
            // Only log if it's not a 401 (unauthorized) error
            if (error.response?.status !== 401 && error.response?.status !== 403) {
              console.error("Session restore failed:", error.message);
            }
          } finally {
            sessionRestored = true;
          }
        })();

        return sessionRestorePromise;
      },

      login: async (email, password) => {
        try {
          const res = await axiosInstance.post("/auth/login", {
            email,
            password,
          });
          set({ pendingEmail: email, pendingAction: "login" });
          return { ok: true, message: res.data.msg };
        } catch (err) {
          return {
            ok: false,
            message: err.response?.data?.msg || "Login failed",
          };
        }
      },

      verifyLoginOtp: async (otp) => {
        const email = get().pendingEmail;
        if (!email) return { ok: false, message: "No pending login" };
        try {
          const res = await axiosInstance.post("/auth/verify-login", {
            email,
            otp,
          });
          const accessToken = res.data.accessToken;
          setAccessToken(accessToken);
          const userRes = await axiosInstance.get("/auth/me");
          set({ user: userRes.data, pendingEmail: null, pendingAction: null });
          return { ok: true, message: "Login successful" };
        } catch (err) {
          return {
            ok: false,
            message: err.response?.data?.msg || "OTP verification failed",
          };
        }
      },

      register: async (name, email, password) => {
        try {
          const res = await axiosInstance.post("/auth/register", {
            name,
            email,
            password,
          });
          set({ pendingEmail: email, pendingAction: "register" });
          return { ok: true, message: res.data.msg };
        } catch (err) {
          return {
            ok: false,
            message: err.response?.data?.msg || "Registration failed",
          };
        }
      },

      verifyRegisterOtp: async (otp) => {
        const email = get().pendingEmail;
        if (!email) return { ok: false, message: "No pending registration" };
        try {
          const res = await axiosInstance.post("/auth/verify-register", {
            email,
            otp,
          });
          const accessToken = res.data.accessToken;
          setAccessToken(accessToken);

          const userRes = await axiosInstance.get("/auth/me");
          set({ user: userRes.data, pendingEmail: null, pendingAction: null });
          return {
            ok: true,
            message: res.data.msg || "Registered Successfully",
          };
        } catch (err) {
          return {
            ok: false,
            message: err.response?.data?.msg || "OTP verification failed",
          };
        }
      },

      resendOtp: async () => {
        const email = get().pendingEmail;
        const purpose = get().pendingAction;
        console.log(email, purpose);
        if (!email || !purpose)
          return {
            ok: false,
            msg: "No pending OTP actions",
          };

        try {
          const res = await axiosInstance.post("/auth/resend-otp", {
            email,
            purpose,
          });
          return { ok: true, msg: res.data.msg };
        } catch (err) {
          return {
            ok: false,
            msg: err.response?.data?.msg || "Failed to resend OTP",
          };
        }
      },

      getOtpCooldown: async () => {
        const email = get().pendingEmail;
        const purpose = get().pendingAction;
        if (!email || !purpose) return 0;
        try {
          const res = await axiosInstance.get("/auth/otp-cooldown", {
            params: { email, purpose },
          });
          return res.data.remaining;
        } catch (err) {
          return 0;
        }
      },

      logout: async () => {
        await axiosInstance.post("/auth/logout");
        set({ user: null });
        setAccessToken(null);
        // Reset session restore state so next login can restore properly
        sessionRestored = false;
        sessionRestorePromise = null;
      },
    }),
    {
      name: "auth-storage", // key in localStorage
      partialize: (state) => ({
        pendingEmail: state.pendingEmail,
        pendingAction: state.pendingAction,
      }),
    }
  )
);
