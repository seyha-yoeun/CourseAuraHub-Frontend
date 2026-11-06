<template>
  <div class="flex flex-col gap-5">
    <NuxtLink to="/instructors" class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-violet-300 no-underline hover:text-violet-200 light:text-violet-700">
      <ArrowLeft :size="15" /> {{ t('All instructors') }}
    </NuxtLink>

    <div v-if="pending" class="h-56 animate-pulse rounded-[20px] bg-white/5 light:bg-slate-100" />
    <div v-else-if="error || !instructor" class="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/5 px-5 py-15 text-center light:border-slate-200 light:bg-white">
      <UserX :size="40" class="text-white/35 light:text-slate-400" />
      <h1 class="mt-3 text-xl font-bold text-slate-50 light:text-slate-900">{{ t('Instructor not found') }}</h1>
      <p class="mt-1.5 text-[13px] text-white/50 light:text-slate-500">{{ getErrorMessage(error, t('This profile is not available.')) }}</p>
    </div>

    <template v-else>
      <section class="flex flex-col gap-5 rounded-[20px] border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-start sm:p-7 light:border-slate-200 light:bg-white">
        <img
          :src="instructor.avatarUrl || fallbackAvatar(instructor.name)"
          :alt="instructor.name"
          class="size-24 shrink-0 rounded-full border-2 border-violet-500/40 bg-white/5 object-cover"
        >
        <div class="min-w-0 flex-1">
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 light:text-slate-900">{{ instructor.name }}</h1>
          <p v-if="instructor.headline" class="mt-1 text-[13px] font-medium text-violet-300 light:text-violet-700">{{ instructor.headline }}</p>
          <p v-if="instructor.bio" class="mt-3 text-[13px] leading-relaxed whitespace-pre-line text-white/65 light:text-slate-600">{{ instructor.bio }}</p>

          <div v-if="links.length" class="mt-4 flex flex-wrap gap-2">
            <a
              v-for="link in links"
              :key="link.label"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer nofollow"
              class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 no-underline hover:bg-white/10 light:border-slate-200 light:bg-slate-100 light:text-slate-700"
            >
              <component :is="link.icon" :size="13" /> {{ link.label }}
            </a>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label" class="rounded-[18px] border border-white/10 bg-white/5 p-4 light:border-slate-200 light:bg-white">
          <p class="text-xs text-white/45 light:text-slate-500">{{ stat.label }}</p>
          <p class="mt-1 text-xl font-extrabold text-slate-50 light:text-slate-900">{{ stat.value }}</p>
        </div>
      </div>

      <section v-if="instructor.courses.length" class="flex flex-col gap-3">
        <h2 class="text-base font-bold text-slate-100 light:text-slate-900">{{ t('Courses by {name}', { name: instructor.name }) }}</h2>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <CourseCard v-for="course in instructor.courses" :key="course.slug" :course="course" :can-manage="false" />
        </div>
      </section>
      <p v-else class="rounded-[18px] border border-white/10 bg-white/5 px-5 py-10 text-center text-[13px] text-white/45 light:border-slate-200 light:bg-white light:text-slate-500">
        {{ t('No published courses yet.') }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Github, Globe, Linkedin, Twitter, UserX, Youtube } from 'lucide-vue-next'
import type { Component } from 'vue'
import CourseCard from '~/components/courses/CourseCard.vue'
import { useInstructorProfile } from '~/composables/useInstructorProfile'
import { getErrorMessage } from '~/utils/apiError'

const { t } = useT()
const route = useRoute()
const { fetchInstructor } = useInstructorProfile()
const handle = computed(() => String(route.params.handle))

const { data: instructor, pending, error } = await useAsyncData(
  () => `instructor-${handle.value}`,
  () => fetchInstructor(handle.value),
  { server: false, watch: [handle] }
)

useHead({ title: computed(() => instructor.value?.name ?? t('Instructor')) })

function fallbackAvatar(name: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name || 'Instructor')}&backgroundColor=b6e3f4`
}

// Only http(s) links are rendered, whatever was stored
function safeUrl(value: string | null) {
  return value && /^https?:\/\//i.test(value) ? value : null
}

const links = computed(() => {
  const value = instructor.value?.links
  if (!value) return []
  const twitter = value.twitter ? `https://x.com/${value.twitter.replace(/^@/, '').replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, '')}` : null
  const candidates: { label: string, href: string | null, icon: Component }[] = [
    { label: t('Website'), href: safeUrl(value.website), icon: Globe },
    { label: 'Twitter', href: twitter, icon: Twitter },
    { label: 'LinkedIn', href: safeUrl(value.linkedin), icon: Linkedin },
    { label: 'GitHub', href: safeUrl(value.github), icon: Github },
    { label: 'YouTube', href: safeUrl(value.youtube), icon: Youtube }
  ]
  return candidates.filter((link): link is { label: string, href: string, icon: Component } => Boolean(link.href))
})

const stats = computed(() => {
  const value = instructor.value?.stats
  if (!value) return []
  return [
    { label: t('Courses'), value: value.courses },
    { label: t('Learners'), value: value.students.toLocaleString() },
    { label: t('Average rating'), value: value.averageRating > 0 ? `${Number(value.averageRating).toFixed(1)} ★` : '—' },
    { label: t('Reviews'), value: value.reviews }
  ]
})
</script>
