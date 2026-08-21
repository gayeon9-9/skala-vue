<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import { weatherData } from '@/data/weatherData'

import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import TravelFilter from './TravelFilter.vue'
import WeatherCard from './WeatherCard.vue'

// 공통 데이터를 반응형 날씨 목록으로 저장
const weatherList = ref([...weatherData]) //기존 40개 배열 제거 & weathwerdata에 기재
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 도시 이름을 검색해 보세요.')
// 현재 선택된 도시의 고유 ID
const selectedCityId = ref('')
const selectedContinent = ref('전체')
const selectedPurpose = ref('전체')

// 기본적인 쾌적한 여행 도시 조건
const isRecommended = (item) => {
  return !item.status.includes('비') && item.feelsLike >= 18 && item.feelsLike < 30 && item.pm10 <= 60 && item.pm25 <= 35
}

// 도시 이름 검색
const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  if (keyword === '') return weatherList.value
  return weatherList.value.filter((item) => item.name.includes(keyword))
})

// 대륙 선택
const continentWeatherList = computed(() => {
  if (selectedContinent.value === '전체') return filteredWeatherList.value
  return filteredWeatherList.value.filter((item) => item.continent === selectedContinent.value)
})

// 여행 목적 선택
const displayedWeatherList = computed(() => {
  const cityList = continentWeatherList.value

  if (selectedPurpose.value === '쾌적한 도시') {
    return cityList.filter((item) => isRecommended(item))
  }

  if (selectedPurpose.value === '더위 피하기') {
    return cityList.filter((item) => !item.status.includes('비') && item.feelsLike < 25 && item.pm10 <= 80 && item.pm25 <= 35)
  }

  if (selectedPurpose.value === '추위 피하기') {
    return cityList.filter((item) => !item.status.includes('비') && item.feelsLike >= 25 && item.feelsLike < 30 && item.pm10 <= 80 && item.pm25 <= 35)
  }

  if (selectedPurpose.value === '비 피하기') {
    return cityList.filter((item) => !item.status.includes('비') && item.feelsLike < 33 && item.pm10 <= 80 && item.pm25 <= 35)
  }

  if (selectedPurpose.value === '대기질 좋은 곳') {
    return cityList.filter((item) => !item.status.includes('비') && item.feelsLike < 33 && item.pm10 <= 30 && item.pm25 <= 15)
  }

  return cityList
})

// 검색 및 필터 결과가 없으면 하단 상태바에도 안내 문구 표시
const statusBarMessage = computed(() => {
  if (displayedWeatherList.value.length === 0) {
    return '선택한 검색 조건에 맞는 도시가 없습니다.'
  }

  return selectedCityInfo.value
})

const updateSearchQuery = (value) => { searchQuery.value = value }
const updateContinent = (value) => { selectedContinent.value = value }
const updatePurpose = (value) => { selectedPurpose.value = value }
const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.country} ${city.name} 도시를 선택했습니다.`
}

const showDetail = (city) => {
  window.alert(`${city.country} ${city.name}\n대륙: ${city.continent}\n날씨: ${city.status}\n기온: ${city.temp}°C\n체감온도: ${city.feelsLike}°C\n습도: ${city.humidity}%\n미세먼지: ${city.pm10}㎍/㎥\n초미세먼지: ${city.pm25}㎍/㎥`)
}

watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log(`[watch] ${oldInfo} → ${newInfo}`)
})

watchEffect(() => {
  console.log(`[watchEffect] 현재 검색어: "${searchQuery.value}"`)
})

watch(selectedContinent, (newValue) => {
  console.log(`[대륙 선택] ${newValue}`)
})

watch(selectedPurpose, (newValue) => {
  console.log(`[여행 목적 선택] ${newValue}`)
})
</script>

<template>
  <div class="dashboard-wrapper">
    <header class="dashboard-header">
      <h2>🌍 어디로 갈까?</h2>
      <p>대륙과 여행 목적을 선택하여 날씨가 알맞은 도시를 찾아보세요.</p>
    </header>

    <BaseDashboardCard>
      <h3>🔍 도시 검색</h3>
      <SearchBar :search-query="searchQuery" @update-query="updateSearchQuery" />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>여행 조건 선택</h3>

      <TravelFilter
        :selected-continent="selectedContinent"
        :selected-purpose="selectedPurpose"
        :filtered-count="continentWeatherList.length"
        :displayed-count="displayedWeatherList.length"
        @update-continent="updateContinent"
        @update-purpose="updatePurpose"
      />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>✈️ 국내·해외 도시별 여행 날씨</h3>

      <div v-if="displayedWeatherList.length > 0" class="weather-grid">
        <WeatherCard
          v-for="item in displayedWeatherList"
          :key="item.id"
          :item="item"
          :search-query="searchQuery"
          :recommended="isRecommended(item)"
          :selected-purpose="selectedPurpose"
          :is-selected="selectedCityId === item.id"
          @select-card="selectCity"
          @click-detail="showDetail"
        />
      </div>

      <p v-else class="no-result">😥 선택한 조건과 일치하는 도시가 없습니다.</p>
    </BaseDashboardCard>

    <div class="status-bar">{{ statusBarMessage }}</div>

    <p class="notice">※ 온도 및 대기질 표시는 과제용 Mockup 데이터이며 실제 특보 및 관측값과 다를 수 있습니다.</p>
  </div>
</template>

<style scoped>
.dashboard-wrapper { max-width: 760px; margin: 0 auto; padding: 20px; color: #222; font-family: Arial, sans-serif; }
.dashboard-header { margin-bottom: 20px; }
.dashboard-header h2 { margin: 0 0 8px; }
.dashboard-header p { margin: 0; color: #666; }
.weather-grid { display: grid; gap: 10px; }
.status-bar { padding: 12px; color: #1b5e20; text-align: center; background-color: #e8f5e9; border-radius: 5px; }
.no-result { padding: 20px; color: #777; text-align: center; }
.notice { color: #777; font-size: 12px; text-align: center; }
</style>
