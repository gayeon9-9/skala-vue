<script setup>
defineProps({
  selectedContinent: {
    type: String,
    default: '전체',
  },
  selectedPurpose: {
    type: String,
    default: '전체',
  },
  filteredCount: {
    type: Number,
    default: 0,
  },
  displayedCount: {
    type: Number,
    default: 0,
  },
  scopeLabel: {
    type: String,
    default: '주요 도시 40곳',
  },
})

const emit = defineEmits(['update-continent', 'update-purpose'])
const continentList = [
  '전체',
  '아시아',
  '유럽',
  '북아메리카',
  '남아메리카',
  '아프리카',
  '오세아니아',
  '기타',
]
const purposeList = [
  '전체',
  '쾌적한 도시',
  '더위 피하기',
  '추위 피하기',
  '비 피하기',
  '대기질 좋은 곳',
]
const purposeDescriptions = {
  '쾌적한 도시': '비·눈 없음 · 체감 15~30℃ · PM10 60 이하 · PM2.5 35 이하',
  '더위 피하기': '비·눈 없음 · 체감 25℃ 미만 · 대기질 허용 범위',
  '추위 피하기': '비·눈 없음 · 체감 25~30℃ · 대기질 허용 범위',
  '비 피하기': '비·눈 없음 · 체감 33℃ 미만 · 대기질 허용 범위',
  '대기질 좋은 곳': '비·눈 없음 · 체감 33℃ 미만 · PM10 30 이하 · PM2.5 15 이하',
}
</script>

<template>
  <div class="travel-filter">
    <div class="filter-group">
      <p><strong>대륙 선택</strong></p>

      <div class="filter-buttons">
        <button
          v-for="continent in continentList"
          :key="continent"
          type="button"
          :class="{ active: selectedContinent === continent }"
          :aria-pressed="selectedContinent === continent"
          @click="emit('update-continent', continent)"
        >
          {{ continent }}
        </button>
      </div>
    </div>

    <div class="filter-group">
      <p><strong>여행 목적</strong></p>

      <div class="filter-buttons">
        <button
          v-for="purpose in purposeList"
          :key="purpose"
          type="button"
          :class="{ active: selectedPurpose === purpose }"
          :aria-pressed="selectedPurpose === purpose"
          @click="emit('update-purpose', purpose)"
        >
          {{ purpose }}
        </button>
      </div>
    </div>

    <div class="filter-summary">
      <p>
        현재 검색 범위: <strong>{{ scopeLabel }}</strong>
      </p>
      <p>
        선택한 대륙의 검색 결과: <strong>{{ filteredCount }}개</strong>
      </p>
      <p>
        여행 목적에 맞는 도시: <strong>{{ displayedCount }}개</strong>
      </p>
      <p v-if="selectedPurpose !== '전체'" class="criteria-note">
        적용 조건: {{ purposeDescriptions[selectedPurpose] }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.travel-filter {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
  gap: 20px 30px;
}
.filter-group {
  min-width: 0;
  margin-bottom: 4px;
}
.filter-group p {
  margin: 0 0 11px;
  color: var(--text-800);
}
.filter-group strong {
  font-weight: 800;
}
.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-buttons button {
  min-height: 42px;
  padding: 8px 14px;
  color: var(--text-700);
  background: var(--surface-muted);
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
  font-weight: 650;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}
.filter-buttons button.active {
  color: white;
  background: linear-gradient(135deg, var(--brand-700), #0369a1);
  border-color: transparent;
  box-shadow: 0 6px 14px rgba(29, 78, 216, 0.2);
}
.filter-summary {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 14px 16px;
  margin-top: 2px;
  color: var(--text-700);
  background: var(--surface-muted);
  border: 1px solid #edf1f6;
  border-radius: var(--radius-sm);
  gap: 8px 18px;
}
.filter-summary p {
  min-width: 0;
  margin: 0;
  line-height: 1.55;
}
.filter-summary strong {
  color: var(--brand-950);
  font-weight: 800;
}
.filter-summary .criteria-note {
  grid-column: 1 / -1;
  padding-top: 8px;
  color: var(--text-600);
  border-top: 1px dashed #cbd5e1;
  font-size: 12px;
}
@media (hover: hover) {
  .filter-buttons button:hover:not(.active) {
    color: var(--brand-700);
    background: #eff6ff;
    border-color: #93c5fd;
    transform: translateY(-1px);
  }
}
@media (max-width: 720px) {
  .travel-filter {
    grid-template-columns: 1fr;
  }
  .filter-summary {
    grid-column: auto;
    grid-template-columns: 1fr;
  }
  .filter-summary .criteria-note {
    grid-column: auto;
  }
}
</style>
