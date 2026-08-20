<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
  searchQuery: {
    type: String,
    default: '',
  },
  recommended: {
    type: Boolean,
    default: false,
  },
  selectedPurpose: {
    type: String,
    default: '전체',
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
  <div
    class="weather-card"
    :class="{
      'searched-card': searchQuery === item.name,
      'recommended-card': recommended,
      'selected-card': isSelected,
    }"
    @click="emit('select-card', item)"
  >
    <p v-if="isSelected" class="selected-message">✅ 선택한 도시입니다.</p>
    <p v-if="searchQuery === item.name" class="search-result">🔍 검색한 도시입니다.</p>

    <h4>{{ item.country }} · {{ item.name }}</h4>
    <p class="continent">{{ item.continent }}</p>
    <p class="weather-status">{{ item.status }}</p>

    <div class="weather-info">
      <p>🌡️ 기온: <strong>{{ item.temp }}°C</strong></p>
      <p>🥵 체감온도: <strong>{{ item.feelsLike }}°C</strong></p>
      <p>💧 습도: <strong>{{ item.humidity }}%</strong></p>
      <p>🌫️ 미세먼지: <strong>{{ item.pm10 }}㎍/㎥</strong></p>
      <p>😷 초미세먼지: <strong>{{ item.pm25 }}㎍/㎥</strong></p>
    </div>

    <!-- 선택한 여행 목적에 따른 안내 -->
    <p v-if="selectedPurpose === '쾌적한 도시'" class="purpose-message">✅ 비·온도·대기질 조건을 모두 만족한 도시입니다.</p>
    <p v-else-if="selectedPurpose === '더위 피하기'" class="purpose-message">🌿 체감온도 {{ item.feelsLike }}℃로 더위를 피하기 좋은 도시입니다.</p>
    <p v-else-if="selectedPurpose === '추위 피하기'" class="purpose-message">☀️ 체감온도 {{ item.feelsLike }}℃로 비교적 따뜻한 도시입니다.</p>
    <p v-else-if="selectedPurpose === '비 피하기'" class="purpose-message">☂️ 현재 비가 내리지 않는 도시입니다.</p>
    <p v-else-if="selectedPurpose === '대기질 좋은 곳'" class="purpose-message">🍃 미세먼지와 초미세먼지가 모두 좋은 단계입니다.</p>

    <!-- 체감온도 구분 -->
    <div class="badge-area">
      <span v-if="item.feelsLike >= 38 || item.temp >= 39" class="badge extreme">🔥 극심한 폭염 위험</span>
      <span v-else-if="item.feelsLike >= 35" class="badge heatwave">🚨 폭염경보 기준 온도</span>
      <span v-else-if="item.feelsLike >= 33" class="badge warning">⚠️ 폭염주의보 기준 온도</span>
      <span v-else-if="item.feelsLike >= 30" class="badge very-hot">🥵 매우 더움</span>
      <span v-else-if="item.feelsLike >= 28" class="badge hot">☀️ 더움</span>
      <span v-else-if="item.feelsLike >= 25" class="badge warm">🌤️ 따뜻함</span>
      <span v-else class="badge cool">🌿 비교적 선선함</span>
    </div>

    <!-- 미세먼지 구분 -->
    <div class="dust-area">
      <span v-if="item.pm10 <= 30" class="dust good">미세먼지 좋음</span>
      <span v-else-if="item.pm10 <= 80" class="dust normal">미세먼지 보통</span>
      <span v-else-if="item.pm10 <= 150" class="dust bad">미세먼지 나쁨</span>
      <span v-else class="dust very-bad">미세먼지 매우 나쁨</span>

      <span v-if="item.pm25 <= 15" class="dust good">초미세먼지 좋음</span>
      <span v-else-if="item.pm25 <= 35" class="dust normal">초미세먼지 보통</span>
      <span v-else-if="item.pm25 <= 75" class="dust bad">초미세먼지 나쁨</span>
      <span v-else class="dust very-bad">초미세먼지 매우 나쁨</span>
    </div>

    <!-- 날씨에 따른 여행 안내 -->
    <p v-if="item.status === '강한 이슬비'" class="travel-message caution">☔ 빗방울이 제법 굵습니다. 무리한 야외 활동보다는 실내 일정을 권해드립니다.</p>
    <p v-else-if="item.status === '약한 이슬비'" class="travel-message caution">🌦️ 이슬비가 내리고 있습니다. 외출 시 가벼운 우산을 챙겨주세요.</p>
    <p v-else-if="item.feelsLike >= 38 || item.temp >= 39" class="travel-message caution">🚨 극심한 폭염으로 위험해요! 현재 여행 및 외출을 추천하지 않습니다.</p>
    <p v-else-if="item.feelsLike >= 35" class="travel-message caution">🔥 체감온도가 매우 높아요! 여행 및 외출을 추천하지 않습니다.</p>
    <p v-else-if="item.feelsLike >= 33" class="travel-message caution">🥵 체감온도가 높아 장시간 야외 외출에 주의하세요.</p>
    <p v-else-if="item.feelsLike >= 30" class="travel-message caution">☀️ 더운 날씨입니다. 낮 시간대 야외 활동에 주의하세요.</p>
    <p v-else-if="item.feelsLike < 18" class="travel-message caution">🧥 체감온도가 낮습니다. 따뜻한 옷을 준비해 주세요.</p>
    <p v-else-if="item.pm10 > 80 || item.pm25 > 35" class="travel-message caution">😷 대기질이 좋지 않아 야외 여행을 추천하지 않습니다.</p>
    <p v-else-if="item.status === '맑음'" class="travel-message recommend">☀️ 맑고 쾌청한 날입니다. 여유롭게 야외 일정을 즐겨보세요.</p>
    <p v-else-if="item.status === '대체로 맑음'" class="travel-message recommend">🌤️ 대체로 맑은 날씨입니다. 가벼운 마음으로 둘러보기 좋습니다.</p>
    <p v-else-if="item.status === '구름 조금'" class="travel-message recommend">⛅ 옅은 구름이 지나며 햇빛을 가려주어 활동하기 편안합니다.</p>
    <p v-else-if="item.status === '흐림'" class="travel-message caution">☁️ 하늘이 다소 흐립니다. 야외 일정 중 기상 변화에 유의해 주세요.</p>
    <p v-else class="travel-message caution">🌍 방문 전 기상 상황을 확인해 주세요.</p>

    <button class="btn-detail" @click.stop="emit('click-detail', item)">상세보기</button>
  </div>
</template>

<style scoped>
.weather-card { padding: 14px; background-color: white; border: 1px solid #ccc; border-radius: 5px; cursor: pointer; }
.recommended-card { border-color: #4caf50; }
.searched-card { background-color: #eef6ff; border-color: #1976d2; }
.selected-card { border: 3px solid #1976d2; background-color: #eaf4ff; }
.selected-message { margin: 0 0 8px; padding: 6px; color: #0d47a1; background-color: #bbdefb; border-radius: 4px; font-weight: bold; }
.search-result { color: #1976d2; font-weight: bold; }
.weather-card h4 { margin: 0 0 4px; }
.continent { margin: 0 0 5px; color: #777; font-size: 13px; }
.weather-status { margin: 0 0 10px; color: #555; }
.weather-info { margin: 10px 0; }
.weather-info p { margin: 4px 0; }
.purpose-message { padding: 8px; color: #0d47a1; background-color: #e3f2fd; border-radius: 4px; }
.badge-area, .dust-area { display: flex; flex-wrap: wrap; gap: 5px; margin: 8px 0; }
.badge, .dust { padding: 4px 7px; color: white; border-radius: 4px; font-size: 12px; }
.extreme, .heatwave, .very-bad { background-color: #d32f2f; }
.warning, .very-hot, .hot, .bad { background-color: #f57c00; }
.warm, .good { background-color: #1976d2; }
.cool, .normal { background-color: #43a047; }
.travel-message { padding: 8px; margin: 10px 0; border-radius: 4px; }
.recommend { color: #1b5e20; background-color: #e8f5e9; }
.caution { color: #bf360c; background-color: #fff3e0; }
.btn-detail { padding: 6px 10px; background-color: white; border: 1px solid #999; cursor: pointer; }
</style>
