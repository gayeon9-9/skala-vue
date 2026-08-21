<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { useTripDecisionStore } from '@/stores/tripDecisionStore'
import { getCurrentWeatherGuide } from '@/utils/weatherCondition'
import { ElAlert, ElButton, ElCard, ElTag } from 'element-plus'
import 'element-plus/es/components/alert/style/css'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/card/style/css'
import 'element-plus/es/components/tag/style/css'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const tripDecisionStore = useTripDecisionStore()

// 현재 상세 페이지에 표시할 도시
const cityData = computed(() => {
  return [...weatherStore.dashboardCities, ...tripDecisionStore.apiCities].find((item) => item.id === route.params.cityId) || null
})
const isLoading = ref(false)
const errorMessage = ref('')
const cityForecast = computed(() => weatherStore.forecastByCityId[route.params.cityId] || [])
const weatherGuide = computed(() => {
  if (!cityData.value) return ''
  return getCurrentWeatherGuide(cityData.value.weatherId)
})

// 화면이 처음 만들어질 때 URL의 도시 ID로 도시 검색
onMounted(async () => {
  if (!cityData.value) return

  isLoading.value = true
  try {
    if (!cityData.value.id.startsWith('api_')) await weatherStore.fetchDashboardCity(cityData.value, true)
    await weatherStore.fetchCityForecast(cityData.value)
  } catch {
    errorMessage.value = '실시간 정보를 다시 불러오지 못했습니다. 마지막으로 조회한 값을 표시합니다.'
  } finally {
    isLoading.value = false
  }
})

const displayTemp = computed(() => {
  if (!cityData.value) return ''
  if (configStore.unit === 'fahrenheit') return Math.round((cityData.value.temp * 9) / 5 + 32)
  return cityData.value.temp
})

const displayFeelsLike = computed(() => {
  if (!cityData.value) return ''
  if (configStore.unit === 'fahrenheit') return Math.round((cityData.value.feelsLike * 9) / 5 + 32)
  return cityData.value.feelsLike
})

const formatTemperature = (temperature) => {
  if (configStore.unit === 'fahrenheit') return Math.round((temperature * 9) / 5 + 32)
  return Math.round(temperature * 10) / 10
}

const formatForecastTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString('ko-KR', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// 메인 화면으로 이동
const goHome = () => {
  router.push('/')
}
</script>

<template>
  <main class="detail-container">
    <h2>🌤️ 도시 상세 날씨</h2>

    <el-alert v-if="isLoading" title="최신 날씨와 예보를 확인하고 있습니다." type="info" show-icon :closable="false" />
    <el-alert v-if="errorMessage" :title="errorMessage" type="warning" show-icon :closable="false" />

    <!-- URL의 ID와 일치하는 도시가 있을 때 -->
    <el-card v-if="cityData" class="detail-card" shadow="never">
      <h3>{{ cityData.country }} · {{ cityData.name }}</h3>
      <p>대륙: {{ cityData.continent }}</p>
      <p>날씨: <strong>{{ cityData.status }}</strong></p>
      <p>현재 기온: <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong></p>
      <p>체감온도: <strong>{{ displayFeelsLike }}{{ configStore.unitSymbol }}</strong></p>
      <p>습도: <strong>{{ cityData.humidity }}%</strong></p>
      <p>미세먼지: <strong>{{ cityData.pm10 }}㎍/㎥</strong></p>
      <p>초미세먼지: <strong>{{ cityData.pm25 }}㎍/㎥</strong></p>
      <p class="data-source">OpenWeatherMap API 관측값</p>

      <div class="travel-guide">
        <p v-if="weatherGuide">{{ weatherGuide }}</p>
        <p v-else-if="cityData.feelsLike >= 33">🥵 체감온도가 높아 장시간 야외 활동에 주의하세요.</p>
        <p v-else-if="cityData.pm10 > 80 || cityData.pm25 > 35">😷 대기질이 좋지 않아 야외 활동에 주의하세요.</p>
        <p v-else>✈️ 현재 여행하기 비교적 좋은 날씨입니다.</p>
      </div>

      <div v-if="cityForecast.length > 0" class="forecast-area">
        <h4>3시간 단위 예보</h4>
        <div class="forecast-list">
          <el-card v-for="forecast in cityForecast" :key="forecast.dt" shadow="hover" :body-style="{ padding: '9px' }">
            <strong>{{ formatForecastTime(forecast.dt) }}</strong>
            <el-tag size="small" effect="plain">{{ forecast.weather[0].description }}</el-tag>
            <span>{{ formatTemperature(forecast.main.temp) }}{{ configStore.unitSymbol }}</span>
            <span>강수확률 {{ Math.round((forecast.pop || 0) * 100) }}%</span>
          </el-card>
        </div>
      </div>

      <el-button type="info" @click="goHome">← 날씨 대시보드로 돌아가기</el-button>
    </el-card>

    <!-- URL의 ID와 일치하는 도시가 없을 때 -->
    <section v-else class="not-found">
      <p>해당 도시의 날씨 정보를 찾을 수 없습니다.</p>
      <p>요청한 도시 ID: {{ route.params.cityId }}</p>
      <el-button type="info" @click="goHome">← 날씨 대시보드로 돌아가기</el-button>
    </section>
  </main>
</template>

<style scoped>
.detail-container {
  max-width: 980px;
  margin: 0 auto;
  color: var(--text-800);
}

.detail-container > h2 {
  margin: 0 0 24px;
  color: var(--brand-950);
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 850;
  letter-spacing: -1px;
  line-height: 1.25;
}

.detail-container > :deep(.el-alert) {
  margin-bottom: 14px;
  border-radius: var(--radius-sm);
}

.detail-card {
  background: linear-gradient(145deg, var(--surface), var(--brand-50));
  border: 1px solid var(--brand-100);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.detail-card :deep(.el-card__body) {
  padding: 30px;
}

.detail-card h3 {
  padding-bottom: 16px;
  margin: 0 0 18px;
  color: var(--brand-950);
  border-bottom: 1px solid var(--line);
  font-size: clamp(24px, 3vw, 30px);
  line-height: 1.25;
}

.detail-card > :deep(.el-card__body) > p:not(.data-source) {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 10px 4px;
  color: var(--text-700);
  border-bottom: 1px solid var(--line);
}

.detail-card p strong {
  color: var(--brand-900);
}

.travel-guide {
  padding: 16px 18px;
  margin: 20px 0;
  color: var(--brand-900);
  background: var(--brand-50);
  border: 1px solid var(--brand-100);
  border-left: 4px solid var(--brand-500);
  border-radius: var(--radius-sm);
  font-weight: 650;
}

.travel-guide p {
  margin: 0;
}

.data-source {
  margin-top: 8px;
  color: var(--text-600);
  font-size: 12px;
  text-align: right;
}

.forecast-area {
  margin: 28px 0 24px;
}

.forecast-area h4 {
  margin: 0 0 14px;
  color: var(--brand-950);
  font-size: 19px;
}

.forecast-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.forecast-list :deep(.el-card) {
  overflow: hidden;
  border-color: var(--line);
  border-radius: var(--radius-sm);
}

.forecast-list :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 7px;
  height: 100%;
  color: var(--text-700);
  background: var(--surface);
  font-size: 12px;
}

.forecast-list :deep(.el-card__body strong) {
  color: var(--brand-900);
}

.detail-card :deep(.el-button--info),
.not-found :deep(.el-button--info) {
  border-color: var(--brand-900);
  border-radius: var(--radius-sm);
  background: var(--brand-900);
  font-weight: 700;
}

.detail-container :deep(.el-button:focus-visible) {
  outline: 3px solid rgba(39, 133, 211, 0.36);
  outline-offset: 3px;
}

.not-found {
  padding: 40px 24px;
  color: var(--text-700);
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.not-found p:first-child {
  color: var(--brand-950);
  font-size: 18px;
  font-weight: 800;
}

.not-found p:nth-child(2) {
  margin: 6px 0 20px;
  color: var(--text-600);
  font-size: 13px;
}

@media (max-width: 760px) {
  .forecast-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .detail-card :deep(.el-card__body) {
    padding: 20px;
  }

  .detail-card > :deep(.el-card__body) > p:not(.data-source) {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
  }

  .forecast-list {
    grid-template-columns: 1fr;
  }
}
</style>
