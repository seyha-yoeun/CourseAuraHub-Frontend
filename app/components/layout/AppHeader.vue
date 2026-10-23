<template>
  <header class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/8 bg-zinc-950/85 px-3.5 backdrop-blur-xl transition-colors duration-300 sm:px-6 light:border-slate-200 light:bg-white/90">
    <div class="flex min-w-0 items-center gap-4">
      <button
        class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/60 transition-colors hover:border-violet-500/40 hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 light:hover:text-slate-900"
        aria-label="Toggle sidebar"
        title="Toggle Sidebar (Ctrl+B)"
        @click="$emit('toggle-sidebar')"
      >
        <Menu :size="20" :stroke-width="1.5" />
      </button>

      <!-- Breadcrumb with CourseAuraHub Academy branding and high contrast -->
      <nav aria-label="Breadcrumb" class="hidden min-w-0 items-center overflow-hidden whitespace-nowrap sm:flex">
        <UBreadcrumb
          :items="breadcrumbItems"
          :ui="{
            list: 'm-0 flex list-none items-center gap-2 p-0',
            item: 'inline-flex items-center gap-2'
          }"
        >
          <template #separator>
            <ChevronRight :size="13" class="shrink-0 text-white/35 light:text-slate-400" />
          </template>
          <template #default="{ item, index }">
            <NuxtLink
              v-if="item.to && index < breadcrumbItems.length - 1"
              :to="item.to"
              class="text-[13px] font-medium text-white/65 no-underline transition-colors hover:text-violet-300 light:text-slate-600 light:hover:text-violet-700"
            >
              <span v-if="index === 0" class="inline-flex items-center gap-1.5">
                <span class="font-bold tracking-tight text-slate-100 light:text-slate-900">CourseAuraHub</span>
                <span class="rounded-full border border-violet-500/25 bg-violet-500/12 px-1.5 py-px text-[10px] font-bold tracking-wider text-violet-300 uppercase light:border-violet-300 light:bg-violet-50 light:text-violet-700">Academy</span>
              </span>
              <span v-else>{{ item.label }}</span>
            </NuxtLink>
            <span v-else class="text-[13px] font-semibold text-slate-50 light:text-slate-900">
              {{ item.label }}
            </span>
          </template>
        </UBreadcrumb>
      </nav>
    </div>

    <div class="flex items-center gap-2.5">
      <!-- Admin Management Trigger -->
      <button
        type="button"
        class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-500/35 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-violet-300 transition-all hover:border-violet-500/60 hover:bg-violet-500/30 hover:text-white hover:shadow-[0_0_15px_rgba(124,58,237,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-violet-300 light:bg-violet-50 light:text-violet-700 light:hover:bg-violet-100 light:hover:text-violet-900"
        title="Open Admin Management Console (Live CRUD)"
        @click="$emit('open-admin')"
      >
        <ShieldAlert :size="15" class="text-violet-400" />
        <span class="hidden md:inline">Admin CRUD</span>
      </button>

      <!-- Functional Search Bar with Instant Results Dropdown -->
      <div ref="searchContainerRef" class="relative hidden min-[840px]:block">
        <div class="relative flex items-center">
          <Search :size="15" class="pointer-events-none absolute left-2.5 text-white/35 light:text-slate-400" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search platform... (Ctrl+K)"
            class="h-9 w-55 rounded-lg border border-white/8 bg-white/4 py-1.75 pr-7 pl-8 text-[13px] text-white/85 outline-none transition-all duration-200 placeholder:text-white/30 focus:w-65 focus:border-violet-500/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20 light:border-slate-200 light:bg-slate-50 light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600 light:focus:bg-white"
            @focus="isSearchFocused = true"
            @keydown.esc="closeSearch"
          >
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2 flex cursor-pointer items-center justify-center rounded p-0.5 text-white/40 transition-colors hover:text-white light:text-slate-400 light:hover:text-slate-900"
            aria-label="Clear search"
            @click="clearSearch"
          >
            <X :size="13" />
          </button>
        </div>

        <!-- Search Results Dropdown -->
        <Transition v-bind="dropdownAnim">
          <div
            v-if="isSearchFocused && searchQuery.trim().length > 0"
            class="absolute top-full left-0 z-[60] mt-2 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-violet-500/30 bg-zinc-950 shadow-2xl shadow-black/80 ring-1 ring-violet-500/10 light:border-violet-500/25 light:bg-white light:shadow-xl light:ring-violet-500/10"
          >
            <div class="flex max-h-100 flex-col gap-2.5 overflow-y-auto p-2">
              <!-- Courses Group -->
              <div v-if="filteredCourses.length > 0" class="flex flex-col gap-1">
                <div class="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold tracking-wider text-white/45 uppercase light:text-slate-500">
                  <BookOpen :size="13" class="text-violet-400" />
                  <span>Courses ({{ filteredCourses.length }})</span>
                </div>
                <button
                  v-for="course in filteredCourses"
                  :key="course.id"
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left text-slate-100 transition-all hover:border-violet-500/30 hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-900 light:hover:bg-violet-50"
                  @click="goToCourse(course.slug)"
                >
                  <img :src="course.thumbnail" :alt="course.title" class="h-6 w-9 shrink-0 rounded object-cover" >
                  <div class="min-w-0 flex-1">
                    <span class="block truncate text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ course.title }}</span>
                    <span class="mt-px block truncate text-[11px] text-white/45 light:text-slate-500">{{ course.category }} • by {{ course.instructor }}</span>
                  </div>
                  <span class="text-xs font-bold text-emerald-400 light:text-emerald-700">${{ course.price.toFixed(2) }}</span>
                </button>
              </div>

              <!-- Students Group -->
              <div v-if="filteredStudents.length > 0" class="flex flex-col gap-1">
                <div class="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold tracking-wider text-white/45 uppercase light:text-slate-500">
                  <Users :size="13" class="text-blue-400" />
                  <span>Students ({{ filteredStudents.length }})</span>
                </div>
                <button
                  v-for="student in filteredStudents"
                  :key="student.id"
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left text-slate-100 transition-all hover:border-violet-500/30 hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-900 light:hover:bg-violet-50"
                  @click="goToStudents"
                >
                  <img :src="student.avatar" :alt="student.name" class="size-7 shrink-0 rounded-full border border-violet-500/30 object-cover" >
                  <div class="min-w-0 flex-1">
                    <span class="block truncate text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ student.name }}</span>
                    <span class="mt-px block truncate text-[11px] text-white/45 light:text-slate-500">{{ student.email }} • {{ student.country }}</span>
                  </div>
                  <span class="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] uppercase text-emerald-500 light:bg-emerald-50 light:text-emerald-700">{{ student.status }}</span>
                </button>
              </div>

              <!-- Quick Navigation Pages Group -->
              <div v-if="filteredPages.length > 0" class="flex flex-col gap-1">
                <div class="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold tracking-wider text-white/45 uppercase light:text-slate-500">
                  <Compass :size="13" class="text-emerald-400" />
                  <span>Navigation Pages</span>
                </div>
                <button
                  v-for="page in filteredPages"
                  :key="page.to"
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left text-slate-100 transition-all hover:border-violet-500/30 hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-900 light:hover:bg-violet-50"
                  @click="goToPage(page)"
                >
                  <component :is="page.icon" :size="15" class="text-violet-400" />
                  <div class="min-w-0 flex-1">
                    <span class="block truncate text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ page.name }}</span>
                    <span class="mt-px block truncate text-[11px] text-white/45 light:text-slate-500">{{ page.desc }}</span>
                  </div>
                </button>
              </div>

              <!-- No Results State -->
              <div
                v-if="filteredCourses.length === 0 && filteredStudents.length === 0 && filteredPages.length === 0"
                class="flex flex-col items-center gap-1.5 p-6 text-center text-[13px] text-white/50 light:text-slate-600"
              >
                <SearchX :size="20" class="text-white/40 light:text-slate-400" />
                <p>No results found for "{{ searchQuery }}"</p>
                <span class="text-xs text-white/40 light:text-slate-500">Try searching for "Nuxt", "Vue", "Alex", or "Analytics"</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Theme (Dark / Light Mode) Toggle -->
      <button
        type="button"
        class="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/60 transition-all duration-200 hover:rotate-[15deg] hover:border-violet-500/40 hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 light:hover:text-slate-900"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        aria-label="Toggle Dark and Light Mode"
        @click="toggleTheme"
      >
        <Sun v-if="isDark" :size="18" :stroke-width="1.6" class="text-amber-400" />
        <Moon v-else :size="18" :stroke-width="1.6" class="text-indigo-400" />
      </button>

      <!-- Notifications with Dropdown -->
      <div ref="notifContainerRef" class="relative">
        <button
          type="button"
          class="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/60 transition-all hover:border-violet-500/40 hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 light:hover:text-slate-900"
          :class="{ 'border-violet-500/40 bg-white/8 text-white light:bg-slate-200 light:text-slate-900': isNotifOpen }"
          aria-label="Notifications"
          title="Notifications"
          @click="toggleNotif"
        >
          <Bell :size="18" :stroke-width="1.5" />
          <span v-if="unreadNotifsCount > 0" class="absolute top-1.75 right-1.75 size-1.75 animate-pulse rounded-full border-[1.5px] border-zinc-950 bg-violet-600 light:border-white" />
        </button>

        <!-- Notifications Dropdown -->
        <Transition v-bind="dropdownAnim">
          <div
            v-if="isNotifOpen"
            class="absolute top-full right-0 z-[60] mt-2.5 w-85 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-violet-500/30 bg-zinc-950 shadow-2xl shadow-black/80 light:border-violet-500/25 light:bg-white"
          >
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-white/8 px-4 py-3.5 light:border-slate-200">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-slate-100 light:text-slate-900">Notifications</span>
                <span v-if="unreadNotifsCount > 0" class="rounded-full border border-violet-500/35 bg-violet-500/20 px-1.75 py-0.5 text-[10px] font-bold text-violet-300 light:border-violet-200 light:bg-violet-100 light:text-violet-700">{{ unreadNotifsCount }} new</span>
              </div>
              <button
                v-if="unreadNotifsCount > 0"
                type="button"
                class="cursor-pointer text-[11px] font-semibold text-violet-300 transition-colors hover:text-violet-200 hover:underline light:text-violet-700 light:hover:text-violet-800"
                @click="markAllAsRead"
              >
                Mark all read
              </button>
            </div>

            <!-- List -->
            <div class="flex max-h-80 flex-col overflow-y-auto">
              <div
                v-for="notif in notifications"
                :key="notif.id"
                class="relative flex cursor-pointer items-start gap-3 border-b border-white/4 px-4 py-3 transition-colors hover:bg-white/4 light:border-slate-100 light:hover:bg-slate-50"
                :class="{ 'bg-violet-500/[0.07] light:bg-violet-50': !notif.read }"
                @click="markItemRead(notif)"
              >
                <div class="mt-0.5 flex size-7.5 shrink-0 items-center justify-center rounded-lg" :class="notif.bgClass">
                  <component :is="notif.icon" :size="15" :class="notif.iconClass" />
                </div>
                <div class="flex-1">
                  <p class="text-xs leading-snug font-medium text-slate-200 light:text-slate-800">{{ notif.title }}</p>
                  <span class="mt-1 block text-[10px] text-white/40 light:text-slate-400">{{ notif.time }}</span>
                </div>
                <span v-if="!notif.read" class="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-600" />
              </div>
            </div>

            <!-- Footer link -->
            <div class="border-t border-white/6 bg-black/20 px-4 py-2.5 text-center light:border-slate-200 light:bg-slate-50">
              <NuxtLink to="/analytics" class="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-300 no-underline transition-colors hover:text-violet-200 light:text-violet-700 light:hover:text-violet-800" @click="isNotifOpen = false">
                <span>View Full Analytics Activity</span>
                <ArrowRight :size="12" />
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Help with Modal Trigger -->
      <button
        type="button"
        class="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/60 transition-all hover:border-violet-500/40 hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 light:hover:text-slate-900"
        aria-label="Help & About Platform"
        title="Help & Platform Guide (Ctrl+H)"
        @click="isHelpOpen = true"
      >
        <HelpCircle :size="18" :stroke-width="1.5" />
      </button>

      <!-- Avatar with User Dropdown -->
      <div ref="avatarContainerRef" class="relative">
        <div
          class="size-9 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-violet-500/50 transition-all duration-200 hover:scale-105 hover:border-violet-500 hover:shadow-[0_0_14px_rgba(124,58,237,0.5)] light:border-violet-300"
          :class="{ 'scale-105 border-violet-500 shadow-[0_0_14px_rgba(124,58,237,0.5)] light:border-violet-600': isAvatarOpen }"
          title="Alex Chen (Platform Administrator)"
          @click="toggleAvatar"
        >
          <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=AlexAdmin&backgroundColor=b6e3f4" alt="Alex Chen Profile" class="size-full object-cover" >
        </div>

        <!-- Avatar Dropdown Menu -->
        <Transition v-bind="dropdownAnim">
          <div
            v-if="isAvatarOpen"
            class="absolute top-full right-0 z-[60] mt-2.5 w-[270px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-violet-500/30 bg-zinc-950 p-2 shadow-2xl shadow-black/80 light:border-violet-500/25 light:bg-white"
          >
            <!-- User Summary Header -->
            <div class="flex items-center gap-3 px-2.5 pt-2.5 pb-3">
              <div class="relative">
                <img
                  src="https://api.dicebear.com/9.x/avataaars/svg?seed=AlexAdmin&backgroundColor=b6e3f4"
                  alt="Alex Chen"
                  class="size-11 rounded-full border-2 border-violet-500/40"
                >
                <span class="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-zinc-950 bg-emerald-500 light:border-white" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-sm font-bold text-slate-100 light:text-slate-900">Alex Chen</span>
                <span class="block truncate text-[11px] text-white/45 light:text-slate-500">alex.chen@courseaurahub.io</span>
                <span class="mt-0.75 inline-block rounded-full border border-violet-500/30 bg-violet-500/18 px-1.5 py-px text-[9px] font-bold tracking-wider text-violet-300 uppercase light:border-violet-200 light:bg-violet-50 light:text-violet-700">Platform Administrator</span>
              </div>
            </div>

            <div class="my-1 h-px bg-white/6 light:bg-slate-200" />

            <!-- Navigation Links -->
            <div class="flex flex-col gap-0.5">
              <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-white/75 no-underline transition-all hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900"
                @click="handleOpenAdmin"
              >
                <ShieldAlert :size="15" class="text-violet-400" />
                <span>Admin CRUD Console</span>
                <span class="ml-auto rounded-full border border-emerald-400/25 bg-emerald-400/12 px-1.5 py-px text-[10px] font-bold text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700">Live</span>
              </button>

              <NuxtLink
                to="/courses"
                class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-white/75 no-underline transition-all hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900"
                @click="isAvatarOpen = false"
              >
                <BookOpen :size="15" class="text-blue-400" />
                <span>Course Catalog</span>
              </NuxtLink>

              <NuxtLink
                to="/students"
                class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-white/75 no-underline transition-all hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900"
                @click="isAvatarOpen = false"
              >
                <Users :size="15" class="text-emerald-400" />
                <span>Students Roster</span>
              </NuxtLink>

              <NuxtLink
                to="/analytics"
                class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-white/75 no-underline transition-all hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900"
                @click="isAvatarOpen = false"
              >
                <BarChart3 :size="15" class="text-amber-400" />
                <span>Sales Analytics</span>
              </NuxtLink>

              <NuxtLink
                to="/settings"
                class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-white/75 no-underline transition-all hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900"
                @click="isAvatarOpen = false"
              >
                <Settings :size="15" class="text-purple-400" />
                <span>Platform Settings</span>
              </NuxtLink>

              <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-white/75 no-underline transition-all hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900"
                @click="handleOpenHelp"
              >
                <HelpCircle :size="15" class="text-teal-400" />
                <span>Platform Help & Guide</span>
              </button>
            </div>

            <div class="my-1 h-px bg-white/6 light:bg-slate-200" />

            <!-- Quick Theme Switch Row inside Dropdown -->
            <div class="flex items-center justify-between px-2.5 py-1.5">
              <span class="text-xs text-white/40 light:text-slate-500">Appearance</span>
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-white/6 px-2.25 py-1 text-[11px] font-semibold text-slate-100 transition-all hover:border-violet-500/40 hover:bg-violet-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-300 light:bg-slate-100 light:text-slate-900 light:hover:bg-violet-50"
                @click="toggleTheme"
              >
                <Sun v-if="!isDark" :size="13" class="text-amber-400" />
                <Moon v-else :size="13" class="text-indigo-400" />
                <span>{{ isDark ? 'Dark Theme' : 'Light Theme' }}</span>
              </button>
            </div>

            <div class="my-1 h-px bg-white/6 light:bg-slate-200" />

            <!-- Logout Button -->
            <button
              type="button"
              class="mt-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.25 text-[13px] font-semibold text-rose-400 transition-all hover:bg-rose-500/12 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:text-rose-600 light:hover:bg-rose-50 light:hover:text-rose-700"
              @click="handleLogout"
            >
              <LogOut :size="15" class="text-rose-400 light:text-rose-600" />
              <span>Log Out</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Help Modal Dialog -->
    <AppHelpModal
      :is-open="isHelpOpen"
      @close="isHelpOpen = false"
    />
  </header>
</template>

<script setup lang="ts">
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Settings,
  BookOpen,
  Users,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Star,
  RefreshCw,
  Compass,
  SearchX,
  X,
  ArrowRight
} from 'lucide-vue-next'
import AppHelpModal from '~/components/shared/AppHelpModal.vue'
import { useAppToast } from '~/composables/useAppToast'
import type { Course, Student } from '~/types'

defineProps<{ sidebarCollapsed: boolean }>()
const emit = defineEmits(['toggle-sidebar', 'open-admin'])

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()
const { info, success } = useAppToast()

// Dropdown and modal states
const isNotifOpen = ref(false)
const isAvatarOpen = ref(false)
const isHelpOpen = ref(false)

// Search state
const searchQuery = ref('')
const isSearchFocused = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchContainerRef = ref<HTMLElement | null>(null)
const notifContainerRef = ref<HTMLElement | null>(null)
const avatarContainerRef = ref<HTMLElement | null>(null)

// Dark/Light mode computed
const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  const nextMode = isDark.value ? 'light' : 'dark'
  colorMode.preference = nextMode
  info(`Theme Switched`, `Switched to ${nextMode.toUpperCase()} mode`)
}

// Breadcrumb items with CourseAuraHub branding
const breadcrumbItems = computed(() => {
  const path = route.path

  if (path === '/') {
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Dashboard' }
    ]
  }

  if (path === '/courses') {
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Courses' }
    ]
  }

  if (path.startsWith('/courses/')) {
    const slug = (route.params.slug as string) || path.replace('/courses/', '')
    const formatted = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Courses', to: '/courses' },
      { label: formatted }
    ]
  }

  if (path === '/students') {
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Students' }
    ]
  }

  if (path === '/analytics') {
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Analytics' }
    ]
  }

  if (path === '/settings') {
    return [
      { label: 'CourseAuraHub', to: '/' },
      { label: 'Settings' }
    ]
  }

  const segment = path.replace(/^\//, '').replace(/-/g, ' ')
  return [
    { label: 'CourseAuraHub', to: '/' },
    { label: segment.charAt(0).toUpperCase() + segment.slice(1) }
  ]
})

// Mock notifications state
const notifications = ref([
  {
    id: 1,
    title: 'Sarah Miller enrolled in Vue 3 Full-Stack Architecture ($89.99)',
    time: '5 mins ago',
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    bgClass: 'bg-emerald-400/15 light:bg-emerald-50',
    read: false
  },
  {
    id: 2,
    title: 'David Kim left a 5-star review on Advanced Pinia Patterns',
    time: '42 mins ago',
    icon: Star,
    iconClass: 'text-amber-400',
    bgClass: 'bg-amber-400/15 light:bg-amber-50',
    read: false
  },
  {
    id: 3,
    title: 'Revenue Milestone: Monthly course sales reached $12,500 target!',
    time: '2 hours ago',
    icon: TrendingUp,
    iconClass: 'text-violet-400',
    bgClass: 'bg-violet-500/15 light:bg-violet-50',
    read: false
  },
  {
    id: 4,
    title: 'Catalog updated: New course drafted in Web Development',
    time: '1 day ago',
    icon: RefreshCw,
    iconClass: 'text-blue-400',
    bgClass: 'bg-blue-400/15 light:bg-blue-50',
    read: true
  }
])

const unreadNotifsCount = computed(() => notifications.value.filter(n => !n.read).length)

function toggleNotif() {
  isNotifOpen.value = !isNotifOpen.value
  if (isNotifOpen.value) {
    isAvatarOpen.value = false
    isSearchFocused.value = false
  }
}

function markAllAsRead() {
  notifications.value.forEach(n => (n.read = true))
  info('Notifications Updated', 'All notifications marked as read')
}

function markItemRead(item: (typeof notifications.value)[0]) {
  item.read = true
}

// Avatar dropdown triggers
function toggleAvatar() {
  isAvatarOpen.value = !isAvatarOpen.value
  if (isAvatarOpen.value) {
    isNotifOpen.value = false
    isSearchFocused.value = false
  }
}

function handleOpenAdmin() {
  isAvatarOpen.value = false
  emit('open-admin')
}

function handleOpenHelp() {
  isAvatarOpen.value = false
  isHelpOpen.value = true
}

function handleLogout() {
  isAvatarOpen.value = false
  success('Logged Out Successfully', 'Your demo administrator session has been reset.')
}

// Fetch search datasets (courses & students)
const allCourses = ref<Course[]>([])
const allStudents = ref<Student[]>([])

async function loadSearchData() {
  try {
    const [cData, sData] = await Promise.all([
      $fetch<Course[]>('/api/courses').catch(() => []),
      $fetch<Student[]>('/api/students').catch(() => [])
    ])
    allCourses.value = cData || []
    allStudents.value = sData || []
  } catch (e) {
    console.error('Error fetching search indices:', e)
  }
}

onMounted(() => {
  loadSearchData()
})

const quickPages = [
  { name: 'Dashboard Overview', desc: 'Main sales KPIs, chart breakdowns, and metrics', to: '/', icon: BarChart3 },
  { name: 'Course Catalog & CRUD', desc: 'Manage curriculum, edit pricing, and publish courses', to: '/courses', icon: BookOpen },
  { name: 'Student Directory', desc: 'Active learners, enrollment dates, and lifetime spend', to: '/students', icon: Users },
  { name: 'Sales & Analytics', desc: 'Detailed financial and performance reports', to: '/analytics', icon: TrendingUp },
  { name: 'Platform Settings', desc: 'Storefront branding, preferences, and profile', to: '/settings', icon: Settings },
  { name: 'Admin Live Console', desc: 'Quick drawer operations, status toggles, and tools', to: 'admin', icon: ShieldAlert },
]

const filteredCourses = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []
  return allCourses.value
    .filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    )
    .slice(0, 4)
})

const filteredStudents = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []
  return allStudents.value
    .filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
    )
    .slice(0, 3)
})

const filteredPages = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []
  return quickPages.filter(p =>
    p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
  ).slice(0, 3)
})

function closeSearch() {
  isSearchFocused.value = false
}

function clearSearch() {
  searchQuery.value = ''
  if (searchInputRef.value) {
    searchInputRef.value.focus()
  }
}

function goToCourse(slug: string) {
  closeSearch()
  searchQuery.value = ''
  router.push(`/courses/${slug}`)
}

function goToStudents() {
  closeSearch()
  searchQuery.value = ''
  router.push('/students')
}

function goToPage(page: typeof quickPages[0]) {
  closeSearch()
  searchQuery.value = ''
  if (page.to === 'admin') {
    emit('open-admin')
  } else {
    router.push(page.to)
  }
}

// Global click-outside handling
function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node

  if (notifContainerRef.value && !notifContainerRef.value.contains(target)) {
    isNotifOpen.value = false
  }

  if (avatarContainerRef.value && !avatarContainerRef.value.contains(target)) {
    isAvatarOpen.value = false
  }

  if (searchContainerRef.value && !searchContainerRef.value.contains(target)) {
    isSearchFocused.value = false
  }
}

// Keyboard shortcuts (Ctrl+K or '/' to focus search, Ctrl+H for help)
function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchInputRef.value?.focus()
    isSearchFocused.value = true
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
    e.preventDefault()
    isHelpOpen.value = !isHelpOpen.value
  } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    e.preventDefault()
    searchInputRef.value?.focus()
    isSearchFocused.value = true
  } else if (e.key === 'Escape') {
    isNotifOpen.value = false
    isAvatarOpen.value = false
    isSearchFocused.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleGlobalKeydown)
})

const dropdownAnim = {
  enterActiveClass: 'transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
  leaveActiveClass: 'transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
  enterFromClass: 'scale-97 -translate-y-2 opacity-0',
  leaveToClass: 'scale-97 -translate-y-1.5 opacity-0'
}
</script>
