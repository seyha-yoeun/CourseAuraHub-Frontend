<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-dialog glass" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="icon-danger">
              <AlertTriangle :size="24" class="text-rose-400" />
            </div>
            <div>
              <h3 class="modal-title">{{ title || 'Confirm Deletion' }}</h3>
              <p class="modal-desc">{{ description || 'Are you sure you want to delete this item? This action cannot be undone.' }}</p>
            </div>
          </div>

          <div v-if="itemName" class="item-preview">
            <span class="preview-label">Selected item:</span>
            <span class="preview-title">{{ itemName }}</span>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="btn-cancel"
              :disabled="loading"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn-danger"
              :disabled="loading"
              @click="$emit('confirm')"
            >
              <Loader2 v-if="loading" :size="16" class="animate-spin" />
              <span>{{ loading ? 'Deleting...' : 'Delete Permanently' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, Loader2 } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  title?: string
  description?: string
  itemName?: string
  loading?: boolean
}>()

defineEmits(['close', 'confirm'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 100;
}

.modal-dialog {
  width: 100%;
  max-width: 480px;
  background: #0f1019;
  border: 1px solid rgba(244, 63, 94, 0.25);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 35px rgba(244, 63, 94, 0.15);
}

.modal-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.icon-danger {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.2;
}

.modal-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
  line-height: 1.5;
}

.item-preview {
  margin: 16px 0;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-label {
  font-size: 11px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.5px;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.btn-cancel {
  padding: 9px 18px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
}

.btn-danger {
  padding: 9px 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e11d48, #be123c);
  border: 1px solid rgba(244, 63, 94, 0.4);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #f43f5e, #e11d48);
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.4);
}

.btn-danger:disabled, .btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
