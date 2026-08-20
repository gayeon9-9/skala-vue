<script setup>
import { computed, ref, watch, watchEffect } from 'vue'

// 2026-08-19 기준 과제용 Mockup 데이터
// 국내 21개, 해외 19개 도시로 총 40개
const weatherList = ref([
  // 국내 도시
  {
    id: 'city_01',
    name: '서울',
    country: '대한민국',
    temp: 30.0,
    humidity: 68,
    feelsLike: 33.0,
    status: '대체로 맑음',
    pm10: 34,
    pm25: 18,
  },
  {
    id: 'city_02',
    name: '수원',
    country: '대한민국',
    temp: 29.4,
    humidity: 65,
    feelsLike: 31.3,
    status: '대체로 맑음',
    pm10: 29,
    pm25: 15,
  },
  {
    id: 'city_03',
    name: '부산',
    country: '대한민국',
    temp: 30.1,
    humidity: 72,
    feelsLike: 34.0,
    status: '대체로 맑음',
    pm10: 31,
    pm25: 17,
  },
  {
    id: 'city_04',
    name: '판교',
    country: '대한민국',
    temp: 29.7,
    humidity: 63,
    feelsLike: 31.5,
    status: '대체로 맑음',
    pm10: 42,
    pm25: 21,
  },
  {
    id: 'city_05',
    name: '광주',
    country: '대한민국',
    temp: 28.2,
    humidity: 86,
    feelsLike: 31.2,
    status: '약한 이슬비',
    pm10: 24,
    pm25: 12,
  },
  {
    id: 'city_06',
    name: '울산',
    country: '대한민국',
    temp: 31.3,
    humidity: 70,
    feelsLike: 35.0,
    status: '대체로 맑음',
    pm10: 38,
    pm25: 19,
  },
  {
    id: 'city_07',
    name: '제주',
    country: '대한민국',
    temp: 28.6,
    humidity: 75,
    feelsLike: 31.1,
    status: '대체로 맑음',
    pm10: 20,
    pm25: 10,
  },
  {
    id: 'city_08',
    name: '대전',
    country: '대한민국',
    temp: 28.9,
    humidity: 66,
    feelsLike: 30.4,
    status: '대체로 맑음',
    pm10: 33,
    pm25: 16,
  },
  {
    id: 'city_09',
    name: '대구',
    country: '대한민국',
    temp: 28.6,
    humidity: 84,
    feelsLike: 31.4,
    status: '약한 이슬비',
    pm10: 45,
    pm25: 22,
  },
  {
    id: 'city_10',
    name: '강릉',
    country: '대한민국',
    temp: 31.3,
    humidity: 54,
    feelsLike: 32.3,
    status: '맑음',
    pm10: 27,
    pm25: 13,
  },
  {
    id: 'city_11',
    name: '인천',
    country: '대한민국',
    temp: 28.3,
    humidity: 70,
    feelsLike: 30.1,
    status: '구름 조금',
    pm10: 55,
    pm25: 28,
  },
  {
    id: 'city_12',
    name: '창원',
    country: '대한민국',
    temp: 29.9,
    humidity: 73,
    feelsLike: 33.1,
    status: '대체로 맑음',
    pm10: 30,
    pm25: 16,
  },
  {
    id: 'city_13',
    name: '전주',
    country: '대한민국',
    temp: 28.8,
    humidity: 68,
    feelsLike: 30.5,
    status: '대체로 맑음',
    pm10: 35,
    pm25: 18,
  },
  {
    id: 'city_14',
    name: '청주',
    country: '대한민국',
    temp: 30.4,
    humidity: 65,
    feelsLike: 32.8,
    status: '대체로 맑음',
    pm10: 39,
    pm25: 20,
  },
  {
    id: 'city_15',
    name: '포항',
    country: '대한민국',
    temp: 30.3,
    humidity: 71,
    feelsLike: 33.6,
    status: '대체로 맑음',
    pm10: 26,
    pm25: 14,
  },
  {
    id: 'city_16',
    name: '속초',
    country: '대한민국',
    temp: 30.7,
    humidity: 58,
    feelsLike: 32.1,
    status: '대체로 맑음',
    pm10: 22,
    pm25: 11,
  },
  {
    id: 'city_17',
    name: '여수',
    country: '대한민국',
    temp: 28.6,
    humidity: 79,
    feelsLike: 32.0,
    status: '대체로 맑음',
    pm10: 25,
    pm25: 13,
  },
  {
    id: 'city_18',
    name: '목포',
    country: '대한민국',
    temp: 28.7,
    humidity: 82,
    feelsLike: 32.5,
    status: '흐림',
    pm10: 84,
    pm25: 38,
  },
  {
    id: 'city_19',
    name: '안동',
    country: '대한민국',
    temp: 30.6,
    humidity: 60,
    feelsLike: 32.0,
    status: '구름 조금',
    pm10: 32,
    pm25: 15,
  },
  {
    id: 'city_20',
    name: '진주',
    country: '대한민국',
    temp: 29.1,
    humidity: 76,
    feelsLike: 32.4,
    status: '구름 조금',
    pm10: 72,
    pm25: 39,
  },
  {
    id: 'city_21',
    name: '서산',
    country: '대한민국',
    temp: 28.2,
    humidity: 74,
    feelsLike: 30.7,
    status: '대체로 맑음',
    pm10: 28,
    pm25: 14,
  },

  // 해외 도시
  {
    id: 'city_22',
    name: '도쿄',
    country: '일본',
    temp: 31.2,
    humidity: 67,
    feelsLike: 34.1,
    status: '대체로 맑음',
    pm10: 40,
    pm25: 20,
  },
  {
    id: 'city_23',
    name: '방콕',
    country: '태국',
    temp: 30.4,
    humidity: 82,
    feelsLike: 36.2,
    status: '약한 이슬비',
    pm10: 48,
    pm25: 24,
  },
  {
    id: 'city_24',
    name: '싱가포르',
    country: '싱가포르',
    temp: 29.8,
    humidity: 80,
    feelsLike: 35.1,
    status: '구름 조금',
    pm10: 37,
    pm25: 19,
  },
  {
    id: 'city_25',
    name: '파리',
    country: '프랑스',
    temp: 23.5,
    humidity: 55,
    feelsLike: 23.2,
    status: '흐림',
    pm10: 22,
    pm25: 10,
  },
  {
    id: 'city_26',
    name: '런던',
    country: '영국',
    temp: 21.8,
    humidity: 78,
    feelsLike: 21.5,
    status: '약한 이슬비',
    pm10: 25,
    pm25: 12,
  },
  {
    id: 'city_27',
    name: '뉴욕',
    country: '미국',
    temp: 28.7,
    humidity: 60,
    feelsLike: 29.5,
    status: '맑음',
    pm10: 28,
    pm25: 12,
  },
  {
    id: 'city_28',
    name: '로스앤젤레스',
    country: '미국',
    temp: 27.4,
    humidity: 45,
    feelsLike: 27.0,
    status: '맑음',
    pm10: 95,
    pm25: 42,
  },
  {
    id: 'city_29',
    name: '시드니',
    country: '호주',
    temp: 16.9,
    humidity: 58,
    feelsLike: 16.2,
    status: '구름 조금',
    pm10: 18,
    pm25: 8,
  },
  {
    id: 'city_30',
    name: '두바이',
    country: '아랍에미리트',
    temp: 40.2,
    humidity: 42,
    feelsLike: 44.0,
    status: '맑음',
    pm10: 110,
    pm25: 51,
  },
  {
    id: 'city_31',
    name: '베이징',
    country: '중국',
    temp: 31.7,
    humidity: 50,
    feelsLike: 35.4,
    status: '맑음',
    pm10: 64,
    pm25: 52,
  },
  {
    id: 'city_32',
    name: '상하이',
    country: '중국',
    temp: 31.8,
    humidity: 60,
    feelsLike: 36.9,
    status: '대체로 맑음',
    pm10: 23,
    pm25: 17,
  },
  {
    id: 'city_33',
    name: '홍콩',
    country: '중국',
    temp: 30.9,
    humidity: 65,
    feelsLike: 34.9,
    status: '흐림',
    pm10: 17,
    pm25: 14,
  },
  {
    id: 'city_34',
    name: '타이베이',
    country: '대만',
    temp: 29.8,
    humidity: 81,
    feelsLike: 35.6,
    status: '강한 이슬비',
    pm10: 9,
    pm25: 6,
  },
  {
    id: 'city_35',
    name: '하노이',
    country: '베트남',
    temp: 28.8,
    humidity: 85,
    feelsLike: 34.7,
    status: '흐림',
    pm10: 18,
    pm25: 18,
  },
  {
    id: 'city_36',
    name: '마닐라',
    country: '필리핀',
    temp: 28.1,
    humidity: 82,
    feelsLike: 32.5,
    status: '흐림',
    pm10: 13,
    pm25: 10,
  },
  {
    id: 'city_37',
    name: '뉴델리',
    country: '인도',
    temp: 32.5,
    humidity: 61,
    feelsLike: 38.7,
    status: '흐림',
    pm10: 108,
    pm25: 51,
  },
  {
    id: 'city_38',
    name: '로마',
    country: '이탈리아',
    temp: 24.7,
    humidity: 77,
    feelsLike: 28.4,
    status: '맑음',
    pm10: 23,
    pm25: 18,
  },
  {
    id: 'city_39',
    name: '베를린',
    country: '독일',
    temp: 17.4,
    humidity: 87,
    feelsLike: 17.6,
    status: '흐림',
    pm10: 13,
    pm25: 8,
  },
  {
    id: 'city_40',
    name: '토론토',
    country: '캐나다',
    temp: 19.9,
    humidity: 82,
    feelsLike: 21.6,
    status: '맑음',
    pm10: 7,
    pm25: 7,
  },
])

// 검색어와 선택된 도시 안내
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 도시 이름을 검색해 보세요.')

// 나만의 반응형 상태: 여행 추천 도시만 표시할지 결정
const recommendedOnly = ref(false)
// 날씨, 체감온도, 대기질을 확인해 여행 추천 도시 판단 및 설정
const isRecommended = (item) => {
  return !item.status.includes('비') && item.feelsLike < 30 && item.pm10 <= 60 && item.pm25 <= 35
}

// 검색어가 없으면 전체 도시, 검색어가 있으면 일치하는 도시만 계산
const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()

  if (keyword === '') return weatherList.value

  return weatherList.value.filter((item) => item.name.includes(keyword))
})

// 검색 결과 중 여행 추천 조건을 만족하는 도시만 계산
const recommendedCityList = computed(() => {
  return filteredWeatherList.value.filter((item) => isRecommended(item))
})

// 전체 보기와 추천 도시만 보기 상태에 따라 최종 출력 목록 결정
const displayedWeatherList = computed(() => {
  if (recommendedOnly.value) return recommendedCityList.value

  return filteredWeatherList.value
})

// 입력창에 작성한 값을 searchQuery에 저장
const handleInput = (event) => {
  searchQuery.value = event.target.value
}

// 선택한 도시 정보를 상태바에 저장
const selectCity = (city) => {
  selectedCityInfo.value = `${city.country} ${city.name} 도시를 선택했습니다.`
}

// 상세 날씨를 알림창으로 출력
const showDetail = (city) => {
  window.alert(
    `${city.country} ${city.name}\n날씨: ${city.status}\n기온: ${city.temp}°C\n체감온도: ${city.feelsLike}°C\n습도: ${city.humidity}%\n미세먼지: ${city.pm10}㎍/㎥\n초미세먼지: ${city.pm25}㎍/㎥`,
  )
}

// 선택한 도시 문구가 변경될 때 실행
watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log(`[watch] ${oldInfo} → ${newInfo}`)
})

// 검색어가 변경될 때마다 자동 실행
watchEffect(() => {
  console.log(`[watchEffect] 현재 검색어: "${searchQuery.value}"`)
})

// 나만의 watcher: 추천 도시만 보기 상태가 변경될 때 실행
watch(recommendedOnly, (newValue) => {
  console.log(`[나만의 watch] 추천 도시만 보기: ${newValue}`)
})
</script>

<template>
  <div class="dashboard-wrapper">
    <header class="dashboard-header">
      <h2>🌍 어디로 갈까?</h2>
      <p>날씨와 대기질을 비교하여 여행하기 좋은 도시를 찾아보세요.</p>
    </header>

    <!-- 도시 검색 영역 -->
    <section class="search-box">
      <h3>🔍 도시 검색</h3>
      <input
        type="text"
        :value="searchQuery"
        @input="handleInput"
        placeholder="검색할 도시 이름 입력"
      />

      <p v-if="searchQuery">
        검색 중인 도시: <strong>{{ searchQuery }}</strong>
      </p>
      <p v-else>검색어가 없어 전체 도시를 표시합니다.</p>

      <div class="filter-buttons">
        <button v-if="recommendedOnly" @click="recommendedOnly = false">🌍 전체 도시 보기</button>
        <button v-else @click="recommendedOnly = true">✈️ 여행 추천 도시만 보기</button>
      </div>

      <div class="search-summary">
        <p>
          검색된 도시: <strong>{{ filteredWeatherList.length }}개</strong>
        </p>
        <p>
          검색 결과 중 추천 도시: <strong>{{ recommendedCityList.length }}개</strong>
        </p>
      </div>
    </section>

    <!-- 도시별 날씨 카드 영역 -->
    <section class="list-box">
      <h3>✈️ 국내·해외 도시별 여행 날씨</h3>

      <div v-if="displayedWeatherList.length > 0" class="weather-grid">
        <div
          v-for="item in displayedWeatherList"
          :key="item.id"
          class="weather-card"
          :class="{
            'searched-card': searchQuery === item.name,
            'recommended-card': isRecommended(item),
          }"
          @click="selectCity(item)"
        >
          <p v-if="searchQuery === item.name" class="search-result">🔍 검색한 도시입니다.</p>

          <h4>{{ item.country }} · {{ item.name }}</h4>
          <p class="weather-status">{{ item.status }}</p>

          <div class="weather-info">
            <p>
              🌡️ 기온: <strong>{{ item.temp }}°C</strong>
            </p>
            <p>
              🥵 체감온도: <strong>{{ item.feelsLike }}°C</strong>
            </p>
            <p>
              💧 습도: <strong>{{ item.humidity }}%</strong>
            </p>
            <p>
              🌫️ 미세먼지: <strong>{{ item.pm10 }}㎍/㎥</strong>
            </p>
            <p>
              😷 초미세먼지: <strong>{{ item.pm25 }}㎍/㎥</strong>
            </p>
          </div>

          <!-- 체감온도 및 공식 폭염 기준 참고 -->
          <div class="badge-area">
            <span v-if="item.feelsLike >= 38 || item.temp >= 39" class="badge extreme"
              >🔥 극심한 폭염 위험</span
            >
            <span v-else-if="item.feelsLike >= 35" class="badge heatwave"
              >🚨 폭염경보 기준 온도</span
            >
            <span v-else-if="item.feelsLike >= 33" class="badge warning"
              >⚠️ 폭염주의보 기준 온도</span
            >
            <span v-else-if="item.feelsLike >= 30" class="badge very-hot">🥵 매우 더움</span>
            <span v-else-if="item.feelsLike >= 28" class="badge hot">☀️ 더움</span>
            <span v-else-if="item.feelsLike >= 25" class="badge warm">🌤️ 따뜻함</span>
            <span v-else class="badge cool">🌿 비교적 선선함</span>
          </div>

          <!-- 미세먼지 등급 -->
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

          <!-- 날씨에 따른 여행 도시 추천 -->
          <p v-if="item.status === '강한 이슬비'" class="travel-message caution">
            ☔ 빗방울이 제법 굵습니다. 무리한 야외 활동보다는 실내 일정을 권해드립니다.
          </p>
          <p v-else-if="item.status === '약한 이슬비'" class="travel-message caution">
            🌦️ 이슬비가 내리고 있습니다. 외출 시 가벼운 우산을 챙겨주세요.
          </p>
          <p v-else-if="item.feelsLike >= 38 || item.temp >= 39" class="travel-message caution">
            🚨 극심한 폭염으로 위험해요! 현재 여행 및 외출을 추천하지 않습니다.
          </p>
          <p v-else-if="item.feelsLike >= 35" class="travel-message caution">
            🔥 체감온도가 매우 높아요! 여행 및 외출을 추천하지 않습니다.
          </p>
          <p v-else-if="item.feelsLike >= 33" class="travel-message caution">
            🥵 체감온도가 높아 장시간 야외 외출에 주의하세요.
          </p>
          <p v-else-if="item.feelsLike >= 30" class="travel-message caution">
            ☀️ 더운 날씨입니다. 낮 시간대의 장시간 야외 활동에 주의하세요.
          </p>
          <p v-else-if="item.feelsLike < 18" class="travel-message caution">
            🧥 체감온도가 낮습니다. 외출 시 따뜻한 옷을 준비해 주세요.
          </p>
          <p v-else-if="item.pm10 > 80 || item.pm25 > 35" class="travel-message caution">
            😷 대기질이 좋지 않아 야외 여행을 추천하지 않습니다.
          </p>
          <p v-else-if="item.status === '맑음'" class="travel-message recommend">
            ☀️ 맑고 쾌청한 날입니다. 여유롭게 야외 일정을 즐겨보세요.
          </p>
          <p v-else-if="item.status === '대체로 맑음'" class="travel-message recommend">
            🌤️ 대체로 맑은 날씨입니다. 가벼운 마음으로 둘러보기 좋습니다.
          </p>
          <p v-else-if="item.status === '구름 조금'" class="travel-message recommend">
            ⛅ 옅은 구름이 지나며 햇빛을 가려주어 활동하기 편안합니다.
          </p>
          <p v-else-if="item.status === '흐림'" class="travel-message caution">
            ☁️ 하늘이 다소 흐립니다. 야외 일정 중 기상 변화에 유의해 주세요.
          </p>
          <p v-else class="travel-message caution">
            🌍 원활한 일정을 위해 방문 전 기상 상황을 미리 확인해 주시기 바랍니다.
          </p>

          <button class="btn-detail" @click.stop="showDetail(item)">상세보기</button>
        </div>
      </div>

      <p v-else class="no-result">😥 검색 조건과 일치하는 도시가 없습니다.</p>
    </section>

    <!-- 선택된 도시 안내 -->
    <div class="status-bar">{{ selectedCityInfo }}</div>

    <p class="notice">
      ※ 온도 및 대기질 표시는 공식 기준을 참고한 과제용 여행 안내이며, 실제 특보 및 관측값과 다를 수
      있습니다.
    </p>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  max-width: 760px;
  margin: 0 auto;
  padding: 20px;
  color: #222;
  font-family: Arial, sans-serif;
}
.dashboard-header {
  margin-bottom: 20px;
}
.dashboard-header h2 {
  margin: 0 0 8px;
}
.dashboard-header p {
  margin: 0;
  color: #666;
}
.search-box,
.list-box {
  padding: 16px;
  margin-bottom: 16px;
  background-color: #f7f7f7;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.search-box h3,
.list-box h3 {
  margin-top: 0;
}
.search-box input {
  width: 100%;
  padding: 9px;
  border: 1px solid #bbb;
  box-sizing: border-box;
}
.filter-buttons {
  margin: 12px 0;
}
.filter-buttons button {
  padding: 7px 12px;
  background-color: white;
  border: 1px solid #999;
  cursor: pointer;
}
.search-summary {
  color: #555;
}
.search-summary p {
  margin: 5px 0;
}
.weather-grid {
  display: grid;
  gap: 10px;
}
.weather-card {
  padding: 14px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
}
.recommended-card {
  border-color: #4caf50;
}
.searched-card {
  background-color: #eef6ff;
  border-color: #1976d2;
}
.search-result {
  color: #1976d2;
  font-weight: bold;
}
.weather-card h4 {
  margin: 0 0 6px;
}
.weather-status {
  margin: 0 0 10px;
  color: #555;
}
.weather-info {
  margin: 10px 0;
}
.weather-info p {
  margin: 4px 0;
}
.badge-area,
.dust-area {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 8px 0;
}
.badge,
.dust {
  padding: 4px 7px;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}
.extreme,
.heatwave,
.very-bad {
  background-color: #d32f2f;
}
.warning,
.very-hot,
.hot,
.bad {
  background-color: #f57c00;
}
.warm,
.good {
  background-color: #1976d2;
}
.cool,
.normal {
  background-color: #43a047;
}
.travel-message {
  padding: 8px;
  margin: 10px 0;
  border-radius: 4px;
}
.recommend {
  color: #1b5e20;
  background-color: #e8f5e9;
}
.normal-trip {
  color: #444;
  background-color: #eee;
}
.caution {
  color: #bf360c;
  background-color: #fff3e0;
}
.btn-detail {
  padding: 6px 10px;
  background-color: white;
  border: 1px solid #999;
  cursor: pointer;
}
.status-bar {
  padding: 12px;
  color: #1b5e20;
  text-align: center;
  background-color: #e8f5e9;
  border-radius: 5px;
}
.no-result {
  padding: 20px;
  color: #777;
  text-align: center;
}
.notice {
  color: #777;
  font-size: 12px;
  text-align: center;
}
</style>
