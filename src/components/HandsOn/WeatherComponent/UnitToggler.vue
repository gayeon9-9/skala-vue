<script setup>
import { useConfigStore } from '@/stores/configStore'
import { ElButton } from 'element-plus'
import 'element-plus/es/components/button/style/css'

// 앱 전체에서 사용하는 온도 단위 Store
const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span>온도 단위: <strong>{{ configStore.unitSymbol }}</strong></span>
    <el-button type="primary" plain size="small" @click="configStore.toggleUnit">
      {{ configStore.unit === 'celsius' ? '화씨로 변경' : '섭씨로 변경' }}
    </el-button>
  </div>
</template>

<style scoped>
.unit-toggler { display: flex; min-height: 44px; padding: 4px 5px 4px 12px; align-items: center; justify-content: center; gap: 9px; background: rgba(255, 255, 255, .76); border: 1px solid rgba(118, 151, 183, .2); border-radius: 13px; box-shadow: 0 5px 14px rgba(37, 79, 120, .06); }
.unit-toggler span { color: var(--slate-700); font-size: 13px; white-space: nowrap; }
.unit-toggler strong { color: var(--brand-700); font-size: 16px; font-weight: 850; }
.unit-toggler :deep(.el-button) { min-height: 34px; border-radius: 9px; }
</style>
