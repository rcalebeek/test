import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Operator } from '@/types/database'

interface AuthState {
  user: Operator | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  setUser: (user: Operator | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  login: async (email: string, password: string) => {
    const supabase = createClient()
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ error: error.message, isLoading: false })
        return false
      }

      if (data.user) {
        // Get operator profile
        const { data: operator, error: operatorError } = await supabase
          .from('operators')
          .select('*')
          .eq('user_id', data.user.id)
          .single()

        if (operatorError || !operator) {
          set({ error: 'Operator profiel niet gevonden', isLoading: false })
          return false
        }

        set({ user: operator, isAuthenticated: true, isLoading: false })
        return true
      }

      set({ isLoading: false })
      return false
    } catch (err) {
      set({ error: 'Er is een fout opgetreden', isLoading: false })
      return false
    }
  },

  logout: async () => {
    const supabase = createClient()
    set({ isLoading: true })

    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  checkSession: async () => {
    const supabase = createClient()
    set({ isLoading: true })

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: operator } = await supabase
          .from('operators')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (operator) {
          set({ user: operator, isAuthenticated: true, isLoading: false })
          return
        }
      }

      set({ user: null, isAuthenticated: false, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
