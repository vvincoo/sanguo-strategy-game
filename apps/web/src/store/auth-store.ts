'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, AuthResult, LoginPayload, RegisterPayload } from '../lib/auth-api';

interface AuthState {
  token: string | null;
  user: AuthResult['user'] | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      async login(payload) {
        const result = await authApi.login(payload);
        set({ token: result.accessToken, user: result.user });
      },
      async register(payload) {
        const result = await authApi.register(payload);
        set({ token: result.accessToken, user: result.user });
      },
      logout() {
        set({ token: null, user: null });
      }
    }),
    {
      name: 'war-auth-storage'
    }
  )
);
