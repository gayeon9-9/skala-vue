import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

// 카드·상세·비교·근교 화면마다 똑같이 반복되던 섭씨→화씨 변환을 한곳에 모았다.
// 원본 데이터는 항상 섭씨로 두고, 화면에 표시할 값만 이 함수를 거친다.
export function useTemperature() {
  const configStore = useConfigStore()

  const isFahrenheit = computed(() => configStore.unit === 'fahrenheit')
  const unitSymbol = computed(() => configStore.unitSymbol)

  // 온도 값 하나를 현재 단위에 맞춰 변환한다.
  const formatTemperature = (temperature) => {
    if (temperature === null || temperature === undefined) return ''
    if (isFahrenheit.value) return Math.round((temperature * 9) / 5 + 32)
    return Math.round(temperature * 10) / 10
  }

  // 두 도시의 온도 차이는 기준점이 없는 간격이므로 32를 더하지 않는다.
  const formatTemperatureDifference = (difference) => {
    if (isFahrenheit.value) return ((difference * 9) / 5).toFixed(1)
    return difference.toFixed(1)
  }

  return { isFahrenheit, unitSymbol, formatTemperature, formatTemperatureDifference }
}
