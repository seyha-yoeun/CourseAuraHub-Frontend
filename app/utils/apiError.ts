export class ApiError extends Error {
  status: number
  code?: string
  fieldErrors: Record<string, string>

  constructor(
    message: string,
    status = 500,
    code?: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

function extractErrorBody(error: unknown) {
  const candidate = error as {
    data?: Record<string, unknown>
    statusCode?: number
    status?: number
    statusMessage?: string
    message?: string
  }

  const body = candidate?.data
  if (!body || typeof body !== 'object') return {}

  // H3 serializes createError({ data }) as { statusCode, statusMessage, data: {...} }.
  const nested = body.data
  if (nested && typeof nested === 'object') {
    return nested as Record<string, unknown>
  }

  return body
}

export function toApiError(error: unknown, fallbackMessage = 'Something went wrong'): ApiError {
  if (error instanceof ApiError) return error

  const candidate = error as {
    statusCode?: number
    status?: number
    statusMessage?: string
    message?: string
  }

  const body = extractErrorBody(error)
  const status = Number(
    candidate?.statusCode
      || candidate?.status
      || 500,
  )

  const message = String(
    body.message
      || candidate?.statusMessage
      || candidate?.message
      || fallbackMessage,
  )

  const code = typeof body.code === 'string' ? body.code : undefined
  const fieldErrors: Record<string, string> = {}

  if (body.errors && typeof body.errors === 'object') {
    for (const [field, value] of Object.entries(body.errors as Record<string, unknown>)) {
      if (typeof value === 'string') {
        fieldErrors[field] = value
      }
    }
  }

  return new ApiError(message, status, code, fieldErrors)
}

export function getErrorMessage(error: unknown, fallbackMessage = 'Something went wrong') {
  return toApiError(error, fallbackMessage).message
}
