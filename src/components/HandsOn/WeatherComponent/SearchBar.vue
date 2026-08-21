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
.search-bar input { width: 100%; padding: 13px 15px; color: #1e293b; background: #f8fafc; border: 1px solid #dbe4ef; border-radius: 11px; box-sizing: border-box; outline: none; transition: all 0.2s ease; }
.search-bar input:focus { background: white; border-color: #60a5fa; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
.search-bar p { margin: 10px 2px 0; color: #64748b; font-size: 13px; }
</style>
