<template>
  <section class="dashboard-card">
    <slot></slot>
  </section>
</template>

<style scoped>
.dashboard-card { padding: 26px; margin-bottom: 24px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); backdrop-filter: blur(12px); }
.dashboard-card :deep(h3) { margin: 0 0 16px; color: var(--brand-900); font-size: 20px; font-weight: 800; letter-spacing: -0.45px; }
@media (max-width: 640px) { .dashboard-card { padding: 20px 16px; border-radius: 20px; } }
</style>
