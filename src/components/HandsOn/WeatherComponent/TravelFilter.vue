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
})

const emit = defineEmits(['update-continent', 'update-purpose'])
const continentList = ['전체', '아시아', '유럽', '북아메리카', '오세아니아']
const purposeList = ['전체', '쾌적한 도시', '더위 피하기', '추위 피하기', '비 피하기', '대기질 좋은 곳']
</script>

<template>
  <div class="travel-filter">
    <div class="filter-group">
      <p><strong>대륙 선택</strong></p>

      <div class="filter-buttons">
        <button
          v-for="continent in continentList"
          :key="continent"
          :class="{ active: selectedContinent === continent }"
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
          :class="{ active: selectedPurpose === purpose }"
          @click="emit('update-purpose', purpose)"
        >
          {{ purpose }}
        </button>
      </div>
    </div>

    <div class="filter-summary">
      <p>선택한 대륙의 검색 결과: <strong>{{ filteredCount }}개</strong></p>
      <p>여행 목적에 맞는 도시: <strong>{{ displayedCount }}개</strong></p>
    </div>
  </div>
</template>

<style scoped>
.filter-group { margin-bottom: 14px; }
.filter-group p { margin: 0 0 7px; }
.filter-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
.filter-buttons button { padding: 7px 10px; background-color: white; border: 1px solid #999; border-radius: 4px; cursor: pointer; }
.filter-buttons button.active { color: white; background-color: #1976d2; border-color: #1976d2; }
.filter-summary { margin-top: 12px; color: #555; }
.filter-summary p { margin: 5px 0; }
</style>