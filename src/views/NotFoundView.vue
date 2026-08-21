<script setup>
// 홈 화면으로 돌아가기 위한 RouterLink 사용
import { RouterLink } from 'vue-router'
</script>

<template>
  <!-- 정의되지 않은 주소에 접근했을 때 보여줄 화면 -->
  <main>
    <h2>☀️❓ 페이지를 찾을 수 없습니다.</h2>
    <p>요청한 주소가 존재하지 않거나 이동된 페이지입니다.</p>
    <RouterLink to="/">날씨 메인으로 돌아가기</RouterLink>
  </main>
</template>