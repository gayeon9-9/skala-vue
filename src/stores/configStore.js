import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// 화면 전체에서 사용하는 온도 단위를 관리하는 Store
export const useConfigStore = defineStore('config', () => {
  // state: 원본 날씨 데이터는 섭씨이므로 처음에는 celsius로 설정
  const unit = ref('celsius')

  // getter: 현재 단위에 맞는 기호를 화면에서 사용할 수 있도록 반환
  const unitSymbol = computed(() => (unit.value === 'celsius' ? '℃' : '℉'))

  // action: 버튼을 누를 때마다 섭씨와 화씨를 번갈아 변경
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return { unit, unitSymbol, toggleUnit }
})
