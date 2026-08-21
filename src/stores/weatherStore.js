import { defineStore } from 'pinia'
import { getCurrentAirQuality, getCurrentWeather, getCurrentWeatherByCity, getForecast, getLocationName, searchCities } from '@/api/weatherApi'
import { cityCatalog } from '@/data/cityCatalog'
import { nearbyCities } from '@/data/nearbyCities'
import { getTravelDayInfo } from '@/api/travelApi'
import { hasPrecipitation } from '@/utils/weatherCondition'
import { getContinentByCountryCode, getCountryName } from '@/utils/locationMetadata'

// 검색 결과와 대시보드 카드가 같은 형식과 반올림 기준을 사용하도록 변환
const makeLiveCityData = (weather, airQuality, fallback = {}) => {
  const air = airQuality.list?.[0]?.components || {}
  const roundOne = (value) => Math.round(value * 10) / 10

  return {
    temp: roundOne(weather.main.temp),
    feelsLike: roundOne(weather.main.feels_like),
    humidity: weather.main.humidity,
    status: weather.weather?.[0]?.description || fallback.status,
    weatherId: weather.weather?.[0]?.id,
    pm10: air.pm10 === undefined ? fallback.pm10 : roundOne(air.pm10),
    pm25: air.pm2_5 === undefined ? fallback.pm25 : roundOne(air.pm2_5),
    isLive: true,
    observedAt: weather.dt,
    latitude: weather.coord?.lat,
    longitude: weather.coord?.lon,
  }
}

const findDashboardCityId = (weather) => {
  const matchedCity = cityCatalog.find((city) => {
    const [name, country] = city.apiQuery.split(',')
    return name.toLowerCase() === weather.name.toLowerCase() && country === weather.sys?.country
  })

  return matchedCity?.id || ''
}

// API 검색 도시 ID에 저장된 위도와 경도를 상세 페이지에서 다시 사용
const getCoordinatesFromApiCityId = (cityId) => {
  if (!cityId.startsWith('api_')) return null

  const coordinates = cityId.slice(4).split('_')
  if (coordinates.length !== 2) return null

  const latitude = Number(coordinates[0])
  const longitude = Number(coordinates[1])
  const isValidLatitude = Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
  const isValidLongitude = Number.isFinite(longitude) && longitude >= -180 && longitude <= 180

  if (!isValidLatitude || !isValidLongitude) return null
  return { latitude, longitude }
}

const hasCoordinates = (city) => {
  return Number.isFinite(city?.latitude) && Number.isFinite(city?.longitude)
}

const getDistance = (firstLat, firstLon, secondLat, secondLon) => {
  const toRadian = (degree) => degree * Math.PI / 180
  const earthRadius = 6371
  const latitudeDistance = toRadian(secondLat - firstLat)
  const longitudeDistance = toRadian(secondLon - firstLon)
  const value = Math.sin(latitudeDistance / 2) ** 2
    + Math.cos(toRadian(firstLat)) * Math.cos(toRadian(secondLat)) * Math.sin(longitudeDistance / 2) ** 2

  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

const getTravelScore = (forecast, distance) => {
  const feelsLike = forecast.main.feels_like
  const precipitationChance = forecast.pop || 0
  const weatherId = forecast.weather?.[0]?.id || 800
  let score = 100

  score -= Math.round(precipitationChance * 45)
  if (hasPrecipitation(weatherId)) score -= 25
  if (feelsLike < 10) score -= Math.min(25, Math.round((10 - feelsLike) * 2))
  if (feelsLike > 30) score -= Math.min(30, Math.round((feelsLike - 30) * 3))
  score -= Math.min(15, Math.round(distance / 15))

  return Math.max(0, score)
}

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    currentLocation: null,
    currentWeather: null,
    currentAirQuality: null,
    isLoading: false,
    errorMessage: '',
    lastUpdated: null,
    citySearchResults: [],
    selectedCity: null,
    selectedCityWeather: null,
    selectedCityAirQuality: null,
    isCitySearching: false,
    citySearchMessage: '',
    liveWeatherByCityId: {},
    isRefreshingCities: false,
    cityRefreshMessage: '',
    nearbyTimeline: [],
    nearbyBaseCity: null,
    nearbySearchResults: [],
    isLoadingNearby: false,
    nearbyErrorMessage: '',
    forecastByCityId: {},
    currentTravelInfo: null,
    selectedTravelInfo: null,
  }),

  getters: {
    // 대기질 응답에서 현재 시각의 정보만 사용
    airQualityData: (state) => {
      return state.currentAirQuality?.list?.[0] || null
    },

    hasCurrentWeather: (state) => {
      return Boolean(state.currentWeather)
    },

    selectedCityAirData: (state) => {
      return state.selectedCityAirQuality?.list?.[0] || null
    },

    // 최종 화면에서는 API 조회에 성공한 도시만 사용하고 목업 날씨 값은 섞지 않는다.
    dashboardCities: (state) => {
      return cityCatalog
        .filter((city) => state.liveWeatherByCityId[city.id])
        .map((city) => ({ ...city, ...state.liveWeatherByCityId[city.id] }))
    },

    // 실시간 검색 결과를 기존 WeatherCard와 비교 Store에서 사용할 수 있는 형태로 변환
    selectedCityItem: (state) => {
      const city = state.selectedCity
      const weather = state.selectedCityWeather
      if (!city || !weather) return null
      const air = state.selectedCityAirQuality?.list?.[0]?.components || {}
      const dashboardCityId = findDashboardCityId(weather)
      const dashboardCity = cityCatalog.find((item) => item.id === dashboardCityId)

      return {
        id: dashboardCity?.id || `api_${city.lat}_${city.lon}`,
        name: dashboardCity?.name || city.local_names?.ko || city.name,
        country: dashboardCity?.country || getCountryName(city.country),
        continent: dashboardCity?.continent || getContinentByCountryCode(city.country),
        temp: Math.round(weather.main.temp * 10) / 10,
        feelsLike: Math.round(weather.main.feels_like * 10) / 10,
        humidity: weather.main.humidity,
        status: weather.weather?.[0]?.description || '',
        weatherId: weather.weather?.[0]?.id,
        pm10: Math.round((air.pm10 || 0) * 10) / 10,
        pm25: Math.round((air.pm2_5 || 0) * 10) / 10,
        latitude: city.lat,
        longitude: city.lon,
        isLive: true,
      }
    },
  },

  actions: {
    // 브라우저의 위치 정보를 Promise 형태로 받아서 사용
    getCurrentPosition() {
      return new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          reject(new Error('이 브라우저에서는 위치 기능을 사용할 수 없습니다.'))
          return
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      })
    },

    // 현재 좌표를 기준으로 지역명, 날씨, 대기질을 함께 조회
    async fetchCurrentLocationWeather() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const position = await this.getCurrentPosition()
        const { latitude, longitude } = position.coords

        const [weather, airQuality, locations] = await Promise.all([
          getCurrentWeather(latitude, longitude),
          getCurrentAirQuality(latitude, longitude),
          getLocationName(latitude, longitude),
        ])

        const location = locations[0]

        this.currentLocation = {
          latitude,
          longitude,
          name: location?.local_names?.ko || location?.name || weather.name,
          country: location?.country || weather.sys?.country || '',
        }
        this.currentWeather = weather
        this.currentAirQuality = airQuality
        try {
          this.currentTravelInfo = await getTravelDayInfo(latitude, longitude)
        } catch {
          this.currentTravelInfo = null
        }
        this.lastUpdated = new Date()
      } catch (error) {
        if (error.code === 1) {
          this.errorMessage = '위치 권한이 필요합니다. 브라우저 설정에서 위치 접근을 허용해 주세요.'
        } else if (error.code === 2) {
          this.errorMessage = '현재 위치를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.'
        } else if (error.code === 3) {
          this.errorMessage = '위치 확인 시간이 초과되었습니다. 다시 시도해 주세요.'
        } else if (error.response?.status === 401) {
          this.errorMessage = 'OpenWeatherMap API Key를 확인해 주세요.'
        } else {
          this.errorMessage = error.message || '날씨 정보를 불러오지 못했습니다.'
        }
      } finally {
        this.isLoading = false
      }
    },

    // 도시명을 검색해 사용자가 고를 수 있는 위치 후보를 저장
    async findCities(cityName) {
      const keyword = cityName.trim()
      if (!keyword) {
        this.citySearchResults = []
        this.citySearchMessage = '검색할 도시 이름을 입력해 주세요.'
        return
      }

      this.isCitySearching = true
      this.citySearchResults = []
      this.citySearchMessage = ''

      try {
        this.citySearchResults = await searchCities(keyword)
        if (this.citySearchResults.length === 0) {
          this.citySearchMessage = '검색 결과가 없습니다. 영문 도시명으로도 검색해 보세요.'
        }
      } catch (error) {
        this.citySearchResults = []
        this.citySearchMessage = error.response?.status === 401
          ? 'OpenWeatherMap API Key를 확인해 주세요.'
          : '도시를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      } finally {
        this.isCitySearching = false
      }
    },

    // 검색 결과에서 고른 도시의 날씨와 대기질을 함께 조회
    async fetchSelectedCityWeather(city) {
      this.isCitySearching = true
      this.citySearchMessage = ''
      this.selectedCity = null
      this.selectedCityWeather = null
      this.selectedCityAirQuality = null

      try {
        const [weather, airQuality] = await Promise.all([
          getCurrentWeather(city.lat, city.lon),
          getCurrentAirQuality(city.lat, city.lon),
        ])

        // 외부 여행 정보 API 실패가 날씨 검색까지 막지 않도록 별도로 처리
        try {
          this.selectedTravelInfo = await getTravelDayInfo(city.lat, city.lon)
        } catch {
          this.selectedTravelInfo = null
        }

        this.selectedCity = city
        this.selectedCityWeather = weather
        this.selectedCityAirQuality = airQuality
        this.citySearchResults = []

        // 40개 카드에도 같은 도시가 있으면 방금 조회한 동일 응답으로 즉시 갱신
        const dashboardCityId = findDashboardCityId(weather)
        if (dashboardCityId) {
          this.liveWeatherByCityId[dashboardCityId] = makeLiveCityData(weather, airQuality)
        }

        return this.selectedCityItem
      } catch (error) {
        this.citySearchMessage = error.response?.status === 401
          ? 'OpenWeatherMap API Key를 확인해 주세요.'
          : '선택한 도시의 날씨를 불러오지 못했습니다.'
        return null
      } finally {
        this.isCitySearching = false
      }
    },

    // 상세 URL을 직접 열어도 도시 ID를 기준으로 현재 데이터를 다시 구성
    async fetchDetailCity(cityId, savedCity = null) {
      const catalogCity = cityCatalog.find((city) => city.id === cityId)

      if (catalogCity) {
        await this.fetchDashboardCity(catalogCity, true)
        return { ...catalogCity, ...this.liveWeatherByCityId[cityId] }
      }

      if (savedCity && hasCoordinates(savedCity)) {
        return this.refreshApiCity(savedCity)
      }

      const coordinates = getCoordinatesFromApiCityId(cityId)
      if (!coordinates) throw new Error('유효하지 않은 도시 주소입니다.')

      const { latitude, longitude } = coordinates
      const [weather, airQuality] = await Promise.all([
        getCurrentWeather(latitude, longitude),
        getCurrentAirQuality(latitude, longitude),
      ])

      // 지역명 조회만 실패한 경우에는 날씨 응답의 도시명으로 상세 화면을 구성
      let locations
      try {
        locations = await getLocationName(latitude, longitude)
      } catch {
        locations = []
      }

      const location = locations[0] || null
      const countryCode = location?.country || weather.sys?.country || ''

      return {
        id: cityId,
        name: location?.local_names?.ko || location?.name || weather.name || '검색 도시',
        country: getCountryName(countryCode),
        continent: getContinentByCountryCode(countryCode),
        ...makeLiveCityData(weather, airQuality),
      }
    },

    // 이번 세션에 저장한 API 도시를 좌표로 다시 조회해 최신 객체로 반환
    async refreshApiCity(city) {
      if (city.latitude === undefined || city.longitude === undefined) {
        throw new Error('도시 좌표를 찾을 수 없습니다.')
      }

      const [weather, airQuality] = await Promise.all([
        getCurrentWeather(city.latitude, city.longitude),
        getCurrentAirQuality(city.latitude, city.longitude),
      ])
      const liveData = makeLiveCityData(weather, airQuality, city)

      if (cityCatalog.some((item) => item.id === city.id)) {
        this.liveWeatherByCityId[city.id] = liveData
      }

      return { ...city, ...liveData }
    },

    // 기존 카드 한 장에 필요한 현재 날씨와 대기질을 실제 API로 갱신
    async fetchDashboardCity(city, force = false) {
      if (!force && this.liveWeatherByCityId[city.id]) return

      const weather = await getCurrentWeatherByCity(city.apiQuery || city.name)
      const airQuality = await getCurrentAirQuality(weather.coord.lat, weather.coord.lon)

      this.liveWeatherByCityId[city.id] = makeLiveCityData(weather, airQuality, city)
    },

    // 상세 화면에서 사용할 도시별 단기예보 저장
    async fetchCityForecast(city) {
      if (!hasCoordinates(city) && !this.liveWeatherByCityId[city.id]) await this.fetchDashboardCity(city)
      const liveCity = hasCoordinates(city) ? city : this.liveWeatherByCityId[city.id]
      if (!hasCoordinates(liveCity)) return

      const forecast = await getForecast(liveCity.latitude, liveCity.longitude)
      this.forecastByCityId[city.id] = forecast.list.slice(0, 5)
    },

    // API 요청이 동시에 몰리지 않도록 네 도시씩 나누어 전체 카드를 갱신
    async refreshDashboardCities(cityList, force = false) {
      if (this.isRefreshingCities) return

      this.isRefreshingCities = true
      this.cityRefreshMessage = `실시간 날씨를 불러오는 중입니다. (0/${cityList.length})`
      let failedCount = 0
      let completedCount = 0

      try {
        for (let index = 0; index < cityList.length; index += 4) {
          const cityGroup = cityList.slice(index, index + 4)
          const results = await Promise.allSettled(cityGroup.map((city) => this.fetchDashboardCity(city, force)))
          failedCount += results.filter((result) => result.status === 'rejected').length
          completedCount += cityGroup.length
          this.cityRefreshMessage = `실시간 날씨를 불러오는 중입니다. (${completedCount}/${cityList.length})`
        }

        const successCount = cityList.filter((city) => this.liveWeatherByCityId[city.id]).length
        this.cityRefreshMessage = failedCount === 0
          ? `${successCount}개 도시를 실시간 날씨로 갱신했습니다.`
          : `${successCount}개 도시 조회 완료 · ${failedCount}개 도시는 API 조회에 실패했습니다.`
      } finally {
        this.isRefreshingCities = false
      }
    },

    // 사용자가 입력한 출발 도시를 검색
    async findNearbyBaseCities(keyword) {
      const cityName = keyword.trim()
      if (!cityName) {
        this.nearbySearchResults = []
        this.nearbyErrorMessage = '출발할 도시 이름을 입력해 주세요.'
        return
      }

      this.isLoadingNearby = true
      this.nearbyErrorMessage = ''
      try {
        const searchResults = await searchCities(cityName)
        this.nearbySearchResults = searchResults.filter((city) => city.country === 'KR')
        if (this.nearbySearchResults.length === 1) {
          this.nearbyBaseCity = this.nearbySearchResults[0]
          this.nearbySearchResults = []
        } else if (this.nearbySearchResults.length === 0) {
          this.nearbyErrorMessage = '국내 출발 도시를 찾지 못했습니다.'
        }
      } catch {
        this.nearbyErrorMessage = '출발 도시를 검색하지 못했습니다.'
      } finally {
        this.isLoadingNearby = false
      }
    },

    selectNearbyBaseCity(city) {
      this.nearbyBaseCity = city
      this.nearbySearchResults = []
      this.nearbyTimeline = []
      this.nearbyErrorMessage = ''
    },

    // 선택한 출발 도시와 가까운 국내 도시의 같은 시간대 예보를 비교
    async fetchNearbyRecommendations() {
      this.isLoadingNearby = true
      this.nearbyErrorMessage = ''

      try {
        if (!this.nearbyBaseCity) throw new Error('먼저 출발 도시를 검색해 선택해 주세요.')

        const latitude = this.nearbyBaseCity.lat
        const longitude = this.nearbyBaseCity.lon
        const name = this.nearbyBaseCity.local_names?.ko || this.nearbyBaseCity.name
        const candidates = nearbyCities
          .map((city) => ({
            ...city,
            distance: getDistance(latitude, longitude, city.latitude, city.longitude),
          }))
          .filter((city) => city.distance >= 5)
          .sort((first, second) => first.distance - second.distance)
          .slice(0, 4)

        const places = [
          { id: 'base', name, latitude, longitude, distance: 0 },
          ...candidates,
        ]

        const forecasts = await Promise.all(places.map(async (place) => ({
          place,
          data: await getForecast(place.latitude, place.longitude),
        })))

        const timeIndexes = [0, 1, 2]
        this.nearbyTimeline = timeIndexes.map((timeIndex) => {
          const compared = forecasts.map(({ place, data }) => {
            const forecast = data.list[timeIndex]
            return {
              ...place,
              forecast,
              score: getTravelScore(forecast, place.distance),
            }
          }).sort((first, second) => second.score - first.score)

          return {
            time: compared[0].forecast.dt,
            recommended: compared[0],
            current: compared.find((item) => item.id === 'base'),
            compared,
          }
        })
      } catch (error) {
        this.nearbyTimeline = []
        this.nearbyErrorMessage = error.response?.status === 401
          ? 'OpenWeatherMap API Key를 확인해 주세요.'
          : error.message || '근교 예보를 불러오지 못했습니다.'
      } finally {
        this.isLoadingNearby = false
      }
    },
  },
})
