<template>
  <!--
    Listing container: optional toolbar on top, a body that scrolls inside the card (column headers stay
    visible), and a footer pinned to the bottom of the card for pagination. Long pages (e.g. 100 rows)
    scroll within the card instead of stretching the whole page.
  -->
  <!-- No overflow-hidden here: toolbar dropdowns must be able to open past the card edge. -->
  <section class="flex flex-col rounded-[14px] border border-white/10 bg-white/[0.03] light:border-slate-200 light:bg-white">
    <div v-if="$slots.toolbar" class="flex flex-wrap items-center gap-3 border-b border-white/8 p-3.5 sm:px-4 light:border-slate-200">
      <slot name="toolbar" />
    </div>

    <div
      ref="bodyRef"
      class="min-h-0 overflow-auto overscroll-contain first:rounded-t-[13px] last:rounded-b-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400/40 [&_table]:w-full [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-1 [&_thead_th]:bg-[#111714] [&_thead_th]:shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)] light:[&_thead_th]:bg-slate-50 light:[&_thead_th]:shadow-[inset_0_-1px_0_rgba(11,31,23,0.08)]"
      :class="maxHeightClass"
      tabindex="0"
      :aria-label="label"
      role="region"
    >
      <slot />
    </div>

    <div v-if="$slots.footer" class="border-t border-white/8 px-3.5 py-2.5 sm:px-4 light:border-slate-200">
      <slot name="footer" />
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Accessible name for the scrollable region, e.g. "Students" */
  label: string
  /** Changes to this value (page, page size, filters) scroll the body back to the top */
  scrollKey?: string | number
  /** Tailwind max-height for the scroll area */
  maxHeightClass?: string
}>(), {
  scrollKey: undefined,
  // Leaves room for the sticky header, page title, toolbar and footer on most screens.
  maxHeightClass: 'max-h-[max(20rem,calc(100dvh-15rem))]',
})

const bodyRef = ref<HTMLElement | null>(null)

watch(() => props.scrollKey, () => {
  bodyRef.value?.scrollTo({ top: 0 })
})
</script>
