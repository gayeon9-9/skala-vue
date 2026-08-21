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
  const temperatureScore = Math.round(getTemperatureRatio(city.feelsLike, purpose) * weights.temperature)
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

// 관심 여행지부터 최종 비교까지 여행지를 고르는 과정을 관리하는 Store
export const useTripDecisionStore = defineStore('tripDecision', {
  state: () => ({
    favoriteCityIds: [],
    compareCityIds: [],
    selectedPurpose: '선택 안 함',
    apiCities: [],
    dashboardSearchCityIds: [],
  }),

  getters: {
    // ID만 저장하고, 화면에서는 공통 날씨 데이터의 도시 객체를 사용
    favoriteCities: (state) => {
      const weatherStore = useWeatherStore()
      const allCities = getUniqueCities([...weatherStore.dashboardCities, ...state.apiCities])
      return allCities.filter((city) => state.favoriteCityIds.includes(city.id))
    },

    // 사용자가 선택한 순서대로 비교 도시 반환
    compareCities: (state) => {
      const weatherStore = useWeatherStore()
      const allCities = getUniqueCities([...weatherStore.dashboardCities, ...state.apiCities])
      return state.compareCityIds
        .map((cityId) => allCities.find((city) => city.id === cityId))
        .filter((city) => city)
    },

    // 대시보드 03에서 직접 검색한 도시만 둘러보기 목록으로 반환
    dashboardSearchCities: (state) => {
      return state.dashboardSearchCityIds
        .map((cityId) => state.apiCities.find((city) => city.id === cityId))
        .filter((city) => city)
    },

    favoriteCount: (state) => state.favoriteCityIds.length,
    compareCount: (state) => state.compareCityIds.length,
    canCompare() {
      return this.compareCities.length === 2
    },

    // 두 도시가 준비되면 현재 여행 목적을 기준으로 추천 결과 계산
    comparisonResult() {
      if (!this.canCompare || this.selectedPurpose === '선택 안 함') return null

      const [firstCity, secondCity] = this.compareCities
      const firstEvaluation = calculateEvaluation(firstCity, this.selectedPurpose)
      const secondEvaluation = calculateEvaluation(secondCity, this.selectedPurpose)

      if (firstEvaluation.score === secondEvaluation.score) {
        return {
          isTie: true,
          recommendedCity: null,
          firstEvaluation,
          secondEvaluation,
        }
      }

      return {
        isTie: false,
        recommendedCity: firstEvaluation.score > secondEvaluation.score ? firstCity : secondCity,
        firstEvaluation,
        secondEvaluation,
      }
    },
  },

  actions: {
    // 40개 목록에 없던 API 검색 도시도 관심·비교 화면에서 다시 사용할 수 있게 저장
    addApiCity(city) {
      if (!city) return
      const cityIndex = this.apiCities.findIndex((item) => item.id === city.id)

      if (cityIndex === -1) {
        this.apiCities.push(city)
      } else {
        this.apiCities.splice(cityIndex, 1, city)
      }
    },

    // 공통 API 캐시와 별도로 대시보드에서 검색한 도시 ID를 기록
    addDashboardSearchCity(city) {
      if (!city) return
      this.addApiCity(city)

      if (!this.dashboardSearchCityIds.includes(city.id)) {
        this.dashboardSearchCityIds.push(city.id)
      }
    },

    // 이미 저장한 도시는 취소하고, 새 도시는 관심 목록에 추가
    toggleFavorite(cityId) {
      if (this.favoriteCityIds.includes(cityId)) {
        this.favoriteCityIds = this.favoriteCityIds.filter((id) => id !== cityId)
        return
      }

      this.favoriteCityIds.push(cityId)
    },

    // 비교 도시는 최대 두 개까지만 선택
    toggleCompare(cityId) {
      if (this.compareCityIds.includes(cityId)) {
        this.removeCompare(cityId)
        return
      }

      if (this.compareCityIds.length >= 2) return

      this.compareCityIds.push(cityId)
    },

    // 비교 화면의 첫 번째 또는 두 번째 도시를 직접 변경
    setCompareCity(index, cityId) {
      const nextCityIds = [...this.compareCityIds]

      if (cityId === '') {
        nextCityIds.splice(index, 1)
      } else {
        nextCityIds[index] = cityId
      }

      this.compareCityIds = nextCityIds.filter((id, cityIndex) => id && nextCityIds.indexOf(id) === cityIndex).slice(0, 2)
    },

    setPurpose(purpose) {
      this.selectedPurpose = purpose
    },

    removeCompare(cityId) {
      this.compareCityIds = this.compareCityIds.filter((id) => id !== cityId)
    },

    clearCompare() {
      this.compareCityIds = []
    },
  },
})
