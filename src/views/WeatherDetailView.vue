<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { weatherData } from '../data/weatherData'

const route = useRoute()
const router = useRouter()

// 현재 상세 페이지에 표시할 도시
const cityData = ref(null)

// 화면이 처음 만들어질 때 URL의 도시 ID로 도시 검색
onMounted(() => {
  const cityId = route.params.cityId

  cityData.value = weatherData.find((item) => item.id === cityId)
})

// 메인 화면으로 이동
const goHome = () => {
  router.push('/')
}
</script>

<template>
  <main class="detail-container">
    <h2>🌤️ 도시 상세 날씨</h2>

    <!-- URL의 ID와 일치하는 도시가 있을 때 -->
    <section v-if="cityData" class="detail-card">
      <h3>{{ cityData.country }} · {{ cityData.name }}</h3>
      <p>대륙: {{ cityData.continent }}</p>
      <p>날씨: <strong>{{ cityData.status }}</strong></p>
      <p>현재 기온: <strong>{{ cityData.temp }}℃</strong></p>
      <p>체감온도: <strong>{{ cityData.feelsLike }}℃</strong></p>
      <p>습도: <strong>{{ cityData.humidity }}%</strong></p>
      <p>미세먼지: <strong>{{ cityData.pm10 }}㎍/㎥</strong></p>
      <p>초미세먼지: <strong>{{ cityData.pm25 }}㎍/㎥</strong></p>

      <div class="travel-guide">
        <p v-if="cityData.status.includes('비')">☔ 비가 내리고 있어 실내 여행지를 추천합니다.</p>
        <p v-else-if="cityData.feelsLike >= 33">🥵 체감온도가 높아 장시간 야외 활동에 주의하세요.</p>
        <p v-else-if="cityData.pm10 > 80 || cityData.pm25 > 35">😷 대기질이 좋지 않아 야외 활동에 주의하세요.</p>
        <p v-else>✈️ 현재 여행하기 비교적 좋은 날씨입니다.</p>
      </div>

      <button class="back-button" @click="goHome">← 날씨 대시보드로 돌아가기</button>
    </section>

    <!-- URL의 ID와 일치하는 도시가 없을 때 -->
    <section v-else class="not-found">
      <p>해당 도시의 날씨 정보를 찾을 수 없습니다.</p>
      <p>요청한 도시 ID: {{ route.params.cityId }}</p>
      <button class="back-button" @click="goHome">← 날씨 대시보드로 돌아가기</button>
    </section>
  </main>
</template>

<style scoped>
.detail-container { max-width: 700px; margin: 0 auto; }
.detail-card { padding: 20px; background-color: white; border: 1px solid #ddd; border-radius: 6px; }
.detail-card h3 { margin-top: 0; }
.travel-guide { padding: 12px; margin: 16px 0; background-color: #f3f8f3; border-radius: 5px; }
.not-found { padding: 20px; text-align: center; background-color: #f7f7f7; border-radius: 6px; }
.back-button { padding: 8px 12px; color: white; background-color: #2c3e50; border: none; border-radius: 4px; cursor: pointer; }
</style>