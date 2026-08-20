<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

const handleInput = (event) => { emit('update-query', event.target.value) }
</script>

<template>
  <div class="search-bar">
    <input type="text" :value="searchQuery" @input="handleInput" placeholder="검색할 도시 이름 입력" />
    <p v-if="searchQuery">검색 중인 도시: <strong>{{ searchQuery }}</strong></p>
    <p v-else>검색어가 없어 전체 도시를 표시합니다.</p>
  </div>
</template>

<style scoped>
.search-bar input { width: 100%; padding: 9px; border: 1px solid #bbb; box-sizing: border-box; }
.search-bar p { margin: 10px 0 0; color: #555; }
</style>