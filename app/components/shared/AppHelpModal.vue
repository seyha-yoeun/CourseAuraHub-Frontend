<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="help-dialog glass" role="dialog" aria-modal="true" aria-labelledby="help-title">
          <!-- Top bar -->
          <div class="help-top">
            <div class="help-header-title">
              <div class="icon-avatar">
                <HelpCircle :size="20" class="text-violet-400" />
              </div>
              <div>
                <h2 id="help-title" class="dialog-title">CourseAuraHub Academy Help & Guide</h2>
                <p class="dialog-subtitle">Platform overview, system features, and productivity shortcuts</p>
              </div>
            </div>
            <button
              type="button"
              class="close-btn"
              aria-label="Close help modal"
              @click="$emit('close')"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Body content with tabs/sections -->
          <div class="help-body">
            <!-- App Architecture & Overview -->
            <div class="help-section">
              <h3 class="section-title">
                <Sparkles :size="15" class="text-violet-400" />
                <span>About CourseAuraHub Academy</span>
              </h3>
              <p class="section-desc">
                CourseAuraHub is a production-grade online course sales and learning management console. It enables course creators, educators, and administrators to orchestrate course catalogs, monitor learner progress, analyze sales trends, and execute live CRUD operations in real time.
              </p>
            </div>

            <!-- Features Grid -->
            <div class="features-grid">
              <div class="feature-item">
                <div class="feature-icon bg-violet">
                  <BookOpen :size="16" class="text-violet-400" />
                </div>
                <div>
                  <h4 class="feature-name">Course Catalog & CRUD</h4>
                  <p class="feature-text">Create, edit, archive, and publish courses with pricing, difficulty levels, and tags.</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon bg-blue">
                  <GraduationCap :size="16" class="text-blue-400" />
                </div>
                <div>
                  <h4 class="feature-name">Student Performance</h4>
                  <p class="feature-text">Track learner completion rates, lifetime spend, enrollment timestamps, and active status.</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon bg-emerald">
                  <BarChart3 :size="16" class="text-emerald-400" />
                </div>
                <div>
                  <h4 class="feature-name">Live Sales Analytics</h4>
                  <p class="feature-text">Analyze monthly recurring revenue, course performance charts, and distribution metrics.</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon bg-purple">
                  <ShieldAlert :size="16" class="text-violet-400" />
                </div>
                <div>
                  <h4 class="feature-name">Admin Quick Console</h4>
                  <p class="feature-text">Slide-out drawer with one-click course status toggles, student creation, and seed data tools.</p>
                </div>
              </div>
            </div>

            <!-- Keyboard Shortcuts Table -->
            <div class="help-section">
              <h3 class="section-title">
                <Command :size="15" class="text-violet-400" />
                <span>Productivity Keyboard Shortcuts</span>
              </h3>
              <div class="shortcuts-table">
                <div class="shortcut-row">
                  <span class="shortcut-action">Focus Global Search</span>
                  <div class="keys-wrap">
                    <kbd class="key-badge">Ctrl</kbd>
                    <span>+</span>
                    <kbd class="key-badge">K</kbd>
                    <span class="text-muted text-xs">or</span>
                    <kbd class="key-badge">/</kbd>
                  </div>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-action">Open / Close Help Guide</span>
                  <div class="keys-wrap">
                    <kbd class="key-badge">Ctrl</kbd>
                    <span>+</span>
                    <kbd class="key-badge">H</kbd>
                  </div>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-action">Close Active Dropdown or Modal</span>
                  <div class="keys-wrap">
                    <kbd class="key-badge">Esc</kbd>
                  </div>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-action">Toggle Theme (Dark / Light)</span>
                  <div class="keys-wrap">
                    <kbd class="key-badge">Header Toggle Button</kbd>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tech Stack Badges -->
            <div class="tech-stack-row">
              <span class="tech-pill">Nuxt 4.5</span>
              <span class="tech-pill">Vue 3.5</span>
              <span class="tech-pill">Nuxt UI 4.11</span>
              <span class="tech-pill">Pinia State</span>
              <span class="tech-pill">Chart.js</span>
              <span class="tech-pill">DiceBear Avatars</span>
            </div>
          </div>

          <!-- Bottom Footer -->
          <div class="help-footer">
            <span class="version-tag">Version 2.4.0 (Experimental Showcase)</span>
            <button
              type="button"
              class="got-it-btn"
              @click="$emit('close')"
            >
              <Check :size="15" />
              <span>Got It, Thanks!</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  HelpCircle,
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  BarChart3,
  ShieldAlert,
  Command,
  Check
} from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.modal-overlay {
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

.help-dialog {
  width: 100%;
  max-width: 650px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: #0f101b;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.9), 0 0 40px rgba(124, 58, 237, 0.18);
}

html.light .help-dialog {
  background: #ffffff;
  border-color: rgba(124, 58, 237, 0.25);
  box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.15), 0 0 35px rgba(124, 58, 237, 0.12);
}

.help-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

html.light .help-top {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.help-header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(124, 58, 237, 0.16);
  border: 1px solid rgba(124, 58, 237, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-title {
  font-size: 17px;
  font-weight: 700;
  color: #f8fafc;
}

html.light .dialog-title {
  color: #0f172a;
}

.dialog-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 2px;
}

html.light .dialog-subtitle {
  color: #64748b;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

html.light .close-btn {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #64748b;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

html.light .close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.help-body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #e2e8f0;
  margin-bottom: 8px;
}

html.light .section-title {
  color: #1e293b;
}

.section-desc {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
}

html.light .section-desc {
  color: #475569;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 600px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

html.light .feature-item {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.feature-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-violet { background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.3); }
.bg-blue { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); }
.bg-emerald { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); }
.bg-purple { background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); }

.feature-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

html.light .feature-name {
  color: #0f172a;
}

.feature-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 2px;
  line-height: 1.4;
}

html.light .feature-text {
  color: #64748b;
}

.shortcuts-table {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

html.light .shortcuts-table {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 12px;
}

html.light .shortcut-row {
  border-bottom-color: #e2e8f0;
}

.shortcut-row:last-child {
  border-bottom: none;
}

.shortcut-action {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

html.light .shortcut-action {
  color: #334155;
}

.keys-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.key-badge {
  padding: 2px 7px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  font-size: 11px;
  font-family: monospace;
  color: #c4b5fd;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

html.light .key-badge {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #7c3aed;
}

.tech-stack-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
}

.tech-pill {
  font-size: 11px;
  font-weight: 500;
  color: #a78bfa;
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(124, 58, 237, 0.25);
  padding: 3px 9px;
  border-radius: 99px;
}

html.light .tech-pill {
  color: #6d28d9;
  background: #ede9fe;
  border-color: #ddd6fe;
}

.help-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
}

html.light .help-footer {
  background: #f8fafc;
  border-top-color: #e2e8f0;
}

.version-tag {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

html.light .version-tag {
  color: #94a3b8;
}

.got-it-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.got-it-btn:hover {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
}

/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
