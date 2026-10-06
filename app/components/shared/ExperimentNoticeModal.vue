<template>
  <Teleport to="body">
    <Transition name="notice-fade">
      <div v-if="isOpen" class="notice-overlay" @click.self="dismissNotice">
        <div class="notice-dialog glass" role="dialog" aria-modal="true" aria-labelledby="notice-title">
          <!-- Ambient Glow decoration -->
          <div class="notice-glow"></div>

          <!-- Header badge -->
          <div class="notice-badge-wrap">
            <span class="notice-tag">
              <FlaskConical :size="13" class="text-violet-400" />
              <span>Experimental Platform Sandbox</span>
            </span>
            <span class="timer-pill" title="This notice will be remembered for 30 minutes">
              <Clock :size="12" />
              <span>30m Cache</span>
            </span>
          </div>

          <!-- Header Title -->
          <div class="notice-header">
            <div class="header-icon-box">
              <Sparkles :size="24" class="text-violet-400" />
            </div>
            <div>
              <h2 id="notice-title" class="notice-title">Welcome to CourseAuraHub Academy</h2>
              <p class="notice-sub">Important visitor information and sandbox usage disclaimer</p>
            </div>
          </div>

          <!-- Key Notices List -->
          <div class="notice-cards">
            <!-- Point 1: Experimental Only -->
            <div class="notice-card-item">
              <div class="item-icon-circle bg-violet">
                <FlaskConical :size="18" class="text-violet-400" />
              </div>
              <div class="item-text">
                <h4 class="item-heading">Experimental & Educational Purpose Only</h4>
                <p class="item-desc">
                  This web application is an interactive architectural showcase built for experimental evaluation, testing, and modern Nuxt 4 learning. It is not a commercial service.
                </p>
              </div>
            </div>

            <!-- Point 2: No Advertisements -->
            <div class="notice-card-item">
              <div class="item-icon-circle bg-amber">
                <ShieldCheck :size="18" class="text-amber-400" />
              </div>
              <div class="item-text">
                <h4 class="item-heading">Zero Advertisements & Privacy-First</h4>
                <p class="item-desc">
                  No commercial advertisements, third-party sponsors, tracking cookies, or marketing banners are provided or supported. Enjoy a clean, distraction-free environment.
                </p>
              </div>
            </div>

            <!-- Point 3: Safe Simulated Sandbox Data -->
            <div class="notice-card-item">
              <div class="item-icon-circle bg-emerald">
                <Database :size="18" class="text-emerald-400" />
              </div>
              <div class="item-text">
                <h4 class="item-heading">Simulated Mock Catalog & Live CRUD</h4>
                <p class="item-desc">
                  All courses, pricing figures, revenue charts, and student accounts are simulated mock data. Feel free to create, modify, publish, or delete courses safely.
                </p>
              </div>
            </div>
          </div>

          <!-- Expiry Notice Card -->
          <div class="storage-notice">
            <Info :size="15" class="text-blue-400 flex-shrink-0" />
            <span>
              Your acknowledgment is saved in your browser's <strong>localStorage</strong> and will automatically expire in <strong>30 minutes</strong>.
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="notice-actions">
            <button
              type="button"
              class="btn-dismiss-primary"
              @click="dismissNotice"
            >
              <CheckCircle2 :size="16" />
              <span>I Understand & Continue</span>
            </button>

            <button
              type="button"
              class="btn-dismiss-secondary"
              @click="exploreCatalog"
            >
              <BookOpen :size="15" />
              <span>Explore Courses</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  FlaskConical,
  Clock,
  Sparkles,
  ShieldCheck,
  Database,
  Info,
  CheckCircle2,
  BookOpen
} from 'lucide-vue-next'
import { useAppToast } from '~/composables/useAppToast'

const STORAGE_KEY = 'courseaurahub_experiment_notice'
const EXPIRY_DURATION_MS = 30 * 60 * 1000 // 30 minutes in milliseconds

const isOpen = ref(false)
const router = useRouter()
const { info } = useAppToast()

function checkStorageStatus() {
  if (!import.meta.client) return

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      isOpen.value = true
      return
    }

    const parsed = JSON.parse(raw)
    const now = Date.now()

    if (!parsed.expiresAt || now > parsed.expiresAt) {
      // Expired!
      isOpen.value = true
    } else {
      isOpen.value = false
    }
  } catch {
    isOpen.value = true
  }
}

function dismissNotice() {
  if (import.meta.client) {
    try {
      const now = Date.now()
      const data = {
        dismissedAt: now,
        expiresAt: now + EXPIRY_DURATION_MS
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Could not write to localStorage:', e)
    }
  }

  isOpen.value = false
  info('Welcome to CourseAuraHub Academy', 'Sandbox session active. Have fun testing!')
}

function exploreCatalog() {
  dismissNotice()
  router.push('/courses')
}

onMounted(() => {
  // Give a tiny delay for smooth initial entrance after mount
  setTimeout(() => {
    checkStorageStatus()
  }, 250)
})
</script>

<style scoped>
.notice-overlay {
  position: fixed;
  inset: 0;
  background: rgba(3, 4, 10, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 9999;
}

.notice-dialog {
  width: 100%;
  max-width: 580px;
  background: #0f101a;
  border: 1px solid rgba(139, 92, 246, 0.35);
  border-radius: 24px;
  padding: 28px 28px 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.9), 0 0 50px rgba(124, 58, 237, 0.2);
}

html.light .notice-dialog {
  background: #ffffff;
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.18), 0 0 40px rgba(124, 58, 237, 0.15);
}

.notice-glow {
  position: absolute;
  top: -80px;
  right: -80px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.25), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.notice-badge-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.notice-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #c4b5fd;
  background: rgba(124, 58, 237, 0.16);
  border: 1px solid rgba(124, 58, 237, 0.35);
  padding: 4px 10px;
  border-radius: 99px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.timer-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px 9px;
  border-radius: 99px;
}

html.light .timer-pill {
  color: #64748b;
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.header-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(124, 58, 237, 0.18);
  border: 1px solid rgba(124, 58, 237, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.25);
}

.notice-title {
  font-size: 20px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.4px;
}

html.light .notice-title {
  color: #0f172a;
}

.notice-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

html.light .notice-sub {
  color: #64748b;
}

.notice-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
}

.notice-card-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s;
}

html.light .notice-card-item {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.notice-card-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.25);
}

html.light .notice-card-item:hover {
  background: #ffffff;
  border-color: rgba(124, 58, 237, 0.3);
}

.item-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-violet {
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.bg-amber {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.bg-emerald {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.item-text {
  flex: 1;
}

.item-heading {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  line-height: 1.3;
}

html.light .item-heading {
  color: #0f172a;
}

.item-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 3px;
  line-height: 1.45;
}

html.light .item-desc {
  color: #64748b;
}

.storage-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  font-size: 12px;
  color: #93c5fd;
  margin-bottom: 20px;
  line-height: 1.4;
}

html.light .storage-notice {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}

.notice-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-dismiss-primary {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
}

.btn-dismiss-primary:hover {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  box-shadow: 0 0 25px rgba(124, 58, 237, 0.5);
  transform: translateY(-1px);
}

.btn-dismiss-secondary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 12px 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

html.light .btn-dismiss-secondary {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #334155;
}

.btn-dismiss-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

html.light .btn-dismiss-secondary:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Modal Transition */
.notice-fade-enter-active,
.notice-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.notice-fade-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.notice-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

@media (max-width: 640px) {
  .notice-dialog {
    padding: 20px 18px;
  }
  .notice-actions {
    flex-direction: column;
  }
  .btn-dismiss-primary,
  .btn-dismiss-secondary {
    width: 100%;
  }
}
</style>
