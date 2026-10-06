<template>
  <footer class="app-footer">
    <span class="footer-text">© 2026 LearnFlow Academy · Built with Nuxt 3 &amp; ❤️</span>
    <div class="footer-links">
      <a href="#" class="footer-link">Privacy</a>
      <a href="#" class="footer-link">Terms</a>
      <a href="#" class="footer-link">Support</a>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(10, 10, 20, 0.6);
}

.footer-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-link {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover { color: rgba(255, 255, 255, 0.6); }
</style>
