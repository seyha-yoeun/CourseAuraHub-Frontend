<template>
  <footer class="app-footer">
    <span class="footer-text">© 2026 CourseAuraHub Academy · Built with Nuxt 4 &amp; ❤️</span>
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
  border-top: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.05));
  background: var(--bg-header, rgba(10, 10, 20, 0.6));
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

html.light .app-footer {
  background: #ffffff;
  border-top-color: rgba(0, 0, 0, 0.08);
}

.footer-text {
  font-size: 12px;
  color: var(--text-muted, rgba(255, 255, 255, 0.35));
}

html.light .footer-text {
  color: #64748b;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-link {
  font-size: 12px;
  color: var(--text-muted, rgba(255, 255, 255, 0.35));
  text-decoration: none;
  transition: color 0.2s;
}

html.light .footer-link {
  color: #64748b;
}

.footer-link:hover {
  color: #a78bfa;
}

html.light .footer-link:hover {
  color: #7c3aed;
}
</style>
