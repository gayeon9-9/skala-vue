// Vue Router 생성에 필요한 함수 가져오기
import { createRouter, createWebHistory } from 'vue-router'

// URL에 따라 어떤 페이지를 보여줄지 설정 (Lazy Loading 적용으로 실제 해당 주소에 방문했을 때 파일을 불러옴)
const routes = [
  {
    // 기본 주소: 날씨 대시보드
    path: '/',
    name: 'weather-home',
    component: () => import('../views/WeatherHomeView.vue'),
  },
  {
    // 도시 ID에 따라 다른 도시의 상세 정보를 보여주는 동적 경로
    path: '/weather/:cityId',
    name: 'weather-detail',
    component: () => import('../views/WeatherDetailView.vue'),
  },
  {
    // 사용자가 저장한 관심 여행지를 보여주는 추가 페이지
    path: '/favorites',
    name: 'weather-favorites',
    component: () => import('../views/WeatherFavoritesView.vue'),
  },
  {
    // 날씨 여행 서비스 소개 페이지
    path: '/about',
    name: 'weather-about',
    component: () => import('../views/WeatherAboutView.vue'),
  },
  {
    // 정의되지 않은 주소로 접근했을 때, 보여주는 404 페이지
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]

// 브라우저의 일반 URL 형식을 사용하는 Router 생성
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// main.js에서 사용할 수 있도록 Router 내보내기
export default router

// 
// 주소                          보여줄 화면
// /                            WeatherHomeView.vue
// /weather/city_01             WeatherDetailView.vue
// /favorites                   WeatherFavoritesView.vue
// /about                       WeatherAboutView.vue
// /존재하지않는주소                 NotFoundView.vue 

// (실행 순서 예시)
// 1. 서울 상세보기 클릭
// 2. 주소가 /weather/city_01로 변경
// 3. Router가 주소를 확인
// 4. WeatherDetailView.vue를 화면에 표시
// 5. city_01에 해당하는 서울 데이터를 찾음
// 6. 서울 날씨 정보를 상세 화면에 출력 

// API 연결 이후  Mockup대신 실제 날씨 호출 에정 