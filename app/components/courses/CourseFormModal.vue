<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-dialog glass" role="dialog" aria-modal="true">
          <!-- Header -->
          <div class="modal-top">
            <div class="header-info">
              <div class="modal-badge-icon">
                <BookPlus v-if="!isEdit" :size="20" class="text-violet-400" />
                <FileEdit v-else :size="20" class="text-violet-400" />
              </div>
              <div>
                <h2 class="modal-title">{{ isEdit ? 'Edit Course' : 'Create New Course' }}</h2>
                <p class="modal-sub">
                  {{ isEdit ? 'Update course curriculum, pricing, and status.' : 'Fill in the details to publish or draft a new course.' }}
                </p>
              </div>
            </div>
            <button type="button" class="close-btn" @click="$emit('close')">
              <X :size="18" />
            </button>
          </div>

          <!-- Form -->
          <form class="modal-form" @submit.prevent="handleSubmit">
            <!-- Row: Title & Category -->
            <div class="form-row">
              <div class="form-group flex-2">
                <label class="form-label">Course Title *</label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  placeholder="e.g. Master Nuxt 3 Full-Stack Architecture"
                  class="form-input"
                />
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Category</label>
                <select v-model="form.category" class="form-select">
                  <option value="Web Development">Web Development</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Backend">Backend</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Mobile">Mobile</option>
                </select>
              </div>
            </div>

            <!-- Row: Instructor, Level, Status -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Instructor Name</label>
                <input
                  v-model="form.instructor"
                  type="text"
                  placeholder="e.g. Alex Chen"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Difficulty Level</label>
                <select v-model="form.level" class="form-select">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Publishing Status</label>
                <select v-model="form.status" class="form-select">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <!-- Row: Pricing & Volume -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Price ($ USD) *</label>
                <input
                  v-model.number="form.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="99.99"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Original Price ($ USD)</label>
                <input
                  v-model.number="form.originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="149.99"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Total Lessons</label>
                <input
                  v-model.number="form.totalLessons"
                  type="number"
                  min="0"
                  placeholder="45"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Duration (Hours)</label>
                <input
                  v-model.number="form.totalHours"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="12.5"
                  class="form-input"
                />
              </div>
            </div>

            <!-- Row: Thumbnail URL with preview -->
            <div class="form-group">
              <label class="form-label">Thumbnail Image URL</label>
              <div class="thumb-input-row">
                <input
                  v-model="form.thumbnail"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  class="form-input"
                />
                <button
                  type="button"
                  class="sample-thumb-btn"
                  @click="generateSampleThumb"
                >
                  Random Tech Photo
                </button>
              </div>
              <div v-if="form.thumbnail" class="thumb-preview-wrap">
                <img :src="form.thumbnail" alt="Preview" class="thumb-preview" />
              </div>
            </div>

            <!-- Row: Description -->
            <div class="form-group">
              <label class="form-label">Course Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Comprehensive course overview covering key learning milestones and techniques..."
                class="form-textarea"
              ></textarea>
            </div>

            <!-- Row: Tags -->
            <div class="form-group">
              <label class="form-label">Tags (comma-separated)</label>
              <input
                v-model="rawTags"
                type="text"
                placeholder="Nuxt 3, Vue, TypeScript, Tailwind"
                class="form-input"
              />
            </div>

            <!-- Footer Actions -->
            <div class="form-footer">
              <button
                type="button"
                class="btn-secondary"
                :disabled="loading"
                @click="$emit('close')"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="loading"
              >
                <Loader2 v-if="loading" :size="16" class="animate-spin" />
                <span>{{ loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Course' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { BookPlus, FileEdit, X, Loader2 } from 'lucide-vue-next'
import type { Course, CourseFormData } from '~/types'

const props = defineProps<{
  isOpen: boolean
  course?: Course | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: CourseFormData): void
}>()

const isEdit = computed(() => !!props.course)

const form = reactive<CourseFormData>({
  title: '',
  description: '',
  instructor: 'Alex Chen',
  category: 'Web Development',
  level: 'Intermediate',
  status: 'draft',
  price: 99.99,
  originalPrice: 149.99,
  totalLessons: 40,
  totalHours: 12.0,
  thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
  tags: ['Nuxt 3', 'Vue 3']
})

const rawTags = ref('')

watch(
  () => props.course,
  (c) => {
    if (c) {
      form.title = c.title
      form.description = c.description
      form.instructor = c.instructor
      form.category = c.category
      form.level = c.level
      form.status = c.status
      form.price = c.price
      form.originalPrice = c.originalPrice
      form.totalLessons = c.totalLessons
      form.totalHours = c.totalHours
      form.thumbnail = c.thumbnail
      form.tags = [...(c.tags || [])]
      rawTags.value = (c.tags || []).join(', ')
    } else {
      form.title = ''
      form.description = ''
      form.instructor = 'Alex Chen'
      form.category = 'Web Development'
      form.level = 'Intermediate'
      form.status = 'draft'
      form.price = 99.99
      form.originalPrice = 149.99
      form.totalLessons = 40
      form.totalHours = 12.0
      form.thumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop'
      form.tags = ['Nuxt 3', 'Vue 3']
      rawTags.value = 'Nuxt 3, Vue 3'
    }
  },
  { immediate: true }
)

const techImages = [
  'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop'
]

function generateSampleThumb() {
  const random = techImages[Math.floor(Math.random() * techImages.length)]
  form.thumbnail = random
}

function handleSubmit() {
  form.tags = rawTags.value
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
  emit('submit', { ...form })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 5, 12, 0.82);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 100;
}

.modal-dialog {
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  background: #0f1019;
  border: 1px solid rgba(124, 58, 237, 0.25);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(124, 58, 237, 0.15);
}

html.light .modal-dialog {
  background: #ffffff;
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.15), 0 0 35px rgba(124, 58, 237, 0.12);
}

.modal-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

html.light .modal-top {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-badge-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
}

html.light .modal-title {
  color: #0f172a;
}

.modal-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 2px;
}

html.light .modal-sub {
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

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
}

.flex-1 { flex: 1 1 180px; }
.flex-2 { flex: 2 1 280px; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 180px;
  min-width: 0;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.5px;
}

html.light .form-label {
  color: #475569;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: all 0.2s;
}

html.light .form-input,
html.light .form-select,
html.light .form-textarea {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

.form-select {
  background-color: #12131f;
  color: #e2e8f0;
}

html.light .form-select {
  background-color: #ffffff;
  color: #0f172a;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: rgba(124, 58, 237, 0.5);
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.15);
}

html.light .form-input:focus,
html.light .form-select:focus,
html.light .form-textarea:focus {
  background: #ffffff;
  border-color: #7c3aed;
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.15);
}

.thumb-input-row {
  display: flex;
  gap: 10px;
}

.sample-thumb-btn {
  padding: 0 14px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.35);
  color: #c4b5fd;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.sample-thumb-btn:hover {
  background: rgba(124, 58, 237, 0.3);
  color: #fff;
}

.thumb-preview-wrap {
  margin-top: 8px;
  border-radius: 10px;
  overflow: hidden;
  max-width: 220px;
  aspect-ratio: 16 / 9;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.thumb-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 8px;
}

.btn-secondary {
  padding: 10px 20px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
}

.btn-primary {
  padding: 10px 24px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
}

.btn-primary:disabled, .btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
