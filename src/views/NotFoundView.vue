<script setup>
// 홈 화면으로 돌아가기 위한 RouterLink 사용
import { RouterLink } from 'vue-router'
</script>

<template>
  <!-- 정의되지 않은 주소에 접근했을 때 보여줄 화면 -->
  <main class="not-found">
    <div class="weather-icon">🌦️</div>
    <span class="error-code">404</span>
    <h2>페이지를 찾을 수 없어요</h2>
    <p>주소가 잘못되었거나 이동된 페이지입니다.</p>
    <RouterLink class="home-link" to="/">날씨 대시보드로 돌아가기</RouterLink>
  </main>
</template>

<style scoped>
.not-found {
  position: relative;
  overflow: hidden;
  max-width: 660px;
  padding: 68px 32px;
  margin: 40px auto;
  color: var(--text-800);
  text-align: center;
  background: linear-gradient(145deg, var(--surface), var(--brand-50));
  border: 1px solid var(--brand-100);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.not-found::before,
.not-found::after {
  position: absolute;
  width: 180px;
  height: 180px;
  background: var(--brand-100);
  border-radius: 50%;
  content: '';
  opacity: 0.4;
}

.not-found::before {
  top: -100px;
  left: -90px;
}

.not-found::after {
  right: -105px;
  bottom: -115px;
}

.weather-icon,
.error-code,
h2,
p,
.home-link {
  position: relative;
  z-index: 1;
}

.weather-icon {
  margin-bottom: 8px;
  font-size: 64px;
  line-height: 1.2;
}

.error-code {
  display: block;
  color: var(--brand-600);
  font-size: 17px;
  font-weight: 850;
  letter-spacing: 0.24em;
}

h2 {
  margin: 12px 0 8px;
  color: var(--brand-950);
  font-size: clamp(28px, 5vw, 36px);
  letter-spacing: -0.8px;
  line-height: 1.3;
}

p {
  margin: 0 0 30px;
  color: var(--text-600);
  font-size: 16px;
}

.home-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 11px 20px;
  color: white;
  background: var(--brand-900);
  border: 1px solid var(--brand-900);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  font-weight: 750;
  text-decoration: none;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.home-link:hover {
  background: var(--brand-700);
  border-color: var(--brand-700);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.home-link:focus-visible {
  outline: 3px solid rgba(39, 133, 211, 0.36);
  outline-offset: 3px;
}

@media (max-width: 560px) {
  .not-found {
    padding: 52px 20px;
    margin: 20px auto;
    border-radius: var(--radius-md);
  }

  .home-link {
    width: 100%;
  }
}
</style>
