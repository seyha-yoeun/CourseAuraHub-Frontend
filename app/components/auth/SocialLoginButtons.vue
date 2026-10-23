<template>
  <div class="mt-6 short:mt-4">
    <div class="mb-4 flex items-center gap-4 text-[13px] text-white/30 before:h-px before:flex-1 before:bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.3),transparent)] before:content-[''] after:h-px after:flex-1 after:bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.3),transparent)] after:content-[''] light:text-black/30">
      <span>Or sign in with</span>
    </div>

    <div class="flex flex-col gap-2.5">
      <button
        v-for="provider in providers"
        :key="provider.id"
        class="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm font-medium text-white/70 transition-all duration-200 enabled:hover:scale-[1.02] enabled:hover:border-emerald-500/40 enabled:hover:bg-emerald-500/8 enabled:hover:text-white enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 light:border-slate-200 light:bg-slate-50 light:text-slate-700 light:enabled:hover:border-emerald-500 light:enabled:hover:bg-emerald-50 light:enabled:hover:text-slate-900"
        :disabled="loading"
        type="button"
        @click="handleClick(provider.id)"
      >
        <component :is="provider.icon" :size="20" class="shrink-0" :class="provider.iconClass" />
        <span>{{ provider.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chrome,
  Github,
  Facebook
} from 'lucide-vue-next'

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  click: [provider: 'google' | 'facebook' | 'github']
}>()

const providers = [
  { id: 'google', name: 'Google', icon: Chrome, iconClass: 'text-[#4285F4]' },
  { id: 'github', name: 'GitHub', icon: Github, iconClass: 'text-white light:text-[#24292e]' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, iconClass: 'text-[#1877F2]' }
] as const

function handleClick(provider: 'google' | 'facebook' | 'github') {
  if (!props.loading) {
    emit('click', provider)
  }
}
</script>
