// OpenWeatherMap의 weather.id를 큰 날씨 종류로 구분한다.
export const getWeatherCategory = (weatherId) => {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm'
  if (weatherId >= 300 && weatherId < 400) return 'drizzle'
  if (weatherId >= 500 && weatherId < 600) return 'rain'
  if (weatherId >= 600 && weatherId < 700) return 'snow'
  if (weatherId >= 700 && weatherId < 800) return 'atmosphere'
  if (weatherId === 800) return 'clear'
  if (weatherId > 800 && weatherId < 900) return 'clouds'
  return 'unknown'
}

export const hasPrecipitation = (weatherId) => {
  const category = getWeatherCategory(weatherId)
  return ['thunderstorm', 'drizzle', 'rain', 'snow'].includes(category)
}

// API의 날씨 종류를 기준으로 현재 여행 준비 문구를 만든다.
export const getCurrentWeatherGuide = (weatherId) => {
  const category = getWeatherCategory(weatherId)

  if (category === 'thunderstorm')
    return '⛈️ 현재 뇌우가 관측되고 있습니다. 낙뢰 위험이 있어 실내 일정을 권장합니다.'
  if (category === 'drizzle') return '🌦️ 현재 이슬비가 내리고 있습니다. 가벼운 우산을 챙겨 주세요.'
  if (category === 'rain')
    return '☔ 현재 비가 내리고 있습니다. 우산과 실내 일정을 함께 준비해 주세요.'
  if (category === 'snow')
    return '❄️ 현재 눈이 내리고 있습니다. 미끄러운 길과 교통 상황에 주의해 주세요.'
  return ''
}
