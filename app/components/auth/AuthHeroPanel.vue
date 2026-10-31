<template>
  <div class="relative flex h-full min-h-0 flex-col justify-between overflow-hidden border-r border-emerald-500/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.035)_0%,transparent_55%,rgba(5,150,105,0.035)_100%)] p-[clamp(2rem,_4vw,_4rem)]">
    <!-- =========================================================
         Background media layer
         Put any visual in here: <video>, Lottie, canvas, <img>…
         A ready-to-use video example is commented below — drop the
         files in /public/auth/ and uncomment it.
         ========================================================= -->
    <div class="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <!--
      <video class="absolute inset-0 size-full object-cover" autoplay muted loop playsinline poster="/auth/hero-poster.jpg">
        <source src="/auth/hero.mp4" type="video/mp4" />
      </video>
      -->

      <!-- Ambient layer: drifting blobs + spinning globe + orbit rings -->
      <div class="absolute inset-0">
        <span class="absolute -left-[15%] -top-[15%] aspect-square w-[60%] animate-blob-1 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.22),transparent_65%)] blur-[70px]" />
        <span class="absolute -bottom-[12%] -right-[10%] aspect-square w-[50%] animate-blob-2 rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.18),transparent_65%)] blur-[70px]" />
        <span class="absolute left-[28%] top-[42%] aspect-square w-[38%] animate-blob-3 rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.12),transparent_65%)] blur-[70px]" />

        <!-- Central spinning globe with orbiting rings & globes -->
        <div class="absolute left-1/2 top-[46%] aspect-square w-[min(58vh,74%)] -translate-x-1/2 -translate-y-1/2 shorter:top-[42%] shorter:w-[min(46vh,62%)]">
          <div class="absolute inset-0 m-auto aspect-square w-[56%] overflow-hidden rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(167,243,208,0.5),rgba(16,185,129,0.28)_38%,rgba(6,78,59,0.5)_72%,rgba(3,40,30,0.6)_100%)] shadow-[0_0_70px_rgba(16,185,129,0.35),0_0_150px_rgba(16,185,129,0.18),inset_0_0_50px_rgba(16,185,129,0.3)] light:shadow-[0_0_70px_rgba(16,185,129,0.25),0_0_150px_rgba(16,185,129,0.12),inset_0_0_50px_rgba(16,185,129,0.22)]">
            <span class="absolute -inset-[12%] animate-globe-spin rounded-full bg-[repeating-conic-gradient(from_0deg,rgba(167,243,208,0.35)_0deg_12deg,rgba(16,185,129,0.05)_12deg_30deg,transparent_30deg_45deg)] blur-[5px]" />
            <span class="absolute inset-0 animate-sheen rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.35),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.25),transparent_55%)]" />
          </div>

          <!-- Orbit rings, each carrying an orbiting globe -->
          <span class="absolute inset-0 m-auto aspect-square w-[74%] animate-orbit-1 rounded-full border border-dashed border-emerald-400/35 light:border-emerald-600/30">
            <span class="absolute -top-[7px] left-1/2 -ml-[7px] size-3.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#d1fae5,#34d399_55%,#047857)] shadow-[0_0_16px_rgba(52,211,153,0.9),0_0_36px_rgba(16,185,129,0.45)]" />
          </span>
          <span class="absolute inset-0 m-auto aspect-square w-full animate-orbit-2 rounded-full border border-emerald-500/20 light:border-emerald-600/25">
            <span class="absolute -top-[5px] left-1/2 -ml-[5px] size-2.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#d1fae5,#34d399_55%,#047857)] shadow-[0_0_16px_rgba(52,211,153,0.9),0_0_36px_rgba(16,185,129,0.45)]" />
          </span>
          <span class="absolute inset-0 m-auto aspect-square w-[128%] animate-orbit-3 rounded-full border border-dotted border-emerald-500/10 light:border-emerald-600/15">
            <span class="absolute -top-1 left-1/2 -ml-1 size-2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#d1fae5,#34d399_55%,#047857)] opacity-80 shadow-[0_0_16px_rgba(52,211,153,0.9),0_0_36px_rgba(16,185,129,0.45)]" />
          </span>
        </div>

        <!-- Free-floating spinning globs -->
        <span class="absolute left-[10%] top-[16%] size-17 animate-float-1 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(209,250,229,0.85),rgba(16,185,129,0.45)_45%,rgba(4,120,87,0.15)_75%,transparent_100%)] shadow-[0_0_30px_rgba(16,185,129,0.35)] after:absolute after:inset-0 after:animate-globe-texture after:rounded-full after:bg-[repeating-conic-gradient(from_0deg,rgba(255,255,255,0.22)_0deg_18deg,transparent_18deg_55deg)] after:blur-[1.5px] after:content-[''] shorter:hidden" />
        <span class="absolute right-[12%] top-[26%] size-11 animate-float-2 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(209,250,229,0.85),rgba(16,185,129,0.45)_45%,rgba(4,120,87,0.15)_75%,transparent_100%)] shadow-[0_0_30px_rgba(16,185,129,0.35)] after:absolute after:inset-0 after:animate-globe-texture after:rounded-full after:bg-[repeating-conic-gradient(from_0deg,rgba(255,255,255,0.22)_0deg_18deg,transparent_18deg_55deg)] after:blur-[1.5px] after:content-[''] shorter:hidden" />
        <span class="absolute bottom-[24%] left-[16%] size-7.5 animate-float-3 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(209,250,229,0.85),rgba(16,185,129,0.45)_45%,rgba(4,120,87,0.15)_75%,transparent_100%)] shadow-[0_0_30px_rgba(16,185,129,0.35)] after:absolute after:inset-0 after:animate-globe-texture after:rounded-full after:bg-[repeating-conic-gradient(from_0deg,rgba(255,255,255,0.22)_0deg_18deg,transparent_18deg_55deg)] after:blur-[1.5px] after:content-[''] shorter:hidden" />

        <!-- Faint grid -->
        <span class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_50%_45%,#000_25%,transparent_85%)] light:bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)]" />
      </div>

      <!-- Readability overlay for whatever plays underneath -->
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,15,0.28)_0%,rgba(10,10,15,0.1)_45%,rgba(10,10,15,0.75)_100%)] light:bg-[linear-gradient(180deg,rgba(248,250,252,0.3)_0%,rgba(248,250,252,0.12)_45%,rgba(248,250,252,0.85)_100%)]" />
    </div>

    <!-- Foreground content -->
    <div class="relative z-[2] mx-auto flex h-full w-full max-w-[560px] flex-col justify-between">
      <!-- Brand -->
      <div v-motion="brandMotion" class="flex items-center gap-3.5">
        <div class="size-13 shrink-0">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-full">
            <rect width="48" height="48" rx="12" fill="url(#grad)" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48">
                <stop stop-color="#10b981" />
                <stop offset="1" stop-color="#059669" />
              </linearGradient>
            </defs>
            <path d="M14 24L21 31L34 17" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="text-left">
          <h1 class="m-0 text-[26px] font-extrabold leading-[1.1] tracking-[-0.5px] text-slate-100 light:text-slate-900">CourseAuraHub</h1>
          <span class="text-xs font-semibold uppercase tracking-[1px] text-emerald-500">Academy</span>
        </div>
      </div>

      <!-- Compact value proposition anchored at the bottom -->
      <div class="mb-4 flex flex-col items-start gap-[18px] shorter:gap-3">
        <div v-motion="badgeMotion" class="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/12 px-4 py-2 text-[13px] font-semibold text-emerald-400 backdrop-blur-md light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700">
          <span class="size-2 animate-pulse rounded-full bg-emerald-500" />
          <span>Trusted by 10,000+ developers</span>
        </div>

        <h2 v-motion="headingMotion" class="m-0 text-[clamp(30px,_2.4vw_+_12px,_42px)] font-extrabold leading-[1.15] tracking-[-0.5px] text-slate-100 light:text-slate-900">
          Unlock your potential with
          <span class="bg-linear-to-br from-emerald-500 via-emerald-400 to-emerald-600 bg-clip-text text-transparent">expert-led tech courses</span>
        </h2>

        <p v-motion="descriptionMotion" class="m-0 max-w-[440px] text-base leading-relaxed text-white/60 light:text-slate-600 shorter:hidden">
          Learn coding, cloud, security, and data from industry leaders —
          build real projects and accelerate your career.
        </p>

        <div v-motion="statsMotion" class="flex flex-wrap gap-2.5 tiny:hidden">
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[12.5px] font-semibold text-white/75 backdrop-blur-sm light:border-slate-200 light:bg-white/70 light:text-slate-700">
            <BookOpen :size="14" class="text-emerald-400 light:text-emerald-600" />
            <span>Expert-led Courses</span>
          </span>
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[12.5px] font-semibold text-white/75 backdrop-blur-sm light:border-slate-200 light:bg-white/70 light:text-slate-700">
            <Award :size="14" class="text-emerald-400 light:text-emerald-600" />
            <span>Certificates</span>
          </span>
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[12.5px] font-semibold text-white/75 backdrop-blur-sm light:border-slate-200 light:bg-white/70 light:text-slate-700">
            <Users :size="14" class="text-emerald-400 light:text-emerald-600" />
            <span>Learning Community</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BookOpen,
  Award,
  Users
} from 'lucide-vue-next'

const brandMotion = {
  initial: { opacity: 0, y: -24 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

const badgeMotion = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] } }
}

const headingMotion = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] } }
}

const descriptionMotion = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] } }
}

const statsMotion = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] } }
}
</script>
