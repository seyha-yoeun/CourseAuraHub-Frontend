<template>
  <span class="status-badge" :class="`badge-${status}`">
    <span class="status-dot"></span>
    <span class="status-text">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: 'published' | 'draft' | 'archived' | string
}>()

const label = computed(() => {
  if (props.status === 'published') return 'Published'
  if (props.status === 'draft') return 'Draft'
  if (props.status === 'archived') return 'Archived'
  return props.status
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;
  text-transform: capitalize;
  width: fit-content;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge-published {
  background: rgba(52, 211, 153, 0.12);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.3);
}
.badge-published .status-dot {
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
}

.badge-draft {
  background: rgba(251, 191, 36, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}
.badge-draft .status-dot {
  background: #fbbf24;
  box-shadow: 0 0 8px #fbbf24;
}

.badge-archived {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}
.badge-archived .status-dot {
  background: #94a3b8;
}
</style>
