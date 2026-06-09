import { create } from "zustand";
import { apiFetch } from "@/utils/api";

interface AuthStore {
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isCheckingSession: true,

  checkSession: async () => {
    try {
      const response = await apiFetch("/api/legacy/auth/session");
      const data = (await response.json()) as { authenticated?: boolean };
      set({
        isAuthenticated: Boolean(data.authenticated),
        isCheckingSession: false,
      });
    } catch {
      set({ isAuthenticated: false, isCheckingSession: false });
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiFetch("/api/legacy/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        set({ isAuthenticated: false, isCheckingSession: false });
        return false;
      }

      set({ isAuthenticated: true, isCheckingSession: false });
      return true;
    } catch {
      set({ isAuthenticated: false, isCheckingSession: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await apiFetch("/api/legacy/auth/logout", { method: "POST" });
    } finally {
      set({ isAuthenticated: false, isCheckingSession: false });
    }
  },
}));
