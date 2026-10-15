<template>
  <div class="social-login-section">
    <div class="auth-divider">
      <span>Or sign in with</span>
    </div>
    
    <div class="social-buttons">
      <button
        v-for="provider in providers"
        :key="provider.id"
        :class="['social-btn', provider.id]"
        @click="handleClick(provider.id)"
        :disabled="loading"
        type="button"
      >
        <component :is="provider.icon" :size="20" class="social-icon" />
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
  { id: 'google', name: 'Google', icon: Chrome },
  { id: 'github', name: 'GitHub', icon: Github },
  { id: 'facebook', name: 'Facebook', icon: Facebook }
] as const

function handleClick(provider: 'google' | 'facebook' | 'github') {
  if (!props.loading) {
    emit('click', provider)
  }
}
</script>

<style scoped>
.social-login-section {
  margin-top: 24px;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
  margin-bottom: 16px;
}

html.light .auth-divider {
  color: rgba(0, 0, 0, 0.3);
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent);
}

html.light .auth-divider::before,
html.light .auth-divider::after {
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent);
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

html.light .social-btn {
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #334155;
}

.social-btn:hover:not(:disabled) {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.08);
  color: var(--text-primary, #fff);
  transform: scale(1.02);
}

html.light .social-btn:hover:not(:disabled) {
  border-color: var(--emerald-500);
  background: var(--emerald-50);
  color: #0f172a;
}

.social-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-btn.google .social-icon {
  color: #4285F4;
}

.social-btn.github .social-icon {
  color: #24292E;
}

.social-btn.facebook .social-icon {
  color: #1877F2;
}

.social-icon {
  flex-shrink: 0;
}
</style>