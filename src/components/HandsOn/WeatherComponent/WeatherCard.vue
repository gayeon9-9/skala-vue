<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useTripDecisionStore } from '@/stores/tripDecisionStore'
import { getCurrentWeatherGuide } from '@/utils/weatherCondition'
import { ElButton, ElCard, ElTag } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/card/style/css'
import 'element-plus/es/components/tag/style/css'

const props = defineProps({
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
  purposeMatched: {
    type: Boolean,
    default: true,
  },
  purposeFailureReasons: {
    type: Array,
    default: () => [],
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])
const configStore = useConfigStore()
const tripDecisionStore = useTripDecisionStore()

// 날씨 계산은 섭씨 원본으로 유지하고 화면에 표시할 값만 변환
const displayTemp = computed(() => {
  if (configStore.unit === 'fahrenheit') return Math.round((props.item.temp * 9) / 5 + 32)
  return props.item.temp
})

const displayFeelsLike = computed(() => {
  if (configStore.unit === 'fahrenheit') return Math.round((props.item.feelsLike * 9) / 5 + 32)
  return props.item.feelsLike
})

const isFavorite = computed(() => tripDecisionStore.favoriteCityIds.includes(props.item.id))
const isCompareCity = computed(() => tripDecisionStore.compareCityIds.includes(props.item.id))
const compareDisabled = computed(() => tripDecisionStore.compareCount >= 2 && !isCompareCity.value)
const weatherGuide = computed(() => getCurrentWeatherGuide(props.item.weatherId))
</script>

<template>
  <el-card
    class="weather-card"
    shadow="hover"
    role="button"
    tabindex="0"
    :aria-label="`${item.country} ${item.name} 날씨 카드`"
    :body-style="{ padding: '18px' }"
    :class="{
      'searched-card': searchQuery === item.name,
      'recommended-card': recommended,
      'purpose-mismatch-card': selectedPurpose !== '전체' && !purposeMatched,
      'selected-card': isSelected,
    }"
    @click="emit('select-card', item)"
    @keydown.enter="emit('select-card', item)"
    @keydown.space.prevent="emit('select-card', item)"
  >
    <p v-if="isSelected" class="selected-message">✅ 선택한 도시입니다.</p>
    <p v-if="searchQuery === item.name" class="search-result">🔍 검색한 도시입니다.</p>

    <div class="card-heading">
      <div><p class="continent">{{ item.country }} · {{ item.continent }}</p><h4>{{ item.name }}</h4></div>
      <el-tag v-if="item.isLive" type="success" size="small" effect="plain">LIVE</el-tag>
      <el-tag v-else type="info" size="small" effect="plain">예비</el-tag>
    </div>
    <div class="temperature-summary">
      <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
      <span>{{ item.status }}<small>체감 {{ displayFeelsLike }}{{ configStore.unitSymbol }}</small></span>
    </div>

    <div class="weather-info">
      <p>🌡️ 기온: <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong></p>
      <p>🥵 체감온도: <strong>{{ displayFeelsLike }}{{ configStore.unitSymbol }}</strong></p>
      <p>💧 습도: <strong>{{ item.humidity }}%</strong></p>
      <p>🌫️ 미세먼지: <strong>{{ item.pm10 }}㎍/㎥</strong></p>
      <p>😷 초미세먼지: <strong>{{ item.pm25 }}㎍/㎥</strong></p>
    </div>

    <!-- 선택한 여행 목적에 따른 안내 -->
    <div v-if="selectedPurpose !== '전체' && !purposeMatched" class="purpose-message purpose-failed">
      <strong>조건에 맞지 않은 이유</strong>
      <ul>
        <li v-for="reason in purposeFailureReasons" :key="reason">{{ reason }}</li>
      </ul>
    </div>
    <p v-else-if="selectedPurpose === '쾌적한 도시'" class="purpose-message">✅ 비·온도·대기질 조건을 모두 만족한 도시입니다.</p>
    <p v-else-if="selectedPurpose === '더위 피하기'" class="purpose-message">🌿 체감온도 {{ displayFeelsLike }}{{ configStore.unitSymbol }}로 더위를 피하기 좋은 도시입니다.</p>
    <p v-else-if="selectedPurpose === '추위 피하기'" class="purpose-message">☀️ 체감온도 {{ displayFeelsLike }}{{ configStore.unitSymbol }}로 비교적 따뜻한 도시입니다.</p>
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
    <p v-if="weatherGuide" class="travel-message caution">{{ weatherGuide }}</p>
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

    <div class="card-actions">
      <el-button :type="isFavorite ? 'danger' : 'default'" size="small" @click.stop="tripDecisionStore.toggleFavorite(item.id)">
        {{ isFavorite ? '♥ 관심 취소' : '♡ 관심 여행지' }}
      </el-button>
      <el-button :type="isCompareCity ? 'primary' : 'default'" size="small" :disabled="compareDisabled" @click.stop="tripDecisionStore.toggleCompare(item.id)">
        {{ isCompareCity ? '✓ 비교 선택됨' : '⚖ 비교 도시' }}
      </el-button>
      <el-button type="primary" size="small" plain @click.stop="emit('click-detail', item)">상세보기</el-button>
    </div>
  </el-card>
</template>

<style scoped>
.weather-card { height: 100%; overflow: hidden; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); cursor: pointer; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
.weather-card :deep(.el-card__body) { display: flex; min-height: 100%; flex-direction: column; }
.weather-card:focus-visible { outline: 3px solid rgba(37, 99, 235, .42); outline-offset: 3px; }
.recommended-card { border-color: #86efac; box-shadow: inset 4px 0 #22c55e; }
.purpose-mismatch-card { background: linear-gradient(160deg, #fffbeb, #fff 62%); border-color: #fbbf24; box-shadow: inset 4px 0 #f59e0b; }
.searched-card { background: linear-gradient(160deg, #eff6ff, #fff 56%); border-color: #60a5fa; }
.selected-card, .selected-card.recommended-card, .selected-card.searched-card { background: linear-gradient(160deg, #eff6ff, #fff 72%); border: 2px solid var(--brand-600); box-shadow: 0 0 0 4px rgba(37, 99, 235, .1); }
.selected-message, .search-result { align-self: flex-start; padding: 6px 9px; margin: 0 0 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
.selected-message { color: #1e40af; background: #dbeafe; }
.search-result { color: #075985; background: #e0f2fe; }
.card-heading { display: flex; min-width: 0; align-items: flex-start; justify-content: space-between; gap: 10px; }
.card-heading > div { min-width: 0; }
.weather-card h4 { overflow: hidden; margin: 4px 0 0; color: var(--brand-950); font-size: 24px; font-weight: 850; letter-spacing: -.55px; text-overflow: ellipsis; white-space: nowrap; }
.continent { overflow: hidden; margin: 0; color: var(--text-600); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.temperature-summary { display: flex; padding: 19px 0 17px; align-items: center; border-bottom: 1px solid #e8eef5; gap: 16px; }
.temperature-summary > strong { flex: 0 0 auto; color: var(--brand-700); font-size: clamp(32px, 3vw, 39px); font-weight: 500; line-height: 1; letter-spacing: -1.8px; }
.temperature-summary span { min-width: 0; color: var(--text-800); font-size: 14px; font-weight: 750; }
.temperature-summary small { display: block; margin-top: 5px; color: var(--text-600); font-size: 11px; font-weight: 550; }
.weather-info { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 14px 0 6px; }
.weather-info p { min-width: 0; padding: 9px 10px; margin: 0; color: var(--text-700); background: var(--surface-muted); border: 1px solid #eef2f7; border-radius: 10px; font-size: 12px; line-height: 1.45; }
.weather-info p:nth-child(-n+2) { display: none; }
.weather-info p:last-child { grid-column: 1 / -1; }
.weather-info strong { color: var(--text-900); font-weight: 750; }
.purpose-message { padding: 10px 11px; margin: 9px 0 4px; color: #1e40af; background: #eff6ff; border-left: 3px solid #60a5fa; border-radius: 9px; font-size: 12px; line-height: 1.5; }
.purpose-failed { color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-left: 3px solid #f59e0b; }
.purpose-failed strong { display: block; margin-bottom: 4px; font-weight: 800; }
.purpose-failed ul { padding-left: 17px; margin: 0; }
.purpose-failed li + li { margin-top: 2px; }
.badge-area, .dust-area { display: flex; flex-wrap: wrap; gap: 6px; margin: 9px 0 0; }
.badge, .dust { padding: 5px 8px; border: 1px solid transparent; border-radius: 999px; font-size: 11px; font-weight: 750; }
.extreme, .heatwave, .very-bad { color: #991b1b; background: #fef2f2; border-color: #fecaca; }
.warning, .very-hot, .hot, .bad { color: #92400e; background: #fffbeb; border-color: #fde68a; }
.warm, .good { color: #1e40af; background: #eff6ff; border-color: #bfdbfe; }
.cool, .normal { color: #166534; background: #f0fdf4; border-color: #bbf7d0; }
.travel-message { min-height: 55px; padding: 11px 12px; margin: 12px 0 10px; border-radius: 10px; font-size: 12px; line-height: 1.55; }
.recommend { color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; }
.caution { color: #9a3412; background: #fff7ed; border: 1px solid #fed7aa; }
.card-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding-top: 6px; margin-top: auto; }
.card-actions :deep(.el-button:last-child) { grid-column: 1 / -1; }
.card-actions :deep(.el-button) { width: 100%; min-height: 36px; border-radius: 9px; font-weight: 650; }
.card-actions :deep(.el-button + .el-button) { margin-left: 0; }
@media (hover: hover) { .weather-card:hover { border-color: #bfdbfe; box-shadow: var(--shadow-md); transform: translateY(-3px); } }
@media (max-width: 420px) { .weather-card h4 { white-space: normal; } .card-actions { grid-template-columns: 1fr; } .card-actions :deep(.el-button:last-child) { grid-column: auto; } }
</style>
