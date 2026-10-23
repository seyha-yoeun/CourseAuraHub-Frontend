import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppToast } from '~/composables/useAppToast'
import { ApiError, toApiError } from '~/utils/apiError'
import {
  clearPendingOAuth,
  getPendingRedirect,
  getSafeRedirect,
  rememberOAuthProvider,
  rememberPendingRedirect,
  type OAuthProvider,
} from '~/utils/authRedirect'

export interface AuthUser {
  userId: string
  email: string
  firstName: string
  lastName: string
  role: string
  provider: string
  avatar?: string
}

export type User = AuthUser

const ADMIN_ROLE = 'ROLE_ADMIN'

function getDefaultAvatar(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed || 'CourseAura')}&backgroundColor=b6e3f4`
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const { success, warning } = useAppToast()

  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const initializing = ref<Promise<void> | null>(null)
  const initializationError = ref<string | null>(null)
  const lastError = ref<ApiError | null>(null)
  const hadSession = ref(false)
  const sessionExpired = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value))
  const isAdmin = computed(() => user.value?.role === ADMIN_ROLE)

  const userName = computed(() => {
    if (!user.value) return ''
    const fullName = [user.value.firstName, user.value.lastName]
      .map(part => part?.trim())
      .filter(Boolean)
      .join(' ')

    return fullName || user.value.email || 'Account'
  })

  const userEmail = computed(() => user.value?.email || '')

  const userInitials = computed(() => {
    const first = user.value?.firstName?.trim().charAt(0) || ''
    const last = user.value?.lastName?.trim().charAt(0) || ''
    const initials = `${first}${last}`.toUpperCase()

    return initials || user.value?.email?.charAt(0).toUpperCase() || 'U'
  })

  const userAvatar = computed(() => {
    if (user.value?.avatar) return user.value.avatar
    return getDefaultAvatar(user.value?.email || userName.value)
  })

  const roleLabel = computed(() => {
    switch (user.value?.role) {
      case 'ROLE_ADMIN':
        return 'Platform Administrator'
      case 'ROLE_INSTRUCTOR':
        return 'Instructor'
      case 'ROLE_USER':
        return 'Student'
      default:
        return user.value?.role || 'Member'
    }
  })

  const homeRoute = computed(() => isAdmin.value ? '/' : '/courses')

  function setUser(userData: AuthUser) {
    user.value = userData
    lastError.value = null
    sessionExpired.value = false
    hadSession.value = true
  }

  function updateUser(patch: Partial<AuthUser>) {
    if (!user.value) return
    user.value = { ...user.value, ...patch }
  }

  function setProfile(profile: { name?: string; email?: string; role?: string; avatar?: string }) {
    const patch: Partial<AuthUser> = {}

    if (profile.name?.trim()) {
      const [firstName, ...rest] = profile.name.trim().split(/\s+/)
      patch.firstName = firstName || ''
      patch.lastName = rest.join(' ')
    }

    if (profile.email) patch.email = profile.email
    if (profile.role) patch.role = profile.role
    if (profile.avatar) patch.avatar = profile.avatar

    updateUser(patch)
  }

  function clearAuth() {
    user.value = null
  }

  function handleError(error: unknown, fallbackMessage: string) {
    const apiError = toApiError(error, fallbackMessage)
    lastError.value = apiError
    return apiError
  }

  async function initializeAuth(force = false) {
    if (initialized.value && !force) return
    if (initializing.value) return initializing.value

    initializing.value = (async () => {
      initializationError.value = null

      try {
        await fetchUser()
      } catch (error) {
        const apiError = handleError(error, 'Unable to restore your session')

        if (apiError.status !== 401) {
          initializationError.value = apiError.message
        }
      } finally {
        initialized.value = true
        initializing.value = null
      }
    })()

    return initializing.value
  }

  async function fetchUser(): Promise<boolean> {
    try {
      const response = await $fetch<AuthUser>('/api/auth/me', {
        credentials: 'include',
      })

      if (!response?.userId) {
        throw new ApiError('The server returned an invalid session.', 502)
      }

      setUser(response)
      return true
    } catch (error) {
      const apiError = handleError(error, 'Unable to restore your session')

      if (apiError.status === 401) {
        if (hadSession.value) sessionExpired.value = true
        clearAuth()
      }

      throw apiError
    }
  }

  async function login(email: string, password: string, rememberMe = false) {
    loading.value = true
    lastError.value = null
    sessionExpired.value = false

    try {
      const response = await $fetch<AuthUser>('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        body: { email, password, rememberMe },
      })

      if (!response?.userId) {
        throw new ApiError('The server returned an invalid login response.', 502)
      }

      setUser(response)
      initialized.value = true
      clearPendingOAuth()

      success('Welcome Back!', `Hello ${response.firstName || response.email}`)

      const redirect = getSafeRedirect(router.currentRoute.value.query.redirect)
      await router.push(redirect || homeRoute.value)

      return response
    } catch (error) {
      throw handleError(error, 'Login failed')
    } finally {
      loading.value = false
    }
  }

  async function register(firstName: string, lastName: string, email: string, password: string) {
    loading.value = true
    lastError.value = null
    sessionExpired.value = false

    try {
      const response = await $fetch<AuthUser>('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        body: { firstName, lastName, email, password },
      })

      if (!response?.userId) {
        throw new ApiError('The server returned an invalid registration response.', 502)
      }

      setUser(response)
      initialized.value = true
      clearPendingOAuth()

      success('Account Created!', `Welcome to CourseAuraHub, ${response.firstName || response.email}`)

      const redirect = getSafeRedirect(router.currentRoute.value.query.redirect)
      await router.push(redirect || homeRoute.value)

      return response
    } catch (error) {
      throw handleError(error, 'Registration failed')
    } finally {
      loading.value = false
    }
  }

  async function refreshSession() {
    try {
      const response = await $fetch<AuthUser>('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response?.userId) {
        throw new ApiError('The server returned an invalid session.', 502)
      }

      setUser(response)
      initialized.value = true
      return response
    } catch (error) {
      const apiError = handleError(error, 'Session expired')

      if (apiError.status === 401) {
        sessionExpired.value = true
        clearAuth()
      }

      throw apiError
    }
  }

  async function logout() {
    loading.value = true
    lastError.value = null
    sessionExpired.value = false

    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      handleError(error, 'Logout failed')
      warning('Signed Out Locally', 'The server could not be reached, but your local session was cleared.')
    } finally {
      clearAuth()
      clearPendingOAuth()
      hadSession.value = false
      initialized.value = true
      loading.value = false
      await router.push('/auth/login')
    }
  }

  function initiateOAuth2(provider: OAuthProvider) {
    if (!import.meta.client) return

    const redirect = getSafeRedirect(router.currentRoute.value.query.redirect)
      || getPendingRedirect()

    rememberPendingRedirect(redirect)
    rememberOAuthProvider(provider)

    window.location.href = `/api/auth/oauth2/${provider}`
  }

  return {
    user,
    loading,
    initialized,
    initializing,
    initializationError,
    lastError,
    isAuthenticated,
    isAdmin,
    userName,
    userEmail,
    userInitials,
    userAvatar,
    roleLabel,
    homeRoute,
    sessionExpired,
    setUser,
    updateUser,
    setProfile,
    clearAuth,
    initializeAuth,
    fetchUser,
    login,
    register,
    refreshSession,
    logout,
    initiateOAuth2,
  }
})

export function useAuth() {
  return useAuthStore()
}
