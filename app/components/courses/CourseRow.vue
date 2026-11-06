<template>
  <section v-if="courses.length" :aria-label="title" class="flex flex-col gap-3">
    <div>
      <h2 class="text-base font-bold text-slate-100 light:text-slate-900">{{ title }}</h2>
      <p v-if="subtitle" class="mt-0.5 text-xs text-white/45 light:text-slate-500">{{ subtitle }}</p>
    </div>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <CourseCard v-for="course in courses" :key="course.slug" :course="course" :can-manage="false" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Course } from '~/types'
import CourseCard from '~/components/courses/CourseCard.vue'

/** A titled grid of catalog cards; renders nothing when there are no courses. */
defineProps<{
  title: string
  subtitle?: string
  courses: Course[]
}>()
</script>
