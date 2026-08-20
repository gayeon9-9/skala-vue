<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import TravelFilter from './TravelFilter.vue'
import WeatherCard from './WeatherCard.vue'

// 국내 21개, 해외 19개 도시의 과제용 Mockup 데이터
// 국내 도시 (대륙 추가)
const weatherList = ref([
  { id: 'city_01', name: '서울', country: '대한민국', continent: '아시아', temp: 30.0, humidity: 68, feelsLike: 33.0, status: '대체로 맑음', pm10: 34, pm25: 18 },
  { id: 'city_02', name: '수원', country: '대한민국', continent: '아시아', temp: 29.4, humidity: 65, feelsLike: 31.3, status: '대체로 맑음', pm10: 29, pm25: 15 },
  { id: 'city_03', name: '부산', country: '대한민국', continent: '아시아', temp: 30.1, humidity: 72, feelsLike: 34.0, status: '대체로 맑음', pm10: 31, pm25: 17 },
  { id: 'city_04', name: '판교', country: '대한민국', continent: '아시아', temp: 29.7, humidity: 63, feelsLike: 31.5, status: '대체로 맑음', pm10: 42, pm25: 21 },
  { id: 'city_05', name: '광주', country: '대한민국', continent: '아시아', temp: 28.2, humidity: 86, feelsLike: 31.2, status: '약한 이슬비', pm10: 24, pm25: 12 },
  { id: 'city_06', name: '울산', country: '대한민국', continent: '아시아', temp: 31.3, humidity: 70, feelsLike: 35.0, status: '대체로 맑음', pm10: 38, pm25: 19 },
  { id: 'city_07', name: '제주', country: '대한민국', continent: '아시아', temp: 28.6, humidity: 75, feelsLike: 31.1, status: '대체로 맑음', pm10: 20, pm25: 10 },
  { id: 'city_08', name: '대전', country: '대한민국', continent: '아시아', temp: 28.9, humidity: 66, feelsLike: 30.4, status: '대체로 맑음', pm10: 33, pm25: 16 },
  { id: 'city_09', name: '대구', country: '대한민국', continent: '아시아', temp: 28.6, humidity: 84, feelsLike: 31.4, status: '약한 이슬비', pm10: 45, pm25: 22 },
  { id: 'city_10', name: '강릉', country: '대한민국', continent: '아시아', temp: 31.3, humidity: 54, feelsLike: 32.3, status: '맑음', pm10: 27, pm25: 13 },
  { id: 'city_11', name: '인천', country: '대한민국', continent: '아시아', temp: 28.3, humidity: 70, feelsLike: 30.1, status: '구름 조금', pm10: 55, pm25: 28 },
  { id: 'city_12', name: '창원', country: '대한민국', continent: '아시아', temp: 29.9, humidity: 73, feelsLike: 33.1, status: '대체로 맑음', pm10: 30, pm25: 16 },
  { id: 'city_13', name: '전주', country: '대한민국', continent: '아시아', temp: 28.8, humidity: 68, feelsLike: 30.5, status: '대체로 맑음', pm10: 35, pm25: 18 },
  { id: 'city_14', name: '청주', country: '대한민국', continent: '아시아', temp: 30.4, humidity: 65, feelsLike: 32.8, status: '대체로 맑음', pm10: 39, pm25: 20 },
  { id: 'city_15', name: '포항', country: '대한민국', continent: '아시아', temp: 30.3, humidity: 71, feelsLike: 33.6, status: '대체로 맑음', pm10: 26, pm25: 14 },
  { id: 'city_16', name: '속초', country: '대한민국', continent: '아시아', temp: 30.7, humidity: 58, feelsLike: 32.1, status: '대체로 맑음', pm10: 22, pm25: 11 },
  { id: 'city_17', name: '여수', country: '대한민국', continent: '아시아', temp: 28.6, humidity: 79, feelsLike: 32.0, status: '대체로 맑음', pm10: 25, pm25: 13 },
  { id: 'city_18', name: '목포', country: '대한민국', continent: '아시아', temp: 28.7, humidity: 82, feelsLike: 32.5, status: '흐림', pm10: 84, pm25: 38 },
  { id: 'city_19', name: '안동', country: '대한민국', continent: '아시아', temp: 30.6, humidity: 60, feelsLike: 32.0, status: '구름 조금', pm10: 32, pm25: 15 },
  { id: 'city_20', name: '진주', country: '대한민국', continent: '아시아', temp: 29.1, humidity: 76, feelsLike: 32.4, status: '구름 조금', pm10: 72, pm25: 39 },
  { id: 'city_21', name: '서산', country: '대한민국', continent: '아시아', temp: 28.2, humidity: 74, feelsLike: 30.7, status: '대체로 맑음', pm10: 28, pm25: 14 },
// 해외 도시 (대륙 추가)
  { id: 'city_22', name: '도쿄', country: '일본', continent: '아시아', temp: 31.2, humidity: 67, feelsLike: 34.1, status: '대체로 맑음', pm10: 40, pm25: 20 },
  { id: 'city_23', name: '방콕', country: '태국', continent: '아시아', temp: 30.4, humidity: 82, feelsLike: 36.2, status: '약한 이슬비', pm10: 48, pm25: 24 },
  { id: 'city_24', name: '싱가포르', country: '싱가포르', continent: '아시아', temp: 29.8, humidity: 80, feelsLike: 35.1, status: '구름 조금', pm10: 37, pm25: 19 },
  { id: 'city_25', name: '파리', country: '프랑스', continent: '유럽', temp: 23.5, humidity: 55, feelsLike: 23.2, status: '흐림', pm10: 22, pm25: 10 },
  { id: 'city_26', name: '런던', country: '영국', continent: '유럽', temp: 21.8, humidity: 78, feelsLike: 21.5, status: '약한 이슬비', pm10: 25, pm25: 12 },
  { id: 'city_27', name: '뉴욕', country: '미국', continent: '북아메리카', temp: 28.7, humidity: 60, feelsLike: 29.5, status: '맑음', pm10: 28, pm25: 12 },
  { id: 'city_28', name: '로스앤젤레스', country: '미국', continent: '북아메리카', temp: 27.4, humidity: 45, feelsLike: 27.0, status: '맑음', pm10: 95, pm25: 42 },
  { id: 'city_29', name: '시드니', country: '호주', continent: '오세아니아', temp: 16.9, humidity: 58, feelsLike: 16.2, status: '구름 조금', pm10: 18, pm25: 8 },
  { id: 'city_30', name: '두바이', country: '아랍에미리트', continent: '아시아', temp: 40.2, humidity: 42, feelsLike: 44.0, status: '맑음', pm10: 110, pm25: 51 },
  { id: 'city_31', name: '베이징', country: '중국', continent: '아시아', temp: 31.7, humidity: 50, feelsLike: 35.4, status: '맑음', pm10: 64, pm25: 52 },
  { id: 'city_32', name: '상하이', country: '중국', continent: '아시아', temp: 31.8, humidity: 60, feelsLike: 36.9, status: '대체로 맑음', pm10: 23, pm25: 17 },
  { id: 'city_33', name: '홍콩', country: '중국', continent: '아시아', temp: 30.9, humidity: 65, feelsLike: 34.9, status: '흐림', pm10: 17, pm25: 14 },
  { id: 'city_34', name: '타이베이', country: '대만', continent: '아시아', temp: 29.8, humidity: 81, feelsLike: 35.6, status: '강한 이슬비', pm10: 9, pm25: 6 },
  { id: 'city_35', name: '하노이', country: '베트남', continent: '아시아', temp: 28.8, humidity: 85, feelsLike: 34.7, status: '흐림', pm10: 18, pm25: 18 },
  { id: 'city_36', name: '마닐라', country: '필리핀', continent: '아시아', temp: 28.1, humidity: 82, feelsLike: 32.5, status: '흐림', pm10: 13, pm25: 10 },
  { id: 'city_37', name: '뉴델리', country: '인도', continent: '아시아', temp: 32.5, humidity: 61, feelsLike: 38.7, status: '흐림', pm10: 108, pm25: 51 },
  { id: 'city_38', name: '로마', country: '이탈리아', continent: '유럽', temp: 24.7, humidity: 77, feelsLike: 28.4, status: '맑음', pm10: 23, pm25: 18 },
  { id: 'city_39', name: '베를린', country: '독일', continent: '유럽', temp: 17.4, humidity: 87, feelsLike: 17.6, status: '흐림', pm10: 13, pm25: 8 },
  { id: 'city_40', name: '토론토', country: '캐나다', continent: '북아메리카', temp: 19.9, humidity: 82, feelsLike: 21.6, status: '맑음', pm10: 7, pm25: 7 },
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 도시 이름을 검색해 보세요.')
// 현재 선택된 도시의 고유 ID
const selectedCityId = ref('')
const selectedContinent = ref('전체')
const selectedPurpose = ref('전체')

// 기본적인 쾌적한 여행 도시 조건
const isRecommended = (item) => {
  return !item.status.includes('비') && item.feelsLike >= 18 && item.feelsLike < 30 && item.pm10 <= 60 && item.pm25 <= 35
}

// 도시 이름 검색
const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  if (keyword === '') return weatherList.value
  return weatherList.value.filter((item) => item.name.includes(keyword))
})

// 대륙 선택
const continentWeatherList = computed(() => {
  if (selectedContinent.value === '전체') return filteredWeatherList.value
  return filteredWeatherList.value.filter((item) => item.continent === selectedContinent.value)
})

// 여행 목적 선택
const displayedWeatherList = computed(() => {
  const cityList = continentWeatherList.value

  if (selectedPurpose.value === '쾌적한 도시') {
    return cityList.filter((item) => isRecommended(item))
  }

  if (selectedPurpose.value === '더위 피하기') {
    return cityList.filter((item) => !item.status.includes('비') && item.feelsLike < 25 && item.pm10 <= 80 && item.pm25 <= 35)
  }

  if (selectedPurpose.value === '추위 피하기') {
    return cityList.filter((item) => !item.status.includes('비') && item.feelsLike >= 25 && item.feelsLike < 30 && item.pm10 <= 80 && item.pm25 <= 35)
  }

  if (selectedPurpose.value === '비 피하기') {
    return cityList.filter((item) => !item.status.includes('비') && item.feelsLike < 33 && item.pm10 <= 80 && item.pm25 <= 35)
  }

  if (selectedPurpose.value === '대기질 좋은 곳') {
    return cityList.filter((item) => !item.status.includes('비') && item.feelsLike < 33 && item.pm10 <= 30 && item.pm25 <= 15)
  }

  return cityList
})

// 검색 및 필터 결과가 없으면 하단 상태바에도 안내 문구 표시
const statusBarMessage = computed(() => {
  if (displayedWeatherList.value.length === 0) {
    return '선택한 검색 조건에 맞는 도시가 없습니다.'
  }

  return selectedCityInfo.value
})

// 대륙 변경 시 하단의 안내 문구도 변경
const changeContinent = (continent) => {
  selectedContinent.value = continent

  if (continent === '전체') {
    selectedCityInfo.value = '전체 대륙의 도시를 표시합니다.'
  } else {
    selectedCityInfo.value = `${continent} 도시를 표시합니다.`
  }
}

// 여행 목적 변경 시 하단의 안내 문구도 변경
const changePurpose = (purpose) => {
  selectedPurpose.value = purpose

  if (purpose === '전체') {
    selectedCityInfo.value = '모든 여행 목적의 도시를 표시합니다.'
  } else {
    selectedCityInfo.value = `${purpose} 조건에 맞는 도시를 표시합니다.`
  }
}

const updateSearchQuery = (value) => { searchQuery.value = value }
const updateContinent = (value) => { selectedContinent.value = value }
const updatePurpose = (value) => { selectedPurpose.value = value }
const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.country} ${city.name} 도시를 선택했습니다.`
}

const showDetail = (city) => {
  window.alert(`${city.country} ${city.name}\n대륙: ${city.continent}\n날씨: ${city.status}\n기온: ${city.temp}°C\n체감온도: ${city.feelsLike}°C\n습도: ${city.humidity}%\n미세먼지: ${city.pm10}㎍/㎥\n초미세먼지: ${city.pm25}㎍/㎥`)
}

watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log(`[watch] ${oldInfo} → ${newInfo}`)
})

watchEffect(() => {
  console.log(`[watchEffect] 현재 검색어: "${searchQuery.value}"`)
})

watch(selectedContinent, (newValue) => {
  console.log(`[대륙 선택] ${newValue}`)
})

watch(selectedPurpose, (newValue) => {
  console.log(`[여행 목적 선택] ${newValue}`)
})
</script>

<template>
  <div class="dashboard-wrapper">
    <header class="dashboard-header">
      <h2>🌍 어디로 갈까?</h2>
      <p>대륙과 여행 목적을 선택하여 날씨가 알맞은 도시를 찾아보세요.</p>
    </header>

    <BaseDashboardCard>
      <h3>🔍 도시 검색</h3>
      <SearchBar :search-query="searchQuery" @update-query="updateSearchQuery" />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>여행 조건 선택</h3>

      <TravelFilter
        :selected-continent="selectedContinent"
        :selected-purpose="selectedPurpose"
        :filtered-count="continentWeatherList.length"
        :displayed-count="displayedWeatherList.length"
        @update-continent="updateContinent"
        @update-purpose="updatePurpose"
      />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>✈️ 국내·해외 도시별 여행 날씨</h3>

      <div v-if="displayedWeatherList.length > 0" class="weather-grid">
        <WeatherCard
          v-for="item in displayedWeatherList"
          :key="item.id"
          :item="item"
          :search-query="searchQuery"
          :recommended="isRecommended(item)"
          :selected-purpose="selectedPurpose"
          :is-selected="selectedCityId === item.id"
          @select-card="selectCity"
          @click-detail="showDetail"
        />
      </div>

      <p v-else class="no-result">😥 선택한 조건과 일치하는 도시가 없습니다.</p>
    </BaseDashboardCard>

    <div class="status-bar">{{ statusBarMessage }}</div>

    <p class="notice">※ 온도 및 대기질 표시는 과제용 Mockup 데이터이며 실제 특보 및 관측값과 다를 수 있습니다.</p>
  </div>
</template>

<style scoped>
.dashboard-wrapper { max-width: 760px; margin: 0 auto; padding: 20px; color: #222; font-family: Arial, sans-serif; }
.dashboard-header { margin-bottom: 20px; }
.dashboard-header h2 { margin: 0 0 8px; }
.dashboard-header p { margin: 0; color: #666; }
.weather-grid { display: grid; gap: 10px; }
.status-bar { padding: 12px; color: #1b5e20; text-align: center; background-color: #e8f5e9; border-radius: 5px; }
.no-result { padding: 20px; color: #777; text-align: center; }
.notice { color: #777; font-size: 12px; text-align: center; }
</style>
