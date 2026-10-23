/**
 * Compatibility endpoint for the backend OAuth2 flow.
 *
 * The backend redirects to `/oauth2/redirect` by default (configurable via
 * `app.oauth2.redirect-uri`), while the frontend callback page lives at
 * `/auth/callback`. Forward the request — including OAuth error parameters —
 * so both configurations work.
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && item !== undefined) search.append(key, String(item))
      }
    } else if (value !== null && value !== undefined) {
      search.append(key, String(value))
    }
  }

  const queryString = search.toString()
  const target = `/auth/callback${queryString ? `?${queryString}` : ''}`

  return sendRedirect(event, target, 302)
})
