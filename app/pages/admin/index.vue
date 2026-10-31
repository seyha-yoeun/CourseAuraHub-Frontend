<template>
  <div class="flex flex-col gap-5">
    <!-- Console header -->
    <section class="relative overflow-hidden rounded-[20px] border border-violet-500/25 bg-linear-to-br from-violet-600/10 via-blue-600/5 to-transparent p-5 backdrop-blur-md sm:p-6 lg:p-7 light:border-violet-200 light:from-violet-50 light:via-white light:to-white">
      <div class="pointer-events-none absolute -top-23 -right-18 size-60 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.16),transparent_70%)] blur-2xl light:bg-[radial-gradient(circle,rgba(124,58,237,0.09),transparent_70%)]" />

      <div class="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex min-w-0 items-start gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-violet-500/35 bg-violet-500/15 shadow-[0_0_24px_rgba(124,58,237,0.18)] light:border-violet-200 light:bg-violet-50">
            <ShieldAlert :size="24" class="text-violet-300 light:text-violet-700" />
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-2xl font-extrabold tracking-tight text-slate-50 sm:text-[26px] light:text-slate-900">
                Admin Console
              </h1>
              <span
                class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                :class="loadError
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 light:border-rose-200 light:bg-rose-50 light:text-rose-700'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700'"
              >
                <span
                  class="size-1.5 rounded-full"
                  :class="loadError ? 'bg-rose-400' : 'animate-pulse bg-emerald-400'"
                />
                {{ loadError ? 'Sync Issue' : 'Live Data' }}
              </span>
            </div>
            <p class="mt-1 max-w-2xl text-[13px] text-white/50 light:text-slate-500">
              Manage courses, students, and platform operations from one dedicated workspace.
            </p>
            <p class="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-white/35 light:text-slate-400">
              <span>Signed in as <strong class="font-semibold text-white/55 light:text-slate-600">{{ auth.userName }}</strong></span>
              <span class="hidden sm:inline">·</span>
              <span class="hidden sm:inline">{{ auth.roleLabel }}</span>
              <span class="hidden size-0.5 rounded-full bg-white/25 sm:inline-block light:bg-slate-300" />
              <span> Last sync: {{ lastLoadedLabel }}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-3.5 py-2.25 text-[13px] font-medium text-white/70 transition-all enabled:hover:bg-white/9 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:enabled:hover:bg-slate-200 light:enabled:hover:text-slate-900"
            :disabled="refreshing"
            @click="handleRefresh"
          >
            <RefreshCw :size="15" :class="{ 'animate-spin': refreshing }" />
            <span>{{ refreshing ? 'Syncing...' : 'Sync Data' }}</span>
          </button>

          <button
            type="button"
            class="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/5 px-3.5 py-2.25 text-[13px] font-medium text-white/70 transition-all enabled:hover:bg-white/9 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-700 light:enabled:hover:bg-slate-200 light:enabled:hover:text-slate-900"
            :disabled="courses.length === 0 && students.length === 0"
            @click="exportSnapshot"
          >
            <Download :size="15" />
            <span>Export</span>
          </button>

          <button
            type="button"
            class="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-4.5 py-2.25 text-[13px] font-semibold text-white shadow-[0_4px_15px_rgba(124,58,237,0.25)] transition-all hover:-translate-y-px hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            @click="openCreateCourse"
          >
            <Plus :size="16" />
            <span>New Course</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Summary metrics -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Courses"
        :value="courses.length"
        :sub="`${publishedCoursesCount} published · ${draftCoursesCount} drafts`"
        :icon="BookOpen"
        accent-color="#8b5cf6"
      />
      <StatCard
        label="Total Learners"
        :value="students.length"
        :sub="`${activeStudentsCount} active · ${inactiveStudentsCount} inactive`"
        :icon="Users"
        accent-color="#3b82f6"
      />
      <StatCard
        label="Platform Revenue"
        :value="totalRevenue"
        format="currency"
        sub="Lifetime course revenue"
        :icon="DollarSign"
        accent-color="#10b981"
      />
      <StatCard
        label="Average Rating"
        :value="averageRating"
        format="rating"
        sub="Across the course catalog"
        :icon="Star"
        accent-color="#f59e0b"
      />
    </div>

    <!-- Load error -->
    <div
      v-if="loadError"
      class="flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300 sm:flex-row sm:items-center sm:justify-between light:border-red-200 light:bg-red-50 light:text-red-700"
      role="alert"
    >
      <div class="flex items-start gap-2.5">
        <AlertCircle :size="17" class="mt-0.5 shrink-0" />
        <span>{{ loadError }}</span>
      </div>
      <button
        type="button"
        class="shrink-0 cursor-pointer self-start rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 sm:self-auto light:border-red-200 light:bg-white light:hover:bg-red-100"
        @click="loadData({ silent: true })"
      >
        Retry
      </button>
    </div>

    <!-- Workspace -->
    <section class="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md light:border-slate-200 light:bg-white">
      <!-- Tabs -->
      <div class="flex flex-col gap-3 border-b border-white/8 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 light:border-slate-200">
        <div class="flex w-full gap-1 overflow-x-auto rounded-xl border border-white/6 bg-black/20 p-1 sm:w-auto light:border-slate-200 light:bg-slate-100">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="inline-flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 sm:flex-none"
            :class="activeTab === tab.id
              ? 'border-violet-500/35 bg-violet-500/15 text-violet-300 shadow-[0_0_18px_rgba(124,58,237,0.08)] light:border-violet-200 light:bg-white light:text-violet-700 light:shadow-sm'
              : 'border-transparent text-white/50 hover:bg-white/5 hover:text-white/80 light:text-slate-500 light:hover:bg-white light:hover:text-slate-800'"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" :size="15" class="shrink-0" />
            <span>{{ tab.label }}</span>
            <span
              v-if="tab.count !== null"
              class="rounded-full px-1.5 py-px text-[10px] font-bold"
              :class="activeTab === tab.id
                ? 'bg-violet-500/20 text-violet-200 light:bg-violet-100 light:text-violet-700'
                : 'bg-white/6 text-white/40 light:bg-slate-200 light:text-slate-600'"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <span class="hidden items-center gap-1.5 text-[11px] text-white/35 sm:inline-flex light:text-slate-400">
          <AlertCircle v-if="loadError" :size="12" class="text-rose-400" />
          <CheckCircle2 v-else :size="12" class="text-emerald-400" />
          {{ loadError ? 'Backend connection issue' : 'Connected to live backend' }}
        </span>
      </div>

      <!-- Tab content -->
      <div class="p-4 sm:p-5">
        <Transition v-bind="tabFade" mode="out-in">
          <div :key="loading ? 'loading' : activeTab">
            <!-- Loading -->
            <div v-if="loading" class="flex flex-col gap-2.5">
              <div v-for="i in 4" :key="i" class="h-20 animate-pulse rounded-xl bg-white/5 light:bg-slate-100" />
            </div>

            <!-- Courses -->
            <div v-else-if="activeTab === 'courses'" class="flex flex-col gap-4">
              <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div class="relative w-full sm:max-w-xs">
                  <Search :size="15" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/35 light:text-slate-400" />
                  <input
                    v-model="courseSearch"
                    type="text"
                    placeholder="Search courses, instructors..."
                    class="w-full rounded-[10px] border border-white/9 bg-white/4 py-2.25 pr-8 pl-9 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-violet-500/60 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-slate-50 light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600 light:focus:bg-white"
                  >
                  <button
                    v-if="courseSearch"
                    type="button"
                    class="absolute top-1/2 right-2.5 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded p-0.5 text-white/40 transition-colors hover:text-white light:text-slate-400 light:hover:text-slate-900"
                    aria-label="Clear course search"
                    @click="courseSearch = ''"
                  >
                    <X :size="13" />
                  </button>
                </div>

                <div class="flex items-center gap-2.5">
                  <span class="text-[11px] text-white/35 light:text-slate-400">
                    {{ filteredCourses.length }} of {{ courses.length }} courses
                  </span>
                  <button
                    type="button"
                    class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-500/35 bg-violet-500/15 px-3 py-1.75 text-xs font-semibold text-violet-300 transition-all hover:bg-violet-500/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-violet-300 light:bg-violet-50 light:text-violet-700 light:hover:bg-violet-100 light:hover:text-violet-900"
                    @click="openCreateCourse"
                  >
                    <Plus :size="14" />
                    <span>New Course</span>
                  </button>
                </div>
              </div>

              <div
                v-if="filteredCourses.length === 0"
                class="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 px-6 py-12 text-center light:border-slate-200"
              >
                <span class="mb-1 flex size-11 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10">
                  <BookOpen :size="20" class="text-violet-400" />
                </span>
                <span class="text-sm font-semibold text-slate-200 light:text-slate-800">
                  {{ courseSearch ? 'No courses match your search' : 'No courses yet' }}
                </span>
                <span class="text-xs text-white/40 light:text-slate-500">
                  {{ courseSearch ? 'Try a different title, category, or instructor.' : 'Create your first course to get started.' }}
                </span>
              </div>

              <div v-else class="divide-y divide-white/6 overflow-hidden rounded-xl border border-white/8 light:divide-slate-100 light:border-slate-200">
                <div
                  v-for="course in filteredCourses"
                  :key="course.id"
                  class="group flex flex-col gap-3 bg-white/2 px-3.5 py-3.5 transition-colors duration-200 hover:bg-white/4 sm:px-4 lg:flex-row lg:items-center light:bg-white light:hover:bg-slate-50"
                >
                  <div class="flex min-w-0 flex-1 items-center gap-3">
                    <img
                      :src="course.thumbnail"
                      :alt="course.title"
                      class="h-12 w-18 shrink-0 rounded-lg border border-white/8 object-cover light:border-slate-200"
                    >
                    <div class="min-w-0">
                      <NuxtLink
                        :to="`/courses/${course.slug}`"
                        class="block truncate text-[13px] font-semibold text-slate-100 no-underline transition-colors hover:text-violet-300 light:text-slate-900 light:hover:text-violet-700"
                      >
                        {{ course.title }}
                      </NuxtLink>
                      <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-white/40 light:text-slate-500">
                        <span>{{ course.category }}</span>
                        <span class="size-0.5 rounded-full bg-white/25 light:bg-slate-300" />
                        <span>{{ course.instructor }}</span>
                        <span class="hidden size-0.5 rounded-full bg-white/25 sm:block light:bg-slate-300" />
                        <span class="hidden sm:inline">{{ course.totalLessons }} lessons</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center gap-2.5">
                    <div class="mr-auto flex items-center gap-3 lg:mr-0 lg:w-43 lg:justify-end">
                      <span class="text-[13px] font-bold text-emerald-400 light:text-emerald-700">
                        ${{ Number(course.price || 0).toFixed(2) }}
                      </span>
                      <span class="text-[11px] text-white/35 light:text-slate-400">
                        {{ Number(course.totalStudents || 0).toLocaleString() }} enrolled
                      </span>
                    </div>

                    <select
                      :value="course.status"
                      :disabled="updatingCourseSlug === course.slug"
                      class="cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-violet-500/60 disabled:cursor-wait disabled:opacity-60"
                      :class="courseStatusClass(course.status)"
                      :aria-label="`Status for ${course.title}`"
                      @change="updateCourseStatus(course, $event)"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>

                    <div class="flex items-center gap-1.5">
                      <NuxtLink
                        :to="`/courses/${course.slug}`"
                        class="flex size-7.5 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/55 transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-500/15 hover:text-violet-300 light:border-slate-200 light:bg-slate-50 light:text-slate-600 light:hover:bg-violet-50 light:hover:text-violet-700"
                        :aria-label="`View ${course.title}`"
                        title="View course"
                      >
                        <ExternalLink :size="13" />
                      </NuxtLink>
                      <button
                        type="button"
                        class="flex size-7.5 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/55 transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-500/15 hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-50 light:text-slate-600 light:hover:bg-violet-50 light:hover:text-violet-700"
                        :aria-label="`Edit ${course.title}`"
                        title="Edit course"
                        @click="openEditCourse(course)"
                      >
                        <Pencil :size="13" />
                      </button>
                      <button
                        type="button"
                        class="flex size-7.5 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-rose-400 transition-all duration-200 hover:border-rose-500/30 hover:bg-rose-500/15 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:border-slate-200 light:bg-slate-50 light:text-rose-600 light:hover:bg-rose-50 light:hover:text-rose-700"
                        :aria-label="`Delete ${course.title}`"
                        title="Delete course"
                        @click="askDeleteCourse(course)"
                      >
                        <Trash2 :size="13" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Students -->
            <div v-else-if="activeTab === 'students'" class="flex flex-col gap-4">
              <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div class="relative w-full sm:max-w-xs">
                  <Search :size="15" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/35 light:text-slate-400" />
                  <input
                    v-model="studentSearch"
                    type="text"
                    placeholder="Search students, emails, countries..."
                    class="w-full rounded-[10px] border border-white/9 bg-white/4 py-2.25 pr-8 pl-9 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-violet-500/60 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-slate-50 light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600 light:focus:bg-white"
                  >
                  <button
                    v-if="studentSearch"
                    type="button"
                    class="absolute top-1/2 right-2.5 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded p-0.5 text-white/40 transition-colors hover:text-white light:text-slate-400 light:hover:text-slate-900"
                    aria-label="Clear student search"
                    @click="studentSearch = ''"
                  >
                    <X :size="13" />
                  </button>
                </div>

                <div class="flex items-center gap-2.5">
                  <span class="text-[11px] text-white/35 light:text-slate-400">
                    {{ filteredStudents.length }} of {{ students.length }} learners
                  </span>
                  <button
                    type="button"
                    class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-500/35 bg-violet-500/15 px-3 py-1.75 text-xs font-semibold text-violet-300 transition-all hover:bg-violet-500/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-violet-300 light:bg-violet-50 light:text-violet-700 light:hover:bg-violet-100 light:hover:text-violet-900"
                    @click="showAddStudent = !showAddStudent"
                  >
                    <UserPlus :size="14" />
                    <span>{{ showAddStudent ? 'Close Form' : 'Add Student' }}</span>
                  </button>
                </div>
              </div>

              <div v-if="showAddStudent" class="rounded-xl border border-violet-500/25 bg-violet-500/6 p-4 light:border-violet-200 light:bg-violet-50/50">
                <div class="mb-3 flex items-center gap-2">
                  <UserPlus :size="16" class="text-violet-400" />
                  <h3 class="text-[13px] font-bold text-slate-100 light:text-slate-900">Quick add student</h3>
                </div>
                <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                  <input
                    v-model="newStudent.name"
                    type="text"
                    placeholder="Full name *"
                    class="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-[13px] text-slate-100 outline-none transition-all placeholder:text-white/30 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600"
                  >
                  <input
                    v-model="newStudent.email"
                    type="email"
                    placeholder="Email address *"
                    class="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-[13px] text-slate-100 outline-none transition-all placeholder:text-white/30 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600"
                  >
                  <input
                    v-model="newStudent.country"
                    type="text"
                    placeholder="Country"
                    class="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-[13px] text-slate-100 outline-none transition-all placeholder:text-white/30 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-violet-600"
                  >
                  <AppDropdown id="new-student-status" v-model="newStudent.status" :options="studentStatusOptions" size="sm" aria-label="Student status" />
                </div>
                <div class="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    class="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 light:hover:text-slate-900"
                    @click="showAddStudent = false"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-violet-500/40 bg-linear-to-br from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-all enabled:hover:from-violet-500 enabled:hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    :disabled="creatingStudent"
                    @click="submitNewStudent"
                  >
                    <Loader2 v-if="creatingStudent" :size="14" class="animate-spin" />
                    <UserPlus v-else :size="14" />
                    <span>{{ creatingStudent ? 'Creating...' : 'Create Student' }}</span>
                  </button>
                </div>
              </div>

              <div
                v-if="filteredStudents.length === 0"
                class="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 px-6 py-12 text-center light:border-slate-200"
              >
                <span class="mb-1 flex size-11 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10">
                  <Users :size="20" class="text-blue-400" />
                </span>
                <span class="text-sm font-semibold text-slate-200 light:text-slate-800">
                  {{ studentSearch ? 'No students match your search' : 'No students yet' }}
                </span>
                <span class="text-xs text-white/40 light:text-slate-500">
                  {{ studentSearch ? 'Try a different name, email, or country.' : 'Add your first learner to get started.' }}
                </span>
              </div>

              <div v-else class="divide-y divide-white/6 overflow-hidden rounded-xl border border-white/8 light:divide-slate-100 light:border-slate-200">
                <div
                  v-for="student in filteredStudents"
                  :key="student.id"
                  class="group flex flex-col gap-3 bg-white/2 px-3.5 py-3.5 transition-colors duration-200 hover:bg-white/4 sm:px-4 lg:flex-row lg:items-center light:bg-white light:hover:bg-slate-50"
                >
                  <div class="flex min-w-0 flex-1 items-center gap-3">
                    <img
                      :src="student.avatar"
                      :alt="student.name"
                      class="size-10 shrink-0 rounded-full border border-violet-500/30 object-cover light:border-violet-200"
                    >
                    <div class="min-w-0">
                      <span class="block truncate text-[13px] font-semibold text-slate-100 light:text-slate-900">{{ student.name }}</span>
                      <div class="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-white/40 light:text-slate-500">
                        <span class="inline-flex items-center gap-1">
                          <Mail :size="11" class="shrink-0" />
                          {{ student.email }}
                        </span>
                        <span class="inline-flex items-center gap-1">
                          <MapPin :size="11" class="shrink-0" />
                          {{ student.country }}
                        </span>
                        <span class="hidden sm:inline">Joined {{ formatDate(student.joinedAt) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center gap-2.5">
                    <div class="mr-auto flex items-center gap-3 lg:mr-0 lg:w-47 lg:justify-end">
                      <span class="text-[13px] font-bold text-emerald-400 light:text-emerald-700">
                        ${{ Number(student.totalSpent || 0).toFixed(2) }}
                      </span>
                      <span class="text-[11px] text-white/35 light:text-slate-400">
                        lifetime spend
                      </span>
                    </div>

                    <button
                      type="button"
                      class="cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize transition-all duration-200 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                      :class="studentStatusClass(student.status)"
                      :disabled="updatingStudentId === student.id"
                      :aria-label="`Toggle status for ${student.name}`"
                      @click="toggleStudentStatus(student)"
                    >
                      {{ updatingStudentId === student.id ? 'Saving...' : student.status }}
                    </button>

                    <button
                      type="button"
                      class="flex size-7.5 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-rose-400 transition-all duration-200 hover:border-rose-500/30 hover:bg-rose-500/15 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 light:border-slate-200 light:bg-slate-50 light:text-rose-600 light:hover:bg-rose-50 light:hover:text-rose-700"
                      :aria-label="`Delete ${student.name}`"
                      title="Delete student"
                      @click="askDeleteStudent(student)"
                    >
                      <Trash2 :size="13" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick operations -->
            <div v-else class="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              <div class="flex flex-col rounded-[14px] border border-white/8 bg-white/2 p-4.5 light:border-slate-200 light:bg-slate-50">
                <div class="flex items-start justify-between gap-3">
                  <span class="flex size-10 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10">
                    <FileJson :size="19" class="text-blue-400" />
                  </span>
                  <span class="rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] font-semibold text-white/40 light:border-slate-200 light:bg-white light:text-slate-500">JSON</span>
                </div>
                <h3 class="mt-3 text-sm font-bold text-slate-100 light:text-slate-900">Export a data snapshot</h3>
                <p class="mt-1 flex-1 text-xs leading-relaxed text-white/45 light:text-slate-500">
                  Download a complete JSON snapshot of the current course and learner records.
                </p>
                <button
                  type="button"
                  class="mt-4 inline-flex w-fit cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-300 transition-all enabled:hover:bg-blue-500/20 enabled:hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 light:border-blue-200 light:bg-blue-50 light:text-blue-700 light:enabled:hover:bg-blue-100"
                  :disabled="courses.length === 0 && students.length === 0"
                  @click="exportSnapshot"
                >
                  <Download :size="14" />
                  <span>Download Snapshot</span>
                </button>
              </div>

              <div class="flex flex-col rounded-[14px] border border-white/8 bg-white/2 p-4.5 light:border-slate-200 light:bg-slate-50">
                <div class="flex items-start justify-between gap-3">
                  <span class="flex size-10 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10">
                    <RefreshCw :size="19" class="text-emerald-400" />
                  </span>
                  <span class="rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] font-semibold text-white/40 light:border-slate-200 light:bg-white light:text-slate-500">Live API</span>
                </div>
                <h3 class="mt-3 text-sm font-bold text-slate-100 light:text-slate-900">Refresh console data</h3>
                <p class="mt-1 flex-1 text-xs leading-relaxed text-white/45 light:text-slate-500">
                  Re-sync courses and students from the backend to see the latest activity.
                </p>
                <button
                  type="button"
                  class="mt-4 inline-flex w-fit cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-all enabled:hover:bg-emerald-500/20 enabled:hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700 light:enabled:hover:bg-emerald-100"
                  :disabled="refreshing"
                  @click="handleRefresh"
                >
                  <RefreshCw :size="14" :class="{ 'animate-spin': refreshing }" />
                  <span>{{ refreshing ? 'Syncing...' : 'Sync Now' }}</span>
                </button>
              </div>

              <div class="flex flex-col rounded-[14px] border border-white/8 bg-white/2 p-4.5 light:border-slate-200 light:bg-slate-50">
                <div class="flex items-start justify-between gap-3">
                  <span class="flex size-10 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10">
                    <Settings :size="19" class="text-violet-400" />
                  </span>
                  <span class="rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] font-semibold text-white/40 light:border-slate-200 light:bg-white light:text-slate-500">Config</span>
                </div>
                <h3 class="mt-3 text-sm font-bold text-slate-100 light:text-slate-900">Platform settings</h3>
                <p class="mt-1 flex-1 text-xs leading-relaxed text-white/45 light:text-slate-500">
                  Update branding, notification preferences, and the administrator profile.
                </p>
                <NuxtLink
                  to="/settings"
                  class="mt-4 inline-flex w-fit items-center justify-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3.5 py-2 text-xs font-semibold text-violet-300 no-underline transition-all hover:bg-violet-500/20 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 light:border-violet-200 light:bg-violet-50 light:text-violet-700 light:hover:bg-violet-100"
                >
                  <Settings :size="14" />
                  <span>Open Settings</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </section>

    <!-- Course create / edit modal -->
    <CourseFormModal
      :is-open="isCourseFormOpen"
      :course="editingCourse"
      :loading="formSubmitting"
      @close="closeCourseForm"
      @submit="handleCourseSubmit"
    />

    <!-- Delete confirmation -->
    <ConfirmDeleteModal
      :is-open="Boolean(deleteTarget)"
      :title="deleteTitle"
      :description="deleteDescription"
      :item-name="deleteItemName"
      :loading="deleteLoading"
      @close="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  DollarSign,
  Download,
  ExternalLink,
  FileJson,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Star,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-vue-next'
import type { Course, CourseFormData, Student } from '~/types'
import StatCard from '~/components/shared/StatCard.vue'
import CourseFormModal from '~/components/courses/CourseFormModal.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import AppDropdown from '~/components/shared/AppDropdown.vue'
import { useAppToast } from '~/composables/useAppToast'

definePageMeta({ requiresAdmin: true })

useHead({
  title: 'Admin Console'
})

const auth = useAuth()
const { crud, error, info, success } = useAppToast()

type AdminTab = 'courses' | 'students' | 'ops'
type DeleteTarget =
  | { kind: 'course'; item: Course }
  | { kind: 'student'; item: Student }

const studentStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

const activeTab = ref<AdminTab>('courses')
const courses = ref<Course[]>([])
const students = ref<Student[]>([])
const loading = ref(true)
const refreshing = ref(false)
const loadError = ref('')
const lastLoadedAt = ref<Date | null>(null)

const courseSearch = ref('')
const studentSearch = ref('')

const updatingCourseSlug = ref<string | null>(null)
const updatingStudentId = ref<number | null>(null)

const showAddStudent = ref(false)
const creatingStudent = ref(false)
const newStudent = reactive({
  name: '',
  email: '',
  country: 'United States',
  status: 'active' as 'active' | 'inactive'
})

const isCourseFormOpen = ref(false)
const editingCourse = ref<Course | null>(null)
const formSubmitting = ref(false)

const deleteTarget = ref<DeleteTarget | null>(null)
const deleteLoading = ref(false)

const tabFade = {
  enterActiveClass: 'transition duration-200 ease-out',
  leaveActiveClass: 'transition duration-150 ease-in',
  enterFromClass: 'translate-y-1 opacity-0',
  leaveToClass: 'translate-y-1 opacity-0'
}

const tabs = computed(() => [
  { id: 'courses' as const, label: 'Courses', icon: BookOpen, count: courses.value.length },
  { id: 'students' as const, label: 'Students', icon: Users, count: students.value.length },
  { id: 'ops' as const, label: 'Quick Ops', icon: SlidersHorizontal, count: null }
])

const publishedCoursesCount = computed(() =>
  courses.value.filter(course => course.status === 'published').length
)
const draftCoursesCount = computed(() =>
  courses.value.filter(course => course.status === 'draft').length
)
const activeStudentsCount = computed(() =>
  students.value.filter(student => student.status === 'active').length
)
const inactiveStudentsCount = computed(() =>
  students.value.length - activeStudentsCount.value
)
const totalRevenue = computed(() =>
  courses.value.reduce((total, course) => total + Number(course.revenue || 0), 0)
)
const averageRating = computed(() => {
  const ratedCourses = courses.value.filter(course => Number(course.rating) > 0)
  if (ratedCourses.length === 0) return 0
  const total = ratedCourses.reduce((sum, course) => sum + Number(course.rating || 0), 0)
  return Number((total / ratedCourses.length).toFixed(1))
})

const lastLoadedLabel = computed(() => {
  if (!lastLoadedAt.value) return 'Not synced yet'
  return lastLoadedAt.value.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
})

const filteredCourses = computed(() => {
  const query = courseSearch.value.toLowerCase().trim()
  if (!query) return courses.value
  return courses.value.filter(course =>
    course.title.toLowerCase().includes(query)
    || course.category.toLowerCase().includes(query)
    || course.instructor.toLowerCase().includes(query)
  )
})

const filteredStudents = computed(() => {
  const query = studentSearch.value.toLowerCase().trim()
  if (!query) return students.value
  return students.value.filter(student =>
    student.name.toLowerCase().includes(query)
    || student.email.toLowerCase().includes(query)
    || student.country.toLowerCase().includes(query)
  )
})

const deleteItemName = computed(() => {
  const target = deleteTarget.value
  if (!target) return undefined
  return target.kind === 'course' ? target.item.title : target.item.name
})

const deleteTitle = computed(() =>
  deleteTarget.value?.kind === 'course' ? 'Delete this course?' : 'Remove this student?'
)

const deleteDescription = computed(() =>
  deleteTarget.value?.kind === 'course'
    ? 'This permanently removes the course and its catalog data. This action cannot be undone.'
    : 'This permanently removes the learner record from the platform. This action cannot be undone.'
)

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function courseStatusClass(status: string) {
  if (status === 'published') return 'border-emerald-400/30 bg-emerald-400/12 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700'
  if (status === 'draft') return 'border-amber-400/30 bg-amber-400/12 text-amber-400 light:border-amber-300 light:bg-amber-50 light:text-amber-700'
  return 'border-slate-400/30 bg-slate-400/12 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600'
}

function studentStatusClass(status: string) {
  if (status === 'active') return 'border-emerald-400/30 bg-emerald-400/15 text-emerald-400 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700'
  return 'border-slate-400/30 bg-slate-400/15 text-slate-400 light:border-slate-300 light:bg-slate-100 light:text-slate-600'
}

async function loadData(options: { silent?: boolean } = {}) {
  if (options.silent) {
    refreshing.value = true
  } else {
    loading.value = true
  }

  loadError.value = ''

  try {
    const [courseData, studentData] = await Promise.all([
      $fetch<Course[]>(`/api/courses?_t=${Date.now()}`),
      $fetch<Student[]>(`/api/students?_t=${Date.now()}`)
    ])

    courses.value = Array.isArray(courseData) ? courseData : []
    students.value = Array.isArray(studentData) ? studentData : []
    lastLoadedAt.value = new Date()
  } catch (err: unknown) {
    const message = (err as Error).message || 'Could not load admin records from the backend.'
    loadError.value = message
    error('Admin Data Failed', message)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function handleRefresh() {
  await loadData({ silent: true })

  if (!loadError.value) {
    info(
      'Admin Console Synced',
      `${courses.value.length} courses and ${students.value.length} learners loaded.`
    )
  }
}

async function updateCourseStatus(course: Course, event: Event) {
  const select = event.target as HTMLSelectElement
  const status = select.value as Course['status']

  if (status === course.status) return

  updatingCourseSlug.value = course.slug
  try {
    await $fetch(`/api/courses/${course.slug}`, {
      method: 'PUT',
      body: { status }
    })
    course.status = status
    crud('status', 'Course', course.title)
  } catch (err: unknown) {
    select.value = course.status
    error('Status Update Failed', (err as Error).message || 'Failed to update course status')
  } finally {
    updatingCourseSlug.value = null
  }
}

async function toggleStudentStatus(student: Student) {
  const status: Student['status'] = student.status === 'active' ? 'inactive' : 'active'
  updatingStudentId.value = student.id

  try {
    await $fetch(`/api/students/${student.id}`, {
      method: 'PUT',
      body: { status }
    })
    student.status = status
    crud('status', 'Student', student.name)
  } catch (err: unknown) {
    error('Student Status Failed', (err as Error).message || 'Failed to update student status')
  } finally {
    updatingStudentId.value = null
  }
}

function openCreateCourse() {
  editingCourse.value = null
  isCourseFormOpen.value = true
}

function openEditCourse(course: Course) {
  editingCourse.value = course
  isCourseFormOpen.value = true
}

function closeCourseForm() {
  isCourseFormOpen.value = false
  editingCourse.value = null
}

async function handleCourseSubmit(formData: CourseFormData) {
  formSubmitting.value = true

  try {
    if (editingCourse.value) {
      await $fetch(`/api/courses/${editingCourse.value.slug}`, {
        method: 'PUT',
        body: formData
      })
      crud('update', 'Course', formData.title)
    } else {
      await $fetch('/api/courses', {
        method: 'POST',
        body: formData
      })
      crud('create', 'Course', formData.title)
    }

    closeCourseForm()
    await loadData({ silent: true })
  } catch (err: unknown) {
    error('Course Action Failed', (err as Error).message || 'Failed to save course')
  } finally {
    formSubmitting.value = false
  }
}

async function submitNewStudent() {
  if (!newStudent.name.trim() || !newStudent.email.trim()) {
    error('Missing Fields', 'Please provide the student name and email address.')
    return
  }

  creatingStudent.value = true

  try {
    await $fetch('/api/students', {
      method: 'POST',
      body: {
        name: newStudent.name.trim(),
        email: newStudent.email.trim(),
        country: newStudent.country.trim() || 'United States',
        status: newStudent.status
      }
    })

    const createdName = newStudent.name.trim()
    newStudent.name = ''
    newStudent.email = ''
    showAddStudent.value = false
    crud('create', 'Student', createdName)
    await loadData({ silent: true })
  } catch (err: unknown) {
    error('Create Student Failed', (err as Error).message || 'Failed to create student')
  } finally {
    creatingStudent.value = false
  }
}

function askDeleteCourse(course: Course) {
  deleteTarget.value = { kind: 'course', item: course }
}

function askDeleteStudent(student: Student) {
  deleteTarget.value = { kind: 'student', item: student }
}

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target) return

  deleteLoading.value = true

  try {
    if (target.kind === 'course') {
      await $fetch(`/api/courses/${target.item.slug}`, { method: 'DELETE' })
      crud('delete', 'Course', target.item.title)
    } else {
      await $fetch(`/api/students/${target.item.id}`, { method: 'DELETE' })
      crud('delete', 'Student', target.item.name)
    }

    deleteTarget.value = null
    await loadData({ silent: true })
  } catch (err: unknown) {
    error('Delete Failed', (err as Error).message || 'Failed to delete record')
  } finally {
    deleteLoading.value = false
  }
}

function exportSnapshot() {
  const snapshot = {
    courses: courses.value,
    students: students.value,
    exportedAt: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `courseaurahub-snapshot-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
  success('Snapshot Exported', 'The JSON backup has been downloaded.')
}

onMounted(() => {
  loadData()
})
</script>
