<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { getCurrentWeatherGuide } from '@/utils/weatherCondition'
import { ElAlert, ElButton, ElCard } from 'element-plus'
import 'element-plus/es/components/alert/style/css'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/card/style/css'

const configStore = useConfigStore()
const weatherStore = useWeatherStore()

const displayTemp = computed(() => {
  const temperature = weatherStore.currentWeather?.main?.temp
  if (temperature === undefined) return ''
  if (configStore.unit === 'fahrenheit') return Math.round((temperature * 9) / 5 + 32)
  return Math.round(temperature * 10) / 10
})

const displayFeelsLike = computed(() => {
  const temperature = weatherStore.currentWeather?.main?.feels_like
  if (temperature === undefined) return ''
  if (configStore.unit === 'fahrenheit') return Math.round((temperature * 9) / 5 + 32)
  return Math.round(temperature * 10) / 10
})

const weatherIconUrl = computed(() => {
  const icon = weatherStore.currentWeather?.weather?.[0]?.icon
  return icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : ''
})

const aqiText = computed(() => {
  const aqi = weatherStore.airQualityData?.main?.aqi
  const labels = ['좋음', '양호', '보통', '나쁨', '매우 나쁨']
  return labels[aqi - 1] || '정보 없음'
})

const outdoorMessage = computed(() => {
  const weather = weatherStore.currentWeather
  const air = weatherStore.airQualityData?.components
  if (!weather) return ''

  const weatherId = weather.weather?.[0]?.id || 0
  const weatherGuide = getCurrentWeatherGuide(weatherId)
  if (weatherGuide) return weatherGuide
  if (weather.main.feels_like >= 33) return '🥵 체감온도가 높아 장시간 외출에 주의하세요.'
  if (air && (air.pm10 > 80 || air.pm2_5 > 35)) return '😷 대기질이 좋지 않아 야외 활동에 주의하세요.'
  return '✈️ 현재 위치는 야외 활동하기 좋은 날씨입니다.'
})

const updatedTime = computed(() => {
  if (!weatherStore.lastUpdated) return ''
  return weatherStore.lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
})

const formatTravelTime = (value) => value ? value.slice(11, 16) : '-'
</script>

<template>
  <el-card class="location-weather" shadow="never">
    <div class="location-header">
      <div>
        <h3>📍 현재 위치 날씨</h3>
        <p>현재 위치를 기준으로 실제 날씨와 외출 조건을 확인합니다.</p>
      </div>
      <el-button type="primary" :loading="weatherStore.isLoading" @click="weatherStore.fetchCurrentLocationWeather">
        {{ weatherStore.hasCurrentWeather ? '🔄 다시 확인' : '📍 위치 날씨 확인' }}
      </el-button>
    </div>

    <p v-if="weatherStore.isLoading" class="state-message">위치와 날씨를 확인하고 있습니다...</p>

    <el-alert v-else-if="weatherStore.errorMessage" :title="weatherStore.errorMessage" type="error" show-icon :closable="false">
      <el-button type="danger" size="small" @click="weatherStore.fetchCurrentLocationWeather">다시 시도</el-button>
    </el-alert>

    <div v-else-if="weatherStore.hasCurrentWeather" class="weather-result">
      <div class="weather-title">
        <div>
          <h4>{{ weatherStore.currentLocation.name }} · {{ weatherStore.currentLocation.country }}</h4>
          <p>{{ weatherStore.currentWeather.weather[0].description }}</p>
        </div>
        <img v-if="weatherIconUrl" :src="weatherIconUrl" :alt="weatherStore.currentWeather.weather[0].description" />
      </div>

      <div class="weather-values">
        <p>🌡️ 기온 <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong></p>
        <p>🥵 체감 <strong>{{ displayFeelsLike }}{{ configStore.unitSymbol }}</strong></p>
        <p>💧 습도 <strong>{{ weatherStore.currentWeather.main.humidity }}%</strong></p>
        <p>💨 풍속 <strong>{{ weatherStore.currentWeather.wind.speed }}m/s</strong></p>
        <p>🌫️ PM10 <strong>{{ weatherStore.airQualityData?.components?.pm10 ?? '-' }}㎍/㎥</strong></p>
        <p>😷 PM2.5 <strong>{{ weatherStore.airQualityData?.components?.pm2_5 ?? '-' }}㎍/㎥</strong></p>
      </div>

      <p class="air-quality">대기질: <strong>{{ aqiText }}</strong></p>
      <p v-if="weatherStore.currentTravelInfo" class="travel-day-info">
        ☀️ 오늘 최대 자외선 {{ weatherStore.currentTravelInfo.daily.uv_index_max[0] }} ·
        일출 {{ formatTravelTime(weatherStore.currentTravelInfo.daily.sunrise[0]) }} ·
        일몰 {{ formatTravelTime(weatherStore.currentTravelInfo.daily.sunset[0]) }}
      </p>
      <p class="outdoor-message">{{ outdoorMessage }}</p>
      <p class="updated-time">마지막 확인: {{ updatedTime }}</p>
    </div>

    <p v-else class="state-message">버튼을 눌러 현재 위치의 날씨를 확인해 보세요.</p>
  </el-card>
</template>

<style scoped>
.location-weather { height: 100%; background: linear-gradient(145deg, #eff6ff 0%, #fff 58%, #ecfeff 100%); border: 1px solid #bfdbfe; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); }
.location-weather :deep(.el-card__body) { display: flex; min-height: 100%; flex-direction: column; }
.location-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.location-header > div { min-width: 0; }
.location-header h3 { margin: 0 0 7px; color: var(--brand-950); font-size: 19px; font-weight: 850; }
.location-header p { margin: 0; color: var(--text-600); font-size: 13px; line-height: 1.55; }
.location-header :deep(.el-button) { min-height: 40px; flex: 0 0 auto; border-radius: 10px; font-weight: 700; }
.state-message { padding: 22px 18px; margin: 16px 0 0; color: var(--text-600); text-align: center; background: rgba(255, 255, 255, .72); border: 1px dashed #bfdbfe; border-radius: 12px; line-height: 1.55; }
.location-weather :deep(.el-alert) { margin-top: 16px; }
.weather-result { margin-top: 16px; }
.weather-title { display: flex; min-width: 0; align-items: center; justify-content: space-between; gap: 12px; }
.weather-title h4 { margin: 0 0 5px; color: var(--brand-950); font-size: 22px; font-weight: 850; }
.weather-title p { margin: 0; color: var(--text-600); }
.weather-title img { width: 68px; height: 68px; flex: 0 0 68px; filter: drop-shadow(0 8px 10px rgba(14, 116, 144, .14)); }
.weather-values { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
.weather-values p { min-width: 0; padding: 11px; margin: 0; color: var(--text-700); background: rgba(255, 255, 255, .82); border: 1px solid rgba(148, 163, 184, .2); border-radius: 11px; font-size: 12px; line-height: 1.45; }
.weather-values strong { display: block; margin-top: 3px; color: var(--text-900); font-size: 14px; font-weight: 800; }
.air-quality { display: inline-flex; padding: 6px 9px; margin: 12px 0 0; color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 999px; font-size: 12px; }
.air-quality strong { font-weight: 800; }
.travel-day-info, .outdoor-message { padding: 10px 12px; margin: 11px 0 0; border-radius: 11px; font-size: 12px; line-height: 1.55; }
.travel-day-info { color: #854d0e; background: #fffbeb; border: 1px solid #fde68a; }
.outdoor-message { color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; }
.updated-time { margin: 10px 0 0; color: var(--text-600); font-size: 11px; text-align: right; }
@media (max-width: 600px) { .location-header { align-items: stretch; flex-direction: column; } .location-header :deep(.el-button) { width: 100%; } .weather-values { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
