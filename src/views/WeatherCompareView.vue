<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTripDecisionStore } from '@/stores/tripDecisionStore'
import { useTemperature } from '@/composables/useTemperature'
import { useWeatherStore } from '@/stores/weatherStore'
import { getCurrentWeatherGuide } from '@/utils/weatherCondition'
import { ElAlert, ElButton, ElInput, ElOption, ElSelect } from 'element-plus'
import 'element-plus/es/components/alert/style/css'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/option/style/css'
import 'element-plus/es/components/select/style/css'

const router = useRouter()
const tripDecisionStore = useTripDecisionStore()
const { unitSymbol, formatTemperature, formatTemperatureDifference } = useTemperature()
const weatherStore = useWeatherStore()
const cityList = computed(() => {
  const cities = [...tripDecisionStore.apiCities, ...weatherStore.dashboardCities]
  return [...new Map(cities.map((city) => [city.id, city])).values()]
})

const firstSearchQuery = ref('')
const secondSearchQuery = ref('')
const firstSearchMessage = ref('')
const secondSearchMessage = ref('')
const isApiSearching = ref(false)

// 비교 도시와 여행 목적은 페이지를 이동해도 유지되도록 Store에 저장
const firstCityId = computed({
  get: () => tripDecisionStore.compareCityIds[0] || '',
  set: (cityId) => {
    if (cityId === '') tripDecisionStore.clearCompare()
    else tripDecisionStore.setCompareCity(0, cityId)
  },
})

const secondCityId = computed({
  get: () => tripDecisionStore.compareCityIds[1] || '',
  set: (cityId) => tripDecisionStore.setCompareCity(1, cityId),
})

const selectedCriterion = computed({
  get: () => tripDecisionStore.selectedPurpose,
  set: (purpose) => tripDecisionStore.setPurpose(purpose),
})

const comparisonCriteria = [
  '선택 안 함',
  '쾌적한 도시',
  '더위 피하기',
  '추위 피하기',
  '비 피하기',
  '대기질 좋은 곳',
]
const hasComparisonCriterion = computed(() => selectedCriterion.value !== '선택 안 함')

// 첫 번째 도시를 바꿨을 때 두 도시가 같아지는 경우 방지
watch(firstCityId, (cityId) => {
  if (cityId === secondCityId.value) {
    secondCityId.value = ''
  }
})

// 기존 목록에 없는 도시도 OpenWeatherMap에서 찾아 비교 목록에 바로 추가
const searchCityFromApi = async (position) => {
  const keyword = position === 'first' ? firstSearchQuery.value : secondSearchQuery.value
  const setMessage = (message) => {
    if (position === 'first') firstSearchMessage.value = message
    else secondSearchMessage.value = message
  }

  if (!keyword.trim()) {
    setMessage('검색할 도시 이름을 입력해 주세요.')
    return
  }

  isApiSearching.value = true
  setMessage('')
  try {
    await weatherStore.findCities(keyword)
    const location = weatherStore.citySearchResults[0]
    if (!location) {
      setMessage(weatherStore.citySearchMessage || '도시를 찾지 못했습니다.')
      return
    }

    const city = await weatherStore.fetchSelectedCityWeather(location)
    if (!city) {
      setMessage(weatherStore.citySearchMessage || '날씨를 불러오지 못했습니다.')
      return
    }

    const otherCityId = position === 'first' ? secondCityId.value : firstCityId.value
    const otherCity = cityList.value.find((item) => item.id === otherCityId)
    const isSameLocation =
      otherCity &&
      Math.abs(city.latitude - otherCity.latitude) < 0.03 &&
      Math.abs(city.longitude - otherCity.longitude) < 0.03

    if (city.id === otherCityId || isSameLocation) {
      setMessage('같은 도시를 두 번 선택할 수 없습니다.')
      return
    }

    tripDecisionStore.addApiCity(city)
    if (position === 'first') {
      firstSearchQuery.value = city.name
      firstCityId.value = city.id
    } else {
      secondSearchQuery.value = city.name
      secondCityId.value = city.id
    }
    setMessage(`${city.country} · ${city.name}을(를) 비교 도시로 선택했습니다.`)
  } finally {
    isApiSearching.value = false
  }
}

// 검색어를 지우는 것과 선택 도시를 해제하는 동작을 구분한다.
const clearSelectedCity = (position) => {
  if (position === 'first') {
    tripDecisionStore.clearCompare()
    firstSearchQuery.value = ''
    secondSearchQuery.value = ''
    firstSearchMessage.value = ''
    secondSearchMessage.value = ''
    return
  }

  secondCityId.value = ''
  secondSearchQuery.value = ''
  secondSearchMessage.value = ''
}

// 비교 대상으로 고른 도시는 최신 API 값으로 다시 확인
watch([firstCityId, secondCityId], async ([firstId, secondId]) => {
  const selectedIds = [firstId, secondId].filter((cityId) => cityId)
  await Promise.allSettled(
    selectedIds.map((cityId) => {
      const city = cityList.value.find((item) => item.id === cityId)
      return city && !city.id.startsWith('api_')
        ? weatherStore.fetchDashboardCity(city, true)
        : Promise.resolve()
    }),
  )
})

// 선택한 ID에 해당하는 도시 정보
const firstCity = computed(() => {
  return cityList.value.find((item) => item.id === firstCityId.value)
})

const secondCity = computed(() => {
  if (firstCityId.value === secondCityId.value) {
    return undefined
  }

  return cityList.value.find((item) => item.id === secondCityId.value)
})

const formatAirDifference = (value) => Math.round(value * 10) / 10

const connectCityNames = (firstName, secondName) => {
  const lastCharacter = firstName.charCodeAt(firstName.length - 1)
  const hasBatchim = (lastCharacter - 0xac00) % 28 > 0
  return `${firstName}${hasBatchim ? '과' : '와'} ${secondName}`
}

// 점수 계산은 Store가 담당하고, View에서는 화면용 주의 문구만 구성
const getWarnings = (city) => {
  const warnings = []
  const weatherGuide = getCurrentWeatherGuide(city.weatherId)

  if (weatherGuide) warnings.push(weatherGuide)
  if (city.feelsLike >= 38)
    warnings.push(`체감 ${formatTemperature(city.feelsLike)}${unitSymbol}: 극심한 폭염 주의`)
  else if (city.feelsLike >= 33)
    warnings.push(`체감 ${formatTemperature(city.feelsLike)}${unitSymbol}: 야외 활동 주의`)
  if (city.pm10 > 80 || city.pm25 > 35) warnings.push('대기질 나쁨: 야외 활동 주의')
  if (warnings.length === 0) warnings.push('특별한 주의사항 없음')

  return warnings
}

const firstEvaluation = computed(() => {
  const evaluation = tripDecisionStore.comparisonResult?.firstEvaluation
  if (!evaluation || !firstCity.value) return null
  return { ...evaluation, warnings: getWarnings(firstCity.value) }
})

const secondEvaluation = computed(() => {
  const evaluation = tripDecisionStore.comparisonResult?.secondEvaluation
  if (!evaluation || !secondCity.value) return null
  return { ...evaluation, warnings: getWarnings(secondCity.value) }
})

const comparisonResult = computed(() => {
  if (!firstCity.value || !secondCity.value || !firstEvaluation.value || !secondEvaluation.value)
    return null

  if (tripDecisionStore.comparisonResult.isTie) {
    return {
      title: `${connectCityNames(firstCity.value.name, secondCity.value.name)}의 적합도가 같습니다.`,
      reasons: [
        `두 도시 모두 ${selectedCriterion.value} 기준 ${firstEvaluation.value.score}점입니다.`,
      ],
    }
  }

  const betterCity = tripDecisionStore.comparisonResult.recommendedCity
  const firstIsBetter = betterCity.id === firstCity.value.id
  const otherCity = firstIsBetter ? secondCity.value : firstCity.value
  const reasons = []

  if (betterCity.status !== otherCity.status)
    reasons.push(
      `날씨: ${betterCity.name} ${betterCity.status} / ${otherCity.name} ${otherCity.status}`,
    )

  if (selectedCriterion.value === '더위 피하기' && betterCity.feelsLike < otherCity.feelsLike) {
    reasons.push(
      `체감온도: ${otherCity.name}보다 ${formatTemperatureDifference(otherCity.feelsLike - betterCity.feelsLike)}${unitSymbol} 낮음`,
    )
  } else if (selectedCriterion.value === '추위 피하기') {
    reasons.push(`체감온도 ${formatTemperature(betterCity.feelsLike)}${unitSymbol}: 더 따뜻한 조건`)
  } else if (betterCity.feelsLike !== otherCity.feelsLike) {
    reasons.push(
      `체감온도 ${formatTemperature(betterCity.feelsLike)}${unitSymbol}: 선택 기준에 더 적합`,
    )
  }

  if (betterCity.pm10 < otherCity.pm10)
    reasons.push(
      `미세먼지: ${otherCity.name}보다 ${formatAirDifference(otherCity.pm10 - betterCity.pm10)}㎍/㎥ 낮음`,
    )
  if (betterCity.pm25 < otherCity.pm25)
    reasons.push(
      `초미세먼지: ${otherCity.name}보다 ${formatAirDifference(otherCity.pm25 - betterCity.pm25)}㎍/㎥ 낮음`,
    )
  if (reasons.length === 0) reasons.push('항목별 가중 점수 우세')

  return {
    title: `추천 도시: ${betterCity.country} · ${betterCity.name}`,
    reasons,
  }
})

// 선택한 도시의 동적 상세 페이지로 이동
const goToDetail = (cityId) => {
  router.push(`/weather/${cityId}`)
}

// 날씨 대시보드로 이동
const goHome = () => {
  router.push('/')
}
</script>

<template>
  <main class="compare-container">
    <header class="compare-header">
      <h2>🔍 도시 날씨 비교</h2>
      <p>여행 후보 도시 두 곳의 날씨와 대기질을 한눈에 비교해 보세요.</p>
    </header>

    <section class="criterion-selector">
      <label for="comparison-criterion">비교 기준</label>
      <el-select id="comparison-criterion" v-model="selectedCriterion">
        <el-option
          v-for="criterion in comparisonCriteria"
          :key="criterion"
          :label="criterion"
          :value="criterion"
        />
      </el-select>
    </section>

    <section class="city-selectors">
      <div class="select-group">
        <label for="first-city-search">첫 번째 도시</label>
        <p class="search-help">도시명을 입력하면 OpenWeatherMap에서 바로 찾아 선택합니다.</p>
        <div class="api-search-row">
          <el-input
            id="first-city-search"
            v-model="firstSearchQuery"
            clearable
            placeholder="예: Barcelona, Honolulu"
            @keyup.enter="searchCityFromApi('first')"
          />
          <el-button type="primary" :loading="isApiSearching" @click="searchCityFromApi('first')"
            >검색하고 선택</el-button
          >
        </div>
        <div v-if="firstCity" class="selected-city">
          <div>
            <span>선택됨</span>
            <strong>{{ firstCity.country }} · {{ firstCity.name }}</strong>
            <small
              >{{ firstCity.status }} · {{ formatTemperature(firstCity.temp)
              }}{{ unitSymbol }}</small
            >
          </div>
          <el-button size="small" plain @click="clearSelectedCity('first')">선택 해제</el-button>
        </div>
        <p v-if="firstSearchMessage" class="api-message">{{ firstSearchMessage }}</p>
      </div>

      <div class="select-group">
        <label for="second-city-search">두 번째 도시</label>
        <p class="search-help">첫 번째 도시와 다른 도시를 검색해 주세요.</p>
        <div class="api-search-row">
          <el-input
            id="second-city-search"
            v-model="secondSearchQuery"
            clearable
            placeholder="예: Lisbon, Interlaken"
            :disabled="!firstCityId"
            @keyup.enter="searchCityFromApi('second')"
          />
          <el-button
            type="primary"
            :loading="isApiSearching"
            :disabled="!firstCityId"
            @click="searchCityFromApi('second')"
            >검색하고 선택</el-button
          >
        </div>
        <div v-if="secondCity" class="selected-city">
          <div>
            <span>선택됨</span>
            <strong>{{ secondCity.country }} · {{ secondCity.name }}</strong>
            <small
              >{{ secondCity.status }} · {{ formatTemperature(secondCity.temp)
              }}{{ unitSymbol }}</small
            >
          </div>
          <el-button size="small" plain @click="clearSelectedCity('second')">선택 해제</el-button>
        </div>
        <p v-if="secondSearchMessage" class="api-message">{{ secondSearchMessage }}</p>
      </div>
    </section>

    <section v-if="firstCity && secondCity" class="comparison-section">
      <div class="table-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>비교 항목</th>
              <th>{{ firstCity.country }} · {{ firstCity.name }}</th>
              <th>{{ secondCity.country }} · {{ secondCity.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>대륙</th>
              <td>{{ firstCity.continent }}</td>
              <td>{{ secondCity.continent }}</td>
            </tr>
            <tr>
              <th>날씨 상태</th>
              <td>{{ firstCity.status }}</td>
              <td>{{ secondCity.status }}</td>
            </tr>
            <tr>
              <th>현재 기온</th>
              <td>{{ formatTemperature(firstCity.temp) }}{{ unitSymbol }}</td>
              <td>{{ formatTemperature(secondCity.temp) }}{{ unitSymbol }}</td>
            </tr>
            <tr>
              <th>체감온도</th>
              <td>{{ formatTemperature(firstCity.feelsLike) }}{{ unitSymbol }}</td>
              <td>{{ formatTemperature(secondCity.feelsLike) }}{{ unitSymbol }}</td>
            </tr>
            <tr>
              <th>습도</th>
              <td>{{ firstCity.humidity }}%</td>
              <td>{{ secondCity.humidity }}%</td>
            </tr>
            <tr>
              <th>미세먼지</th>
              <td>{{ firstCity.pm10 }}㎍/㎥</td>
              <td>{{ secondCity.pm10 }}㎍/㎥</td>
            </tr>
            <tr>
              <th>초미세먼지</th>
              <td>{{ firstCity.pm25 }}㎍/㎥</td>
              <td>{{ secondCity.pm25 }}㎍/㎥</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="detail-buttons">
        <el-button type="primary" plain @click="goToDetail(firstCity.id)"
          >{{ firstCity.name }} 상세보기</el-button
        >
        <el-button type="primary" plain @click="goToDetail(secondCity.id)"
          >{{ secondCity.name }} 상세보기</el-button
        >
      </div>

      <div v-if="hasComparisonCriterion && comparisonResult" class="comparison-result">
        <h3>🏆 {{ comparisonResult.title }}</h3>

        <div class="score-summary">
          <div>
            <strong>{{ firstCity.country }} · {{ firstCity.name }}</strong>
            <p class="total-score">{{ firstEvaluation.score }}점</p>
            <p>
              날씨 {{ firstEvaluation.weatherScore }}점 · 체감온도
              {{ firstEvaluation.temperatureScore }}점
            </p>
            <p>
              대기질 {{ firstEvaluation.airScore }}점 · 습도 {{ firstEvaluation.humidityScore }}점
            </p>
          </div>
          <div>
            <strong>{{ secondCity.country }} · {{ secondCity.name }}</strong>
            <p class="total-score">{{ secondEvaluation.score }}점</p>
            <p>
              날씨 {{ secondEvaluation.weatherScore }}점 · 체감온도
              {{ secondEvaluation.temperatureScore }}점
            </p>
            <p>
              대기질 {{ secondEvaluation.airScore }}점 · 습도 {{ secondEvaluation.humidityScore }}점
            </p>
          </div>
        </div>

        <div class="result-details">
          <div>
            <h4>추천 이유</h4>
            <ul>
              <li v-for="reason in comparisonResult.reasons" :key="reason">{{ reason }}</li>
            </ul>
          </div>
          <div>
            <h4>{{ firstCity.name }} 주의사항</h4>
            <ul>
              <li v-for="warning in firstEvaluation.warnings" :key="warning">{{ warning }}</li>
            </ul>
          </div>
          <div>
            <h4>{{ secondCity.name }} 주의사항</h4>
            <ul>
              <li v-for="warning in secondEvaluation.warnings" :key="warning">{{ warning }}</li>
            </ul>
          </div>
        </div>

        <small>‘{{ selectedCriterion }}’ 기준별 가중치를 적용한 100점 결과입니다.</small>
      </div>

      <el-alert
        v-else
        title="현재는 날씨 정보만 비교하고 있습니다. 추천 결과가 필요하면 비교 기준을 선택해 주세요."
        type="info"
        show-icon
        :closable="false"
        class="criterion-guide"
      />
    </section>

    <el-alert
      v-else
      title="비교할 도시 두 곳을 선택해 주세요."
      type="info"
      show-icon
      :closable="false"
      class="select-guide"
    />

    <el-button type="info" @click="goHome">← 날씨 대시보드로 돌아가기</el-button>
  </main>
</template>

<style scoped>
.compare-container {
  max-width: 1040px;
  margin: 0 auto;
  color: var(--text-800);
}

.compare-header {
  padding: 8px 4px 24px;
}

.compare-header h2 {
  margin: 0 0 8px;
  color: var(--brand-950);
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 850;
  letter-spacing: -1px;
  line-height: 1.25;
}

.compare-header p {
  margin: 0;
  color: var(--text-600);
  font-size: 16px;
}

.criterion-selector {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  margin-bottom: 18px;
  background: linear-gradient(135deg, var(--brand-50), var(--surface));
  border: 1px solid var(--brand-100);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.criterion-selector label,
.select-group label {
  color: var(--brand-900);
  font-weight: 800;
}

.criterion-selector :deep(.el-select) {
  width: 260px;
}

.criterion-selector :deep(.el-select__wrapper),
.api-search-row :deep(.el-input__wrapper) {
  min-height: 42px;
  border-radius: var(--radius-sm);
  box-shadow: 0 0 0 1px var(--line) inset;
}

.criterion-selector :deep(.el-select__wrapper.is-focused),
.api-search-row :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--brand-500) inset;
}

.city-selectors {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  padding: 22px;
  margin-bottom: 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.select-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
  padding: 18px;
  background: var(--surface-muted);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.search-help {
  min-height: 22px;
  margin: 0;
  color: var(--text-600);
  font-size: 13px;
  line-height: 1.55;
}

.api-search-row {
  display: flex;
  gap: 8px;
}

.api-search-row :deep(.el-input) {
  flex: 1;
  min-width: 0;
}

.api-search-row :deep(.el-button) {
  min-height: 42px;
  margin-left: 0;
  border-radius: var(--radius-sm);
  font-weight: 700;
}

.api-message {
  margin: 0;
  color: var(--brand-700);
  font-size: 13px;
  font-weight: 600;
}

.selected-city {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 78px;
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--brand-100);
  border-left: 4px solid var(--brand-500);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.selected-city div {
  display: grid;
  gap: 2px;
}

.selected-city span {
  color: var(--brand-700);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.selected-city strong {
  color: var(--brand-950);
}

.selected-city small {
  color: var(--text-600);
}

.selected-city :deep(.el-button) {
  flex: 0 0 auto;
  margin-left: 0;
  border-radius: var(--radius-sm);
}

.comparison-section {
  margin-bottom: 18px;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  scrollbar-color: var(--brand-100) transparent;
}

.comparison-table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  background: var(--surface);
}

.comparison-table th,
.comparison-table td {
  padding: 14px 16px;
  text-align: center;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.comparison-table tr:last-child > * {
  border-bottom: 0;
}

.comparison-table tr > *:last-child {
  border-right: 0;
}

.comparison-table thead th {
  color: white;
  background: var(--brand-900);
  font-size: 15px;
}

.comparison-table thead th:first-child {
  background: var(--brand-950);
}

.comparison-table tbody th {
  color: var(--brand-900);
  background: var(--brand-50);
  font-weight: 750;
}

.comparison-table tbody tr:nth-child(even) td {
  background: var(--surface-muted);
}

.detail-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.detail-buttons :deep(.el-button) {
  margin-left: 0;
  border-radius: var(--radius-sm);
  font-weight: 700;
}

.comparison-result {
  padding: 24px;
  margin-top: 22px;
  color: var(--text-800);
  background: linear-gradient(145deg, var(--brand-50), var(--surface) 54%);
  border: 1px solid var(--brand-100);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.comparison-result h3 {
  margin: 0 0 18px;
  color: var(--brand-950);
  font-size: 21px;
  text-align: center;
}

.comparison-result > small {
  display: block;
  color: var(--text-600);
  text-align: center;
}

.criterion-guide {
  margin-top: 20px;
}

.score-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  text-align: center;
}

.score-summary > div {
  padding: 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.score-summary strong {
  color: var(--brand-900);
}

.score-summary p {
  margin: 5px 0;
  color: var(--text-700);
  font-size: 13px;
}

.score-summary .total-score {
  margin: 8px 0;
  color: var(--brand-700);
  font-size: 28px;
  font-weight: 850;
}

.result-details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.result-details > div {
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
}

.result-details h4 {
  margin: 0 0 8px;
  color: var(--brand-900);
}

.result-details ul {
  padding-left: 20px;
  margin: 0;
}

.result-details li {
  margin-bottom: 5px;
  color: var(--text-700);
  font-size: 13px;
}

.select-guide {
  padding: 22px;
  margin-bottom: 18px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.compare-container > :deep(.el-button--info) {
  border-color: var(--brand-900);
  border-radius: var(--radius-sm);
  background: var(--brand-900);
  font-weight: 700;
}

.compare-container :deep(.el-button:focus-visible) {
  outline: 3px solid rgba(39, 133, 211, 0.36);
  outline-offset: 3px;
}

@media (max-width: 760px) {
  .city-selectors,
  .score-summary,
  .result-details {
    grid-template-columns: 1fr;
  }

  .criterion-selector {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
  }

  .criterion-selector :deep(.el-select) {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .compare-header {
    padding-bottom: 20px;
  }

  .city-selectors,
  .comparison-result {
    padding: 16px;
    border-radius: var(--radius-md);
  }

  .select-group {
    padding: 14px;
  }

  .detail-buttons,
  .api-search-row {
    flex-direction: column;
  }

  .detail-buttons :deep(.el-button),
  .api-search-row :deep(.el-button) {
    width: 100%;
  }

  .selected-city {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
