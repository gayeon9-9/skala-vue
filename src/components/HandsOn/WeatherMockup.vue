<script setup>
import { ref } from 'vue'

// 1. 배열 렌더링(v-for) - 2026-08-19 15:00~15:15(KST) 날씨 기준
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 30.0, status: '대체로 맑음' },
  { id: 'city_02', name: '수원', temp: 29.4, status: '대체로 맑음' },
  { id: 'city_03', name: '부산', temp: 30.1, status: '대체로 맑음' },
  { id: 'city_04', name: '판교', temp: 29.7, status: '대체로 맑음' },
  { id: 'city_05', name: '광주', temp: 28.2, status: '약한 이슬비' },
  { id: 'city_06', name: '울산', temp: 31.3, status: '대체로 맑음' },
  { id: 'city_07', name: '제주', temp: 28.6, status: '대체로 맑음' },
  { id: 'city_08', name: '대전', temp: 28.9, status: '대체로 맑음' },
  { id: 'city_09', name: '대구', temp: 28.6, status: '약한 이슬비' },
  { id: 'city_10', name: '강릉', temp: 31.3, status: '맑음' },
  { id: 'city_11', name: '인천', temp: 28.3, status: '구름 조금' },
  { id: 'city_12', name: '창원', temp: 29.9, status: '대체로 맑음' },
  { id: 'city_13', name: '전주', temp: 28.8, status: '대체로 맑음' },
  { id: 'city_14', name: '청주', temp: 30.4, status: '대체로 맑음' },
  { id: 'city_15', name: '포항', temp: 30.3, status: '대체로 맑음' },
  { id: 'city_16', name: '속초', temp: 30.7, status: '대체로 맑음' },
  { id: 'city_17', name: '여수', temp: 28.6, status: '대체로 맑음' },
  { id: 'city_18', name: '목포', temp: 28.7, status: '흐림' },
  { id: 'city_19', name: '안동', temp: 30.6, status: '구름 조금' },
  { id: 'city_20', name: '진주', temp: 29.1, status: '구름 조금' },
  { id: 'city_21', name: '서산', temp: 28.2, status: '대체로 맑음' },
])

// 추후 API 조회 시각으로 변경 예정
const updatedAt = '2026-08-19 15:00 KST'

// 검색어(입력한 도시 이름) 및 선택 결과
const searchQuery = ref('') // 과제 기준에 따라 이름변경 (searchCity -> searchQuery)
const selectedCityInfo = ref('카드를 클릭하거나 도시 이름을 입력해 보세요.')

// input 이벤트가 발생하면 입력값을 searchQuery에 저장
const handleInput = (event) => {
  searchQuery.value = event.target.value
}
const selectCity = (city) => {
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}
const showDetail = (city) => {
  window.alert(`${city.name}의 현재 기온은 ${city.temp}°C이며, 날씨는 [${city.status}] 상태입니다.`)
}
</script>

<template>
  <main class="dashboard-wrapper">
    <!-- 나중에 WeatherParent 또는 WeatherHomeView의 상단 영역 -->
    <header class="dashboard-header">
      <p>WEATHER MOCKUP</p>
      <h1>전국 주요 도시 날씨</h1>
      <p>{{ updatedAt }} 기준</p>
    </header>

    <!-- 나중에 SearchBar.vue로 분리할 영역 -->
    <section class="search-box">
      <h2>🔍 도시 검색</h2>
      <input type="text" :value="searchQuery" @input="handleInput" placeholder="검색할 도시 이름 입력" />

      <p v-if="searchQuery">검색 중인 도시: <strong>{{ searchQuery }}</strong></p>
      <p v-else>도시 이름을 입력해 주세요.</p>
    </section>

    <!-- 나중에 BaseDashboardCard.vue의 slot에 들어갈 영역 -->
    <section class="list-box">
      <h2>🏙️ 지역별 날씨 현황</h2>

      <div class="weather-grid">
        <!-- 나중에 WeatherCard.vue로 분리할 영역 -->
        <article v-for="item in weatherList" :key="item.id" class="weather-card" :class="{ 'hot-card': item.temp >= 30, 'normal-card': item.temp < 30, 'search-card': searchQuery === item.name }" @click="selectCity(item)">
          <h3>{{ item.name }} ({{ item.status }})</h3>
          <p>현재 기온: {{ item.temp }}°C</p>

          <span v-if="item.temp >= 30" class="badge hot">🔥 고온 주의 (30도 이상)</span>
          <span v-else class="badge normal">🌤️ 일반 더위 (30도 미만)</span>

          <div class="weather-message">
            <p v-if="item.status === '약한 이슬비'">☔ 약한 비가 내리고 있으니 우산을 준비하세요.</p>
            <p v-else-if="item.status === '흐림'">☁️ 하늘이 흐리니 외출 전 날씨를 확인하세요.</p>
            <p v-else-if="item.status === '구름 조금'">⛅ 구름이 조금 있지만 외출하기 무난합니다.</p>
            <p v-else>☀️ 햇빛이 강할 수 있으니 자외선에 주의하세요.</p>
          </div>

          <button type="button" class="btn-detail" @click.stop="showDetail(item)">상세보기</button>
        </article>
      </div>
    </section>

    <div class="status-bar">{{ selectedCityInfo }}</div>
  </main>
</template>

<style scoped>
/* 전체 대시보드 영역 */
.dashboard-wrapper { max-width: 1100px; margin: 0 auto; padding: 30px; color: #25334a; background-color: #f4f7fb; }

/* 대시보드 제목 영역 */
.dashboard-header { margin-bottom: 30px; text-align: center; }
.dashboard-header h1 { margin: 8px 0; }
.header-label { margin: 0; color: #3182f6; font-size: 13px; font-weight: bold; letter-spacing: 2px; }

/* 도시 검색 영역 */
.search-box { margin-bottom: 30px; padding: 20px; background-color: white; border-radius: 10px; }
.search-box label { display: block; margin-bottom: 10px; font-weight: bold; }
.search-box input { width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid #ccd5e0; border-radius: 6px; font-size: 16px; }
.empty-message { color: #868e96; }

/* 날씨 카드 목록 */
.weather-section h2 { margin-bottom: 20px; }
.weather-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }

/* 기본 날씨 카드 */
.weather-card { padding: 18px; background-color: white; border: 2px solid transparent; border-radius: 12px; cursor: pointer; }
.weather-card:hover { transform: translateY(-3px); }

/* 온도 조건에 따라 적용되는 카드 색상 */
.card-hot { border-top: 5px solid #ff6b6b; }
.card-normal { border-top: 5px solid #4dabf7; }

/* 검색창에 입력한 도시와 이름이 같은 카드 */
.card-searched { border-color: #7c3aed; background-color: #f5f3ff; }

/* 카드 제목과 날씨 상태 */
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-header h3 { margin: 0; }
.card-header span { color: #667085; font-size: 14px; }

/* 기온 표시 */
.temperature { margin: 18px 0 10px; font-size: 32px; font-weight: bold; }

/* 기온 상태 배지 */
.badge { display: inline-block; padding: 5px 8px; border-radius: 6px; font-size: 13px; font-weight: bold; }
.hot { color: #d6336c; background-color: #fff0f3; }
.normal { color: #1971c2; background-color: #e7f5ff; }

/* 날씨별 안내 메시지 */
.weather-message { min-height: 65px; margin: 14px 0; padding: 10px; background-color: #f8f9fa; border-radius: 6px; font-size: 14px; line-height: 1.5; }
.weather-message p { margin: 0; }

/* 상세보기 버튼 */
.btn-detail { width: 100%; padding: 9px; border: none; border-radius: 6px; color: white; background-color: #3182f6; cursor: pointer; }
.btn-detail:hover { background-color: #1c64d1; }

/* 선택된 도시 정보 상태바 */
.status-bar { margin-top: 25px; padding: 16px; color: white; background-color: #343a40; border-radius: 8px; text-align: center; }
</style>