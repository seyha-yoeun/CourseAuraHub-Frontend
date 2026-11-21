<template>
  <section :class="cardClass">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/12">
          <Target :size="20" class="text-emerald-400 light:text-emerald-700" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-100 light:text-slate-900">{{ t('Weekly goal') }}</h2>
          <p v-if="goal?.weeklyLessonsTarget" class="mt-0.5 text-xs text-white/50 light:text-slate-500">
            {{ t('{done} of {target} lessons this week', { done: goal.lessonsThisWeek, target: goal.weeklyLessonsTarget }) }}
          </p>
          <p v-else class="mt-0.5 text-xs text-white/50 light:text-slate-500">{{ t('Set a target to keep a steady pace.') }}</p>
        </div>
      </div>
      <button v-if="!editing" type="button" class="cursor-pointer text-xs font-semibold text-brand-300 light:text-brand-700" @click="startEditing">
        {{ goal?.weeklyLessonsTarget ? t('Change') : t('Set a goal') }}
      </button>
    </div>

    <div v-if="loading" class="mt-3 h-2 animate-pulse rounded-full bg-white/5 light:bg-slate-100" />
    <template v-else-if="goal">
      <div v-if="goal.weeklyLessonsTarget && !editing" class="mt-3">
        <div class="h-2 overflow-hidden rounded-full bg-white/8 light:bg-slate-100">
          <div class="h-full rounded-full transition-all" :class="goal.achieved ? 'bg-emerald-500' : 'bg-brand-500'" :style="{ width: `${goal.progressPercent}%` }" />
        </div>
        <p v-if="goal.achieved" class="mt-2 text-xs font-semibold text-emerald-400 light:text-emerald-700">{{ t('Goal reached this week. Nice work!') }}</p>
      </div>

      <form v-if="editing" class="mt-3 flex flex-wrap items-center gap-2" @submit.prevent="save(Number(target) || null)">
        <input v-model.number="target" type="number" min="1" max="100" :aria-label="t('Lessons per week')" class="w-24" :class="inputClass">
        <span class="text-xs text-white/55 light:text-slate-500">{{ t('lessons per week') }}</span>
        <button type="submit" :class="primaryAction" :disabled="saving">{{ t('Save') }}</button>
        <button v-if="goal.weeklyLessonsTarget" type="button" :class="dangerAction" :disabled="saving" @click="save(null)">{{ t('Remove goal') }}</button>
        <button type="button" class="cursor-pointer text-xs font-semibold text-white/50 light:text-slate-500" @click="editing = false">{{ t('Cancel') }}</button>
      </form>

      <label class="mt-3 flex cursor-pointer items-center gap-2 text-xs text-white/60 light:text-slate-600">
        <input type="checkbox" :checked="goal.leaderboardVisible" :disabled="saving" class="accent-brand-500" @change="toggleVisible">
        {{ t('Show me on leaderboards') }}
      </label>
    </template>
  </section>
</template>

<script setup lang="ts">
import { Target } from 'lucide-vue-next'
import type { WeeklyGoal } from '~/types/leaderboard'
import { useAppToast } from '~/composables/useAppToast'
import { useLeaderboard } from '~/composables/useLeaderboard'
import { getErrorMessage } from '~/utils/apiError'
import { cardClass, dangerAction, inputClass, primaryAction } from '~/utils/ui'

/** The learner's weekly lesson target, their progress since Monday, and whether they appear on leaderboards. */
const emit = defineEmits<{ changed: [goal: WeeklyGoal] }>()

const { t } = useT()
const toast = useAppToast()
const { fetchGoal, saveGoal } = useLeaderboard()

const goal = ref<WeeklyGoal | null>(null)
const loading = ref(true)
const saving = ref(false)
const editing = ref(false)
const target = ref<number | ''>(5)

onMounted(async () => {
  goal.value = await fetchGoal().catch(() => null)
  loading.value = false
})

function startEditing() {
  target.value = goal.value?.weeklyLessonsTarget ?? 5
  editing.value = true
}

async function persist(body: { weeklyLessonsTarget: number | null, leaderboardVisible?: boolean }, message: string) {
  saving.value = true
  try {
    goal.value = await saveGoal(body)
    editing.value = false
    emit('changed', goal.value)
    toast.success(message)
  } catch (err) {
    toast.error(t('Goal not saved'), getErrorMessage(err, t('Unable to save your weekly goal')))
  } finally {
    saving.value = false
  }
}

function save(value: number | null) {
  return persist({ weeklyLessonsTarget: value }, value ? t('Weekly goal saved') : t('Weekly goal removed'))
}

// A null target would clear the goal, so the current one is sent along
function toggleVisible() {
  const visible = !goal.value?.leaderboardVisible
  return persist({ weeklyLessonsTarget: goal.value?.weeklyLessonsTarget ?? null, leaderboardVisible: visible },
    visible ? t('You\'re on the leaderboards') : t('You\'re hidden from leaderboards'))
}
</script>
