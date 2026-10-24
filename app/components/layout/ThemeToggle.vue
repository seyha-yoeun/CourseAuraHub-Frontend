<template>
  <button
    type="button"
    role="switch"
    :aria-checked="isDark"
    aria-label="Toggle dark mode"
    :title="isDark ? 'Switch to light mode (Ctrl/⌘+Shift+L)' : 'Switch to dark mode (Ctrl/⌘+Shift+L)'"
    class="group relative inline-flex h-9 w-[68px] shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_4px_14px_rgba(124,58,237,0.16)] focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none active:scale-[0.96] light:focus-visible:ring-offset-white"
    :class="
      isDark
        ? 'border-white/10 bg-white/6 hover:border-violet-500/40 hover:bg-white/9 light:border-slate-300 light:bg-slate-200/80 light:hover:border-violet-400'
        : 'border-slate-200 bg-slate-100 hover:border-slate-300 hover:bg-slate-200/80 light:border-slate-200 light:bg-slate-100 light:hover:border-slate-300'
    "
    @click="toggleTheme"
  >
    <!-- Sliding thumb -->
    <span
      aria-hidden="true"
      class="absolute top-0.5 left-0.5 size-8 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      :class="
        isDark
          ? 'translate-x-8 bg-linear-to-br from-violet-500 to-indigo-600 shadow-[0_2px_10px_rgba(124,58,237,0.45)]'
          : 'translate-x-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]'
      "
    />
    <!-- Mode icons -->
    <span class="relative z-1 flex w-full items-center justify-between px-2">
      <Sun
        :size="14"
        :stroke-width="2"
        class="transition-all duration-300"
        :class="
          !isDark
            ? 'scale-110 text-amber-500 drop-shadow-xs'
            : 'text-white/35 group-hover:text-white/55'
        "
      />
      <Moon
        :size="14"
        :stroke-width="2"
        class="transition-all duration-300"
        :class="
          isDark
            ? 'scale-110 text-white drop-shadow-sm'
            : 'text-slate-400 group-hover:text-slate-600'
        "
      />
    </span>
  </button>
</template>

<script setup lang="ts">
import { Moon, Sun } from "lucide-vue-next";

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

function toggleTheme() {
  colorMode.preference = isDark.value ? "light" : "dark";
}
</script>
