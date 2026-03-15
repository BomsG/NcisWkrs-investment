import { create } from "zustand";

interface User {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  balance: number;
  activeInvestments: number;
  totalProfit: number;
  totalDeposits: number;
  referralCode?: string;
  referredBy?: string | null;
  role: "user" | "admin";
  createdAt: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  setUser: (user: User | null) => void;
  setAuthReady: (isReady: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthReady: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthReady: (isReady) => set({ isAuthReady: isReady }),
  logout: () => set({ isAuthenticated: false, user: null, isAuthReady: false }),
}));
