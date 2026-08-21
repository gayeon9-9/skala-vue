# 어디로 갈까?

배포 주소: [https://skala-vue-phi-two.vercel.app/](https://skala-vue-phi-two.vercel.app/)

## 프로젝트 소개

`어디로 갈까?`는 Weather Hands-on을 순서대로 진행하면서 만든 날씨 기반 여행지 추천 서비스입니다.

처음에는 서울, 수원, 부산의 날씨를 보여주는 간단한 Mockup 화면으로 시작했습니다. 이후 국내 21개, 해외 19개로 도시를 늘렸고, Composition API, 컴포넌트 분리, Router, Pinia, Axios, UI Library를 배울 때마다 이전 기능을 한 단계씩 바꿔 보았습니다. 각 단계에서 작성한 파일은 학습 과정을 확인할 수 있도록 삭제하지 않고 남겨 두었습니다.

평소 여행을 좋아해서 단순히 날씨를 조회하는 화면보다는 “오늘 어디로 가면 좋을까?”를 판단할 수 있는 서비스를 만들고 싶었습니다. 그래서 도시 검색에서 끝내지 않고 관심 여행지, 두 도시 비교, 여행 목적 필터와 시간대별 근교 추천을 연결했습니다.

이전 Hands-on 화면은 40개 Mockup 데이터를 사용하지만, 최종 Router 화면의 날씨와 대기질 값은 API로 조회합니다. 40개 도시는 최종 화면에서도 대표 도시 목록으로 남아 있지만, 기온이나 미세먼지 같은 수치는 Mockup과 섞지 않습니다.

### 과제를 진행하며 바뀐 흐름

| 단계 | 바꾸기 전 | 이 단계에서 바꾼 점 |
|---|---|---|
| Weather Mockup | 한 파일에 40개 도시와 고정 날씨 작성 | 반복해서 쓸 데이터와 화면 역할을 구분 |
| Weather Composition | 도시 검색과 추천 도시만 보기 | `computed`, `watch`, `watchEffect`로 상태 계산 |
| Weather Component | 한 컴포넌트에 있던 검색·필터·카드 | 부모와 자식 컴포넌트로 분리 |
| Weather Router | 한 화면 안에서 처리하던 상세보기 | 상세·관심·비교·소개 View로 분리 |
| Weather Store | View마다 따로 가지고 있던 상태 | 단위와 여행지 선택 과정을 Pinia로 공유 |
| Weather Axios | 고정된 Mockup 날씨 | 실제 날씨·대기질·예보 API로 전환 |
| Weather UI Library | 기본 HTML 버튼과 카드 | Element Plus와 반응형 CSS 적용 |
| Weather Deployment | 개발 서버에서만 확인 | 환경변수·Lint·Build 점검 후 Vercel에 배포 |

### 최종 화면에서 할 수 있는 일

- 현재 위치의 날씨, 대기질, 자외선, 일출·일몰 확인
- 도시 이름으로 국내외 지역을 검색하고 실제 날씨와 대기질 확인
- 주요 도시, SKALA 캠퍼스, API 검색 도시, 관심 여행지를 그룹별로 확인
- 대륙과 여행 목적에 맞는 도시 필터링
- 도시가 선택한 여행 조건에서 제외된 이유 확인
- 관심 여행지 저장과 비교 도시 선택
- 두 도시의 날씨·대기질 비교 및 선택 기준별 추천
- 사용자가 정한 국내 출발지를 기준으로 시간대별 근교 추천
- 섭씨와 화씨 단위 전환
- 도시 상세 화면에서 3시간 단위 예보와 강수확률 확인

---

## 실행 방법

프로젝트 폴더가 한 단계 더 안쪽에 있어서, `npm` 명령은 `package.json`이 있는 폴더로 이동한 뒤 실행해야 합니다.

```bash
cd /Users/gayeon/workspace/skala-vue/skala-vue
npm install
npm run dev
```

현재 폴더가 맞는지는 다음 명령으로 확인할 수 있습니다.

```bash
ls package.json
```

OpenWeatherMap API Key는 프로젝트 루트의 `.env.local`에 작성합니다.

```env
VITE_OPENWEATHER_API_KEY=발급받은_API_KEY
```

`.env.local`은 Git에 올리지 않습니다. 필요한 변수 이름만 `.env.example`에 남겼습니다. 환경변수를 새로 만들거나 값을 바꿨다면 실행 중인 개발 서버를 종료한 뒤 다시 시작해야 합니다.

```bash
npm run lint
npm run build
```

### 실행 전에 확인할 점

- 위치 기능은 `localhost` 또는 HTTPS 환경과 브라우저 위치 권한이 필요합니다.
- API 응답은 실행 시각에 따라 바뀌므로 README의 예시와 실제 기온이 다를 수 있습니다.
- 관심 여행지와 비교 도시는 Pinia 메모리에 저장되며 새로고침하면 초기화됩니다.
- API 요청 일부가 실패하면 Mockup 값으로 바꾸지 않고 조회에 성공한 도시만 표시합니다.

---

## Hands-on 1 - Weather Mockup

작업 파일: `src/components/HandsOn/WeatherMockup1.vue`

### 요구사항과 구현

#### 1.1 배열 렌더링

날씨 배열을 `ref`로 만들고 `v-for`로 도시 카드를 반복 출력했습니다. 도시마다 중복되지 않는 `id`를 작성하고 `:key="item.id"`로 연결했습니다.

처음 제공된 서울, 수원, 부산에서 시작해 국내 21개와 해외 19개, 총 40개 도시로 늘렸습니다. 검색과 필터를 여러 조건으로 확인해 보고 싶어 도시 수를 늘렸습니다.

40개 값은 실제 API 기록이 아니라 `8월 19일 15:00 KST` 상황을 가정해 만든 학습용 고정 데이터입니다. 도시별 값을 구성할 때 AI의 도움을 받았으며, 최종 API 화면의 실시간 값과는 섞지 않습니다.

#### 1.2 조건부 렌더링

`v-if`, `v-else-if`, `v-else`를 사용해 온도 상태를 일곱 단계로 나눴습니다. 기온과 체감온도 값을 함께 확인해 선선함부터 폭염 위험까지 문구와 배지 색을 다르게 표시했습니다.

미세먼지와 초미세먼지도 수치에 따라 좋음, 보통, 나쁨, 매우 나쁨으로 나눴습니다.

#### 1.3 양방향 바인딩과 한글 입력

도시 검색 input의 값과 반응형 검색어를 연결했습니다. 한글 입력 중에도 값이 화면에 바로 반영되는지 확인할 수 있도록 현재 검색어를 함께 표시했습니다.

#### 1.4 이벤트와 수식어

카드를 클릭하면 선택한 도시 정보를 하단 상태바에 표시했습니다. 상세보기 버튼에는 `@click.stop`을 사용해 버튼 클릭과 카드 선택이 동시에 실행되지 않게 했습니다.

이 단계에서는 Router를 배우기 전이므로 상세보기 결과를 `window.alert()`로 확인했습니다.

#### 1.5 직접 추가한 데이터

여행지 선택에 필요한 정보라고 생각해 다음 항목을 추가했습니다.

- 국가
- 체감온도와 습도
- 미세먼지와 초미세먼지
- 날씨와 대기질에 따른 여행 안내

이 단계의 카드에는 국가를 넣었지만 대륙 값은 아직 없었습니다. 대륙 정보와 대륙 필터는 뒤의 Component 단계에서 추가했습니다.

### 이후에 바뀐 점

Hands-on 1과 2는 각 파일 안의 배열을 그대로 보존했습니다. Component 단계에서는 같은 형태의 데이터를 `src/data/weatherData.js`로 분리해 `WeatherParent.vue`에서 사용했습니다. 최종 Router 화면은 이 Mockup 날씨가 아니라 `cityCatalog.js`의 도시 정보와 API 응답을 사용합니다.

---

## Hands-on 2 - Weather Composition

작업 파일: `src/components/HandsOn/WeatherComposition.vue`

### 요구사항과 구현

#### 2.1 반응형 상태 관리

`searchQuery`, `selectedCityInfo`, `weatherList`, `recommendedOnly`를 `ref`로 관리했습니다. 사용자가 검색하거나 추천 도시만 보기 버튼을 바꾸면 별도의 DOM 조작 없이 카드 목록이 다시 계산되도록 했습니다.

#### 2.2 computed 활용

원본 배열을 직접 수정하지 않고 `filteredWeatherList`, `recommendedCityList`, `displayedWeatherList`를 `computed`로 만들었습니다.

```text
40개 원본 도시
→ 이름 검색
→ 추천 도시만 보기 여부 확인
→ 화면에 표시할 목록 계산
```

추천 도시는 비가 오지 않고, 체감온도가 30℃ 미만이며, PM10 60 이하, PM2.5 35 이하인 도시로 정했습니다.

#### 2.3 watch와 watchEffect

`watch`로 선택 도시 문구와 `recommendedOnly`의 변화를 확인했습니다. `watchEffect`에서는 검색어를 추적하여 입력에 따라 어떤 값이 반응하는지 콘솔에서 확인했습니다.

#### 2.4 검색 결과와 빈 상태

검색 결과가 있으면 카드를 출력하고, 결과가 없으면 빈 화면 대신 안내 문구를 표시했습니다. 검색 전 안내, 카드 선택 안내, 결과 없음 안내가 서로 다른 상태라는 점을 구분했습니다.

#### 2.5 직접 추가한 Composition 기능

단순 이름 검색 외에 `추천 도시만 보기`를 추가했습니다. 검색 결과와 추천 결과를 각각 `computed`로 나누니 어느 조건에서 도시가 제외되는지 확인하기 쉬웠습니다.

### 이후에 바뀐 점

대륙과 여행 목적 필터는 이 단계가 아니라 Component 단계에서 추가했습니다. 최종 API 화면에서는 문자열 상태 대신 OpenWeatherMap의 `weather.id`와 실제 체감온도·대기질로 조건을 판단합니다.

---

## Hands-on 3 - Weather Component

작업 폴더: `src/components/HandsOn/WeatherComponent`

### 요구사항과 구현

#### 3.1 WeatherParent.vue

검색어, 선택한 도시, 대륙, 여행 목적과 필터 결과를 부모가 관리하도록 했습니다. 자식 컴포넌트가 보낸 이벤트도 부모가 받아 상태를 변경합니다.

#### 3.2 BaseDashboardCard.vue

검색, 필터, 도시 목록에서 반복되는 바깥 영역을 `BaseDashboardCard.vue`로 만들었습니다.

#### 3.3 SearchBar.vue

부모의 검색어를 props로 받고, 사용자가 입력한 값은 `update-query` 이벤트로 다시 부모에게 전달했습니다.

```text
WeatherParent의 검색어
→ props로 SearchBar에 전달
→ 사용자가 입력
→ update-query 이벤트 발생
→ WeatherParent의 검색어 변경
```

#### 3.4 WeatherCard.vue

도시 객체를 props로 받아 카드에 표시했습니다. 카드 선택은 `select-card`, 상세보기는 `click-detail` 이벤트로 부모에게 전달했습니다.

선택한 도시 ID를 부모가 저장하고 각 카드에 `isSelected`를 전달해, 현재 선택한 카드 한 장만 테두리와 배경이 바뀌도록 했습니다.

```text
WeatherCard 클릭
→ select-card 이벤트로 도시 객체 전달
→ 부모가 selectedCityId 저장
→ is-selected 다시 계산
→ 선택 카드만 강조
```

#### 3.5 scoped style

각 컴포넌트의 스타일은 `<style scoped>`에 작성했습니다. 검색창, 필터와 카드의 클래스 이름이 다른 화면에 영향을 주지 않도록 분리했습니다.

#### 3.6 slot과 부모·자식 통신

`SearchBar`와 `WeatherCard`를 `BaseDashboardCard`의 slot 안에 넣었습니다. 공통 카드 안에서 화면을 구성하지만, 실제 검색어와 선택 상태는 props와 emits를 통해 `WeatherParent`와 주고받습니다.

#### 3.7 직접 만든 TravelFilter.vue

대륙과 여행 목적 버튼을 별도 컴포넌트로 분리했습니다. 이때 Mockup 도시에 대륙 정보를 추가했고, 쾌적한 도시·더위 피하기·추위 피하기·비 피하기·대기질 좋은 곳 조건을 만들었습니다.

### 직접 추가한 기능과 바뀐 점

필터 결과가 0개일 때 카드 영역과 상태바에 서로 다른 문구가 나오는 문제를 수정했습니다. 카드 영역에는 `선택한 조건과 일치하는 도시가 없습니다.`, 상태바에는 `선택한 검색 조건에 맞는 도시가 없습니다.`를 보여주고, 카드가 있을 때만 `WeatherCard` 목록을 렌더링했습니다.

### 이후에 바뀐 점

최종 단계에서는 같은 컴포넌트 구조를 유지하면서 `CurrentLocationWeather.vue`, `LiveCityWeather.vue`, `NearbyWeatherRecommendation.vue`, `UnitToggler.vue`를 추가했습니다.

---

## Hands-on 4 - Weather Router

주요 파일:

- `src/App.vue`
- `src/router/index.js`
- `src/views/WeatherHomeView.vue`
- `src/views/WeatherDetailView.vue`
- `src/views/WeatherFavoritesView.vue`
- `src/views/WeatherCompareView.vue`
- `src/views/WeatherAboutView.vue`
- `src/views/NotFoundView.vue`

### 요구사항과 구현

#### 4.1 Vue Router 설정

각 View는 해당 주소에 방문할 때 불러오도록 Lazy Loading 방식으로 등록했습니다. 등록되지 않은 주소는 Catch-all Route를 통해 `NotFoundView.vue`로 이동합니다.

| 주소 | 연결 View | 역할 |
|---|---|---|
| `/` | `WeatherHomeView.vue` | 날씨 대시보드 |
| `/weather/:cityId` | `WeatherDetailView.vue` | 동적 도시 상세 |
| `/favorites` | `WeatherFavoritesView.vue` | 관심 여행지 |
| `/compare` | `WeatherCompareView.vue` | 도시 비교 |
| `/about` | `WeatherAboutView.vue` | 서비스 소개 |
| `/:pathMatch(.*)*` | `NotFoundView.vue` | 잘못된 주소 안내 |

#### 4.2 Navigation Bar와 RouterView

`App.vue`에 `RouterLink`와 `RouterView`를 배치했습니다. Navigation 순서는 다음과 같습니다.

```text
날씨 대시보드 | 관심 여행지 | 도시 비교 | 서비스 소개
```

브랜드 이름인 `어디로 갈까?`를 누르면 메인으로 이동하면서 Pinia와 검색 상태도 초기화하고 싶어 `import.meta.env.BASE_URL`을 사용한 일반 링크로 연결했습니다.

#### 4.3 WeatherHomeView.vue

기존 검색, 필터, 카드 선택 기능을 `/` View로 옮겼습니다. 상세보기는 `window.alert()` 대신 `router.push()`로 동적 상세 주소에 이동하도록 바꿨습니다.

대시보드에 처음 들어올 때 `?search=` Query를 검색어 초기값으로 복원합니다. 화면에서 검색어가 바뀌면 새 값을 Route Query에도 반영합니다.

#### 4.4 WeatherDetailView.vue

URL의 `:cityId`로 도시를 찾아 현재 날씨와 대기질을 표시했습니다. Axios 단계에서는 가까운 다섯 개의 3시간 예보도 추가했습니다. 상세 주소를 직접 열거나 새로고침했을 때 Store가 비어 있으면 대표 도시는 `cityCatalog.js`에서, API 검색 도시는 ID에 포함된 좌표에서 다시 복구합니다.

#### 4.5 WeatherAboutView.vue

서비스 목적, 주요 기능과 여행 추천 기준을 정리했습니다. 하단 버튼은 `router.push('/')`를 사용합니다.

#### 4.6 직접 추가한 View

관심 여행지와 도시 비교 기능을 서로 다른 View로 만들었습니다.

- `/favorites`: 관심 표시한 도시 카드 출력
- `/compare`: 선택한 두 도시의 날씨·대기질 비교

비교 화면은 처음에 40개 도시를 두 개의 `<select>`로 고르는 구조였습니다. 이후 검색 input과 select를 함께 사용했지만, 결과가 하나여도 드롭다운을 다시 눌러야 했습니다. 최종 화면에서는 도시명을 API로 검색하고 날씨 조회가 성공하면 해당 비교 칸에 바로 선택합니다.

```text
1차: 40개 목록의 select 두 개
2차: 검색으로 목록을 줄인 뒤 select에서 다시 선택
3차: Geocoding API 검색 결과를 바로 비교 도시로 선택
```

비교 기준의 기본값은 `선택 안 함`입니다. 이때는 비교표만 보여주고, 사용자가 기준을 선택했을 때만 점수와 추천 결과를 표시합니다.

### 이후에 바뀐 점

Router 과제 당시에는 Mockup 도시를 사용했습니다. Axios 적용 후에는 대표 목록 밖의 도시도 비교할 수 있도록 Geocoding, 현재 날씨와 대기질 API를 연결했습니다.

---

## Hands-on 5 - Weather Store

주요 파일:

- `src/stores/configStore.js`
- `src/stores/tripDecisionStore.js`
- `src/stores/weatherStore.js`

### 요구사항과 구현

#### configStore.js 준비

과제에서 제시한 state, getter, action을 다음과 같이 작성했습니다.

| 구분 | 이름 | 역할 |
|---|---|---|
| state | `unit` | 초기값 `celsius`, 현재 단위 저장 |
| getter | `unitSymbol` | 현재 상태에 따라 `℃` 또는 `℉` 반환 |
| action | `toggleUnit` | `celsius`와 `fahrenheit` 전환 |

#### 5.1 UnitToggler.vue

현재 단위와 전환 버튼을 보여주는 컴포넌트를 만들었습니다. 버튼을 누르면 `configStore.toggleUnit()`을 실행합니다.

#### 5.2 Navigation Bar 옆 배치

`App.vue`의 Navigation Bar 옆에 `UnitToggler.vue`를 배치했습니다. 페이지를 이동한 뒤에도 같은 Store를 사용하므로 현재 단위 설정이 유지됩니다.

#### 5.3 메인과 상세 날씨에 단위 적용

API 원본 값은 섭씨로 유지하고 카드, 현재 위치, 실시간 검색, 상세와 비교 화면의 `computed`에서 표시값만 화씨로 바꿨습니다.

#### 5.4 직접 만든 tripDecisionStore.js

단순한 여행 정보보다 여행지를 고르는 과정을 Store로 관리하고 싶어 `tripDecisionStore`를 만들었습니다.

State:

- `favoriteCityIds`: 관심 여행지 ID
- `compareCityIds`: 비교할 도시 ID, 최대 두 개
- `selectedPurpose`: 도시 비교 기준
- `apiCities`: 메인·비교 도시 검색으로 만든 도시 객체
- `dashboardSearchCityIds`: 대시보드에서 직접 검색한 도시 ID

Getters:

- 관심 여행지와 비교 도시 객체 목록
- 관심 여행지·비교 도시 개수
- 두 도시가 선택되었는지 여부
- 목적별 항목 점수와 최종 비교 결과

Actions:

- 관심 여행지 추가·취소
- 비교 도시 추가·취소와 전체 해제
- 비교 기준 변경
- API 도시 객체 추가·갱신
- 대시보드 검색 도시 등록

```text
WeatherCard의 관심 버튼
→ favoriteCityIds 변경
→ WeatherFavoritesView 갱신

WeatherCard의 비교 버튼
→ compareCityIds 변경
→ WeatherCompareView에서 사용

비교 기준 변경
→ selectedPurpose 변경
→ comparisonResult 다시 계산
```

처음에는 같은 API 도시가 이미 있으면 새 결과를 버렸습니다. 같은 도시를 다시 검색해도 오래된 날씨가 남는 문제를 확인해, 현재는 같은 ID가 있으면 새 항목을 추가하지 않고 기존 도시 객체를 최신 응답으로 교체합니다.

#### Axios 단계에서 추가한 weatherStore.js

Axios 단계에서 현재 위치, 도시 검색 결과, 대표 도시 API 값, 예보, 로딩과 오류 상태가 늘어나 별도 Store로 분리했습니다. 현재 위치, 대표 도시와 예보 결과를 `weatherStore`에 저장해 다른 View에서도 다시 사용할 수 있게 했습니다.

### 이후에 바뀐 점

처음에는 `apiCities`가 검색 도시 저장과 대시보드 둘러보기 목록 역할을 함께 했습니다. 그래서 비교 화면에서 코펜하겐을 검색해도 대시보드에 자동으로 나타났습니다. 현재는 `apiCities`에 메인·비교에서 검색한 도시 객체를 저장하고, `dashboardSearchCityIds`에는 홈의 03 검색창에서 추가한 ID만 저장합니다.

---

## Hands-on 6 - Weather Axios

주요 파일:

- `src/api/weatherApi.js`
- `src/api/travelApi.js`
- `src/stores/weatherStore.js`

### Axios 활용 준비

`npm install axios`로 Axios를 설치했습니다. OpenWeatherMap에서 발급받은 Key는 `.env.local`의 `VITE_OPENWEATHER_API_KEY`에 저장하고, API 파일에서 `import.meta.env.VITE_OPENWEATHER_API_KEY`로 읽습니다.

### 요구사항 1 - 실제 날씨 데이터 적용

`weatherApi.js`에 Axios 인스턴스를 만들고 공통 `baseURL`, API Key, 섭씨 단위와 한글 응답 설정을 작성했습니다.

최종 대시보드의 40개 대표 도시는 ID, 이름, 국가, 대륙과 API 검색어만 `cityCatalog.js`에 저장합니다. 현재 기온, 체감온도, 습도, 날씨, PM10과 PM2.5는 API 결과를 사용합니다.

실제 날씨를 적용한 화면은 다음과 같습니다.

- 현재 위치
- 대표 도시와 API 검색 도시 카드
- 도시 상세
- 관심 여행지
- 도시 비교

API 호출에 실패한 도시를 이전 Mockup 값으로 대체하면 한 카드 안에 서로 다른 시점의 값이 섞일 수 있습니다. 그래서 최종 화면에서는 성공한 도시만 표시합니다.

### 요구사항 2 - OpenWeatherMap 추가 API

현재 날씨 외에도 다음 API를 사용했습니다.

| 용도 | 경로 | 사용한 값 |
|---|---|---|
| 현재 날씨 | `/data/2.5/weather` | 기온, 체감온도, 습도, 풍속, `weather.id`와 설명 |
| 대기질 | `/data/2.5/air_pollution` | PM10, PM2.5, AQI |
| 도시명 검색 | `/geo/1.0/direct` | 국가·지역·좌표 후보, 최대 5개 |
| 현재 좌표의 지역명 | `/geo/1.0/reverse` | 도시명과 국가 |
| 단기예보 | `/data/2.5/forecast` | 3시간별 날씨, 체감온도, 강수확률 |

Geocoding API 덕분에 대표 40개 목록에 없는 도시도 검색할 수 있습니다. 메인 검색은 후보가 여러 개일 때 국가와 지역을 보고 한 곳을 고르게 했습니다. 도시 비교는 검색 과정을 짧게 만들기 위해 첫 번째 후보를 바로 선택합니다.

### 요구사항 3 - 기타 외부 API

Open-Meteo Forecast API를 연결해 현재 위치 카드에 다음 정보를 표시했습니다.

- 오늘의 최대 자외선
- 일출 시간
- 일몰 시간

여행 중 야외 활동 시간을 정할 때 날씨와 함께 볼 수 있는 정보라서 이 API를 선택했습니다. OpenWeatherMap 요청과 섞이지 않도록 `travelApi.js`로 분리했습니다. 도시 검색과 비교 검색에서도 선택한 좌표의 Open-Meteo 정보를 함께 요청하지만, 최종 홈 화면에서 야외 활동 정보가 직접 보이는 곳은 현재 위치 카드입니다.

### 비동기 처리

API Action은 `async/await`와 `try/catch/finally`로 작성했습니다.

- `try`: 요청과 Store 저장
- `catch`: Key, 위치 권한, 네트워크 오류 안내
- `finally`: 성공 여부와 관계없이 로딩 해제

함께 필요한 현재 날씨와 대기질은 `Promise.all()`로 기다렸습니다. 대표 도시처럼 일부 요청이 실패해도 성공 결과를 남겨야 할 때는 `Promise.allSettled()`을 사용했습니다.

브라우저 Geolocation은 callback 방식이라 `getCurrentPosition()`만 한 번 Promise로 감싼 뒤 Store Action에서 `await`했습니다.

### 직접 확장한 기능과 바뀐 점

#### 전 세계 도시 검색과 카드 추가

처음에는 전 세계 검색 결과가 별도 카드 한 장에만 표시됐습니다. 이 상태에서는 03 필터와 04 카드에 검색 도시가 들어오지 않았습니다. 그래서 기존 로컬 검색창을 Geocoding API 검색으로 교체했습니다.

```text
도시명 입력
→ Geocoding 후보 확인
→ 선택 좌표의 현재 날씨와 대기질 조회
→ apiCities에 객체 저장
→ dashboardSearchCityIds에 ID 저장
→ API 검색 도시 그룹의 WeatherCard로 출력
```

이제 바르셀로나나 코펜하겐처럼 대표 목록에 없는 도시도 검색, 관심 표시, 비교와 상세 이동에 사용할 수 있습니다. 같은 도시를 다시 검색하면 카드를 늘리지 않고 최신 객체로 바꿉니다.

단, OpenWeatherMap 현재 날씨 API는 `지금 쾌적한 전 세계 도시 전체`를 반환하지 않습니다. 도시명이나 좌표를 먼저 정해야 합니다. 따라서 대륙과 여행 목적 필터는 현재 불러온 도시 그룹 안에서 작동합니다.

#### 도시 그룹과 최신 날씨 갱신

도시 목록은 다음 네 그룹으로 나눴습니다.

- 주요 도시: 대표 카탈로그 40곳
- SKALA 캠퍼스: 판교, 광주, 울산
- API 검색 도시: 대시보드 03에서 직접 검색한 도시
- 관심 여행지: 사용자가 관심 표시한 도시

대표 도시는 도시마다 현재 날씨와 대기질 요청이 필요합니다. 요청이 한꺼번에 몰리지 않도록 네 도시씩 나누고 진행 개수를 표시했습니다. `최신 날씨 갱신` 버튼은 캐시를 사용하지 않고 다시 요청하도록 `force=true`를 전달합니다.

중간에는 개인적으로 가보고 싶은 도시 8곳을 고정 탭으로 만들었습니다. 하지만 전 세계 검색과 역할이 겹치고, 사용자가 직접 고르는 서비스 취지에도 맞지 않아 제거했습니다.

#### 여행 목적 결과가 0개일 때

처음에는 조건을 모두 만족한 도시가 없으면 04 카드가 사라졌습니다. 사용자는 API 검색이 실패한 것인지, 조건에서 제외된 것인지 알기 어려웠습니다.

현재는 선택한 대륙에 후보가 있지만 여행 목적을 만족한 도시만 0곳인 경우 후보 카드를 유지합니다. 각 카드에는 체감온도, 강수, PM10과 PM2.5 중 어떤 값이 기준을 벗어났는지 실제 수치와 함께 표시합니다. 선택한 대륙에 후보 자체가 없을 때만 결과 없음 안내를 표시합니다.

#### 시간대별 근교 추천

처음에는 현재 GPS 위치를 근교 추천의 출발지로 쓰려고 했습니다. 하지만 앱을 확인하는 장소와 실제 여행 출발지가 다를 수 있어, 국내 출발 도시를 직접 검색하게 바꿨습니다.

```text
국내 출발 도시 검색
→ 등록 후보와 직선거리 계산
→ 가까운 네 곳의 Forecast 조회
→ 같은 세 시간대 점수 비교
→ 시간대별 추천 도시 출력
```

이 기능은 국내 모든 도시를 자동 탐색하지 않습니다. `nearbyCities.js`에 등록한 국내 12개 후보 중 출발지에서 5km 이상 떨어진 가까운 네 곳을 고릅니다. 출발 도시까지 포함한 총 다섯 곳의 예보를 비교하며, 거리는 도로 이동시간이 아니라 위도·경도 기반 직선거리입니다.

---

## Hands-on 7 - Weather UI Library

사용한 UI 라이브러리: Element Plus

### 요구사항과 구현

Element Plus를 설치하고 필요한 컴포넌트를 각 Vue 파일에서 import했습니다.

| 컴포넌트 | 사용 위치 |
|---|---|
| `ElCard` | 날씨 카드, 현재 위치, 근교 추천, 상세 예보 |
| `ElButton` | 검색, 단위 변경, 관심·비교·상세 버튼 |
| `ElInput` | 도시 검색과 비교 도시 검색 |
| `ElSelect`, `ElOption` | 비교 기준 선택 |
| `ElAlert` | API 오류, 비교와 상세 안내 |
| `ElTag` | 실시간 상태와 예보 정보 |
| `ElEmpty` | 관심 여행지와 근교 추천의 초기 상태 |

버튼과 입력창은 Element Plus로 바꿨지만, 화면을 보여 주는 조건과 데이터 계산은 기존 `v-if`, `v-for`, `computed`, props와 emits를 그대로 사용했습니다.

### 직접 정리한 디자인과 이후 변화

처음에는 버튼과 input만 바꿔 화면 변화가 거의 없었습니다. 버튼만 바꿔서는 가독성이 좋아지지 않아 화면 배치도 함께 손봤습니다.

- Sticky Header와 현재 Route 표시
- 메인 Hero와 01~04 단계 구분
- 현재 위치와 근교 추천의 2열 배치
- 도시 검색·필터와 결과 카드 영역 분리
- 도시명과 현재 기온을 먼저 보이게 한 카드 정보 순서
- 선택, 관심, 비교, 실시간 상태의 색상 구분
- 980px 이하 2열, 700px 이하 1열 반응형 구성

공통 색상, 글자, 테두리, 그림자와 둥근 모서리는 `src/assets/base.css`의 CSS 변수로 정리했습니다. Element Plus의 기본 파란색도 이 변수와 맞춰 화면마다 색이 달라 보이지 않게 했습니다.

키보드로도 필터와 카드를 사용할 수 있게 포커스 표시와 Enter·Space 선택을 추가했습니다. 화면 움직임을 줄이는 설정을 사용하는 경우에는 Hover 이동 효과도 줄였습니다. 모바일에서는 비교표가 찌그러지지 않도록 가로 스크롤로 확인하게 했습니다.

---

## Hands-on 8 - Weather Deployment

### 요구사항과 구현

#### 8.1 ESLint 점검

`npm run lint`를 실행해 Oxlint와 ESLint 오류가 없는지 확인했습니다.

#### 8.2 API Key 환경변수 처리

실제 Key는 `.env.local`로 옮기고 `.gitignore`에서 제외했습니다. 저장소에는 값이 비어 있는 `.env.example`만 남겼으며, 배포할 때는 같은 이름의 `VITE_OPENWEATHER_API_KEY`를 Vercel 환경변수로 등록했습니다.

#### 8.3 Production Build

`npm run build`로 Vite Production Build가 완료되는지 확인했습니다. 정적 배포에서는 생성된 `dist` 폴더를 사용합니다.

#### 8.4 Hosting

GitHub의 `main` 브랜치를 Vercel과 연결해 정적 파일을 Hosting했습니다. Vue Router의 `/compare`, `/weather/:cityId` 같은 주소를 직접 열거나 새로고침해도 화면이 유지되도록 `vercel.json`에 SPA Rewrite 설정을 추가했습니다.

- 배포 주소: [https://skala-vue-phi-two.vercel.app/](https://skala-vue-phi-two.vercel.app/)
- 메인 화면에서 주요 도시 40곳의 실시간 날씨 갱신 확인
- `/compare` 직접 접속과 새로고침 확인
- 주요 도시와 API 검색 도시의 상세 페이지 및 3시간 단위 예보 확인
- 존재하지 않는 주소에서 Vue 404 화면 확인

이후에는 `main` 브랜치에 변경 내용을 Push하면 Vercel에서 새 버전을 자동으로 배포합니다.

---

## 내가 정한 추천 기준

아래 기준은 OpenWeatherMap이나 공공기관에서 제공하는 공식 여행 지수가 아닙니다. 여러 도시를 같은 규칙으로 비교하기 위해 프로젝트에서 직접 정한 값입니다.

### 여행 목적 필터

`강수 없음`은 `weather.id`가 뇌우·이슬비·비·눈 범위가 아니라는 뜻입니다.

| 여행 목적 | 체감온도 | 대기질 | 날씨 |
|---|---|---|---|
| 쾌적한 도시 | 15℃ 이상 30℃ 미만 | PM10 60 이하, PM2.5 35 이하 | 강수 없음 |
| 더위 피하기 | 25℃ 미만 | PM10 80 이하, PM2.5 35 이하 | 강수 없음 |
| 추위 피하기 | 25℃ 이상 30℃ 미만 | PM10 80 이하, PM2.5 35 이하 | 강수 없음 |
| 비 피하기 | 33℃ 미만 | PM10 80 이하, PM2.5 35 이하 | 강수 없음 |
| 대기질 좋은 곳 | 33℃ 미만 | PM10 30 이하, PM2.5 15 이하 | 강수 없음 |

### 도시 비교 가중치

두 도시의 점수는 날씨, 체감온도, 대기질, 습도를 합친 100점 기준입니다.

| 비교 기준 | 날씨 | 체감온도 | 대기질 | 습도 |
|---|---:|---:|---:|---:|
| 쾌적한 도시 | 25 | 40 | 30 | 5 |
| 더위 피하기 | 20 | 55 | 20 | 5 |
| 추위 피하기 | 20 | 55 | 20 | 5 |
| 비 피하기 | 60 | 15 | 20 | 5 |
| 대기질 좋은 곳 | 10 | 15 | 70 | 5 |

항목별 평가는 다음 구간을 사용합니다.

- 날씨: 맑음 100%, 구름 양에 따라 90~60%, 안개·먼지류 50%, 강수 20%
- 기본 체감온도: 20℃ 이상 27℃ 미만 100%, 15℃ 이상 20℃ 미만 또는 27℃ 이상 30℃ 미만 70%, 10℃ 이상 15℃ 미만 또는 30℃ 이상 33℃ 미만 30%
- 더위 피하기: 25℃ 미만 100%, 25℃ 이상 30℃ 미만 70%, 30℃ 이상 33℃ 미만 30%
- 추위 피하기: 25℃ 이상 30℃ 미만 100%, 20℃ 이상 25℃ 미만 또는 30℃ 이상 33℃ 미만 70%, 15℃ 이상 20℃ 미만 또는 33℃ 이상 35℃ 미만 30%
- PM10: 30 이하 100%, 60 이하 75%, 80 이하 50%, 150 이하 20%
- PM2.5: 15 이하 100%, 35 이하 60%, 75 이하 20%
- 습도: 40~70% 100%, 30% 이상 40% 미만 또는 70% 초과 80% 이하 50%

두 총점이 같으면 한 도시를 억지로 추천하지 않고 동점으로 표시합니다. 추천 결과에는 총점과 항목 점수, 짧은 추천 이유와 각 도시의 주의사항을 나눠 표시합니다.

### 근교 추천 감점 기준

근교 추천은 100점에서 불편 요소를 빼는 방식입니다.

- 강수확률: `pop × 45`, 최대 45점 감점
- 뇌우·이슬비·비·눈: 25점 감점
- 추위: 체감온도가 10℃보다 낮을수록 1℃당 2점, 최대 25점 감점
- 더위: 체감온도가 30℃보다 높을수록 1℃당 3점, 최대 30점 감점
- 거리: 약 15km마다 1점, 최대 15점 감점

---

## 데이터 흐름

```text
[대표 도시]
cityCatalog.js의 ID·도시명·국가·대륙·API 검색어
→ Current Weather + Air Pollution
→ weatherStore.liveWeatherByCityId
→ 대시보드·상세·관심·비교

[전 세계 직접 검색]
도시명 입력
→ Geocoding 후보
→ 현재 날씨·대기질
→ tripDecisionStore.apiCities
→ 대시보드 검색이면 dashboardSearchCityIds에도 저장
→ API 검색 도시·관심·비교·상세

[현재 위치]
사용자가 위치 확인 버튼 클릭
→ 브라우저 Geolocation
→ Current Weather + Air Pollution + Reverse Geocoding
→ Open-Meteo의 자외선·일출·일몰

[근교 추천]
국내 출발 도시 선택
→ 출발 도시와 가까운 등록 후보 네 곳
→ 같은 시간대 Forecast
→ 강수·체감온도·거리 점수
→ 시간대별 추천

[공통 날씨 판정]
OpenWeatherMap weather.id
→ weatherCondition.js
→ 카드 안내·여행 목적 필터·비교 점수·근교 점수
```

### 데이터별 역할

| 데이터 | 역할 |
|---|---|
| `weatherData.js` | 이전 Component 단계에서 사용하는 40개 Mockup 날씨 |
| `cityCatalog.js` | 대표 도시의 ID, 이름, 국가, 대륙, API 검색어 |
| `weatherStore.liveWeatherByCityId` | 대표 도시 ID별 실제 API 응답 |
| `weatherStore.dashboardCities` | 카탈로그 정보와 API 값을 합친 카드 목록 |
| `tripDecisionStore.apiCities` | 어느 화면에서든 검색한 API 도시 객체 캐시 |
| `tripDecisionStore.dashboardSearchCityIds` | 대시보드 03에서 직접 추가한 도시 범위 |

`전체` 대륙 필터는 지구상의 모든 도시라는 뜻이 아니라 현재 선택한 그룹에서 대륙 제한을 두지 않는다는 뜻입니다. 주요 도시 40곳도 전 세계 전체 데이터가 아니라 처음 둘러볼 대표 후보입니다.

처음에는 대표 도시를 60개로 늘릴까 고민했습니다. 하지만 요청 수만 늘고 목록 밖 도시 문제는 해결되지 않아 40개를 유지했습니다. 필요한 도시는 API로 직접 추가할 수 있습니다.

---

## 진행하면서 해결한 문제

### 1. `npm run dev`에서 package.json을 찾지 못함

상위 폴더 `/Users/gayeon/workspace/skala-vue`에서 실행해 `ENOENT` 오류가 발생했습니다. 실제 `package.json`이 있는 안쪽 `skala-vue` 폴더로 이동해 해결했습니다.

### 2. API Key를 작성했지만 화면이 바뀌지 않음

`.env.local` 위치와 `VITE_` 접두사를 확인하고 Vite 개발 서버를 다시 시작했습니다. Vite가 시작될 때 환경변수를 읽기 때문입니다.

### 3. 결과가 0개인데 카드 선택 안내가 남음

선택 안내와 결과 없음 상태가 같은 문구를 사용하고 있었습니다. 최종 결과 길이에 따라 카드 영역과 상태바 안내를 함께 바꾸도록 분리했습니다.

### 4. 어떤 카드를 선택했는지 알기 어려움

부모가 `selectedCityId`를 저장하고 `WeatherCard`에 `isSelected`를 전달했습니다. 선택 카드에는 테두리, 배경과 `선택한 도시입니다` 문구를 표시합니다.

### 5. 같은 도시인데 화면마다 날씨가 다름

현재 위치와 실시간 검색은 API, 대표 카드는 Mockup을 사용하고 있었습니다. 대표 도시 값은 `weatherStore.dashboardCities`를 함께 사용하고, 직접 검색한 도시는 `tripDecisionStore.apiCities`에 저장해 관심·비교 화면에서도 같은 값을 찾게 했습니다.

### 6. 40개 도시 요청이 한꺼번에 실행됨

도시마다 현재 날씨와 대기질이 필요해 요청 수가 많았습니다. 네 도시씩 `Promise.allSettled()`로 처리하고 진행 상황을 표시했습니다. 조회한 값은 Store에 저장해 필터를 바꿀 때 다시 요청하지 않습니다.

### 7. 전 세계 검색을 만들었지만 03은 여전히 40개만 검색함

처음 전 세계 검색은 별도 결과 카드에만 연결되어 있었습니다. 03 입력창 자체를 Geocoding API 검색으로 바꾸고, 선택 결과를 `API 검색 도시` 그룹과 04 카드에 넣었습니다.

### 8. 비교 검색 도시가 대시보드에 자동으로 섞임

`apiCities` 하나가 공통 캐시와 대시보드 목록 역할을 모두 맡고 있었습니다. 객체 캐시는 `apiCities`, 대시보드에서 직접 추가한 범위는 `dashboardSearchCityIds`로 분리했습니다.

### 9. 도시 비교에서 검색 후 드롭다운을 다시 눌러야 함

로컬 목록을 검색한 뒤 `<select>`에서 확정하는 두 단계 구조를 제거했습니다. API 조회 성공 결과를 바로 비교 칸에 저장하고 선택한 도시 요약을 보여줍니다.

같은 위치가 카탈로그 ID와 API 좌표 ID로 각각 생길 수 있어, ID뿐 아니라 위도와 경도도 비교해 중복 선택을 막았습니다.

### 10. API의 날씨 문구가 기존 조건과 맞지 않음

Mockup의 `흐림`과 달리 API에서는 `온흐림`, `튼구름`, `실 비` 같은 설명이 왔습니다. 문자열 비교를 중단하고 `weather.id`를 사용해 뇌우, 이슬비, 비, 눈, 맑음과 구름을 분류했습니다.

OpenWeatherMap은 `weather.id`, `description`, 예보의 `pop`을 제공합니다. `우산을 챙겨 주세요` 같은 여행 문장은 API에 없으므로 `weatherCondition.js`와 각 화면에서 직접 만들었습니다.

현재 날씨는 `현재 비가 내리고 있습니다`처럼 관측형으로, Forecast의 `pop`은 `강수확률`로 표시해 현재 상태와 예보를 구분했습니다.

### 11. 여행 목적을 선택하면 카드가 모두 사라짐

조건 결과 0개가 API 실패처럼 보였습니다. 같은 대륙의 후보 카드를 남기고 체감온도, 강수와 대기질 중 어떤 조건을 통과하지 못했는지 표시하도록 변경했습니다.

### 12. 도시 비교 결과 문장이 너무 김

긴 문단 대신 추천 도시, 두 도시 총점, 항목별 점수, 짧은 추천 이유와 주의사항으로 나눴습니다. `선택 안 함`에서는 점수를 계산하지 않고 비교표만 표시합니다.

### 13. UI Library를 적용했지만 가독성이 크게 달라지지 않음

버튼만 Element Plus로 바꾸는 것으로는 부족했습니다. Header, Hero, 01~04 단계와 카드의 정보 우선순위를 다시 배치하고 공통 CSS 변수와 반응형 스타일을 적용했습니다.

### 14. 상세 페이지를 새로고침하면 도시가 사라짐

상세 View가 Pinia에 저장된 도시만 찾고 있어 새로고침 후에는 결과가 없었습니다. `city_01` 형식은 도시 카탈로그에서 다시 조회하고, `api_위도_경도` 형식은 ID의 좌표로 날씨·대기질·지역명을 다시 불러오도록 바꿨습니다. 현재 날씨와 예보 오류도 분리해 예보만 실패한 경우에는 상세 카드가 유지됩니다.

---

## 주요 파일 구조

```text
src/
├── App.vue
├── router/
│   └── index.js
├── api/
│   ├── travelApi.js
│   └── weatherApi.js
├── data/
│   ├── cityCatalog.js
│   ├── nearbyCities.js
│   └── weatherData.js
├── stores/
│   ├── configStore.js
│   ├── tripDecisionStore.js
│   └── weatherStore.js
├── utils/
│   ├── locationMetadata.js
│   └── weatherCondition.js
├── views/
│   ├── WeatherHomeView.vue
│   ├── WeatherDetailView.vue
│   ├── WeatherFavoritesView.vue
│   ├── WeatherCompareView.vue
│   ├── WeatherAboutView.vue
│   └── NotFoundView.vue
└── components/HandsOn/WeatherComponent/
    ├── BaseDashboardCard.vue
    ├── SearchBar.vue
    ├── TravelFilter.vue
    ├── WeatherCard.vue
    ├── CurrentLocationWeather.vue
    ├── LiveCityWeather.vue
    ├── NearbyWeatherRecommendation.vue
    └── UnitToggler.vue
```

---

## 현재 구현 범위와 다음에 개선할 점

- 관심 여행지, 비교 도시와 검색 도시는 Pinia 메모리에만 저장되어 새로고침하면 초기화됩니다.
- 도시 비교 검색은 Geocoding의 첫 번째 후보를 바로 선택하므로 동명이인 후보 선택 UI가 없습니다.
- API 검색 도시의 관심·비교·상세 화면은 검색 시 저장한 객체를 사용합니다.
- 비교 화면에 처음 들어갈 때는 Store에 저장된 값을 사용하고, 이후 비교 도시 선택이 바뀌면 대표 도시의 현재값을 다시 조회합니다.
- 근교 추천은 국내 출발지와 `nearbyCities.js`의 12개 후보만 지원합니다.
- 근교 추천 거리는 실제 도로 거리나 소요 시간이 아닌 직선거리입니다.
- 근교 추천 카드의 체감온도에는 아직 전역 화씨 단위가 적용되지 않습니다.
- 별도 백엔드, localStorage, 지도, 항공권·숙박 API는 이번 범위에 포함하지 않았습니다.

다음 단계에서는 관심 여행지 영구 저장과 도시 비교의 동명이인 후보 선택을 먼저 개선할 수 있습니다.

---

## 화면 문구를 직접 수정할 위치

기능 구현이 끝난 뒤 제목이나 안내 문구를 직접 다듬을 때는 다음 파일을 확인하면 됩니다.

| 바꾸려는 내용 | 파일 |
|---|---|
| 서비스 이름, 부제와 Navigation | `src/App.vue` |
| 메인 소개, 단계 제목, 결과 없음 안내 | `src/views/WeatherHomeView.vue` |
| 카드의 온도·대기질·여행 목적 안내 | `src/components/HandsOn/WeatherComponent/WeatherCard.vue` |
| 뇌우·이슬비·비·눈 공통 문구 | `src/utils/weatherCondition.js` |
| 여행 목적별 조건 설명 | `src/components/HandsOn/WeatherComponent/TravelFilter.vue` |
| 현재 위치 안내와 오류 | `src/components/HandsOn/WeatherComponent/CurrentLocationWeather.vue`, `src/stores/weatherStore.js` |
| 전 세계 검색 안내 | `src/components/HandsOn/WeatherComponent/LiveCityWeather.vue` |
| 근교 추천 제목과 이유 | `src/components/HandsOn/WeatherComponent/NearbyWeatherRecommendation.vue` |
| 도시 비교 제목, 추천 이유와 주의사항 | `src/views/WeatherCompareView.vue` |
| 관심 여행지 안내 | `src/views/WeatherFavoritesView.vue` |
| 상세·소개·404 화면 | `src/views/WeatherDetailView.vue`, `src/views/WeatherAboutView.vue`, `src/views/NotFoundView.vue` |

문구만 고칠 때는 `weatherCondition.js`의 숫자 범위를 건드리지 않으려고 합니다. 이 숫자는 OpenWeatherMap 날씨 코드 판정에 사용됩니다.

---

## 참고 자료

- 수업 자료: `Full-stack Engineering_3.Frontend-framework_Vue.js_강병호_0807`
- 과제 예시 구조: [bottletiger/skala-vue](https://github.com/bottletiger/skala-vue)

수업 자료는 Hands-on 순서와 필수 문법을 확인하는 데 사용했습니다. 참고 저장소에서는 Router 과제의 파일 구조를 확인했고, 구현은 현재 여행 추천 주제에 맞게 작성했습니다.
