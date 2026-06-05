import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ADMIN_EMAIL = 'admin@pucminas.br'
const ADMIN_PASSWORD = 'admin123'

interface AuthStore {
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,

      login: (email, password) => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          set({ isAuthenticated: true })
          return true
        }
        return false
      },

      logout: () => set({ isAuthenticated: false }),
    }),
    { name: 'painel-puc-auth' }
  )
)
