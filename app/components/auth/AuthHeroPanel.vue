<template>
  <div class="auth-hero-panel">
    <!-- =========================================================
         Background media layer
         Put any visual in here: <video>, Lottie, canvas, <img>…
         A ready-to-use video example is commented below — drop the
         files in /public/auth/ and uncomment it.
         ========================================================= -->
    <div class="hero-media" aria-hidden="true">
      <!--
      <video class="hero-video" autoplay muted loop playsinline poster="/auth/hero-poster.jpg">
        <source src="/auth/hero.mp4" type="video/mp4" />
      </video>
      -->

      <!-- Default ambient animation: spinning globes + orbit rings -->
      <div class="hero-ambient">
        <span class="blob blob-1" />
        <span class="blob blob-2" />
        <span class="blob blob-3" />

        <!-- Central spinning globe with orbiting rings & globes -->
        <div class="globe-scene">
          <div class="globe-core">
            <span class="globe-surface" />
            <span class="globe-sheen" />
          </div>
          <span class="orbit-ring ring-1"><span class="orbiter" /></span>
          <span class="orbit-ring ring-2"><span class="orbiter" /></span>
          <span class="orbit-ring ring-3"><span class="orbiter" /></span>
        </div>

        <!-- Free-floating spinning globs -->
        <span class="globe-float globe-a" />
        <span class="globe-float globe-b" />
        <span class="globe-float globe-c" />

        <span class="hero-grid" />
      </div>

      <!-- Readability overlay for whatever plays underneath -->
      <div class="hero-overlay" />
    </div>

    <!-- Foreground content -->
    <div class="hero-content">
      <!-- Brand -->
      <div class="hero-brand" v-motion="brandMotion">
        <div class="brand-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-icon">
            <rect width="48" height="48" rx="12" fill="url(#grad)" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48">
                <stop stop-color="#10b981" />
                <stop offset="1" stop-color="#059669" />
              </linearGradient>
            </defs>
            <path d="M14 24L21 31L34 17" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="brand-text">
          <h1 class="brand-name">CourseAuraHub</h1>
          <span class="brand-tagline">Academy</span>
        </div>
      </div>

      <!-- Compact value proposition -->
      <div class="hero-bottom">
        <div class="hero-badge" v-motion="badgeMotion">
          <span class="badge-dot" />
          <span>Trusted by 10,000+ developers</span>
        </div>

        <h2 class="hero-heading" v-motion="headingMotion">
          Unlock your potential with
          <span class="gradient-text">expert-led tech courses</span>
        </h2>

        <p class="hero-description" v-motion="descriptionMotion">
          Learn coding, cloud, security, and data from industry leaders —
          build real projects and accelerate your career.
        </p>

        <div class="hero-stats" v-motion="statsMotion">
          <span class="stat-pill">
            <BookOpen :size="14" />
            <span>50+ Courses</span>
          </span>
          <span class="stat-pill">
            <Award :size="14" />
            <span>Certificates</span>
          </span>
          <span class="stat-pill">
            <Users :size="14" />
            <span>10K+ Community</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BookOpen,
  Award,
  Users
} from 'lucide-vue-next'

const brandMotion = {
  initial: { opacity: 0, y: -24 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

const badgeMotion = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] } }
}

const headingMotion = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] } }
}

const descriptionMotion = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] } }
}

const statsMotion = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] } }
}
</script>

<style scoped>
.auth-hero-panel {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem;
  overflow: hidden;
  border-right: 1px solid rgba(16, 185, 129, 0.1);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.035) 0%, transparent 55%, rgba(5, 150, 105, 0.035) 100%);
}

/* ---------- Background media layer ---------- */
.hero-media {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-ambient {
  position: absolute;
  inset: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  animation: blob-drift 18s ease-in-out infinite;
}

.blob-1 {
  width: 60%;
  aspect-ratio: 1;
  top: -15%;
  left: -15%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.22), transparent 65%);
}

.blob-2 {
  width: 50%;
  aspect-ratio: 1;
  bottom: -12%;
  right: -10%;
  background: radial-gradient(circle, rgba(5, 150, 105, 0.18), transparent 65%);
  animation-delay: -6s;
}

.blob-3 {
  width: 38%;
  aspect-ratio: 1;
  top: 42%;
  left: 28%;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.12), transparent 65%);
  animation-delay: -12s;
}

@keyframes blob-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(26px, -20px) scale(1.08); }
  66% { transform: translate(-20px, 24px) scale(0.94); }
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(circle at 50% 45%, #000 25%, transparent 85%);
  mask-image: radial-gradient(circle at 50% 45%, #000 25%, transparent 85%);
}

html.light .hero-grid {
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.045) 1px, transparent 1px);
}

/* ---------- Spinning globes ---------- */
.globe-scene {
  position: absolute;
  top: 46%;
  left: 50%;
  width: min(58vh, 74%);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
}

.globe-core {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 56%;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  background: radial-gradient(circle at 32% 28%, rgba(167, 243, 208, 0.5), rgba(16, 185, 129, 0.28) 38%, rgba(6, 78, 59, 0.5) 72%, rgba(3, 40, 30, 0.6) 100%);
  box-shadow:
    0 0 70px rgba(16, 185, 129, 0.35),
    0 0 150px rgba(16, 185, 129, 0.18),
    inset 0 0 50px rgba(16, 185, 129, 0.3);
}

.globe-surface {
  position: absolute;
  inset: -12%;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from 0deg,
    rgba(167, 243, 208, 0.35) 0deg 12deg,
    rgba(16, 185, 129, 0.05) 12deg 30deg,
    transparent 30deg 45deg
  );
  filter: blur(5px);
  animation: spin-360 14s linear infinite;
}

.globe-sheen {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.35), transparent 45%),
    radial-gradient(circle at 70% 80%, rgba(16, 185, 129, 0.25), transparent 55%);
  animation: sheen-pulse 6s ease-in-out infinite;
}

@keyframes spin-360 {
  to { transform: rotate(360deg); }
}

@keyframes sheen-pulse {
  0%, 100% { opacity: 0.75; }
  50% { opacity: 1; }
}

/* Orbit rings + orbiting globes */
.orbit-ring {
  position: absolute;
  inset: 0;
  margin: auto;
  border-radius: 50%;
  border: 1px dashed rgba(52, 211, 153, 0.35);
  animation: spin-360 20s linear infinite;
}

.ring-1 {
  width: 74%;
  aspect-ratio: 1;
}

.ring-2 {
  width: 100%;
  aspect-ratio: 1;
  border-color: rgba(16, 185, 129, 0.22);
  animation-duration: 30s;
  animation-direction: reverse;
}

.ring-3 {
  width: 128%;
  aspect-ratio: 1;
  border-style: dotted;
  border-color: rgba(16, 185, 129, 0.12);
  animation-duration: 44s;
}

.orbiter {
  position: absolute;
  top: -7px;
  left: 50%;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #d1fae5, #34d399 55%, #047857);
  box-shadow: 0 0 16px rgba(52, 211, 153, 0.9), 0 0 36px rgba(16, 185, 129, 0.45);
}

.ring-2 .orbiter {
  width: 10px;
  height: 10px;
  top: -5px;
  margin-left: -5px;
}

.ring-3 .orbiter {
  width: 8px;
  height: 8px;
  top: -4px;
  margin-left: -4px;
  opacity: 0.8;
}

/* Free-floating spinning globs */
.globe-float {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, rgba(209, 250, 229, 0.85), rgba(16, 185, 129, 0.45) 45%, rgba(4, 120, 87, 0.15) 75%, transparent 100%);
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.35);
  animation: float-globe 12s ease-in-out infinite;
}

.globe-float::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from 0deg,
    rgba(255, 255, 255, 0.22) 0deg 18deg,
    transparent 18deg 55deg
  );
  filter: blur(1.5px);
  animation: spin-360 9s linear infinite;
}

.globe-a {
  width: 68px;
  height: 68px;
  top: 16%;
  left: 10%;
}

.globe-b {
  width: 44px;
  height: 44px;
  top: 26%;
  right: 12%;
  animation-delay: -4s;
}

.globe-c {
  width: 30px;
  height: 30px;
  bottom: 24%;
  left: 16%;
  animation-delay: -8s;
}

@keyframes float-globe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}

html.light .globe-core {
  box-shadow:
    0 0 70px rgba(16, 185, 129, 0.25),
    0 0 150px rgba(16, 185, 129, 0.12),
    inset 0 0 50px rgba(16, 185, 129, 0.22);
}

html.light .orbit-ring {
  border-color: rgba(5, 150, 105, 0.28);
}

/* Keeps the foreground readable over any media underneath */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 10, 15, 0.28) 0%, rgba(10, 10, 15, 0.1) 45%, rgba(10, 10, 15, 0.75) 100%);
}

html.light .hero-overlay {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.3) 0%, rgba(248, 250, 252, 0.12) 45%, rgba(248, 250, 252, 0.85) 100%);
}

/* ---------- Foreground ---------- */
.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 560px;
  height: 100%;
  margin: 0 auto;
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
}

.logo-icon {
  width: 100%;
  height: 100%;
}

.brand-text {
  text-align: left;
}

.brand-name {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary, #f1f5f9);
  letter-spacing: -0.5px;
  line-height: 1.1;
  margin: 0;
}

html.light .brand-name {
  color: #0f172a;
}

.brand-tagline {
  font-size: 12px;
  font-weight: 600;
  color: var(--emerald-500);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-bottom {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 99px;
  color: var(--emerald-400);
  font-size: 13px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

html.light .hero-badge {
  background: var(--emerald-50);
  border-color: var(--emerald-200);
  color: var(--emerald-700);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: var(--emerald-500);
  border-radius: 50%;
  animation: pulse-soft 2s ease-in-out infinite;
}

.hero-heading {
  font-size: clamp(30px, 2.4vw + 12px, 42px);
  font-weight: 800;
  color: var(--text-primary, #f1f5f9);
  line-height: 1.15;
  letter-spacing: -0.5px;
  margin: 0;
}

html.light .hero-heading {
  color: #0f172a;
}

.hero-heading .gradient-text {
  background: linear-gradient(135deg, #10b981, #34d399, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 16px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  line-height: 1.6;
  margin: 0;
  max-width: 440px;
}

html.light .hero-description {
  color: #475569;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary, rgba(255, 255, 255, 0.75));
  font-size: 12.5px;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

html.light .stat-pill {
  background: rgba(255, 255, 255, 0.7);
  border-color: #e2e8f0;
  color: #334155;
}

.stat-pill svg {
  color: var(--emerald-400);
  flex-shrink: 0;
}

html.light .stat-pill svg {
  color: var(--emerald-600);
}

@media (max-width: 1280px) {
  .auth-hero-panel {
    padding: 2.25rem;
  }

  .hero-heading {
    font-size: 30px;
  }
}

@media (max-height: 760px) {
  .globe-scene {
    top: 42%;
    width: min(46vh, 62%);
  }

  .globe-float {
    display: none;
  }
}
</style>
