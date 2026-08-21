<script setup>
import { computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { useTripDecisionStore } from '@/stores/tripDecisionStore'
import { useRouter } from 'vue-router'
import { ElButton, ElInput } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/input/style/css'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  showHeading: { type: Boolean, default: true },
  showResult: { type: Boolean, default: true },
  autoSearch: { type: Boolean, default: false },
})
const emit = defineEmits(['update-query', 'city-selected'])
const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const tripDecisionStore = useTripDecisionStore()
const router = useRouter()
const selectedCityItem = computed(() => weatherStore.selectedCityItem)
const keyword = computed({
  get: () => props.searchQuery,
  set: (value) => {
    emit('update-query', value)
    if (value.trim() === '') {
      weatherStore.citySearchResults = []
      weatherStore.citySearchMessage = ''
    }
  },
})

const saveSelectedCity = (mode) => {
  if (!selectedCityItem.value) return
  tripDecisionStore.addApiCity(selectedCityItem.value)
  if (mode === 'favorite') tripDecisionStore.toggleFavorite(selectedCityItem.value.id)
  if (mode === 'compare') tripDecisionStore.toggleCompare(selectedCityItem.value.id)
}

const goToSelectedCity = () => {
  if (!selectedCityItem.value) return
  tripDecisionStore.addApiCity(selectedCityItem.value)
  router.push(`/weather/${selectedCityItem.value.id}`)
}

const convertTemperature = (temperature) => {
  if (configStore.unit === 'fahrenheit') return Math.round((temperature * 9) / 5 + 32)
  return Math.round(temperature * 10) / 10
}

const displayAirValue = (value) => {
  if (value === undefined) return '-'
  return Math.round(value * 10) / 10
}

const cityTitle = computed(() => {
  const city = weatherStore.selectedCity
  if (!city) return ''
  const localName = city.local_names?.ko || city.name
  return `${localName} · ${city.state ? `${city.state} · ` : ''}${city.country}`
})

const weatherIconUrl = computed(() => {
  const icon = weatherStore.selectedCityWeather?.weather?.[0]?.icon
  return icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : ''
})

const formatTravelTime = (value) => value ? value.slice(11, 16) : '-'

const submitSearch = async () => {
  await weatherStore.findCities(keyword.value)

  // 결과가 하나라면 목록을 다시 누르지 않아도 바로 날씨를 표시
  if (weatherStore.citySearchResults.length === 1) {
    await selectSearchCity(weatherStore.citySearchResults[0])
  }
}

// 한 번 조회한 API 도시는 다른 화면에서도 바로 찾을 수 있도록 공통 Store에 등록
const selectSearchCity = async (city) => {
  const cityItem = await weatherStore.fetchSelectedCityWeather(city)
  if (!cityItem) return

  tripDecisionStore.addApiCity(cityItem)
  weatherStore.citySearchMessage = `${cityItem.country} · ${cityItem.name}의 실시간 날씨를 불러왔습니다.`
  emit('city-selected', cityItem)
}

onMounted(() => {
  if (props.autoSearch && keyword.value.trim()) submitSearch()
})
</script>

<template>
  <section class="live-city-weather">
    <h3 v-if="showHeading">🌍 실시간 도시 날씨 검색</h3>
    <p v-if="showHeading" class="description">전 세계 도시를 검색해 현재 날씨와 대기질을 확인해 보세요.</p>

    <form class="search-form" @submit.prevent="submitSearch">
      <el-input v-model="keyword" clearable placeholder="예: 서울, Suwon, Paris" />
      <el-button native-type="submit" type="primary" :loading="weatherStore.isCitySearching">
        {{ weatherStore.isCitySearching ? '조회 중...' : '실시간 검색' }}
      </el-button>
    </form>

    <p v-if="weatherStore.citySearchMessage" class="message">{{ weatherStore.citySearchMessage }}</p>

    <ul v-if="weatherStore.citySearchResults.length > 0" class="result-list">
      <li v-for="city in weatherStore.citySearchResults" :key="`${city.lat}-${city.lon}`">
        <button type="button" :disabled="weatherStore.isCitySearching" @click="selectSearchCity(city)">
          {{ city.local_names?.ko || city.name }}{{ city.state ? ` · ${city.state}` : '' }} · {{ city.country }}
        </button>
      </li>
    </ul>

    <article v-if="showResult && weatherStore.selectedCityWeather" class="weather-result">
      <div class="result-title">
        <div>
          <h4>{{ cityTitle }}</h4>
          <p>{{ weatherStore.selectedCityWeather.weather[0].description }}</p>
        </div>
        <img v-if="weatherIconUrl" :src="weatherIconUrl" :alt="weatherStore.selectedCityWeather.weather[0].description" />
      </div>

      <div class="weather-values">
        <p>🌡️ 기온 <strong>{{ convertTemperature(weatherStore.selectedCityWeather.main.temp) }}{{ configStore.unitSymbol }}</strong></p>
        <p>🥵 체감 <strong>{{ convertTemperature(weatherStore.selectedCityWeather.main.feels_like) }}{{ configStore.unitSymbol }}</strong></p>
        <p>💧 습도 <strong>{{ weatherStore.selectedCityWeather.main.humidity }}%</strong></p>
        <p>💨 풍속 <strong>{{ weatherStore.selectedCityWeather.wind.speed }}m/s</strong></p>
        <p>🌫️ PM10 <strong>{{ displayAirValue(weatherStore.selectedCityAirData?.components?.pm10) }}㎍/㎥</strong></p>
        <p>😷 PM2.5 <strong>{{ displayAirValue(weatherStore.selectedCityAirData?.components?.pm2_5) }}㎍/㎥</strong></p>
      </div>

      <div v-if="weatherStore.selectedTravelInfo" class="travel-day-info">
        <p><strong>오늘 야외 활동 정보</strong></p>
        <p>최대 자외선 {{ weatherStore.selectedTravelInfo.daily.uv_index_max[0] }}</p>
        <p>일출 {{ formatTravelTime(weatherStore.selectedTravelInfo.daily.sunrise[0]) }} · 일몰 {{ formatTravelTime(weatherStore.selectedTravelInfo.daily.sunset[0]) }}</p>
      </div>

      <div v-if="selectedCityItem" class="result-actions">
        <el-button type="danger" plain size="small" @click="saveSelectedCity('favorite')">관심 여행지</el-button>
        <el-button type="primary" plain size="small" :disabled="tripDecisionStore.compareCount >= 2" @click="saveSelectedCity('compare')">비교 도시</el-button>
        <el-button type="primary" size="small" @click="goToSelectedCity">상세보기</el-button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.live-city-weather { padding: 0; background: transparent; border: none; box-shadow: none; }
.live-city-weather h3 { margin: 0 0 5px; color: var(--brand-950); font-size: 17px; font-weight: 850; }
.description { margin: 0 0 13px; color: var(--text-600); font-size: 13px; }
.search-form { display: flex; gap: 8px; }
.search-form :deep(.el-input__wrapper) { min-height: 44px; background: var(--surface-muted); box-shadow: 0 0 0 1px var(--line) inset; }
.search-form :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 2px rgba(37, 99, 235, .28) inset; }
.search-form :deep(.el-button) { min-width: 112px; min-height: 44px; padding: 0 18px; border-radius: 10px; font-weight: 750; }
.message { padding: 10px 12px; margin: 10px 0 0; color: #854d0e; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; font-size: 12px; line-height: 1.5; }
.result-list { max-height: 215px; overflow: auto; padding: 0; margin: 10px 0 0; list-style: none; background: white; border: 1px solid var(--line); border-radius: 11px; box-shadow: var(--shadow-sm); }
.result-list li + li { border-top: 1px solid #edf1f6; }
.result-list button { width: 100%; min-height: 42px; padding: 10px 12px; color: var(--text-800); text-align: left; background: white; border: 0; cursor: pointer; transition: color .18s ease, background-color .18s ease; }
.result-list button:disabled { color: var(--text-600); cursor: progress; background: var(--surface-muted); }
.weather-result { padding: 17px; margin-top: 14px; background: rgba(255, 255, 255, .97); border: 1px solid var(--line); border-radius: var(--radius-sm); box-shadow: var(--shadow-md); }
.result-title { display: flex; align-items: center; justify-content: space-between; }
.result-title h4 { margin: 0 0 5px; color: var(--brand-950); font-weight: 850; }
.result-title p { margin: 0 0 5px; color: var(--text-600); }
.result-title img { width: 65px; height: 65px; }
.weather-values { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.weather-values p { min-width: 0; padding: 10px; margin: 0; background: var(--surface-muted); border: 1px solid #edf1f6; border-radius: 10px; }
.travel-day-info { display: flex; flex-wrap: wrap; padding: 10px 12px; margin-top: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; gap: 8px 16px; }
.travel-day-info p { margin: 0; font-size: 13px; }
.result-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.result-actions :deep(.el-button + .el-button) { margin-left: 0; }
@media (hover: hover) { .result-list button:hover:not(:disabled) { color: var(--brand-700); background: #eff6ff; } }
@media (max-width: 600px) { .search-form { flex-direction: column; } .search-form :deep(.el-button) { width: 100%; } .weather-values { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
