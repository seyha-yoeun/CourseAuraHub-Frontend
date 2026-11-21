<template>
  <!-- Always a deep-green panel; only the inner course card switches with the theme. -->
  <div class="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/6 bg-[#0b1f18] px-[clamp(2rem,4vw,3.5rem)] py-[clamp(2rem,5vh,3.25rem)] text-white light:border-transparent light:bg-[#0f2f24]">
    <!-- Ambient light + faint grid -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <span class="absolute -top-1/4 -right-1/4 size-[70%] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.16),transparent_65%)] blur-2xl" />
      <span class="absolute -bottom-1/3 -left-1/4 size-[70%] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12),transparent_65%)] blur-2xl" />
      <span class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_60%_45%,#000_15%,transparent_75%)]" />
    </div>

    <!-- Pitch -->
    <div v-motion="enter(0)" class="relative max-w-[520px]">
      <p class="text-[11.5px] font-semibold tracking-[0.14em] text-emerald-300/80 uppercase">Courses built by working engineers</p>
      <h2 class="mt-3.5 text-[clamp(26px,1.6vw+12px,38px)] leading-[1.12] font-bold tracking-[-0.025em] text-white">
        Learn the skills teams
        <em class="font-['Instrument_Serif',ui-serif,Georgia,serif] text-[1.08em] font-normal tracking-normal text-emerald-300">actually</em>
        hire for — one real project at a time.
      </h2>
    </div>

    <!-- Showcase -->
    <div class="relative flex min-h-0 flex-1 items-center py-8 shorter:py-5" aria-hidden="true">
      <div class="flex w-full items-start gap-5">
        <!-- Course card -->
        <div v-motion="enter(0.08)" class="w-full max-w-[330px] shrink-0 overflow-hidden rounded-[16px] bg-[#121b18] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] light:bg-white light:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]">
          <div class="relative bg-[#0a110f] px-4 pt-4 pb-11 font-mono text-[11.5px] leading-[1.75] text-white/80 shorter:pb-10 tiny:hidden">
            <div><span class="text-sky-300">resource</span> <span class="text-amber-200">"aws_lambda_function"</span> <span class="text-amber-200">"api"</span> {</div>
            <div class="pl-4">function_name = <span class="text-amber-200">"orders-api"</span></div>
            <div class="pl-4">runtime&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span class="text-amber-200">"nodejs20.x"</span></div>
            <div class="pl-4 shorter:hidden">handler&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span class="text-amber-200">"index.handler"</span></div>
            <div class="pl-4 opacity-50 shorter:hidden">memory_size&nbsp;&nbsp;= <span class="text-violet-300">512</span></div>
            <span class="absolute bottom-3 left-4 rounded-full border border-emerald-300/30 bg-emerald-300/15 px-2.5 py-0.5 font-sans text-[10.5px] font-semibold text-emerald-200">Bestseller</span>
            <span class="absolute right-4 bottom-2.5 flex size-8 items-center justify-center rounded-full bg-white text-[#0a110f] shadow-md">
              <Play :size="13" class="ml-0.5 fill-current" />
            </span>
          </div>
          <div class="p-4">
            <p class="flex flex-wrap items-center gap-x-1.5 text-[11px] text-white/45 light:text-slate-500">
              <span class="font-semibold text-emerald-400 light:text-emerald-700">Cloud</span>
              <span>·</span><span>Intermediate</span><span>·</span><span>42 lessons</span><span>·</span><span>18h</span>
            </p>
            <p class="mt-1.5 text-[15px] leading-snug font-bold text-white light:text-slate-900">Cloud Architecture on AWS: Ship a Production-Ready API</p>
            <div class="mt-3 flex items-center gap-2.5">
              <span class="flex size-7 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">PR</span>
              <div class="min-w-0 leading-tight">
                <p class="text-[12px] font-semibold text-white/90 light:text-slate-800">Priya Raman</p>
                <p class="truncate text-[10.5px] text-white/45 light:text-slate-500">Staff Engineer · 11 yrs in cloud infra</p>
              </div>
            </div>
            <div class="mt-3.5 border-t border-white/8 pt-3 light:border-slate-200">
              <div class="flex items-center justify-between text-[11px] text-white/55 light:text-slate-500">
                <span class="inline-flex items-center gap-1"><Star :size="12" class="fill-amber-400 text-amber-400" /><span class="font-semibold text-white/90 light:text-slate-800">4.9</span> (2,184 reviews)</span>
                <span>6,320 enrolled</span>
              </div>
              <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10 light:bg-slate-200">
                <div class="h-full w-[34%] rounded-full bg-emerald-500 light:bg-emerald-700" />
              </div>
              <div class="mt-1.5 flex justify-between text-[10.5px] text-white/45 light:text-slate-500">
                <span>Your progress · Lesson 14 of 42</span><span>34%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Testimonial -->
        <figure v-motion="enter(0.16)" class="mt-[18%] hidden w-[220px] shrink-0 rounded-[16px] border border-white/12 bg-white/6 p-4.5 backdrop-blur-md xl:block">
          <blockquote class="font-['Instrument_Serif',ui-serif,Georgia,serif] text-[17px] leading-[1.35] text-white/90">
            “The capstone project became the centerpiece of my portfolio. Three interviews later, I got the offer.”
          </blockquote>
          <figcaption class="mt-4 flex items-center gap-2.5">
            <span class="flex size-7 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">DO</span>
            <span class="leading-tight">
              <span class="block text-[12px] font-semibold text-white/90">Daniel Okafor</span>
              <span class="block text-[10.5px] text-white/50">Backend Engineer</span>
            </span>
          </figcaption>
          <span class="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-[10.5px] font-medium text-emerald-200">
            <Check :size="11" /> Verified learner · 4 courses
          </span>
        </figure>
      </div>
    </div>

    <!-- Proof -->
    <div v-motion="enter(0.24)" class="relative flex items-end justify-between gap-6 border-t border-white/10 pt-6 shorter:pt-4">
      <dl class="flex gap-[clamp(1.25rem,3vw,2.75rem)]">
        <div v-for="stat in stats" :key="stat.label" class="flex flex-col-reverse">
          <dt class="mt-0.5 text-[12px] text-white/55">{{ stat.label }}</dt>
          <dd class="text-[clamp(20px,1vw+10px,24px)] font-bold tracking-[-0.02em] text-white">{{ stat.value }}</dd>
        </div>
      </dl>
      <div class="hidden -space-x-2 xl:flex" aria-hidden="true">
        <span
          v-for="avatar in avatars"
          :key="avatar.initials"
          class="flex size-8 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-[#0b1f18] light:ring-[#0f2f24]"
          :class="avatar.color"
        >{{ avatar.initials }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Play, Star } from 'lucide-vue-next'

// Showcase copy. Replace with real catalog figures when a public stats endpoint exists.
const stats = [
  { value: '12,400+', label: 'Active learners' },
  { value: '4.8/5', label: 'Avg. course rating' },
  { value: '140', label: 'Hands-on courses' },
]

const avatars = [
  { initials: 'AK', color: 'bg-teal-600' },
  { initials: 'JL', color: 'bg-violet-500' },
  { initials: 'SM', color: 'bg-orange-500' },
  { initials: 'TN', color: 'bg-sky-600' },
]

function enter(delay: number) {
  return {
    initial: { opacity: 0, y: 14 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] } },
  }
}
</script>
