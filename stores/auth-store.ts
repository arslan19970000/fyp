"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserRole } from "@/models/user"

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
  shopName?: string
}

type State = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  hydrated: boolean
}

type Actions = {
  setAuth: (user: User, token: string) => void
  logout: () => void
  checkAuth: () => Promise<boolean>
  isAdmin: () => boolean
  isSeller: () => boolean
  isBuyer: () => boolean
  setHydrated: () => void
}

export const useAuth = create<State & Actions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hydrated: false,

      setHydrated: () => {
        set({ hydrated: true })
      },

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        // Clear the cookie
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ user: null, isAuthenticated: false })
          return false
        }

        try {
          const res = await fetch("/api/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (res.ok) {
            const user = await res.json()
            set({ user, isAuthenticated: true })
            return true
          } else {
            get().logout()
            return false
          }
        } catch (error) {
          get().logout()
          return false
        }
      },

      isAdmin: () => {
        const { user } = get()
        return user?.role === "admin"
      },

      isSeller: () => {
        const { user } = get()
        return user?.role === "seller"
      },

      isBuyer: () => {
        const { user } = get()
        return user?.role === "buyer"
      },
    }),
    {
      name: "ecommerce-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    },
  ),
)
