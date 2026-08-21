<script setup>
import { ref } from 'vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { ElAlert, ElButton, ElCard, ElEmpty, ElInput } from 'element-plus'
import 'element-plus/es/components/alert/style/css'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/card/style/css'
import 'element-plus/es/components/empty/style/css'
import 'element-plus/es/components/input/style/css'

const weatherStore = useWeatherStore()
const baseKeyword = ref('')

const formatTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit',
  })
}

const getReason = (item) => {
  const recommended = item.recommended
  const current = item.current
  if (recommended.id === 'base') return '선택한 출발 도시의 조건이 주변 도시보다 좋습니다.'

  const rainDifference = Math.round(((current.forecast.pop || 0) - (recommended.forecast.pop || 0)) * 100)
  if (rainDifference > 0) return `출발 도시보다 강수확률이 ${rainDifference}%p 낮습니다.`
  if (recommended.forecast.main.feels_like < current.forecast.main.feels_like) return '출발 도시보다 체감온도가 낮습니다.'
  return '날씨와 이동 거리를 함께 계산한 점수가 가장 높습니다.'
}

const searchBaseCity = async () => {
  await weatherStore.findNearbyBaseCities(baseKeyword.value)
}
</script>

<template>
  <el-card class="nearby-recommendation" shadow="never">
    <div class="section-header">
      <div>
        <h3>🧭 시간대별 근교 추천</h3>
        <p>출발 도시를 정하고 가까운 국내 도시의 시간대별 예보를 비교합니다.</p>
      </div>
    </div>

    <form class="base-search" @submit.prevent="searchBaseCity">
      <el-input v-model="baseKeyword" clearable placeholder="출발 도시 검색 (예: 서울, 수원)" />
      <el-button native-type="submit" type="primary" :loading="weatherStore.isLoadingNearby">도시 찾기</el-button>
    </form>

    <div v-if="weatherStore.nearbySearchResults.length" class="base-results">
      <button v-for="city in weatherStore.nearbySearchResults" :key="`${city.lat}-${city.lon}`" type="button" @click="weatherStore.selectNearbyBaseCity(city)">
        {{ city.local_names?.ko || city.name }}{{ city.state ? ` · ${city.state}` : '' }} · {{ city.country }}
      </button>
    </div>

    <div v-if="weatherStore.nearbyBaseCity" class="selected-base">
      <span>출발지: <strong>{{ weatherStore.nearbyBaseCity.local_names?.ko || weatherStore.nearbyBaseCity.name }}</strong></span>
      <el-button type="success" :loading="weatherStore.isLoadingNearby" @click="weatherStore.fetchNearbyRecommendations">근교 추천 보기</el-button>
    </div>

    <el-alert v-if="weatherStore.nearbyErrorMessage" :title="weatherStore.nearbyErrorMessage" type="error" show-icon :closable="false" />

    <div v-if="weatherStore.nearbyTimeline.length > 0" class="timeline-list">
      <article v-for="item in weatherStore.nearbyTimeline" :key="item.time">
        <p class="time">{{ formatTime(item.time) }}</p>
        <h4>{{ item.recommended.id === 'base' ? '출발 도시 유지' : `${item.recommended.name} 추천` }}</h4>
        <p>{{ item.recommended.forecast.weather[0].description }} · 강수 {{ Math.round((item.recommended.forecast.pop || 0) * 100) }}% · {{ Math.round(item.recommended.forecast.main.feels_like) }}℃</p>
        <p v-if="item.recommended.distance > 0">직선거리 약 {{ Math.round(item.recommended.distance) }}km</p>
        <p class="reason">{{ getReason(item) }}</p>
      </article>
    </div>

    <el-empty v-else-if="!weatherStore.isLoadingNearby" :image-size="45" description="출발 도시를 검색하면 근교 여행지를 추천해 드려요." />
  </el-card>
</template>

<style scoped>
.nearby-recommendation { height: 100%; background: linear-gradient(145deg, #ecfeff 0%, #fff 58%, #eff6ff 100%); border: 1px solid #a5f3fc; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); }
.nearby-recommendation :deep(.el-card__body) { display: flex; min-height: 100%; flex-direction: column; }
.section-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.section-header h3 { margin: 0 0 7px; color: var(--brand-950); font-size: 19px; font-weight: 850; }
.section-header p { margin: 0; color: var(--text-600); font-size: 13px; line-height: 1.55; }
.base-search { display: flex; margin-top: 16px; gap: 8px; }
.base-search :deep(.el-input__wrapper) { min-height: 42px; background: rgba(255, 255, 255, .85); box-shadow: 0 0 0 1px #bae6fd inset; }
.base-search :deep(.el-button) { min-height: 42px; flex: 0 0 auto; border-radius: 10px; font-weight: 700; }
.base-results { display: grid; max-height: 178px; margin-top: 9px; overflow: auto; background: white; border: 1px solid #bae6fd; border-radius: 11px; }
.base-results button { min-height: 42px; padding: 10px 12px; color: var(--text-800); text-align: left; background: white; border: 0; cursor: pointer; }
.base-results button + button { border-top: 1px solid #e0f2fe; }
.selected-base { display: flex; padding: 11px 13px; margin-top: 11px; align-items: center; justify-content: space-between; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 11px; gap: 12px; }
.selected-base span { color: var(--text-700); }
.selected-base strong { color: #115e59; font-weight: 800; }
.selected-base :deep(.el-button) { min-height: 38px; border-radius: 9px; font-weight: 700; }
.timeline-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); gap: 9px; margin-top: 14px; }
.timeline-list article { min-width: 0; padding: 14px; background: rgba(255, 255, 255, .9); border: 1px solid #bae6fd; border-radius: 12px; box-shadow: 0 7px 18px rgba(14, 116, 144, .06); }
.timeline-list p { margin: 5px 0; color: var(--text-700); font-size: 12px; line-height: 1.45; }
.timeline-list h4 { margin: 6px 0; color: #0e7490; font-size: 16px; font-weight: 850; }
.time { color: var(--brand-700) !important; font-weight: 800; }
.reason { padding-top: 6px; color: #115e59 !important; border-top: 1px dashed #a5f3fc; font-weight: 650; }
.nearby-recommendation :deep(.el-alert) { margin-top: 14px; }
.nearby-recommendation :deep(.el-empty) { padding: 18px 0 0; }
@media (hover: hover) { .base-results button:hover { background: #ecfeff; } }
@media (max-width: 650px) { .section-header, .selected-base, .base-search { align-items: stretch; flex-direction: column; } .base-search :deep(.el-button), .selected-base :deep(.el-button) { width: 100%; } .timeline-list { grid-template-columns: 1fr; } }
</style>
