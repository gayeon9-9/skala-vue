<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTripDecisionStore } from '@/stores/tripDecisionStore'
import WeatherCard from '@/components/HandsOn/WeatherComponent/WeatherCard.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { ElButton, ElEmpty } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/empty/style/css'

const router = useRouter()
const tripDecisionStore = useTripDecisionStore()
const weatherStore = useWeatherStore()

onMounted(async () => {
  const dashboardFavorites = tripDecisionStore.favoriteCities.filter((city) => !city.id.startsWith('api_'))
  await Promise.allSettled(dashboardFavorites.map((city) => weatherStore.fetchDashboardCity(city, true)))
})

const goHome = () => {
  router.push('/')
}

const goToDetail = (city) => {
  router.push(`/weather/${city.id}`)
}
</script>

<template>
  <main class="favorites-container">
    <header class="favorites-header">
      <h2>❤️ 관심 여행지</h2>
      <p>저장한 도시 {{ tripDecisionStore.favoriteCount }}곳을 확인할 수 있습니다.</p>
    </header>

    <section class="favorite-guide">
      <h3>⭐️ 관심 여행지 기능</h3>
      <p>
        날씨 대시보드에서 마음에 드는 도시를 저장하면 이 페이지에서 저장한 도시의 날씨를 모아서 확인할 수 있습니다.
      </p>

      <ul>
        <li>관심 여행지 저장 및 취소</li>
        <li>저장한 도시 개수 확인</li>
        <li>저장한 도시의 날씨 비교</li>
        <li>선택한 도시의 상세 날씨 페이지 이동</li>
      </ul>
    </section>

    <section v-if="tripDecisionStore.favoriteCount > 0" class="favorite-grid">
      <WeatherCard
        v-for="city in tripDecisionStore.favoriteCities"
        :key="city.id"
        :item="city"
        @click-detail="goToDetail"
      />
    </section>

    <el-empty v-else description="아직 저장한 관심 여행지가 없습니다.">
      <el-button type="primary" @click="goHome">여행지 찾아보기</el-button>
    </el-empty>

    <el-button type="info" @click="goHome">← 날씨 대시보드로 돌아가기</el-button>
  </main>
</template>

<style scoped>
.favorites-container {
  max-width: 1040px;
  margin: 0 auto;
  color: var(--text-800);
}

.favorites-header {
  padding: 8px 4px 24px;
}

.favorites-header h2 {
  margin: 0 0 8px;
  color: var(--brand-950);
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 850;
  letter-spacing: -1px;
  line-height: 1.25;
}

.favorites-header p {
  margin: 0;
  color: var(--text-600);
  font-size: 16px;
}

.favorite-guide {
  position: relative;
  overflow: hidden;
  padding: 24px 26px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, var(--brand-50), var(--surface) 64%);
  border: 1px solid var(--brand-100);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.favorite-guide::after {
  position: absolute;
  top: -52px;
  right: -42px;
  width: 150px;
  height: 150px;
  background: var(--brand-100);
  border-radius: 50%;
  content: '';
  opacity: 0.45;
}

.favorite-guide h3,
.favorite-guide p,
.favorite-guide ul {
  position: relative;
  z-index: 1;
}

.favorite-guide h3 {
  margin: 0 0 10px;
  color: var(--brand-900);
  font-size: 20px;
}

.favorite-guide p {
  max-width: 760px;
  color: var(--text-700);
  line-height: 1.75;
}

.favorite-guide ul {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px 30px;
  padding-left: 22px;
  margin: 14px 0 0;
  color: var(--text-700);
}

.favorite-guide li::marker {
  color: var(--brand-600);
}

.favorite-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.favorites-container > :deep(.el-empty) {
  padding: 44px 24px;
  margin-bottom: 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.favorites-container > :deep(.el-button--info) {
  border-color: var(--brand-900);
  border-radius: var(--radius-sm);
  background: var(--brand-900);
  font-weight: 700;
}

.favorites-container :deep(.el-button:focus-visible) {
  outline: 3px solid rgba(39, 133, 211, 0.36);
  outline-offset: 3px;
}

@media (max-width: 720px) {
  .favorite-grid,
  .favorite-guide ul {
    grid-template-columns: 1fr;
  }

  .favorite-guide {
    padding: 20px;
    border-radius: var(--radius-md);
  }
}
</style>
