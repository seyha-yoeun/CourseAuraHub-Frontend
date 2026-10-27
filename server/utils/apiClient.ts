import type { H3Event } from 'h3'

interface BackendApiResponse<T> {
  success: boolean
  message?: string
  data: T
  errors?: Record<string, string> | null
  timestamp?: string
}

export interface BackendAuthData {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: string
  email: string
  firstName: string
  lastName: string
  role: string
  provider: string
}

export interface BackendUser {
  userId: string
  email: string
  firstName: string
  lastName: string
  role: string
  provider: string
  imageUrl?: string | null
}

export interface AuthUserPayload {
  userId: string
  email: string
  firstName: string
  lastName: string
  role: string
  provider: string
}

export interface PlatformSettingsResponse {
  platformName: string
  platformTagline: string
  currency: string
  defaultLanguage: string
  notifications: {
    newEnrollment: boolean
    courseCompletion: boolean
    weeklyReport: boolean
    marketingEmails: boolean
  }
  profile: {
    name: string
    email: string
    role: string
    avatar: string
    bio: string
    website: string
    twitter: string
  }
}

interface CsrfTokenData {
  headerName: string
  parameterName: string
  token: string
}

interface BackendRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Record<string, unknown>
  auth?: boolean
  retryOn401?: boolean
  csrf?: boolean
  fallbackMessage?: string
}

const ACCESS_COOKIE = 'access_token'
const REFRESH_COOKIE = 'refresh_token'
const CSRF_COOKIE = 'XSRF-TOKEN'
const REMEMBER_COOKIE = 'remember_me'

const ACCESS_TOKEN_MAX_AGE = 15 * 60
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60
const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60
const CSRF_TOKEN_MAX_AGE = 30 * 24 * 60 * 60

const refreshRequests = new Map<string, Promise<BackendAuthData>>()

function getApiBase() {
  const config = useRuntimeConfig()
  return String(config.apiBase || 'http://localhost:8080/api/v1').replace(/\/+$/, '')
}

export function getBackendOrigin() {
  const config = useRuntimeConfig()

  if (config.public.backendUrl) {
    return String(config.public.backendUrl).replace(/\/+$/, '')
  }

  try {
    return new URL(getApiBase()).origin
  } catch {
    return 'http://localhost:8080'
  }
}

function getCookieOptions(event: H3Event, httpOnly = true) {
  const config = useRuntimeConfig(event)

  return {
    httpOnly,
    secure: Boolean(config.cookieSecure),
    sameSite: (config.cookieSameSite || 'lax') as 'lax' | 'strict' | 'none',
    domain: config.cookieDomain ? String(config.cookieDomain) : undefined,
    path: '/',
  }
}

function getCookieDeleteOptions() {
  const config = useRuntimeConfig()

  return {
    domain: config.cookieDomain ? String(config.cookieDomain) : undefined,
    path: '/',
  }
}

function getErrorStatus(error: unknown) {
  const candidate = error as {
    statusCode?: number
    status?: number
    response?: { status?: number }
  }

  return Number(
    candidate?.response?.status
      || candidate?.statusCode
      || candidate?.status
      || 500,
  )
}

function getErrorBody(error: unknown) {
  const candidate = error as {
    data?: unknown
    response?: { _data?: unknown; data?: unknown }
  }

  return candidate?.response?._data
    || candidate?.response?.data
    || candidate?.data
    || null
}

export function createSessionExpiredError() {
  return createError({
    statusCode: 401,
    statusMessage: 'Session expired',
    data: {
      code: 'SESSION_EXPIRED',
      message: 'Your session has expired. Please sign in again.',
    },
  })
}

export function toPublicError(
  error: unknown,
  fallbackStatus = 500,
  fallbackMessage = 'Request failed',
  includeSessionCode = true,
) {
  const status = getErrorStatus(error)
  const body = getErrorBody(error) as {
    message?: string
    errors?: Record<string, string>
    code?: string
  } | null

  const rawMessage = body?.message
    || (error as { statusMessage?: string })?.statusMessage
    || (error as { message?: string })?.message
    || fallbackMessage

  const message = rawMessage === 'fetch failed' || rawMessage === 'Failed to fetch'
    ? 'Unable to reach the authentication service. Please try again.'
    : rawMessage

  return createError({
    statusCode: status >= 400 && status < 600 ? status : fallbackStatus,
    statusMessage: message,
    data: {
      code: body?.code || (includeSessionCode && status === 401 ? 'SESSION_EXPIRED' : undefined),
      message,
      errors: body?.errors || undefined,
    },
  })
}

export function setSessionCookies(event: H3Event, data: BackendAuthData, rememberMe: boolean) {
  const accessMaxAge = Number(data.expiresIn) > 0
    ? Math.max(60, Math.floor(Number(data.expiresIn) / 1000))
    : ACCESS_TOKEN_MAX_AGE
  const refreshMaxAge = rememberMe ? REMEMBER_ME_MAX_AGE : REFRESH_TOKEN_MAX_AGE

  setCookie(event, ACCESS_COOKIE, data.accessToken, {
    ...getCookieOptions(event),
    maxAge: accessMaxAge,
  })

  setCookie(event, REFRESH_COOKIE, data.refreshToken, {
    ...getCookieOptions(event),
    maxAge: refreshMaxAge,
  })

  setCookie(event, REMEMBER_COOKIE, rememberMe ? '1' : '0', {
    ...getCookieOptions(event),
    maxAge: refreshMaxAge,
  })
}

export function clearSessionCookies(event: H3Event) {
  const options = getCookieDeleteOptions()

  deleteCookie(event, ACCESS_COOKIE, options)
  deleteCookie(event, REFRESH_COOKIE, options)
  deleteCookie(event, CSRF_COOKIE, options)
  deleteCookie(event, REMEMBER_COOKIE, options)
}

async function performRefresh(event: H3Event, refreshToken: string): Promise<BackendAuthData> {
  const xsrfToken = getCookie(event, CSRF_COOKIE)
  const cookies = [`${REFRESH_COOKIE}=${encodeURIComponent(refreshToken)}`]

  if (xsrfToken) {
    cookies.push(`${CSRF_COOKIE}=${encodeURIComponent(xsrfToken)}`)
  }

  try {
    const response = await $fetch<BackendApiResponse<BackendAuthData>>(`${getApiBase()}/auth/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        Cookie: cookies.join('; '),
      },
    })

    if (!response?.success || !response.data?.accessToken || !response.data?.refreshToken) {
      throw createSessionExpiredError()
    }

    return response.data
  } catch (error) {
    const status = getErrorStatus(error)

    if (status === 400 || status === 401 || status === 403) {
      throw createSessionExpiredError()
    }

    throw toPublicError(
      error,
      503,
      'Unable to refresh your session. Please try again.',
    )
  }
}

export async function refreshSession(event: H3Event) {
  const refreshToken = getCookie(event, REFRESH_COOKIE)

  if (!refreshToken) {
    throw createSessionExpiredError()
  }

  let request = refreshRequests.get(refreshToken)

  if (!request) {
    request = performRefresh(event, refreshToken).finally(() => {
      refreshRequests.delete(refreshToken)
    })
    refreshRequests.set(refreshToken, request)
  }

  try {
    const data = await request
    setSessionCookies(event, data, getCookie(event, REMEMBER_COOKIE) === '1')
    return data
  } catch (error) {
    const status = getErrorStatus(error)

    if (status === 400 || status === 401 || status === 403) {
      clearSessionCookies(event)
    }

    throw error
  }
}

export async function ensureCsrfToken(event: H3Event, force = false): Promise<CsrfTokenData> {
  const existingToken = getCookie(event, CSRF_COOKIE)
  if (existingToken && !force) {
    return {
      headerName: 'X-XSRF-TOKEN',
      parameterName: '_csrf',
      token: existingToken,
    }
  }

  const accessToken = getCookie(event, ACCESS_COOKIE)
  const response = await $fetch<BackendApiResponse<CsrfTokenData>>(`${getApiBase()}/auth/csrf`, {
    headers: {
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  })

  if (!response?.success || !response.data?.token) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to initialize CSRF protection',
      data: { message: 'Unable to initialize CSRF protection. Please try again.' },
    })
  }

  setCookie(event, CSRF_COOKIE, response.data.token, {
    ...getCookieOptions(event, false),
    maxAge: CSRF_TOKEN_MAX_AGE,
  })

  return response.data
}

async function executeBackendRequest<T>(
  event: H3Event,
  path: string,
  accessToken: string | undefined,
  options: BackendRequestOptions,
  forceCsrf = false,
) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (options.csrf) {
    const csrf = await ensureCsrfToken(event, forceCsrf)
    headers[csrf.headerName] = csrf.token
    headers.Cookie = `${CSRF_COOKIE}=${encodeURIComponent(csrf.token)}`
  }

  return await $fetch<BackendApiResponse<T>>(`${getApiBase()}${path}`, {
    method: options.method || 'GET',
    body: options.body,
    query: options.query,
    headers,
  })
}

function unwrapResponse<T>(response: BackendApiResponse<T>, fallbackMessage: string) {
  if (!response || response.success === false) {
    throw createError({
      statusCode: 502,
      statusMessage: response?.message || fallbackMessage,
      data: {
        message: response?.message || fallbackMessage,
        errors: response?.errors || undefined,
      },
    })
  }

  return response.data
}

export async function backendRequest<T>(
  event: H3Event,
  path: string,
  options: BackendRequestOptions = {},
): Promise<T> {
  const {
    auth = true,
    retryOn401 = true,
    fallbackMessage = 'Request failed',
  } = options

  let accessToken = auth ? getCookie(event, ACCESS_COOKIE) : undefined

  if (auth && !accessToken && retryOn401) {
    const refreshed = await refreshSession(event)
    accessToken = refreshed.accessToken
  }

  if (auth && !accessToken) {
    throw createSessionExpiredError()
  }

  try {
    const response = await executeBackendRequest<T>(event, path, accessToken, options)
    return unwrapResponse(response, fallbackMessage)
  } catch (error) {
    const status = getErrorStatus(error)

    if (auth && status === 401 && retryOn401 && path !== '/auth/refresh') {
      const refreshed = await refreshSession(event)
      accessToken = refreshed.accessToken

      try {
        const response = await executeBackendRequest<T>(event, path, accessToken, options)
        return unwrapResponse(response, fallbackMessage)
      } catch (retryError) {
        throw toPublicError(retryError, 401, fallbackMessage, auth)
      }
    }

    if (options.csrf && status === 403) {
      try {
        const response = await executeBackendRequest<T>(event, path, accessToken, options, true)
        return unwrapResponse(response, fallbackMessage)
      } catch (retryError) {
        throw toPublicError(retryError, 403, fallbackMessage, auth)
      }
    }

    throw toPublicError(error, status, fallbackMessage, auth)
  }
}

export async function logoutBackend(event: H3Event) {
  const refreshToken = getCookie(event, REFRESH_COOKIE)
  if (!refreshToken) return

  try {
    await $fetch(`${getApiBase()}/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Cookie: `${REFRESH_COOKIE}=${encodeURIComponent(refreshToken)}`,
      },
    })
  } catch {
    // Logout is best-effort; local cookies are always cleared by the caller.
  }
}

export function toAuthUser(data: BackendAuthData): AuthUserPayload {
  return {
    userId: data.userId,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
    provider: data.provider,
  }
}
