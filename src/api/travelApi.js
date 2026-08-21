import axios from 'axios'

const travelApi = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
})

// 여행 중 야외 일정 판단에 사용할 오늘의 자외선과 일출·일몰 조회
export const getTravelDayInfo = async (latitude, longitude) => {
  const response = await travelApi.get('/forecast', {
    params: {
      latitude,
      longitude,
      daily: 'uv_index_max,sunrise,sunset',
      timezone: 'auto',
      forecast_days: 1,
    },
  })

  return response.data
}
