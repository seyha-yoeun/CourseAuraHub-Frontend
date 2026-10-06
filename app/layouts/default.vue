<template>
  <div class="default-layout">
    <!-- Background orbs -->
    <div class="bg-orb" style="width:600px;height:600px;background:radial-gradient(circle,rgba(124,58,237,0.08),transparent 70%);top:-200px;left:-200px;"></div>
    <div class="bg-orb" style="width:500px;height:500px;background:radial-gradient(circle,rgba(37,99,235,0.06),transparent 70%);top:50%;right:-150px;"></div>
    <div class="bg-orb" style="width:400px;height:400px;background:radial-gradient(circle,rgba(5,150,105,0.05),transparent 70%);bottom:-100px;left:40%;"></div>

    <!-- Sidebar -->
    <AppSidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

    <!-- Main area -->
    <div class="main-wrapper" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <AppHeader :sidebar-collapsed="sidebarCollapsed" @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" />

      <main class="main-content">
        <div v-motion-fade-visible-once class="content-inner">
          <slot />
        </div>
      </main>

      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarCollapsed = ref(false)
</script>

<style scoped>
.default-layout {
  display: flex;
  min-height: 100vh;
  background: #0a0a0f;
  position: relative;
  overflow: hidden;
}

.main-wrapper {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.main-wrapper.sidebar-collapsed {
  margin-left: 72px;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-x: hidden;
}

.content-inner {
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
  }
  .main-content {
    padding: 1rem;
  }
}
</style>
