import axios from 'axios'

// OpenWeatherMap 요청에서 공통으로 사용하는 주소와 설정
const openWeatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org',
  params: {
    appid: import.meta.env.VITE_OPENWEATHER_API_KEY,
    units: 'metric',
    lang: 'kr',
  },
})

// 현재 위치의 날씨 조회
export const getCurrentWeather = async (latitude, longitude) => {
  const response = await openWeatherApi.get('/data/2.5/weather', {
    params: {
      lat: latitude,
      lon: longitude,
    },
  })

  return response.data
}

// 도시 이름으로 현재 날씨를 조회하고 응답에 포함된 좌표도 함께 사용
export const getCurrentWeatherByCity = async (cityName) => {
  const response = await openWeatherApi.get('/data/2.5/weather', {
    params: { q: cityName },
  })

  return response.data
}

// 현재 위치의 미세먼지와 초미세먼지 조회
export const getCurrentAirQuality = async (latitude, longitude) => {
  const response = await openWeatherApi.get('/data/2.5/air_pollution', {
    params: {
      lat: latitude,
      lon: longitude,
    },
  })

  return response.data
}

// 위도와 경도를 도시 이름으로 변환
export const getLocationName = async (latitude, longitude) => {
  const response = await openWeatherApi.get('/geo/1.0/reverse', {
    params: {
      lat: latitude,
      lon: longitude,
      limit: 1,
    },
  })

  return response.data
}

// 입력한 도시명과 일치하는 위치 후보를 최대 5개까지 조회
export const searchCities = async (cityName) => {
  const response = await openWeatherApi.get('/geo/1.0/direct', {
    params: {
      q: cityName,
      limit: 5,
    },
  })

  return response.data
}

// 지정한 좌표의 5일 예보를 3시간 간격으로 조회
export const getForecast = async (latitude, longitude) => {
  const response = await openWeatherApi.get('/data/2.5/forecast', {
    params: {
      lat: latitude,
      lon: longitude,
    },
  })

  return response.data
}
