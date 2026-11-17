<template>
  <div v-if="changes.length" class="overflow-x-auto rounded-xl border border-white/8 light:border-slate-200">
    <table class="w-full min-w-140 border-collapse text-left text-xs">
      <thead>
        <tr class="border-b border-white/8 text-[10px] tracking-wider text-white/40 uppercase light:border-slate-200 light:text-slate-500">
          <th class="w-32 px-3 py-2 font-semibold">{{ t('Field') }}</th>
          <th class="px-3 py-2 font-semibold">{{ t('Before') }}</th>
          <th class="px-3 py-2 font-semibold">{{ t('After') }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-white/6 light:divide-slate-200">
        <tr v-for="change in changes" :key="change.field" class="align-top">
          <td class="px-3 py-2 font-semibold text-white/70 light:text-slate-700">{{ t(FIELD_LABELS[change.field] ?? change.field) }}</td>
          <td class="px-3 py-2 text-rose-300/90 line-through decoration-rose-400/40 light:text-rose-700">
            <img v-if="change.field === 'thumbnail' && change.before" :src="String(change.before)" alt="" class="h-12 rounded-md object-cover">
            <span v-else class="line-clamp-4 whitespace-pre-line">{{ display(change.field, change.before) }}</span>
          </td>
          <td class="px-3 py-2 text-emerald-300 light:text-emerald-700">
            <img v-if="change.field === 'thumbnail' && change.after" :src="String(change.after)" alt="" class="h-12 rounded-md object-cover">
            <span v-else class="line-clamp-4 whitespace-pre-line">{{ display(change.field, change.after) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-else class="text-xs text-white/45 light:text-slate-500">{{ t('No field changes.') }}</p>
</template>

<script setup lang="ts">
import type { CourseRevision } from '~/types/revision'
import { formatMoney } from '~/composables/useCart'

defineProps<{ changes: CourseRevision['changes'] }>()

const { t } = useT()

const FIELD_LABELS: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  price: 'Price',
  originalPrice: 'Original price',
  category: 'Category',
  level: 'Level',
  thumbnail: 'Thumbnail',
  tags: 'Tags',
}

function display(field: string, value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) return value.join(', ')
  if ((field === 'price' || field === 'originalPrice') && !Number.isNaN(Number(value))) return formatMoney(Number(value))
  return String(value)
}
</script>
