import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useWeatherStore } from '@/stores/weatherStore'
import { hasPrecipitation } from '@/utils/weatherCondition'

const getUniqueCities = (cities) => {
  return cities.filter((city, index) => cities.findIndex((item) => item.id === city.id) === index)
}

// API의 숫자 날씨 코드로 계산하여 번역 문구가 바뀌어도 같은 기준을 유지한다.
const getWeatherRatio = (weatherId) => {
  if (hasPrecipitation(weatherId)) return 0.2
  if (weatherId >= 700 && weatherId < 800) return 0.5
  if (weatherId === 800) return 1
  if (weatherId === 801) return 0.9
  if (weatherId === 802) return 0.8
  if (weatherId === 803) return 0.7
  if (weatherId === 804) return 0.6
  return 0.5
}

// 여행 목적에 따라 알맞은 체감온도 구간을 다르게 계산
const getTemperatureRatio = (feelsLike, purpose) => {
  if (purpose === '더위 피하기') {
    if (feelsLike < 25) return 1
    if (feelsLike < 30) return 0.7
    if (feelsLike < 33) return 0.3
    return 0
  }

  if (purpose === '추위 피하기') {
    if (feelsLike >= 25 && feelsLike < 30) return 1
    if (feelsLike >= 20 && feelsLike < 33) return 0.7
    if (feelsLike >= 15 && feelsLike < 35) return 0.3
    return 0
  }

  if (feelsLike >= 20 && feelsLike < 27) return 1
  if (feelsLike >= 15 && feelsLike < 30) return 0.7
  if (feelsLike >= 10 && feelsLike < 33) return 0.3
  return 0
}

const getPm10Ratio = (pm10) => {
  if (pm10 <= 30) return 1
  if (pm10 <= 60) return 0.75
  if (pm10 <= 80) return 0.5
  if (pm10 <= 150) return 0.2
  return 0
}

const getPm25Ratio = (pm25) => {
  if (pm25 <= 15) return 1
  if (pm25 <= 35) return 0.6
  if (pm25 <= 75) return 0.2
  return 0
}

const getHumidityRatio = (humidity) => {
  if (humidity >= 40 && humidity <= 70) return 1
  if (humidity >= 30 && humidity <= 80) return 0.5
  return 0
}

// 선택한 여행 목적에서 중요한 항목에 더 높은 비중 적용
const getWeights = (purpose) => {
  if (purpose === '더위 피하기' || purpose === '추위 피하기') {
    return { weather: 20, temperature: 55, air: 20, humidity: 5 }
  }

  if (purpose === '비 피하기') {
    return { weather: 60, temperature: 15, air: 20, humidity: 5 }
  }

  if (purpose === '대기질 좋은 곳') {
    return { weather: 10, temperature: 15, air: 70, humidity: 5 }
  }

  return { weather: 25, temperature: 40, air: 30, humidity: 5 }
}

// 도시 한 곳의 항목별 점수와 총점을 계산
const calculateEvaluation = (city, purpose) => {
  const weights = getWeights(purpose)
  const weatherScore = Math.round(getWeatherRatio(city.weatherId) * weights.weather)
  const temperatureScore = Math.round(
    getTemperatureRatio(city.feelsLike, purpose) * weights.temperature,
  )
  const airRatio = (getPm10Ratio(city.pm10) + getPm25Ratio(city.pm25)) / 2
  const airScore = Math.round(airRatio * weights.air)
  const humidityScore = Math.round(getHumidityRatio(city.humidity) * weights.humidity)

  return {
    score: weatherScore + temperatureScore + airScore + humidityScore,
    weatherScore,
    temperatureScore,
    airScore,
    humidityScore,
  }
}

// 관심 여행지는 새로고침해도 남아 있어야 해서 브라우저 저장소에 ID만 보관한다.
// 날씨 수치는 저장하지 않고 화면을 열 때 API로 다시 조회한다.
const FAVORITE_STORAGE_KEY = 'travel-favorite-city-ids'

const loadFavoriteCityIds = () => {
  try {
    const savedValue = localStorage.getItem(FAVORITE_STORAGE_KEY)
    const savedIds = JSON.parse(savedValue || '[]')
    return Array.isArray(savedIds) ? savedIds : []
  } catch {
    return []
  }
}

// 관심 여행지부터 최종 비교까지 여행지를 고르는 과정을 관리하는 Store
export const useTripDecisionStore = defineStore('tripDecision', () => {
  // state
  const favoriteCityIds = ref(loadFavoriteCityIds())
  const compareCityIds = ref([])
  const selectedPurpose = ref('선택 안 함')
  const apiCities = ref([])
  const dashboardSearchCityIds = ref([])

  // 대표 도시와 검색 도시를 합친 전체 목록 (getter 여러 곳에서 사용)
  const allCities = computed(() => {
    const weatherStore = useWeatherStore()
    return getUniqueCities([...weatherStore.dashboardCities, ...apiCities.value])
  })

  // getters
  // ID만 저장하고, 화면에서는 공통 날씨 데이터의 도시 객체를 사용
  const favoriteCities = computed(() =>
    allCities.value.filter((city) => favoriteCityIds.value.includes(city.id)),
  )

  // 사용자가 선택한 순서대로 비교 도시 반환
  const compareCities = computed(() =>
    compareCityIds.value
      .map((cityId) => allCities.value.find((city) => city.id === cityId))
      .filter((city) => city),
  )

  // 대시보드 03에서 직접 검색한 도시만 둘러보기 목록으로 반환
  const dashboardSearchCities = computed(() =>
    dashboardSearchCityIds.value
      .map((cityId) => apiCities.value.find((city) => city.id === cityId))
      .filter((city) => city),
  )

  const favoriteCount = computed(() => favoriteCityIds.value.length)
  const compareCount = computed(() => compareCityIds.value.length)
  const canCompare = computed(() => compareCities.value.length === 2)

  // 두 도시가 준비되면 현재 여행 목적을 기준으로 추천 결과 계산
  const comparisonResult = computed(() => {
    if (!canCompare.value || selectedPurpose.value === '선택 안 함') return null

    const [firstCity, secondCity] = compareCities.value
    const firstEvaluation = calculateEvaluation(firstCity, selectedPurpose.value)
    const secondEvaluation = calculateEvaluation(secondCity, selectedPurpose.value)

    if (firstEvaluation.score === secondEvaluation.score) {
      return { isTie: true, recommendedCity: null, firstEvaluation, secondEvaluation }
    }

    return {
      isTie: false,
      recommendedCity: firstEvaluation.score > secondEvaluation.score ? firstCity : secondCity,
      firstEvaluation,
      secondEvaluation,
    }
  })

  // actions
  // 40개 목록에 없던 API 검색 도시도 관심·비교 화면에서 다시 사용할 수 있게 저장
  function addApiCity(city) {
    if (!city) return
    const cityIndex = apiCities.value.findIndex((item) => item.id === city.id)

    if (cityIndex === -1) {
      apiCities.value.push(city)
    } else {
      apiCities.value.splice(cityIndex, 1, city)
    }
  }

  // 공통 API 캐시와 별도로 대시보드에서 검색한 도시 ID를 기록
  function addDashboardSearchCity(city) {
    if (!city) return
    addApiCity(city)

    if (!dashboardSearchCityIds.value.includes(city.id)) {
      dashboardSearchCityIds.value.push(city.id)
    }
  }

  // 관심 목록이 바뀔 때마다 브라우저 저장소에 반영
  function saveFavoriteCityIds() {
    try {
      localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(favoriteCityIds.value))
    } catch {
      // 저장소를 사용할 수 없는 환경에서도 화면 동작은 그대로 유지한다.
    }
  }

  // 이미 저장한 도시는 취소하고, 새 도시는 관심 목록에 추가
  function toggleFavorite(cityId) {
    if (favoriteCityIds.value.includes(cityId)) {
      favoriteCityIds.value = favoriteCityIds.value.filter((id) => id !== cityId)
    } else {
      favoriteCityIds.value.push(cityId)
    }

    saveFavoriteCityIds()
  }

  function removeCompare(cityId) {
    compareCityIds.value = compareCityIds.value.filter((id) => id !== cityId)
  }

  // 비교 도시는 최대 두 개까지만 선택
  function toggleCompare(cityId) {
    if (compareCityIds.value.includes(cityId)) {
      removeCompare(cityId)
      return
    }

    if (compareCityIds.value.length >= 2) return

    compareCityIds.value.push(cityId)
  }

  // 비교 화면의 첫 번째 또는 두 번째 도시를 직접 변경
  function setCompareCity(index, cityId) {
    const nextCityIds = [...compareCityIds.value]

    if (cityId === '') {
      nextCityIds.splice(index, 1)
    } else {
      nextCityIds[index] = cityId
    }

    compareCityIds.value = nextCityIds
      .filter((id, cityIndex) => id && nextCityIds.indexOf(id) === cityIndex)
      .slice(0, 2)
  }

  function setPurpose(purpose) {
    selectedPurpose.value = purpose
  }

  function clearCompare() {
    compareCityIds.value = []
  }

  return {
    favoriteCityIds,
    compareCityIds,
    selectedPurpose,
    apiCities,
    dashboardSearchCityIds,
    favoriteCities,
    compareCities,
    dashboardSearchCities,
    favoriteCount,
    compareCount,
    canCompare,
    comparisonResult,
    addApiCity,
    addDashboardSearchCity,
    toggleFavorite,
    saveFavoriteCityIds,
    toggleCompare,
    setCompareCity,
    setPurpose,
    removeCompare,
    clearCompare,
  }
})
