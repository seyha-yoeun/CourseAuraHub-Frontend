<template>
  <div class="course-card glass glass-hover card-lift">
    <!-- Thumbnail & Badges -->
    <div class="card-media">
      <img
        :src="course.thumbnail || fallbackThumb"
        :alt="course.title"
        class="media-img"
        loading="lazy"
        @error="onImageError"
      />
      <div class="media-overlay"></div>
      
      <div class="media-top">
        <CourseStatusBadge :status="course.status" />
        <span class="level-pill">{{ course.level }}</span>
      </div>

      <div class="media-bottom">
        <span class="category-pill">{{ course.category }}</span>
        <span v-if="course.rating > 0" class="rating-pill">
          <Star :size="12" class="fill-amber-400 text-amber-400" />
          {{ course.rating.toFixed(1) }}
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="card-content">
      <div class="instructor-row">
        <span class="instructor-name">by {{ course.instructor }}</span>
        <span class="hours-tag">
          <Clock :size="12" />
          {{ course.totalHours }}h ({{ course.totalLessons }} lessons)
        </span>
      </div>

      <NuxtLink :to="`/courses/${course.slug}`" class="course-title-link">
        <h3 class="course-title">{{ course.title }}</h3>
      </NuxtLink>

      <p class="course-desc">{{ course.description }}</p>

      <!-- Tags -->
      <div v-if="course.tags && course.tags.length" class="tags-row">
        <span v-for="tag in course.tags.slice(0, 3)" :key="tag" class="tag-pill">
          #{{ tag }}
        </span>
        <span v-if="course.tags.length > 3" class="tag-pill tag-more">
          +{{ course.tags.length - 3 }}
        </span>
      </div>

      <!-- Metrics -->
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-lbl">Students</span>
          <span class="metric-val">
            <Users :size="13" class="text-violet-400" />
            {{ course.totalStudents.toLocaleString() }}
          </span>
        </div>
        <div class="metric-item">
          <span class="metric-lbl">Revenue</span>
          <span class="metric-val text-emerald-400">
            ${{ formatRevenue(course.revenue) }}
          </span>
        </div>
      </div>

      <!-- Footer: Pricing & Actions -->
      <div class="card-footer">
        <div class="price-wrap">
          <span class="current-price">${{ course.price.toFixed(2) }}</span>
          <span v-if="course.originalPrice > course.price" class="original-price">
            ${{ course.originalPrice.toFixed(2) }}
          </span>
        </div>

        <div class="actions-wrap">
          <button
            type="button"
            class="action-btn"
            title="Edit Course"
            @click.stop="$emit('edit', course)"
          >
            <Edit3 :size="15" />
          </button>
          <button
            type="button"
            class="action-btn text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            title="Delete Course"
            @click.stop="$emit('delete', course)"
          >
            <Trash2 :size="15" />
          </button>
          <NuxtLink
            :to="`/courses/${course.slug}`"
            class="details-btn"
            title="View Details & Analytics"
          >
            <span>Details</span>
            <ArrowRight :size="13" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, Clock, Users, Edit3, Trash2, ArrowRight } from 'lucide-vue-next'
import type { Course } from '~/types'
import CourseStatusBadge from './CourseStatusBadge.vue'

defineProps<{
  course: Course
}>()

defineEmits(['edit', 'delete'])

const fallbackThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop'

function onImageError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = fallbackThumb
}

function formatRevenue(val: number) {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
  return val.toFixed(0)
}
</script>

<style scoped>
.course-card {
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: rgba(18, 18, 28, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.course-card:hover .media-img {
  transform: scale(1.06);
}

.media-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 10, 15, 0.3) 0%, rgba(10, 10, 15, 0.7) 100%);
}

.media-top {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
}

.level-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.media-bottom {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
}

.category-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(124, 58, 237, 0.35);
  color: #c4b5fd;
  border: 1px solid rgba(124, 58, 237, 0.5);
  backdrop-filter: blur(6px);
}

.rating-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(0, 0, 0, 0.65);
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.card-content {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.instructor-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

.hours-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-title-link {
  text-decoration: none;
}

.course-title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1.35;
  transition: color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-title:hover {
  color: #a78bfa;
}

.course-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.tag-pill {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2px 7px;
  border-radius: 4px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 10px 14px;
  margin-top: 14px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-lbl {
  font-size: 10px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.4px;
}

.metric-val {
  font-size: 13px;
  font-weight: 700;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-footer {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.price-wrap {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.current-price {
  font-size: 18px;
  font-weight: 800;
  color: #f8fafc;
}

.original-price {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  text-decoration: line-through;
}

.actions-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.details-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.35);
  border-radius: 8px;
  color: #c4b5fd;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.details-btn:hover {
  background: rgba(124, 58, 237, 0.3);
  color: #fff;
  border-color: rgba(124, 58, 237, 0.6);
}

/* Light mode overrides */
html.light .course-card {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

html.light .course-card:hover {
  background: #ffffff;
  border-color: rgba(124, 58, 237, 0.35);
  box-shadow: 0 12px 30px rgba(124, 58, 237, 0.1);
}

html.light .instructor-row {
  color: #64748b;
}

html.light .course-title {
  color: #0f172a;
}

html.light .course-title:hover {
  color: #7c3aed;
}

html.light .course-desc {
  color: #475569;
}

html.light .metrics-grid {
  background: #f8fafc;
  border-color: #e2e8f0;
}

html.light .metric-lbl {
  color: #64748b;
}

html.light .metric-val {
  color: #0f172a;
}

html.light .current-price {
  color: #0f172a;
}

html.light .original-price {
  color: #94a3b8;
}

html.light .action-btn {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #475569;
}

html.light .action-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

html.light .details-btn {
  background: rgba(124, 58, 237, 0.1);
  border-color: rgba(124, 58, 237, 0.25);
  color: #6d28d9;
}

html.light .details-btn:hover {
  background: rgba(124, 58, 237, 0.2);
  color: #5b21b6;
}
</style>
