import type { AdminOrderPage } from '~/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await backendRequest<AdminOrderPage>(event, '/admin/orders', {
    query: {
      status: queryString(query.status as string | undefined),
      page: queryString(query.page as string | undefined),
      size: queryString(query.size as string | undefined),
    },
    fallbackMessage: 'Unable to load orders',
  })
})
