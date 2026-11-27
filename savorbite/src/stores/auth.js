import { defineStore } from 'pinia'
import { http, setAuthToken, clearAuthToken } from '@/services/http'

const AUTH_USER_KEY = 'savorbite_auth'
const AUTH_TOKEN_KEY = 'savorbite_auth_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    // True while the app is restoring the session (reading storage + calling
    // /auth/me). While true, route guards must not redirect to login.
    rehydrating: false,
    // True once restore() has finished (successfully or not).
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => state.user?.name || 'Guest',
  },
  actions: {
    async restore() {
      this.rehydrating = true
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY)
        const raw = localStorage.getItem(AUTH_USER_KEY)

        if (token) {
          // Rehydrate from the server so the session is validated (and
          // refreshed against Supabase) rather than trusted blindly.
          try {
            await this.fetchMe()
          } catch {
            // Token invalid/expired — clear everything so the UI shows login.
            this.user = null
            clearAuthToken()
            try {
              localStorage.removeItem(AUTH_USER_KEY)
              localStorage.removeItem(AUTH_TOKEN_KEY)
            } catch {
              /* ignore */
            }
          }
        } else if (raw) {
          // No token but a persisted user object: trust it for the shell, but
          // mark as not fully authenticated until a token exists.
          try {
            const parsed = JSON.parse(raw)
            if (parsed) this.user = parsed
          } catch {
            this.user = null
          }
        }
      } catch {
        this.user = null
      } finally {
        this.rehydrating = false
        this.initialized = true
      }
    },
    persist(user, token) {
      this.user = user || null
      if (token) setAuthToken(token)
      try {
        if (user) {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
        } else {
          localStorage.removeItem(AUTH_USER_KEY)
        }
      } catch {
        /* ignore */
      }
    },
    async fetchMe() {
      const { user } = await http.get('/auth/me')
      this.persist(user)
      return user
    },
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const { user, session } = await http.post('/auth/login', { email, password })
        this.persist(user, session?.access_token)
        return user
      } catch (e) {
        this.error = e.message || 'Login failed. Please check your credentials.'
        throw e
      } finally {
        this.loading = false
      }
    },
    async register(name, email, password, phone) {
      this.loading = true
      this.error = null
      try {
        const { user, session } = await http.post('/auth/register', { name, email, password, phone })
        this.persist(user, session?.access_token)
        return user
      } catch (e) {
        this.error = e.message || 'Registration failed. Please try again.'
        throw e
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.user = null
      clearAuthToken()
      try {
        localStorage.removeItem(AUTH_USER_KEY)
        localStorage.removeItem(AUTH_TOKEN_KEY)
      } catch {
        /* ignore */
      }
    },
  },
})
