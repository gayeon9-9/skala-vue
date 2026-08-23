<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 화면에 흩어져 있던 추천 기준을 한곳에서 확인할 수 있도록 표로 정리함
const purposeCriteria = [
  {
    purpose: '쾌적한 도시',
    temperature: '체감 15℃ 이상 30℃ 미만',
    air: 'PM10 60 이하 · PM2.5 35 이하',
  },
  { purpose: '더위 피하기', temperature: '체감 25℃ 미만', air: 'PM10 80 이하 · PM2.5 35 이하' },
  {
    purpose: '추위 피하기',
    temperature: '체감 25℃ 이상 30℃ 미만',
    air: 'PM10 80 이하 · PM2.5 35 이하',
  },
  { purpose: '비 피하기', temperature: '체감 33℃ 미만', air: 'PM10 80 이하 · PM2.5 35 이하' },
  { purpose: '대기질 좋은 곳', temperature: '체감 33℃ 미만', air: 'PM10 30 이하 · PM2.5 15 이하' },
]

const compareWeights = [
  { purpose: '쾌적한 도시', weather: 25, temperature: 40, air: 30, humidity: 5 },
  { purpose: '더위 피하기', weather: 20, temperature: 55, air: 20, humidity: 5 },
  { purpose: '추위 피하기', weather: 20, temperature: 55, air: 20, humidity: 5 },
  { purpose: '비 피하기', weather: 60, temperature: 15, air: 20, humidity: 5 },
  { purpose: '대기질 좋은 곳', weather: 10, temperature: 15, air: 70, humidity: 5 },
]

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <main class="about-container">
    <header class="about-header">
      <h2>ℹ️ 서비스 소개</h2>
      <p>도시별 날씨 현황을 확인하고 여행하기 좋은 도시를 찾아보는 서비스입니다.</p>
    </header>

    <section class="about-section service-section">
      <span class="section-icon">🌍</span>
      <div>
        <h3>어떤 서비스인가요?</h3>
        <p>
          ‘어디로 갈까?’는 국내외 도시의 기온, 체감온도, 습도와 대기질을 한눈에 확인하고 사용자의
          여행 목적에 맞는 도시를 찾을 수 있도록 만든 날씨 기반 여행지 추천 서비스입니다.
        </p>
      </div>
    </section>

    <section class="feature-section">
      <h3>🧭 주요 기능</h3>
      <div class="feature-grid">
        <article>
          <strong>실시간 날씨</strong><span>현재 위치와 원하는 도시의 날씨 확인</span>
        </article>
        <article>
          <strong>여행지 찾기</strong><span>대륙과 여행 목적에 맞춰 도시 탐색</span>
        </article>
        <article><strong>도시 비교</strong><span>두 도시의 날씨와 대기질 비교</span></article>
        <article><strong>관심 여행지</strong><span>마음에 드는 도시를 한곳에 보관</span></article>
      </div>
    </section>

    <section class="about-section">
      <h3>✈️ 여행 도시 추천 기준</h3>
      <p>
        단순히 날씨가 맑은지만 확인하지 않고 체감온도, 비 여부, 미세먼지와 초미세먼지를 함께
        확인하여 여행 조건에 맞는 도시를 표시합니다.
      </p>
      <p>같은 도시라도 사용자가 선택한 여행 목적에 따라 검색 결과가 달라질 수 있습니다.</p>

      <h4>여행 목적별 필터 조건</h4>
      <p class="criteria-note">모든 목적은 공통으로 비·눈이 내리지 않는 도시만 통과합니다.</p>
      <div class="criteria-table">
        <table>
          <thead>
            <tr>
              <th>여행 목적</th>
              <th>체감온도</th>
              <th>대기질</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="criteria in purposeCriteria" :key="criteria.purpose">
              <td>{{ criteria.purpose }}</td>
              <td>{{ criteria.temperature }}</td>
              <td>{{ criteria.air }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>도시 비교 가중치 (100점 기준)</h4>
      <p class="criteria-note">선택한 기준에서 중요한 항목에 더 높은 배점을 둡니다.</p>
      <div class="criteria-table">
        <table>
          <thead>
            <tr>
              <th>비교 기준</th>
              <th>날씨</th>
              <th>체감온도</th>
              <th>대기질</th>
              <th>습도</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="weight in compareWeights" :key="weight.purpose">
              <td>{{ weight.purpose }}</td>
              <td>{{ weight.weather }}</td>
              <td>{{ weight.temperature }}</td>
              <td>{{ weight.air }}</td>
              <td>{{ weight.humidity }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="criteria-note">
        위 기준은 공식 여행 지수가 아니라, 여러 도시를 같은 규칙으로 비교하기 위해 이 프로젝트에서
        직접 정한 값입니다.
      </p>
    </section>

    <section class="about-section data-notice">
      <h3>📌 데이터 안내</h3>
      <p>
        현재 날씨와 대기질은 OpenWeatherMap API에서 받아오며, 위치 기반 추천에는 시간대별 예보를
        함께 사용합니다. API 조회에 성공한 도시만 화면에 표시하고, 실패한 도시는 안내 문구로
        구분합니다.
      </p>
    </section>

    <button class="home-button" @click="goHome">← 날씨 대시보드로 돌아가기</button>
  </main>
</template>

<style scoped>
.about-section h4 {
  margin: 24px 0 8px;
  color: var(--brand-900);
  font-size: 16px;
  font-weight: 800;
}

.criteria-note {
  margin: 0 0 10px;
  color: var(--text-600);
  font-size: 13px;
}

.criteria-table {
  margin-bottom: 8px;
  overflow-x: auto;
}

.criteria-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.criteria-table th,
.criteria-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.criteria-table thead th {
  color: var(--brand-900);
  background: var(--surface-muted);
  font-weight: 800;
}

.about-container {
  max-width: 980px;
  margin: 0 auto;
  color: var(--text-800);
}

.about-header {
  padding: 8px 4px 24px;
}

.about-header h2 {
  margin: 0 0 8px;
  color: var(--brand-950);
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 850;
  letter-spacing: -1px;
  line-height: 1.25;
}

.about-header p {
  margin: 0;
  color: var(--text-600);
  font-size: 16px;
}

.about-section,
.feature-section {
  padding: 26px;
  margin-bottom: 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.service-section {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--brand-50), var(--surface));
  border-color: var(--brand-100);
}

.section-icon {
  display: grid;
  flex: 0 0 58px;
  height: 58px;
  place-items: center;
  background: var(--surface);
  border: 1px solid var(--brand-100);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  font-size: 28px;
}

.about-section h3,
.feature-section h3 {
  margin: 0 0 10px;
  color: var(--brand-900);
  font-size: 20px;
}

.about-section p {
  margin: 6px 0;
  color: var(--text-700);
  line-height: 1.8;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.feature-grid article {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  background: var(--surface-muted);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.feature-grid article:hover {
  border-color: var(--brand-100);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.feature-grid strong {
  color: var(--brand-700);
  font-size: 16px;
}

.feature-grid span {
  color: var(--text-600);
  font-size: 14px;
}

.data-notice {
  background: linear-gradient(135deg, var(--surface-muted), var(--surface));
  border-left: 4px solid var(--brand-500);
}

.home-button {
  padding: 12px 18px;
  color: white;
  background: var(--brand-900);
  border: 1px solid var(--brand-900);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  font-weight: 750;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.home-button:hover {
  background: var(--brand-700);
  border-color: var(--brand-700);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.home-button:focus-visible {
  outline: 3px solid rgba(39, 133, 211, 0.36);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .about-section,
  .feature-section {
    padding: 20px;
    border-radius: var(--radius-md);
  }

  .service-section {
    flex-direction: column;
    gap: 14px;
  }

  .home-button {
    width: 100%;
  }
}
</style>
