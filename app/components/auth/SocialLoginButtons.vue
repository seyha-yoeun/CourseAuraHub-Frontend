<template>
  <div>
    <div class="grid grid-cols-3 gap-2.5">
      <button
        v-for="provider in providers"
        :key="provider.id"
        type="button"
        :class="[authSecondaryButton, 'px-2']"
        :disabled="loading"
        :aria-label="`${actionLabel} with ${provider.name}`"
        @click="handleClick(provider.id)"
      >
        <!-- Google's multi-colour mark (lucide has no Google icon) -->
        <svg v-if="provider.id === 'google'" class="size-[17px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3.02c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.11A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56V6.61H1.28a12 12 0 0 0 0 10.78l4.01-3.11Z" />
          <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 1.28 6.61l4.01 3.11C6.23 6.88 8.88 4.77 12 4.77Z" />
        </svg>
        <component :is="provider.icon" v-else :size="17" class="shrink-0" :class="provider.iconClass" aria-hidden="true" />
        <span class="truncate">{{ provider.name }}</span>
      </button>
    </div>

    <div class="my-6 flex items-center gap-3 text-[12.5px] short:my-4 text-white/40 light:text-slate-400" role="separator">
      <span class="h-px flex-1 bg-white/10 light:bg-slate-200" />
      <span>or with email</span>
      <span class="h-px flex-1 bg-white/10 light:bg-slate-200" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Facebook, Github } from 'lucide-vue-next'
import { authSecondaryButton } from '~/utils/authUi'

type Provider = 'google' | 'facebook' | 'github'

const props = withDefaults(defineProps<{
  loading?: boolean
  actionLabel?: string
}>(), {
  loading: false,
  actionLabel: 'Continue',
})

const emit = defineEmits<{
  click: [provider: Provider]
}>()

const providers = [
  { id: 'google', name: 'Google', icon: null, iconClass: '' },
  { id: 'github', name: 'GitHub', icon: Github, iconClass: 'text-white light:text-[#24292e]' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, iconClass: 'text-[#4a8af4] light:text-[#1877F2]' },
] as const

function handleClick(provider: Provider) {
  if (!props.loading) emit('click', provider)
}
</script>
