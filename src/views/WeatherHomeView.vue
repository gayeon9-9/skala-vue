<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cityCatalog, majorCityIds, skalaCityIds } from '@/data/cityCatalog'
import { useTripDecisionStore } from '@/stores/tripDecisionStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { hasPrecipitation as checkPrecipitation } from '@/utils/weatherCondition'

import BaseDashboardCard from '../components/HandsOn/WeatherComponent/BaseDashboardCard.vue'
import CurrentLocationWeather from '../components/HandsOn/WeatherComponent/CurrentLocationWeather.vue'
import LiveCityWeather from '../components/HandsOn/WeatherComponent/LiveCityWeather.vue'
import NearbyWeatherRecommendation from '../components/HandsOn/WeatherComponent/NearbyWeatherRecommendation.vue'
import TravelFilter from '../components/HandsOn/WeatherComponent/TravelFilter.vue'
import WeatherCard from '../components/HandsOn/WeatherComponent/WeatherCard.vue'

// 현재 주소를 확인하고 다른 주소로 이동하기 위한 Router 기능
const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()
const tripDecisionStore = useTripDecisionStore()

const cityGroups = [
  { id: 'major', label: '주요 도시', icon: '🌏', description: '국내외 주요 도시 40곳' },
  { id: 'skala', label: 'SKALA 캠퍼스', icon: '🏫', description: '판교·광주·울산' },
  { id: 'api', label: 'API 검색 도시', icon: '🔎', description: '03에서 직접 검색한 전 세계 도시' },
  { id: 'favorites', label: '관심 여행지', icon: '♥', description: '관심 표시한 도시' },
]
const selectedCityGroup = ref('major')

const selectedGroupIds = computed(() => {
  if (selectedCityGroup.value === 'skala') return skalaCityIds
  if (selectedCityGroup.value === 'api') return tripDecisionStore.dashboardSearchCityIds
  if (selectedCityGroup.value === 'favorites') return tripDecisionStore.favoriteCityIds
  return majorCityIds
})

const activeGroup = computed(() => cityGroups.find((group) => group.id === selectedCityGroup.value))
const activeScopeLabel = computed(() => `${activeGroup.value.label} ${selectedGroupIds.value.length}곳`)
const activeCatalogCities = computed(() => cityCatalog.filter((city) => selectedGroupIds.value.includes(city.id)))

// API로 조회된 카탈로그 도시와 직접 검색해 저장한 도시를 한 목록으로 합친다.
const allAvailableCities = computed(() => {
  const cities = [...weatherStore.dashboardCities, ...tripDecisionStore.apiCities]
  return cities.filter((city, index) => cities.findIndex((item) => item.id === city.id) === index)
})
const weatherList = computed(() => selectedGroupIds.value
  .map((cityId) => allAvailableCities.value.find((city) => city.id === cityId))
  .filter((city) => city))

// 검색어와 선택 결과
const searchQuery = ref(typeof route.query.search === 'string' ? route.query.search : '')
const selectedCityInfo = ref('카드를 클릭하거나 도시 이름을 검색해 보세요.')
const selectedCityId = ref('')
const isRefreshingApiCities = ref(false)
const apiRefreshMessage = ref('검색한 도시는 이 탭에 모아서 표시합니다.')

// 대륙과 여행 목적
const selectedContinent = ref('전체')
const selectedPurpose = ref('전체')

// 페이지가 처음 열릴 때 주소의 검색어를 복원
// 예: /?search=수원
onMounted(() => {
  // 현재 선택된 탭에 필요한 도시만 실제 날씨를 조회
  weatherStore.refreshDashboardCities(activeCatalogCities.value)
})

const changeCityGroup = async (groupId) => {
  selectedCityGroup.value = groupId
  searchQuery.value = ''
  weatherStore.citySearchResults = []
  weatherStore.citySearchMessage = ''
  selectedContinent.value = '전체'
  selectedPurpose.value = '전체'
  selectedCityId.value = ''

  if (groupId === 'favorites') {
    selectedCityInfo.value = '관심 표시한 도시를 보여줍니다.'
    return
  }

  if (groupId === 'api') {
    selectedCityInfo.value = '대시보드 03에서 직접 검색한 도시를 보여줍니다.'
    return
  }

  selectedCityInfo.value = `${activeGroup.value.label}의 실시간 날씨를 표시합니다.`
  await weatherStore.refreshDashboardCities(activeCatalogCities.value)
}

const refreshActiveCities = async () => {
  if (selectedCityGroup.value === 'api') {
    const apiCities = [...tripDecisionStore.dashboardSearchCities]
    if (apiCities.length === 0 || isRefreshingApiCities.value) return

    isRefreshingApiCities.value = true
    apiRefreshMessage.value = `검색 도시의 최신 날씨를 불러오는 중입니다. (0/${apiCities.length})`
    try {
      let successCount = 0
      let failedCount = 0
      let completedCount = 0

      // 검색 도시가 늘어나도 요청이 한꺼번에 몰리지 않도록 네 곳씩 갱신한다.
      for (let index = 0; index < apiCities.length; index += 4) {
        const cityGroup = apiCities.slice(index, index + 4)
        const results = await Promise.allSettled(cityGroup.map((city) => weatherStore.refreshApiCity(city)))

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            tripDecisionStore.addApiCity(result.value)
            successCount += 1
          } else {
            failedCount += 1
          }
        })
        completedCount += cityGroup.length
        apiRefreshMessage.value = `검색 도시의 최신 날씨를 불러오는 중입니다. (${completedCount}/${apiCities.length})`
      }

      apiRefreshMessage.value = failedCount === 0
        ? `${successCount}개 검색 도시를 실시간 날씨로 갱신했습니다.`
        : `${successCount}개 도시 갱신 완료 · ${failedCount}개 도시 조회 실패`
    } finally {
      isRefreshingApiCities.value = false
    }
    return
  }

  if (activeCatalogCities.value.length === 0) return
  await weatherStore.refreshDashboardCities(activeCatalogCities.value, true)
}

// 기본적인 쾌적한 여행 도시 조건
const hasPrecipitation = (item) => checkPrecipitation(item.weatherId)

const isRecommended = (item) => {
  return !hasPrecipitation(item) && item.feelsLike >= 15 && item.feelsLike < 30 && item.pm10 <= 60 && item.pm25 <= 35
}

// 도시명 검색은 API가 담당하고, 이 목록에서는 선택한 그룹의 도시부터 필터링한다.
const filteredWeatherList = computed(() => weatherList.value)

// 2단계: 검색 결과에서 대륙 필터링
const continentWeatherList = computed(() => {
  if (selectedContinent.value === '전체') {
    return filteredWeatherList.value
  }

  return filteredWeatherList.value.filter((item) => item.continent === selectedContinent.value)
})

// 도시가 여행 목적에서 제외된 이유를 카드에서 확인할 수 있도록 같은 기준으로 계산한다.
const getPurposeFailureReasons = (item) => {
  const purpose = selectedPurpose.value
  if (purpose === '전체') return []

  const reasons = []
  if (hasPrecipitation(item)) reasons.push('현재 비나 눈이 관측됩니다.')

  if (purpose === '쾌적한 도시') {
    if (item.feelsLike < 15) reasons.push(`체감온도 ${item.feelsLike}℃가 기준 15℃보다 낮습니다.`)
    if (item.feelsLike >= 30) reasons.push(`체감온도 ${item.feelsLike}℃가 기준 30℃ 이상입니다.`)
    if (item.pm10 > 60) reasons.push(`미세먼지 ${item.pm10}㎍/㎥가 기준 60을 초과합니다.`)
    if (item.pm25 > 35) reasons.push(`초미세먼지 ${item.pm25}㎍/㎥가 기준 35를 초과합니다.`)
  }

  if (purpose === '더위 피하기') {
    if (item.feelsLike >= 25) reasons.push(`체감온도 ${item.feelsLike}℃가 기준 25℃ 이상입니다.`)
    if (item.pm10 > 80) reasons.push(`미세먼지 ${item.pm10}㎍/㎥가 기준 80을 초과합니다.`)
    if (item.pm25 > 35) reasons.push(`초미세먼지 ${item.pm25}㎍/㎥가 기준 35를 초과합니다.`)
  }

  if (purpose === '추위 피하기') {
    if (item.feelsLike < 25) reasons.push(`체감온도 ${item.feelsLike}℃가 기준 25℃보다 낮습니다.`)
    if (item.feelsLike >= 30) reasons.push(`체감온도 ${item.feelsLike}℃가 기준 30℃ 이상입니다.`)
    if (item.pm10 > 80) reasons.push(`미세먼지 ${item.pm10}㎍/㎥가 기준 80을 초과합니다.`)
    if (item.pm25 > 35) reasons.push(`초미세먼지 ${item.pm25}㎍/㎥가 기준 35를 초과합니다.`)
  }

  if (purpose === '비 피하기') {
    if (item.feelsLike >= 33) reasons.push(`체감온도 ${item.feelsLike}℃가 안전 기준 33℃ 이상입니다.`)
    if (item.pm10 > 80) reasons.push(`미세먼지 ${item.pm10}㎍/㎥가 기준 80을 초과합니다.`)
    if (item.pm25 > 35) reasons.push(`초미세먼지 ${item.pm25}㎍/㎥가 기준 35를 초과합니다.`)
  }

  if (purpose === '대기질 좋은 곳') {
    if (item.feelsLike >= 33) reasons.push(`체감온도 ${item.feelsLike}℃가 안전 기준 33℃ 이상입니다.`)
    if (item.pm10 > 30) reasons.push(`미세먼지 ${item.pm10}㎍/㎥가 좋은 단계 기준 30을 초과합니다.`)
    if (item.pm25 > 15) reasons.push(`초미세먼지 ${item.pm25}㎍/㎥가 좋은 단계 기준 15를 초과합니다.`)
  }

  return reasons
}

const isPurposeMatch = (item) => getPurposeFailureReasons(item).length === 0

// 3단계: 대륙 필터 결과에서 여행 목적을 충족한 도시만 계산한다.
const purposeMatchedWeatherList = computed(() => continentWeatherList.value.filter((item) => isPurposeMatch(item)))

// 일치 도시가 0개일 때는 빈 화면 대신 후보 카드와 제외 이유를 보여준다.
const isShowingPurposeFailures = computed(() => {
  return selectedPurpose.value !== '전체'
    && continentWeatherList.value.length > 0
    && purposeMatchedWeatherList.value.length === 0
})

const displayedWeatherList = computed(() => {
  if (isShowingPurposeFailures.value) return continentWeatherList.value
  return purposeMatchedWeatherList.value
})

// 필터 결과가 없으면 상태바에 안내 표시
const statusBarMessage = computed(() => {
  if (selectedCityId.value) return selectedCityInfo.value
  if (isShowingPurposeFailures.value) return `${selectedPurpose.value} 조건을 충족한 도시는 없지만, 각 도시의 제외 이유를 확인할 수 있습니다.`
  if (continentWeatherList.value.length === 0) return '선택한 대륙에서 조회된 도시가 없습니다.'

  return selectedCityInfo.value
})

const emptyListMessage = computed(() => {
  if (selectedCityGroup.value === 'api' && selectedGroupIds.value.length === 0) return '03 검색창에서 도시를 검색하면 이곳에 카드가 추가됩니다.'
  if (selectedCityGroup.value === 'favorites' && selectedGroupIds.value.length === 0) return '아직 관심 표시한 도시가 없습니다.'
  if (weatherList.value.length === 0) return '실시간 API 조회에 성공한 도시가 없습니다.'
  if (continentWeatherList.value.length === 0) return `${selectedContinent.value}에 해당하는 도시가 현재 목록에 없습니다.`
  return '조회된 도시가 없습니다.'
})

// API 검색 컴포넌트에서 전달한 검색어 저장
const updateSearchQuery = (value) => {
  searchQuery.value = value
}

// API 검색이 끝난 도시는 별도 그룹에서 기존 대륙·여행 목적 필터를 적용한다.
const selectApiCity = (city) => {
  tripDecisionStore.addDashboardSearchCity(city)
  selectedCityGroup.value = 'api'
  selectedContinent.value = '전체'
  selectedPurpose.value = '전체'
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.country} ${city.name} 도시를 API 검색 목록에 추가했습니다.`
  apiRefreshMessage.value = `${tripDecisionStore.dashboardSearchCityIds.length}개 도시를 실시간 API 값으로 불러왔습니다.`
}

const isListRefreshing = computed(() => weatherStore.isRefreshingCities || isRefreshingApiCities.value)
const canRefreshActiveCities = computed(() => {
  if (selectedCityGroup.value === 'api') return tripDecisionStore.dashboardSearchCityIds.length > 0
  return activeCatalogCities.value.length > 0
})
const listRefreshMessage = computed(() => selectedCityGroup.value === 'api'
  ? apiRefreshMessage.value
  : weatherStore.cityRefreshMessage)

// 대륙 변경
const changeContinent = (continent) => {
  selectedContinent.value = continent
  selectedCityId.value = ''

  if (continent === '전체') {
    selectedCityInfo.value = '전체 대륙의 도시를 표시합니다.'
  } else {
    selectedCityInfo.value = `${continent} 도시를 표시합니다.`
  }
}

// 여행 목적 변경
const changePurpose = (purpose) => {
  selectedPurpose.value = purpose
  selectedCityId.value = ''

  if (purpose === '전체') {
    selectedCityInfo.value = '모든 여행 목적의 도시를 표시합니다.'
  } else {
    selectedCityInfo.value = `${purpose} 조건에 맞는 도시를 표시합니다.`
  }
}

// 카드 클릭 시 선택한 도시 저장
const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.country} ${city.name} 도시를 선택했습니다.`
}

// 상세보기 클릭 시 동적 상세 주소로 이동
const goToDetail = (city) => {
  router.push(`/weather/${city.id}`)
}

// 검색어가 바뀔 때 주소의 쿼리 스트링도 변경
watch(searchQuery, (newQuery) => {
  router.replace({
    path: '/',
    query: {
      search: newQuery.trim() || undefined,
    },
  })
})

// 상태 변경을 콘솔에서 확인
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
      <div class="hero-copy">
        <span class="eyebrow">WEATHER TRIP PLANNER</span>
        <h2>오늘 날씨에 맞는<br /><em>여행지를 찾아보세요.</em></h2>
        <p>현재 위치의 날씨부터 전 세계 도시 비교까지 한곳에서 확인할 수 있어요.</p>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <span class="sun">☀️</span>
        <span class="cloud">☁️</span>
        <span class="plane">✈️</span>
      </div>
    </header>

    <section class="city-group-panel">
      <div class="group-intro">
        <div><span class="step-label">01</span><h3>어떤 도시를 찾고 있나요?</h3></div>
        <p>먼저 둘러볼 도시 그룹을 선택해 보세요.</p>
      </div>
      <div class="city-group-tabs">
        <button
          v-for="group in cityGroups"
          :key="group.id"
          type="button"
          :class="{ active: selectedCityGroup === group.id }"
          :aria-pressed="selectedCityGroup === group.id"
          :disabled="isListRefreshing"
          @click="changeCityGroup(group.id)"
        >
          <span>{{ group.icon }}</span>
          <span class="group-copy">
            <strong>{{ group.label }}</strong>
            <small>{{ group.description }}</small>
          </span>
        </button>
      </div>
    </section>

    <div class="section-title">
      <span class="step-label">02</span>
      <div><h3>내 위치와 근교 날씨</h3><p>현재 위치를 확인하거나 출발지를 정해 근교 여행지를 찾아보세요.</p></div>
    </div>

    <div class="quick-weather-grid">
      <!-- 현재 위치를 기준으로 OpenWeatherMap의 실제 날씨와 대기질 확인 -->
      <div class="current-location-section">
        <CurrentLocationWeather />
      </div>

      <div class="nearby-section">
        <NearbyWeatherRecommendation />
      </div>
    </div>

    <BaseDashboardCard class="finder-panel">
      <div class="finder-heading">
        <span>03</span>
        <div><h3>내 취향에 맞는 도시 찾기</h3><p>전 세계 도시를 API로 검색하거나 여행 조건을 골라보세요.</p></div>
      </div>
      <div class="finder-layout">
        <div class="finder-search">
          <h4>전 세계 도시 API 검색</h4>
          <LiveCityWeather
            :search-query="searchQuery"
            :show-heading="false"
            :show-result="false"
            auto-search
            @update-query="updateSearchQuery"
            @city-selected="selectApiCity"
          />
          <p class="api-search-guide">검색 결과가 여러 곳이면 국가와 지역을 확인해 한 곳을 선택하세요.</p>
        </div>
        <div class="finder-filter">
          <TravelFilter
            :selected-continent="selectedContinent"
            :selected-purpose="selectedPurpose"
            :filtered-count="continentWeatherList.length"
            :displayed-count="purposeMatchedWeatherList.length"
            :scope-label="activeScopeLabel"
            @update-continent="changeContinent"
            @update-purpose="changePurpose"
          />
        </div>
      </div>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <div class="city-list-header">
        <div>
          <span class="section-number">04</span>
          <h3>{{ activeGroup.label }} 둘러보기</h3>
          <p class="refresh-message">{{ listRefreshMessage }}</p>
        </div>
        <button type="button" class="refresh-button" :disabled="isListRefreshing || !canRefreshActiveCities" @click="refreshActiveCities">
          {{ isListRefreshing ? '갱신 중...' : '최신 날씨 갱신' }}
        </button>
      </div>

      <div v-if="isShowingPurposeFailures" class="filter-result-guide" role="status">
        <strong>{{ selectedPurpose }} 조건을 충족한 도시가 없습니다.</strong>
        <span>검색한 도시를 숨기지 않고, 카드에 조건에서 제외된 이유를 표시합니다.</span>
      </div>

      <div v-if="displayedWeatherList.length > 0" class="weather-grid">
        <WeatherCard
          v-for="item in displayedWeatherList"
          :key="item.id"
          :item="item"
          :recommended="isRecommended(item) && !isShowingPurposeFailures"
          :selected-purpose="selectedPurpose"
          :purpose-matched="isPurposeMatch(item)"
          :purpose-failure-reasons="getPurposeFailureReasons(item)"
          :is-selected="selectedCityId === item.id"
          @select-card="selectCity"
          @click-detail="goToDetail"
        />
      </div>

      <p v-else-if="isListRefreshing" class="no-result">실시간 도시 날씨를 불러오고 있습니다.</p>
      <p v-else class="no-result">{{ emptyListMessage }}</p>
    </BaseDashboardCard>

    <div class="status-bar">{{ statusBarMessage }}</div>

    <p class="notice">※ 이 화면에는 OpenWeatherMap API 조회에 성공한 도시만 표시합니다.</p>
  </div>
</template>

<style scoped>
.dashboard-wrapper { max-width: 1180px; margin: 0 auto; color: var(--text-900); }
.dashboard-header { position: relative; display: flex; min-height: 210px; padding: 44px 52px; margin-bottom: 24px; overflow: hidden; align-items: center; justify-content: space-between; background: linear-gradient(128deg, var(--brand-950) 0%, var(--brand-700) 56%, #0284c7 100%); border: 1px solid rgba(255, 255, 255, .2); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); isolation: isolate; }
.dashboard-header::before, .dashboard-header::after { position: absolute; z-index: -1; background: rgba(255, 255, 255, .09); border-radius: 50%; content: ''; }
.dashboard-header::before { top: -190px; left: 43%; width: 340px; height: 340px; }
.dashboard-header::after { right: -90px; bottom: -160px; width: 380px; height: 380px; }
.hero-copy { position: relative; z-index: 1; }
.eyebrow { display: inline-block; padding: 6px 10px; margin-bottom: 14px; color: #e0f2fe; background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .16); border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 1.8px; }
.dashboard-header h2 { margin: 0 0 13px; color: white; font-size: clamp(31px, 3.8vw, 46px); font-weight: 850; line-height: 1.14; letter-spacing: -1.8px; }
.dashboard-header h2 em { color: #bae6fd; font-style: normal; }
.dashboard-header p { max-width: 580px; margin: 0; color: rgba(255, 255, 255, .88); font-size: 16px; line-height: 1.65; }
.hero-visual { position: relative; z-index: 1; width: 235px; height: 145px; flex: 0 0 235px; }
.hero-visual::before { position: absolute; inset: 9px; background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .14); border-radius: 28px; content: ''; transform: rotate(-5deg); }
.hero-visual span { position: absolute; filter: drop-shadow(0 12px 14px rgba(8, 47, 73, .22)); }
.sun { top: -2px; right: 18px; font-size: 62px; }
.cloud { right: 45px; bottom: 2px; font-size: 84px; }
.plane { top: 60px; left: 7px; font-size: 39px; transform: rotate(-12deg); }
.quick-weather-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-bottom: 24px; }
.quick-weather-grid .current-location-section, .quick-weather-grid .nearby-section { min-width: 0; margin: 0; }
.quick-weather-grid :deep(.el-card) { height: 100%; }
.city-group-panel { padding: 27px; margin-bottom: 28px; background: rgba(255, 255, 255, .96); border: 1px solid var(--line); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
.group-intro { display: flex; margin-bottom: 18px; align-items: flex-end; justify-content: space-between; gap: 16px; }
.group-intro > div, .section-title { display: flex; align-items: center; gap: 12px; }
.group-intro h3, .section-title h3 { margin: 0; color: var(--brand-950); font-size: 21px; font-weight: 800; letter-spacing: -.45px; }
.group-intro p, .section-title p { margin: 0; color: var(--text-600); font-size: 13px; line-height: 1.5; }
.step-label, .finder-heading > span, .section-number { display: inline-grid; width: 38px; height: 38px; flex: 0 0 38px; color: var(--brand-700); place-items: center; background: var(--brand-50); border: 1px solid var(--brand-100); border-radius: 12px; font-size: 12px; font-weight: 850; }
.city-group-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 11px; }
.city-group-tabs button { display: flex; min-width: 0; min-height: 62px; padding: 10px 14px; color: var(--text-700); align-items: center; background: var(--surface-muted); border: 1px solid var(--line); border-radius: var(--radius-sm); cursor: pointer; gap: 10px; text-align: left; transition: color .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease; }
.city-group-tabs button > span:first-child { flex: 0 0 auto; font-size: 21px; }
.group-copy { display: grid; min-width: 0; gap: 2px; }
.group-copy strong { color: inherit; font-size: 13px; font-weight: 800; }
.group-copy small { overflow: hidden; color: var(--text-600); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.city-group-tabs button.active { color: var(--brand-700); background: linear-gradient(145deg, #eff6ff, #f0f9ff); border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(37, 99, 235, .08); }
.city-group-tabs button.active .group-copy small { color: #1d4f91; }
.city-group-tabs button:disabled { cursor: progress; opacity: .65; }
.section-title { padding: 3px 4px 14px; }
.section-title > div { display: grid; gap: 2px; }
.finder-panel { padding: 29px !important; }
.finder-heading { display: flex; margin-bottom: 23px; align-items: center; gap: 14px; }
.finder-heading h3 { margin: 0 0 3px !important; color: var(--brand-950); font-size: 21px !important; font-weight: 800 !important; }
.finder-heading p { margin: 0; color: var(--text-600); font-size: 14px; }
.finder-layout { display: grid; grid-template-columns: minmax(320px, .9fr) minmax(0, 1.55fr); gap: 30px; }
.finder-search { min-width: 0; padding-right: 30px; border-right: 1px solid var(--line); }
.finder-search h4 { margin: 0 0 12px; color: var(--text-800); font-size: 14px; font-weight: 800; }
.api-search-guide { margin: 11px 0 0; color: var(--text-600); font-size: 12px; line-height: 1.6; }
.filter-result-guide { display: grid; padding: 13px 15px; margin: 0 0 16px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-sm); gap: 3px; }
.filter-result-guide strong { font-size: 14px; font-weight: 800; }
.filter-result-guide span { font-size: 12px; line-height: 1.5; }
.weather-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.weather-grid > * { min-width: 0; }
.city-list-header { display: flex; margin-bottom: 18px; align-items: center; justify-content: space-between; gap: 16px; }
.city-list-header > div { display: grid; grid-template-columns: auto 1fr; gap: 1px 13px; align-items: center; }
.city-list-header h3 { margin: 0 !important; color: var(--brand-950); font-size: 22px !important; font-weight: 800 !important; }
.city-list-header .section-number { grid-row: 1 / 3; }
.refresh-message { margin: 0; color: var(--text-600); font-size: 13px; }
.refresh-button { min-height: 42px; padding: 9px 16px; color: white; background: linear-gradient(135deg, var(--brand-700), #0369a1); border: 0; border-radius: 11px; box-shadow: 0 7px 18px rgba(29, 78, 216, .2); cursor: pointer; font-weight: 700; transition: background-color .18s ease, box-shadow .18s ease, transform .18s ease; }
.refresh-button:disabled { color: #475569; background: #cbd5e1; box-shadow: none; cursor: not-allowed; }
.status-bar { padding: 14px 18px; margin-top: 20px; color: #166534; text-align: center; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm); font-size: 14px; font-weight: 650; }
.no-result { padding: 40px 20px; margin: 0; color: var(--text-600); text-align: center; background: var(--surface-muted); border: 1px dashed #cbd5e1; border-radius: var(--radius-md); }
.notice { margin: 16px 0 0; color: var(--text-600); font-size: 12px; text-align: center; }
@media (hover: hover) { .city-group-tabs button:hover:not(:disabled) { background: #eff6ff; border-color: #93c5fd; } .refresh-button:hover:not(:disabled) { box-shadow: 0 10px 22px rgba(29, 78, 216, .24); transform: translateY(-1px); } }
@media (max-width: 980px) { .quick-weather-grid, .finder-layout { grid-template-columns: 1fr; } .city-group-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); } .finder-search { padding: 0 0 23px; border-right: 0; border-bottom: 1px solid var(--line); } .weather-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 700px) { .dashboard-header { min-height: auto; padding: 35px 27px; } .hero-visual { display: none; } .group-intro { align-items: flex-start; flex-direction: column; } .weather-grid { grid-template-columns: 1fr; } .city-list-header { align-items: stretch; flex-direction: column; } .refresh-button { width: 100%; } }
@media (max-width: 440px) { .dashboard-header { padding: 30px 22px; border-radius: var(--radius-md); } .dashboard-header p { font-size: 14px; } .city-group-panel, .finder-panel { padding: 20px !important; } .city-group-tabs { grid-template-columns: 1fr; } .group-intro h3, .section-title h3 { font-size: 19px; } }
</style>
