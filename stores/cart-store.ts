"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  id: string
  title: string
  price: number
  quantity: number
  image?: string
}

type State = {
  items: CartItem[]
}

type Actions = {
  add: (item: CartItem) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
}

export const useCart = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const exists = get().items.find((i) => i.id === item.id)
        if (exists) {
          set({
            items: get().items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)),
          })
        } else {
          set({ items: [...get().items, item] })
        }
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      setQty: (id, qty) => set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)) }),
      clear: () => set({ items: [] }),
    }),
    { name: "ecommerce-cart" },
  ),
)

export const cartTotal = (items: CartItem[]) => items.reduce((sum, i) => sum + i.price * i.quantity, 0)
