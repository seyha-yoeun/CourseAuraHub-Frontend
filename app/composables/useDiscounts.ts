import type { CourseDiscount, CourseDiscountCreate, CourseDiscountUpdate, CourseSale } from '~/types'

/** The size of a discount, such as "20% off" or "$10.00 off". */
export function formatDiscount(discount: Pick<CourseSale, 'discountType' | 'discountValue'>) {
  const value = Number(discount.discountValue)
  return discount.discountType.toUpperCase() === 'PERCENT' ? `${value}% off` : `$${value.toFixed(2)} off`
}

/** Admin management of scheduled sale prices (/api/admin/discounts). */
export function useDiscounts() {
  async function fetchDiscounts() {
    return await $fetch<CourseDiscount[]>('/api/admin/discounts')
  }

  async function createDiscount(data: CourseDiscountCreate) {
    return await $fetch<CourseDiscount>('/api/admin/discounts', { method: 'POST', body: data })
  }

  async function updateDiscount(id: number, data: CourseDiscountUpdate) {
    return await $fetch<CourseDiscount>(`/api/admin/discounts/${id}`, { method: 'PATCH', body: data })
  }

  async function deleteDiscount(id: number) {
    return await $fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' })
  }

  return {
    fetchDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
  }
}
