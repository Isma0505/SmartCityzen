import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Page = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'dashboard-warga' 
  | 'buat-laporan'
  | 'analisis'
  | 'peta'
  | 'dashboard-pemerintah'
  | 'tracking'
  | 'statistik'
  | 'profil'
  | 'report-detail';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'WARGA' | 'ADMIN';
  avatar?: string;
  points: number;
}

interface StoreState {
  // Navigation
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  previousPage: Page | null;
  navigateTo: (page: Page) => void;

  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Selected Report
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;

  // Analysis result
  analysisResult: any | null;
  setAnalysisResult: (result: any | null) => void;

  // Notifications
  unreadCount: number;
  setUnreadCount: (count: number) => void;

  // Refresh triggers
  refreshReports: number;
  triggerRefreshReports: () => void;
  refreshNotifications: number;
  triggerRefreshNotifications: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentPage: 'landing',
      setCurrentPage: (page) => set({ currentPage: page }),
      previousPage: null,
      navigateTo: (page) => set({ previousPage: get().currentPage, currentPage: page }),

      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, currentPage: 'landing', selectedReportId: null, analysisResult: null }),

      selectedReportId: null,
      setSelectedReportId: (id) => set({ selectedReportId: id }),

      analysisResult: null,
      setAnalysisResult: (result) => set({ analysisResult: result }),

      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),

      refreshReports: 0,
      triggerRefreshReports: () => set((s) => ({ refreshReports: s.refreshReports + 1 })),
      refreshNotifications: 0,
      triggerRefreshNotifications: () => set((s) => ({ refreshNotifications: s.refreshNotifications + 1 })),
    }),
    {
      name: 'smartcityzen-storage',
      partialize: (state) => ({
        user: state.user,
        currentPage: state.currentPage,
      }),
    }
  )
);