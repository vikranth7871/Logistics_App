import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import apiClient from '@api/client';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string>;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set((state) => { state.isLoading = true; });
        try {
          const response = await apiClient.post('/auth/login', { email, password });
          const { access_token, refresh_token, user } = response.data.data;

          set((state) => {
            state.accessToken = access_token;
            state.refreshToken = refresh_token;
            state.user = user;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } catch (err) {
          set((state) => { state.isLoading = false; });
          throw err;
        }
      },

      logout: () => {
        const token = get().accessToken;
        if (token) {
          // Fire-and-forget logout — don't await
          apiClient.post('/auth/logout').catch(() => {});
        }
        set((state) => {
          state.accessToken = null;
          state.refreshToken = null;
          state.user = null;
          state.isAuthenticated = false;
        });
      },

      refreshAccessToken: async (): Promise<string> => {
        const { refreshToken, user } = get();
        if (!refreshToken || !user) {
          throw new Error('No refresh token available');
        }

        const response = await apiClient.post('/auth/refresh', {
          userId: user.id,
          refreshToken,
        });

        const { access_token, refresh_token } = response.data.data;

        set((state) => {
          state.accessToken = access_token;
          state.refreshToken = refresh_token;
        });

        return access_token;
      },

      setUser: (user: AuthUser) => {
        set((state) => { state.user = user; });
      },
    })),
    {
      name: 'lorry-erp-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
