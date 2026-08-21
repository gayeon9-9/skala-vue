import { defineStore } from 'pinia'

// 화면 전체에서 사용하는 온도 단위를 관리하는 Store
export const useConfigStore = defineStore('config', {
  state: () => ({
    // 원본 날씨 데이터는 섭씨이므로 처음에는 celsius로 설정
    unit: 'celsius',
  }),

  getters: {
    // 현재 단위에 맞는 기호를 화면에서 사용할 수 있도록 반환
    unitSymbol: (state) => {
      return state.unit === 'celsius' ? '℃' : '℉'
    },
  },

  actions: {
    // 버튼을 누를 때마다 섭씨와 화씨를 번갈아 변경
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
    },
  },
})
