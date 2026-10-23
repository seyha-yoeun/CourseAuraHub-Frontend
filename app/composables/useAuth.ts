import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppToast } from '~/composables/useAppToast'

export interface User {
  userId: string
  email: string
  firstName: string
  lastName: string
  role: string
  provider: string
  avatar?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    accessToken: string | null
    refreshToken: string | null
    tokenType: string
    expiresIn: number
    userId: string
    email: string
    firstName: string
    lastName: string
    role: string
    provider: string
  }
  timestamp: string
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const { success, error } = useAppToast()

  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ROLE_ADMIN')
  const userName = computed(() => user.value ? `${user.value.firstName} ${user.value.lastName}` : '')
  const userInitials = computed(() => 
    user.value ? `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase() : 'U'
  )

  function setUser(userData: User) {
    user.value = userData
  }

  function clearAuth() {
    user.value = null
  }

  async function initializeAuth() {
    if (initialized.value) return
    
    try {
      await fetchUser()
    } catch {
      // Not authenticated, that's fine
    }
    initialized.value = true
  }

  async function fetchUser(): Promise<boolean> {
    try {
      const response = await $fetch<AuthResponse>('/api/auth/me')
      if (response.success && response.data) {
        setUser({
          userId: response.data.userId,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          provider: response.data.provider
        })
        return true
      }
    } catch {
      clearAuth()
    }
    return false
  }

  async function login(email: string, password: string, rememberMe = false) {
    loading.value = true
    try {
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password, rememberMe }
      })
      
      if (response.success && response.data) {
        setUser({
          userId: response.data.userId,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          provider: response.data.provider
        })
        success('Welcome Back!', `Hello ${response.data.firstName}`)
        
        const redirect = router.currentRoute.value.query.redirect as string || '/'
        await router.push(redirect)
        
        return response
      }
      throw new Error(response.message || 'Login failed')
    } catch (e: unknown) {
      const message = (e as { response?: { _data?: { message: string } } }).response?._data?.message 
        || (e as Error)?.message 
        || 'Invalid email or password'
      error('Login Failed', message)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(firstName: string, lastName: string, email: string, password: string) {
    loading.value = true
    try {
      const response = await $fetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: { firstName, lastName, email, password }
      })
      
      if (response.success && response.data) {
        setUser({
          userId: response.data.userId,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          provider: response.data.provider
        })
        success('Account Created!', `Welcome to CourseAuraHub, ${response.data.firstName}`)
        
        await router.push('/')
        
        return response
      }
      throw new Error(response.message || 'Registration failed')
    } catch (e: unknown) {
      const message = (e as { response?: { _data?: { message: string } } }).response?._data?.message 
        || (e as Error)?.message 
        || 'Registration failed'
      error('Registration Failed', message)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore logout API errors
    } finally {
      clearAuth()
      success('Logged Out', 'You have been successfully logged out')
      loading.value = false
      await router.push('/auth/login')
    }
  }

  function initiateOAuth2(provider: 'google' | 'github' | 'facebook') {
    const config = useRuntimeConfig()
    const frontendUrl = config.public.siteUrl || 'http://localhost:3000'
    // Use our Nuxt API callback endpoint as redirect_uri so it can set cookies
    const redirectUri = `${frontendUrl}/api/auth/callback`
    // Use our Nuxt API endpoint to properly handle CSRF and cookies
    window.location.href = `/api/auth/oauth2/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    isAdmin,
    userName,
    userInitials,
    setUser,
    clearAuth,
    initializeAuth,
    fetchUser,
    login,
    register,
    logout,
    initiateOAuth2
  }
})

export function useAuth() {
  return useAuthStore()
}