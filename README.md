# Course Aura Hub — Frontend

Course Aura Hub is an online learning platform. Learners browse a course catalog, enroll, work through lessons while their progress is tracked, and review the courses they take. Administrators run the platform from a dashboard: they publish courses, build each course's curriculum, manage students, moderate reviews and follow sales and enrollment analytics.

This repository is the **web app**, built with Nuxt 4. It talks to the Spring Boot API in the companion repository [`CourseAuraHub-Backend`](../CourseAuraHub-Backend).

## What it does

Each user sees a different experience depending on their role.

**Learners**
- **Explore courses**: search, filter and sort the catalog
- **Course page**: description, curriculum outline with free-preview lessons, reviews, enroll, and save to wishlist
- **Lesson player** (`/learn/[slug]`): video, article and quiz lessons, a lesson sidebar with completion checkmarks, previous/next, "Complete & continue" and a progress bar
- **My Learning**: enrolled courses with progress and in-progress/completed filters
- **Wishlist** and **Account** (profile, avatar, password)

**Administrators**
- **Dashboard and Analytics**: revenue, enrollments, top courses, charts
- **Course management**: create, edit and delete courses; per-course performance; curriculum editor (sections and lessons, reordering, previews); review moderation
- **Students**, **Admin Console** and **Platform Settings**

**Throughout the app**
- Email/password and social login (Google, GitHub, Facebook)
- Dark and light themes
- Keyboard shortcuts
- Global search
- Accessible modals with focus trapping and Escape to close

## How it works

```
Browser ──► Nuxt app (pages, Pinia store)
              │  $fetch('/api/...')
              ▼
           Nuxt server routes (server/api/**)  ──►  Spring Boot API (/api/v1/**)
```

The browser never calls the backend directly. Nuxt's server routes act as a **backend-for-frontend**. They:
- keep the access and refresh tokens in HttpOnly cookies on the Nuxt domain
- attach the access token to each backend request
- refresh an expired session transparently and retry the request
- handle the CSRF token for write requests
- turn backend errors into consistent responses for the UI

Route protection lives in `app/middleware/auth.global.ts`. Signed-out visitors are redirected to the login page, and pages marked `requiresAdmin` are restricted to admins.

## Tech stack

| Area | Technology |
|---|---|
| Framework | Nuxt 4, Vue 3, TypeScript |
| UI | Nuxt UI, Tailwind CSS, Lucide icons, VueUse Motion |
| State | Pinia |
| Charts | Chart.js with vue-chartjs |
| Linting | ESLint (`@nuxt/eslint`) |

## Getting started

**Prerequisites:** Node.js 20+ and the backend running on http://localhost:8080 (see the backend README).

```bash
cp .env.example .env    # defaults work for local development
npm install
npm run dev             # http://localhost:3000
```

Sign up for a learner account, or sign in as the admin configured in the backend (`BOOTSTRAP_ADMIN_EMAIL`). As a learner, open **Git & GitHub Fundamentals**, a free course, to try enrollment and the lesson player.

> **Using WSL with the project on a Windows drive (`/mnt/...`)?** File-change events don't reach the dev server there, so `nuxt.config.ts` switches the watcher to polling automatically. You can force it with `NUXT_WATCH_POLLING=true` or `false`.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `NUXT_API_BASE` | `http://localhost:8080/api/v1` | Backend API that the server routes call |
| `NUXT_PUBLIC_BACKEND_URL` | `http://localhost:8080` | Backend origin, used for OAuth2 redirects |
| `NUXT_SITE_URL` | `http://localhost:3000` | This app's origin |
| `NUXT_COOKIE_SECURE` | `false` (dev) | Set to `true` when serving over HTTPS |
| `NUXT_COOKIE_SAME_SITE` | `lax` | Session cookie SameSite policy |
| `NUXT_COOKIE_DOMAIN` | *(empty)* | Set only if the frontend and backend share a parent domain |

For social login, the backend's `OAUTH2_REDIRECT_URI` should point to `http://localhost:3000/auth/callback`.

## Project structure

```
app/
  pages/         routes: courses, learn, my-learning, wishlist, account,
                 dashboard (index), analytics, students, admin, settings, auth/*
  components/    learning/ (curriculum, reviews, learner course view), courses/,
                 dashboard/, layout/ (header, sidebar), shared/, auth/
  composables/   useAuth (Pinia store), useCourses, useLearning, useCurriculum, useReviews, …
  middleware/    global auth and role guard
  types/         shared API types
server/
  api/           backend-for-frontend routes that forward to the Spring API
  utils/         apiClient: session cookies, token refresh, CSRF, error mapping
```

## Scripts

```bash
npm run dev       # development server with hot reload
npm run build     # production build
npm run preview   # preview the production build
npx eslint .      # lint
```
