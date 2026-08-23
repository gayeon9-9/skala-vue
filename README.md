# 어디로 갈까? — 날씨 기반 여행지 추천 서비스
- 배포 주소: https://skala-vue-phi-two.vercel.app/
- 저장소: https://github.com/gayeon9-9/skala-vue

`어디로 갈까?`는
Vue.js 수업의 Weather Hands-on 8단계를 순서대로 하면서 만들었으며,
여행이나 외출 시 그때그때의 날씨 정보를 확인하고 최적의 장소로 여행갈 수 있도록 하는 날씨 기반 여행지 추천 서비스입니다. 

과제 예시는 서울, 수원, 부산 세 도시의 날씨를 보여주는 화면이었는데, 평소에 여행을 좋아해서 그냥 날씨만 보는 것보다 날씨에 따라 "오늘 어디로 가면 좋을까?"를 정할 수 있는 화면을 만들어보고 싶었습니다. 그래서 단계마다 요구사항을 먼저 작성하고, 그다음에 여행 목적별로 선택할 수 있는 필터나 도시 비교, 근교 추천 같은 걸 하나씩 붙여서 구현했습니다.
단계별로 만든 파일은 지우지 않고 참고용으로 두었습니다. 1~3단계는 고정 데이터를 쓰고, 최종 화면은 API로 날씨 정보를 받아와서 사용했습니다.

## 실행 방법
```bash

npm install

npm run dev
```

API Key는 프로젝트 루트에 `.env.local` 파일을 만들어서 넣습니다. 해당 파일은 Git에 안 올렸고, 변수 이름만 `.env.example`에 남겨뒀습니다.

```env

VITE_OPENWEATHER_API_KEY=발급받은_API_KEY

```

<실행하기 전 확인사항 정리>

- 위치 기능은 `localhost`나 HTTPS에서만 되고, 브라우저 위치 권한도 필요합니다.
- 날씨는 실행하는 시각에 따라 달라져서 README에 적힌 예시랑 실제 값은 다를 수 있습니다.
- 관심 여행지는 새로고침해도 남지만, 비교 도시랑 검색 도시는 초기화됩니다.
- 일부 도시 조회가 실패하면 옛날 값으로 채우지 않고 성공한 도시만 보여줍니다.
----

## 1. Weather Mockup

작업 파일: `src/components/HandsOn/WeatherMockup1.vue`

### 1.1 배열 렌더링 (v-for)
`ref([])`로 날씨 배열을 만들고 `v-for="item in weatherList"`로 카드를 반복해서 넣었습니다. `:key`에는 `city_01` 같은 형식으로 도시마다 겹치지 않는 ID를 넣었습니다. (1~40)
그리고 예시의 3개의 도시에서 두니까 여행지를 고르는 느낌이 날 수 있도록 국내 21개, 해외 19개 총 40개로 늘렸습니다. 이 40개 값은 `8월 19일 15:00 KST`를 당시 AI의 검색기반 서비스를 사용하여 채워 넣은 고정 데이터입니다. 나중에 API 붙인 화면의 실시간 값이랑은 섞지 않았습니다.

### 1.2 조건부 렌더링 (v-if)
요구사항은 25도 기준으로 두 단계만 나누는 거였는데, `v-if` / `v-else-if` / `v-else`를 써서 일곱 단계로 나눴습니다.
극심한 폭염 위험(체감 38℃ 이상이거나 기온 39℃ 이상) → 폭염경보 기준(35℃) → 폭염주의보 기준(33℃) → 매우 더움(30℃) → 더움(28℃) → 따뜻함(25℃) → 비교적 선선함 순서입니다.
이때 단순히 단계만 늘린 게 아니라 기온의 기준을 체감온도로 잡았습니다. 여행을 갈지 말지 혹은 어디로 갈지 정할 때는 실제로 느껴지는 온도가 더 중요하다고 생각했기에 체감온도로 설정했습니다. 미세먼지랑 초미세먼지도 좋음 / 보통 / 나쁨 / 매우 나쁨 네 단계로 나눠서 배지로 표시했으며, 날씨 상태에 따라 여행 안내 문구도 다르게 넣었습니다.

### 1.3 양방향 바인딩과 한글 처리 (:value, @input)
검색 input에 `v-model` 대신 `:value="searchQuery"`랑 `@input="handleInput"`을 썼습니다. `handleInput`에서 `event.target.value`를 받아서 `searchQuery`에 넣습니다.
`v-model`을 쓰면 한글을 조합하는 중에는 값이 바로 들어오지 않는데, `@input`을 사용하면 조합 중 에도 값이 바로 들어옵니다. 화면에서 실제로 되는지 보기 위해 화면에 `검색 중인 도시: {{ searchQuery }}`를 같이 띄워두었습니다.



추가로 검색어랑 도시명이 딱 맞으면 그 카드에 `searched-card` 클래스랑 "검색한 도시입니다" 문구가 붙게 `:class`를 바인딩했습니다.

### 1.4 이벤트와 수식어
카드를 클릭하면 `selectCity(item)`이 실행되면서 아래 상태바에 "{국가} {도시} 도시를 선택했습니다."가 뜹니다.
상세보기 버튼에서 `.stop` 없이 눌러보니 버튼 클릭이 부모 카드까지 전달되어 상태바 문구까지 같이 바뀌어서 해당 내용 확인 후 `@click.stop`을 붙였습니다. 
`window.alert`에는 도시명만 넣지 않고 날씨, 기온, 체감온도, 습도, 미세먼지, 초미세먼지를 줄바꿈으로 나눠서 넣었습니다.

### 1.5 직접 추가한 데이터
예시 데이터는 `id / name / temp / status` 네 개였는데, 여행지를 고르려면 이것만으로는 부족할 것 같아서 항목을 더 넣었습니다.

| 추가한 항목 | 넣은 이유 |
|---|---|
| `country` | 해외 도시를 넣다 보니 어느 나라인지 구분이 필요하여 추가 |
| `feelsLike` | 단순 기온보다는 여행에 있어 체감온도가 더 중요할 것으로 생각되어 추가|
| `humidity` | 같은 온도라도 습도에 따라 다르기에 보다 상세한 현황을 구현하고자 추가 |
| `pm10`, `pm25` | 야외 일정을 행하는 기준으로 추가 |

(이 단계 카드에는 아직 국가만 있고 대륙(`continent`) 값은 아직 없는데, 대륙은 3단계에서 필터를 만들면서 추가하게 됐습니다.)

---
## 2. Weather Composition
작업 파일: `src/components/HandsOn/WeatherComposition.vue`

### 2.1 반응형 상태 관리
`searchQuery`, `selectedCityInfo`, `weatherList`를 `ref`로 만들었습니다. 나중에 필터가 붙을 걸 예상하여 원본 배열 `weatherList`는 직접 건드리지 않기로 했습니다.

### 2.2 computed로 검색 도시 계산
filteredWeatherList를 computed로 만들었습니다. 검색어를 trim()으로 다듬고 아무것도 안 남으면(빈 문자열이거나 공백만 입력한 경우) 40개 전체를 보여주고, 글자가 남아있으면 도시 이름에 해당 글자가 포함된 것만 걸러냅니다. trim()을 안 넣으면 스페이스바만 눌러도 “검색어가 있다”고 인식돼서 결과가 0개로 나오는데, 사용자 입장에서는 아무것도 안 쳤는데 검색 결과가 없다고 나오면 이상해 보일 것 같아서 추가했습니다.

### 2.3 watch와 watchEffect
watch(selectedCityInfo, ...)로 상태바 문구가 바뀔 때 이전 값과 새 값을 콘솔에 찍었습니다.
watchEffect는 watch처럼 감시할 대상을 따로 지정하지 않지만, 함수 안에서 searchQuery.value를 참조하기만 하면, Vue가 그 안에서 어떤 반응형 값을 쓰는지 자동으로 추적해서 그 값이 바뀔 때마다 실행해주기에 검색어를 입력할 때마다 로그가 찍힘을 획인했습미다. watch는 감시 대상을 명시적으로 지정하고 이전 값도 받을 수 있는 반면, watchEffect는 대상 지정 없이 자동으로 추적한다는 차이를 콘솔로 비교해 보았습니다.

### 2.4 검색 결과 표시
상태를 3개로 나눠서 문구를 다르게 했습니다.
- 검색어가 없을 때: 40개 전부 + "검색어가 없어 전체 도시를 표시합니다."
- 검색 결과가 있을 때: 해당 카드만
- 결과가 없을 때: 카드 대신 안내 문구

### 2.5 직접 추가한 상태와 computed, watcher
- **상태**: `recommendedOnly` (추천 도시만 보기)
- **computed 2개**: `recommendedCityList`(검색 결과 중 추천 조건 통과), `displayedWeatherList`(최종 출력 목록)
- **watcher**: `watch(recommendedOnly, ...)`로 토글 변화 확인

(한 번에 다 계산하지 않고 단계별로 나눈 건, 어느 조건에서 도시가 걸러지는지 보기 위함입니다.)

```text
40개 원본 → filteredWeatherList (이름 검색) → recommendedCityList (추천 조건) → displayedWeatherList (최종 출력)
```
그래서 검색 영역에 "검색된 도시 N개 / 그중 추천 도시 M개"를 같이 띄웠습니다. 추천 조건은 비 X, 체감온도 30℃ 미만, PM10 60 이하, PM2.5 35 이하로 설정했습니다.
---

## 3. Weather Component
작업 폴더: `src/components/HandsOn/WeatherComponent/`
요구사항 : 기능 픽스 & 파일만 나누기 
- 2단계 화면이랑 똑같이 동작하는지 계속 확인하면서 옮겼습니다.


### 3.1 WeatherParent.vue
3.1 WeatherParent.vue
검색어, 선택한 도시, 선택 도시 ID, 대륙, 여행 목적 같은 상태는 전부 부모가 가지고 있습니다. 자식이 보낸 이벤트를 받아서 상태를 바꾸는 것도 부모에서 합니다.
2단계까지는 40개 도시 배열이 컴포넌트 파일 안에 그대로 있었는데, 이 단계에서 컴포넌트를 4개로 나누다 보니 이 배열을 어느 컴포넌트에 둬야 할지 애매해졌습니다. WeatherParent.vue 안에 그냥 두면 검색이나 상태 관리 같은 로직이랑 고정된 도시 데이터가 계속 한 파일에 섞여 있게 될 것 같아서, 배열 자체를 src/data/weatherData.js로 따로 뺐습니다. 컴포넌트는 화면을 그리는 역할만 하고, 데이터는 별도 파일에 값으로만 두는 식으로 나눴습니다.

필터를 단계별로 쌓아 올렸습니다.

weatherList (40개 원본)
→ filteredWeatherList (도시 이름 검색)
→ continentWeatherList (대륙 선택)
→ displayedWeatherList (여행 목적 선택)

2단계에서 검색만 있을 때는 computed 하나로 충분했는데, 대륙이랑 여행 목적이 추가되면서 조건이 3개로 늘었고, 이때 한 computed에 전부 넣지 않고 이전 결과를 다음 computed가 이어받게 만들어서 “대륙 필터까지 통과한 도시가 몇 개인지”랑 “여행 목적까지 통과한 도시가 몇 개인지”를 따로 셀 수 있게 했습니다. (이 개수는 나중에 TravelFilter에 filtered-count, displayed-count로 그대로 내려주게 했습니다.)
BaseDashboardCard는 도시 검색, 대륙·목적 필터, 카드 목록을 각각 감싸서 3개의 공통 카드 박스 안에 넣었습니다.

(대륙과 여행 목적도 watch로 값이 바뀔 때마다 콘솔에 출력하면서, 필터가 몇 단계로 겹쳐 있는지 확인해봤습니다.)

### 3.2 BaseDashboardCard.vue
검색 박스랑 목록 박스에서 똑같이 반복되던 테두리, 여백, 그림자를 공통 컴포넌트로 빼고 안에 <slot></slot>을 넣었습니다. 이 컴포넌트 자체는 <slot>말고는 다른 내용이 없고, 디자인만 가지고 있는 상태입니다.

안쪽 h3 스타일은 :deep(h3)로 지정했습니다. 처음에 그냥 썼을 때 slot으로 들어온 부모 쪽 제목에 스타일 적용이 안된걸 보고 scoped 스타일이 slot 내용까지는 적용되지 않는다는 걸 확인했습니다. WeatherParent.vue에서 이 컴포넌트를 3번 쓰면서 <h3>🔍 도시 검색</h3>, <h3>여행 조건 선택</h3>, <h3>✈️ 국내, 해외 도시별 여행 날씨</h3>처럼 안에 넣는 제목만 다르게 했습니다.
(:deep(h3) 없을 경우 : 위의 3개의 제목이 전부 스타일 없이 나옴)

### 3.3 SearchBar.vue
부모 검색어를 defineProps로 받아서 :value에 넣고, 입력이 생기면 emit('update-query', event.target.value)으로 부모에게 올려보냅니다. props는 읽기 전용이라 자식이 직접 못 바꾸니까, 값은 무조건 부모를 거쳐서 바꿀 수 있도록 했습니다.
WeatherParent의 searchQuery → props → SearchBar 입력 → update-query emit → 부모가 값 변경 → 다시 props로 내려옴
1단계에서 만들었던 “검색 중인 도시: {{ searchQuery }}” 안내 문구를 그대로 옮겨서, 검색어가 없을 때 “검색어가 없어 전체 도시를 표시합니다”문구가 나오게 했습니다.

### 3.4 WeatherCard.vue
도시 객체를 props로 받아서 카드를 그립니다. 카드 클릭은 select-card, 상세보기는 click-detail로 부모에 올립니다.
카드를 따로 떼고 나니 어느 카드를 선택했는지 화면에서 확인이 어려워  isSelected props를 하나 더 만들었습니다. 부모가 selectedCityId를 갖고 있고, 각 카드에 선택된 카드를 내려주게 했습니다. 선택된 카드 한 장만 테두리랑 배경이 바뀝니다.
searchQuery, recommended도 같이 props로 받아서 검색어랑 일치하는 카드, 추천 조건을 만족하는 카드에는 각각 다른 배경색이 오게 했습니다. 한 카드에 여러 조건(선택됨 / 검색됨 / 추천됨)이 동시에 맞을 수도 있어서, :class 바인딩에 객체 형태로 조건을 다 넣고 CSS에서 우선순위를 정했습니다.

### 3.5 style scoped
4개 컴포넌트 전부 `<style scoped>`로 스타일을 나눴습니다. 검색창이랑 필터, 카드가 같은 클래스명을 사용해도 서로 안 건드립니다.

### 3.6 slot과 부모·자식 통신
SearchBar, WeatherCard는 BaseDashboardCard의 slot 안에 들어가 있어서 겉보기엔 자식 안에 있는 것 같지만, 스크립트는 WeatherParent 쪽에서 평가되기 때문에 BaseDashboardCard를 거치지 않고 부모랑 직접 props/emits로 주고받습니다.

실제로 확인해보면, WeatherParent.vue 템플릿에서 <BaseDashboardCard><SearchBar :search-query="searchQuery" @update-query="updateSearchQuery" /></BaseDashboardCard>처럼 SearchBar에 props랑 이벤트를 바로 붙입니다. BaseDashboardCard는 이 바인딩에 전혀 관여하지 않고, 그냥 감싸는 박스 역할만 합니다.

### 3.7 (추가) 직접 만든 컴포넌트 — TravelFilter.vue
대륙 선택이랑 여행 목적 선택을 따로 컴포넌트로 뺐습니다.
추가 컴포넌트를 만들며 1단계 데이터에 continent 값을 추가했습니다. (국가만 있으면 “유럽(대륙) 도시만 보기”가 검색이 불가)
대륙은 전체, 아시아, 유럽, 북아메리카, 남아메리카, 아프리카, 오세아니아, 기타 8종, 여행 목적은 전체/쾌적한 도시/더위 피하기/추위 피하기/비 피하기/대기질 좋은 곳 6종으로 만들고 각각 버튼 목록으로 뒀습니다. 선택 상태는 부모가 갖고 있는 selectedContinent, selectedPurpose를 props로 받아서 active 클래스로 표시합니다.
버튼만 있으면 왜 걸러졌는지 알 수 없어서, 목적마다 조건 설명을 객체로 미리 만들어뒀습니다.


const purposeDescriptions = {
  '쾌적한 도시': '비·눈 없음 · 체감 15~30℃ · PM10 60 이하 · PM2.5 35 이하',
  '더위 피하기': '비·눈 없음 · 체감 25℃ 미만 · 대기질 허용 범위',
  ...
}

선택한 목적이 있으면 해당 설명을 필터 아래에 그대로 띄워서 보어주며, 여기에 더하여 filteredCount(대륙까지 통과한 개수), displayedCount(목적까지 통과한 개수)도 props로 받아서 “선택한 대륙의 검색 결과: N개 / 여행 목적에 맞는 도시: M개”를 같이 보여줬습니다. 이 두 숫자가 3.1에서 만든 continentWeatherList.length, displayedWeatherList.length입니다.
버튼에는 :aria-pressed를 넣어서 선택 상태가 스크린리더에도 전달되게 했습니다.

---

## 4. Weather Router
주요 파일: `src/router/index.js`, `src/App.vue`, `src/views/*`

### 4.1 Router 설정 (지연 로딩과 Catch-all)
View를 전부 `component: () => import('../views/...')` 형태로 등록하여 처음부터 다 불러오는 것이 아니라 해당 주소에 갈 때 가져오게 했습니다.
`path: '/:pathMatch(.*)*'`로 Catch-all을 만들어서 `NotFoundView.vue`에 연결했습니다. (순서가 중요하므로 배열 맨 마지막에 둠)

| 주소 | View | 역할 |
|---|---|---|
| `/` | WeatherHomeView | 날씨 대시보드 |
| `/weather/:cityId` | WeatherDetailView | 도시 상세 |
| `/favorites` | WeatherFavoritesView | 관심 여행지 (추가) |
| `/compare` | WeatherCompareView | 도시 비교 (추가) |
| `/about` | WeatherAboutView | 서비스 소개 |
| `/:pathMatch(.*)*` | NotFoundView | 404 |

### 4.2 App.vue의 Navigation과 RouterView
`RouterLink` 4개(날씨 대시보드 / 관심 여행지 / 도시 비교 / 서비스 소개)랑 `RouterView`를 배치했습니다.
브랜드명 "어디로 갈까?"는 `RouterLink`가 아니라 `import.meta.env.BASE_URL`을 쓴 일반 링크로 걸었습니다. `RouterLink`로 `/`에 가면 SPA 내부 이동이라 Pinia 상태랑 검색어가 그대로 남지만, 보통 로고를 누르는 것은 메인화면으로 새로고침 할 때 누르는 것이기에, 새로고침이 되도록 설정했습니다.

### 4.3 WeatherHomeView.vue
`WeatherParent.vue`에 있던 검색, 필터, 카드 기능을 `/` View로 옮겼습니다.

**1.4에서 작성한 `window.alert()` 제거** 대신 `router.push('/weather/' + city.id)`를 통해 상세 주소로 이동합니다. alert에 담았던 체감온도, 습도, 미세먼지 정보는 버리지 않고 상세 화면 항목으로 옮겼습니다. 그리고 대시보드에 들어올 때 `?search=` 값이 있으면 검색어 초기값으로 넣고, 검색어가 바뀌면 `watch`로 주소도 같이 바꿔줍니다. 검색한 상태 그대로 주소를 공유할 수 있으면 좋을 것 같아서 넣었습니다.

### 4.4 WeatherDetailView.vue
주소의 `:cityId`로 도시를 찾아서 상세 정보를 보여줍니다. Router 과제 때는 고정 데이터에서 찾았습니다.

**문제 발생** 상세 주소를 직접 열거나 새로고침하면 빈 화면 발생함.
도시 객체를 메모리에서만 찾고 있어서, 홈을 안 거치고 들어오면 찾을 게 없어서 해당 문제가 발생하였음. 그래서 ID 형식을 두 가지로 나누고 각각 복구 시도
- `city_01` 형식이면 `cityCatalog.js`에서 다시 찾기
- `api_위도_경도` 형식이면 ID에 들어있는 좌표로 날씨, 대기질, 지역명을 다시 요청
Axios 단계 이후로는 가까운 3시간 예보 다섯 개도 같이 보여줌. 현재 날씨 오류랑 예보 오류를 따로 처리해서, 예보만 실패하면 상세 카드는 그대로 남도록 함

### 4.5 WeatherAboutView.vue
서비스 목적이랑 주요 기능, 여행 추천 기준을 정리하고 아래에 `router.push('/')` 버튼을 넣었습니다.
직접 정한 여행 목적별 조건이랑 비교 가중치도 `v-for`로 표에 넣었습니다. README에만 써두면 화면에서는 기준이 안 보여서, 서비스 안에서도 볼 수 있게 구성했습니다.

### 4.6 직접 추가한 View
- **`/favorites`**: 관심 표시한 도시만 모아서 보여줍니다. (관심목록에서 고민중인 여행지를 쉽게 비교해보며 선택할 수 있게함)
- **`/compare`**: 두 도시 날씨랑 대기질을 표로 비교하고 기준을 고르면 점수랑 추천 결과를 보여줍니다.

비교 화면에서 도시를 고르는 방식은 세 번 바꿨습니다.

```text

- 1차: 40개 목록을 <select> 두 개로 고르기
- 2차: 검색으로 목록을 줄인 다음 <select>에서 다시 고르기
- 3차: Geocoding API로 검색해서 조회에 성공하면 바로 비교 칸에 넣기

```
2차까지는 결과가 하나만 남아도 드롭다운을 또 눌러야 해서 손이 두 번 가는 번거로움이 존재하여 3차에서 보완했습니다.
비교 기준 기본값은 `선택 안 함`이고, 이때는 점수는 매기지 않고 비교표만 보여주도록 했습니다. (기준을 선택하지 않고 단순히 날씨만 보고 비교가능 하도록 함)

---

## 5. Weather Store
주요 파일: `src/stores/configStore.js`, `src/stores/tripDecisionStore.js`, `src/stores/weatherStore.js`

### configStore.js
과제에서 제시한 대로 만들었습니다.

| 구분 | 이름 | 내용 |
|---|---|---|
| state | `unit` | 초기값 `celsius` |
| getters | `unitSymbol` | 상태에 따라 `℃` / `℉` |
| actions | `toggleUnit` | 두 단위 전환 |

### 5.1 UnitToggler.vue
현재 단위를 보여주고 버튼을 누르면 `toggleUnit()`을 실행하는 컴포넌트를 만들었습니다. 버튼 문구도 상태에 따라 "화씨로 변경" / "섭씨로 변경"으로 바뀝니다.

### 5.2 Navigation Bar 옆에 배치
`App.vue`의 Navigation 옆에 뒀습니다. Store를 쓰니까 페이지를 옮겨도 설정이 유지됩니다.

### 5.3 메인과 상세에 단위 적용
**원본 값은 섭씨 그대로 두고** 각 화면의 `computed`에서 표시할 값만 바꿨습니다. 원본을 바꿔버리면 토글을 여러 번 눌렀을 때 변환이 계속 쌓일 수 있어서입니다.
카드, 현재 위치, 실시간 검색, 상세, 비교 화면에 전부 적용했습니다.

### 5.4 (추가) 직접 만든 Store — tripDecisionStore.js
온도 단위 같은 단순한 설정보다는 여행지를 고르는 과정 자체를 편리하게 하도록 Store 추가했습니다. 
- WeatherCard의 관심 및 비교 버튼을 누르면 상태가 바뀌고 /favorites, /compare 화면이 이 Store를 읽고 화면을 보여줌
- 두 도시를 비교할 때 점수 계산(comparisonResult)도 여기서 진행함

**State**
- `favoriteCityIds`: 관심 여행지 ID
- `compareCityIds`: 비교 도시 ID, 최대 두 개
- `selectedPurpose`: 비교 기준
- `apiCities`: 검색으로 만들어진 도시 객체
- `dashboardSearchCityIds`: 대시보드에서 직접 검색해서 추가한 도시 ID

**Getters**: 관심/비교 도시 목록, 개수, 두 도시가 다 골라졌는지, 목적별 점수와 최종 결과
**Actions**: 관심 추가·취소, 비교 추가·취소·해제, 기준 변경, API 도시 갱신, 검색 도시 등록

```text

관심 버튼 → favoriteCityIds 변경 → /favorites 갱신
비교 버튼 → compareCityIds 변경 → /compare에서 사용
기준 변경 → selectedPurpose 변경 → comparisonResult 재계산

```
이 Store를 만들면서 **4.6에서 만든 두 View가 각자 갖고 있던 상태를 없앴습니다.** 홈에서 관심을 눌러도 `/favorites`로 가면 사라지던 게 해당 부분에서 해결되었습니다. Axios 단계에서는 현재 위치, 검색 결과, 대표 도시 API 값, 예보, 로딩, 오류 상태까지 늘어나서 `weatherStore.js`를 따로 만들었습니다. "사용자가 고른 것"은 `tripDecisionStore`, "서버에서 받아온 것"은 `weatherStore`로 나눴습니다.

### 5.5 나중에 정리한 것 — Store 작성 형식 통일
처음에는 `state` / `getters` / `actions`가 파일에서 바로 보이는 게 좋아서 Options Store 형식으로 썼습니다. 그런데 교안 실습에서 만든 `counter.js`는 Setup Store 형식이라 한 프로젝트 안에 2개의 방식이 섞여 있었습니다. 해당 방식이 조금 헷갈려서 3개의 Store를 전부 `ref`, `computed`, 일반 함수로 다시 쓰고 마지막에 `return`으로 내보내는 형식으로 맞췄습니다.

| Options Store | Setup Store |
|---|---|
| `state: () => ({ unit: 'celsius' })` | `const unit = ref('celsius')` |
| `getters: { unitSymbol: (state) => ... }` | `const unitSymbol = computed(() => ...)` |
| `actions: { toggleUnit() { ... } }` | `function toggleUnit() { ... }` |
| `this.unit` | `unit.value` |

(옮기면서 알게 된 차이는, Options Store는 `state`나 `actions`에 적기만 하면 알아서 밖에서 쓸 수 있는데 Setup Store는 `return`에 안 넣으면 컴포넌트에서 못 쓴다는 점이었습니다.)

`tripDecisionStore`를 옮기다가 `favoriteCities`랑 `compareCities`가 "대표 도시 + 검색 도시 합치기"를 각각 따로 하고 있는 걸 발견하고, `allCities` computed로 한 번만 계산하게 수정했습니다.

### 5.6 나중에 개선한 것 — 온도 변환 Composable
교안 5단계 참고사항에 "화면마다 비슷한 변환 코드가 중복됨, Composable로 해결 가능(범위 제외)"이라고 적혀 있어서, 요구사항을 다 하고 나서 이 부분을 정리했습니다.

`Math.round((temp * 9) / 5 + 32)`가 `WeatherCard`, `WeatherDetailView`, `WeatherCompareView`, `CurrentLocationWeather`, `LiveCityWeather` 다섯 군데에 거의 똑같이 들어가 있었습니다. 이걸 `src/composables/useTemperature.js`로 모으고, 각 화면에서는 함수만 가져다 쓰게 바꿨습니다.


| 반환값 | 역할 |
|---|---|
| `formatTemperature` | 온도 하나를 현재 단위로 변환 |
| `formatTemperatureDifference` | 두 도시의 온도 차이를 변환 |
| `unitSymbol` | 현재 단위 기호 |

- 계산식이 달라 함수를 2개로 나눔 :  온도 값은 `× 9/5 + 32`인데, 두 도시의 온도 차이는 기준점이 없는 간격이라 32를 더하면 안 되고 `× 9/5`만 해야 합니다. 이 작업을 하다가 근교 추천 카드에만 `℃`가 그대로 있어서 단위 전환이 안 되고 있던 것도 같이 수정 진행

## 6. Weather Axios
주요 파일: `src/api/weatherApi.js`, `src/api/travelApi.js`, `src/stores/weatherStore.js`

### 6.1 실제 날씨 데이터 적용
`axios.create()`로 인스턴스를 만들고 `baseURL`, `appid`, `units: 'metric'`, `lang: 'kr'`을 공통 params에 넣었습니다. 요청할 때마다 Key랑 단위를 계속 쓰는 것이 불편하여 인스턴스로 묶었두었습니다.
Key는 `.env.local`에 두고 `import.meta.env.VITE_OPENWEATHER_API_KEY`로 읽습니다.

**1단계에서 만든 40개 데이터는 여기서 2가지로 나눴습니다.**
- 도시 ID, 이름, 국가, 대륙, API 검색어처럼 API가 알려주지 않는 정보는 `cityCatalog.js`에 그대로 뒀습니다. OpenWeatherMap은 "대표 도시 40곳" 같은 목록 자체가 기본적으로 나오지 않기에, 어떤 도시를 보여줄지는 미리 정해서 가지고 있도록 했습니다. (처음에는 아예 api만 받아서 진행하려고 했는데, 그렇게 되면 기본 화면에서 조건을 선택할 때 아무것도 조회되지 않는 현상이 발생하여 다시 재수정 하였습니다.)

반면 기온, 체감온도, 습도, 날씨, PM10, PM2.5 같은 날씨 수치는 전부 API 응답으로 바꿨습니다. 1단계에서 쓰던 고정 날씨 값(`weatherData.js`)은 3단계 화면 전용으로만 남겨두고 최종 화면에서는 API값으로만 사용합니다. 

정리하면 **도시 목록(이름, 국가, 대륙 등)은 미리 정한 고정값, 기온이나 대기질 같은 날씨 수치만 API** 를 사용하게 했습니다.

도시 하나가 조회 실패했다고 해서 예전 값으로 채워 넣으면, 같은 카드 안에 현재 값이랑 이전 값이 섞이게 되므로, 조회에서 실패한 도시는 그냥 빼버리고, 성공한 도시만 화면에 보여주도록 했습니다. 

### 6.2 OpenWeatherMap 추가 API
| 용도 | 경로 | 쓴 값 |
|---|---|---|
| 현재 날씨 | `/data/2.5/weather` | 기온, 체감온도, 습도, 풍속, `weather.id` |
| 대기질 | `/data/2.5/air_pollution` | PM10, PM2.5, AQI |
| 도시명 검색 | `/geo/1.0/direct` | 국가·지역·좌표 후보 최대 5개 |
| 좌표로 지역명 찾기 | `/geo/1.0/reverse` | 도시명, 국가 |
| 단기예보 | `/data/2.5/forecast` | 3시간별 날씨, 체감온도, 강수확률 |

Geocoding을 붙이면서 40개 목록에 없는 도시도 검색할 수 있게 했습니다. 메인 검색은 후보가 여러 개면 국가랑 지역을 보고 고르게 했고, 비교 검색은 손이 덜 가게 첫 번째 후보를 바로 씁니다.

### 6.3 다른 외부 API
Open-Meteo Forecast API를 붙여서 **오늘의 최대 자외선, 일출, 일몰**을 현재 위치 카드에 표시했습니다. 실제 야외에서 어떤 업무를 수행할 때 날씨에 따라 행하는 시간 정보를 같이 활용할 수 있도록 하기 위하여 추가했습니다. OpenWeatherMap 요청과 섞이지 않게 `travelApi.js` 따로 뺐습니다.

### 비동기 처리
API Action은 전부 `async/await`랑 `try/catch/finally`로 썼습니다. `try`에서 요청하고 Store에 저장, `catch`에서 Key나 위치 권한, 네트워크 오류를 나눠서 안내, `finally`에서 성공이든 실패든 로딩을 풉니다.

현재 날씨랑 대기질처럼 둘 다 있어야 카드가 완성되는 건 `Promise.all()`로 묶었고, 대표 도시처럼 일부가 실패해도 나머지는 보여줘야 하는 건 `Promise.allSettled()`를 사용했습니다.
- 브라우저 Geolocation은 callback 방식이라 `getCurrentPosition()`만 Promise로 감싸고 Store Action에서 `await` 

---

## 7. Weather UI Library
사용한 라이브러리: Element Plus
`main.js`에 전역으로 등록하지 않고 쓰는 컴포넌트만 각 파일에서 import 했습니다. 

| 컴포넌트 | 사용 위치 |
|---|---|
| `ElCard` | 날씨 카드, 현재 위치, 근교 추천, 상세 예보 |
| `ElButton` | 검색, 단위 변경, 관심·비교·상세 버튼 |
| `ElInput` | 도시 검색, 비교 도시 검색 |
| `ElSelect`, `ElOption` | 비교 기준 선택 |
| `ElAlert` | API 오류, 비교·상세 안내 |
| `ElTag` | 실시간 상태, 예보 정보 |
| `ElEmpty` | 관심 여행지, 근교 추천 초기 상태 |
| `ElSkeleton` | 40개 도시 갱신 중 카드 자리 |

**화면을 보여주는 조건과 데이터 계산은 그대로 두었습니다.** `v-if`, `v-for`, `computed`, props와 emits는 앞에서 만든 걸 유지하고 보이는 부분만 바꿨습니다.
버튼과 input만 바꿔보니, 화면이 거의 그대로라 배치도 수정했습니다.

- Sticky Header랑 현재 Route 표시
- 메인 Hero랑 01~04 단계 구분
- 현재 위치랑 근교 추천 2열 배치
- 카드에서 도시명이랑 기온이 먼저 보이게 순서 조정
- 선택, 관심, 비교, 실시간 상태 색 구분
- 980px 이하 2열, 700px 이하 1열

40개 도시 갱신할 때 안내 문구만 뜨고 카드 자리는 비어 있어서, 목록이 갑자기 나타나면서 화면이 아래로 밀려지는 상황이 발생했습니다. 이에 ElSkeleton으로 카드 자리를 미리 고정해뒀습니다. 
카드에 붙어 있던 이모지도 조금 삭제했습니다. 원래 한 카드에 이모지가 여러 개 겹쳐 있었는데, 그러다 보니 정작 중요한 기온이나 대기질 수치보다 이모지가 먼저 눈에 들어오는 현상이 있어서, 가독성을 위해 상태를 구분하는 배지 쪽에만 남기고 나머지는 정리했습니다.
04 영역 위쪽에는 관심 여행지랑 비교 도시가 지금 몇 개 선택됐는지 표시했습니다. 
색이랑 글자, 테두리, 그림자, 모서리 같은 공통 스타일은 src/assets/base.css에 CSS 변수로 넣어서 통일감을 주었습니다.(Element Plus 기본 파란색 설정)
키보드로도 필터랑 카드를 쓸 수 있게 포커스 표시랑 Enter.Space로 선택되게 넣었고, 화면 움직임 줄이기 설정이 켜져 있으면 Hover 효과도 줄어들게 했습니다. 모바일에서는 가로 스크롤 넘길 수 있게 하였습니다. 

---

## 8. Vite Build & Deployment

### 8.1 ESLint 점검
`npm run lint`로 Oxlint랑 ESLint를 돌려서 오류가 없는지 확인했습니다.

### 8.1-1 Prettier 일괄 적용
기능을 만드는 동안에는 포맷 때문에 diff가 커져서 일부러 Prettier를 적용안했고, 기능이 다 끝나고 나서 `npm run format`으로 한 번에 적용했습니다. 적용한 뒤에 `npm run lint`랑 `npm run build`로 다시 확인하여 잘 작동하는지까지 보았습니다.

### 8.2 API Key 환경변수 처리
실제 Key는 `.env.local`로 옮기고 `.gitignore`에 넣었습니다. 저장소에는 값이 빈 `.env.example`만 남겼고, 배포할 때는 같은 이름으로 Vercel 환경변수에 등록했습니다.

### 8.3 Production Build
`npm run build`로 `dist` 폴더가 잘 만들어지는지 확인했습니다.

### 8.4 Hosting
GitHub `main` 브랜치를 Vercel에 연결해서 배포했습니다.
`/compare`나 `/weather/:cityId` 같은 주소를 직접 열면 404가 났습니다. History모드 Router는 서버가 해당 경로의 파일을 찾으려고 하기에
`vercel.json`에 전체 경로를 `/index.html`로 보내는 설정을 추가하였습니다.
배포 후 확인 사항 : 메인의 40개 도시 실시간 갱신 / `/compare` 직접 접속과 새로고침 / 상세 페이지와 3시간 예보 / 없는 주소일 때 404 화면

---
## 진행하면서 해결한 문제
### 1. `npm run dev`에서 package.json을 못 찾음
상위 폴더에서 실행하여 `ENOENT`가 났습니다. 프로젝트 폴더가 한 단계 안쪽에 있어서, `package.json`이 있는 폴더로 이동하여 해결

### 2. API Key를 넣었는데 화면이 그대로임
`.env.local` 위치랑 `VITE_` 를 확인했는데도 안 됨 -> Vite가 시작할 때 환경변수를 읽기 때문에, 개발 서버를 껐다 켜니 실행됨

### 3. 결과가 0개인데 "카드를 클릭해 보세요"가 남아 있음
카드 영역과 상태바가 같은 문구 상태를 쓰고 있었음. -> `statusBarMessage`를 따로 computed로 만들어서, 결과가 0개일 때 카드 영역에는 "선택한 조건과 일치하는 도시가 없습니다", 상태바에는 "선택한 검색 조건에 맞는 도시가 없습니다"를 각각 표시

### 4. 어떤 카드를 선택했는지 알기 어려움
컴포넌트를 나누며 발생한 문제로 부모가 `selectedCityId`를 갖고 있고 각 카드에 `isSelected`를 내려줘서 선택한 카드에만 테두리랑 배경, 안내 문구가 나오게함

### 5. 같은 도시인데 화면마다 날씨가 다름
현재 위치랑 실시간 검색은 API를 쓰고 대표 카드는 고정 값을 쓰고 있었음 -> 대표 도시는 `weatherStore.dashboardCities`, 직접 검색한 도시는 `tripDecisionStore.apiCities`에서 찾도록 통일시킴

### 6. 40개 도시 요청이 한꺼번에 나감
도시마다 현재 날씨랑 대기질을 각각 불러야 해서 요청이 몰림 -> 4개 도시씩 끊어서 `Promise.allSettled()`로 처리하고 진행 개수를 화면에 표시함. 한 번 받아온 값은 Store에 저장해서 필터를 바꿀 때 재요청 필요없음. `최신 날씨 갱신` 버튼만 `force=true`로 캐시 무시

### 7. 전 세계 검색을 만들었는데 대시보드 검색창은 여전히 40개만 검색함
처음에는 전 세계 검색 결과가 별도 카드 한 장에만 나오고 필터나 카드 영역이랑 연결이 안 됨 -> 대시보드 검색 input 자체를 Geocoding 검색으로 바꾸고, 결과를 "API 검색 도시" 그룹 카드로 보여줌

### 8. 비교 화면에서 검색한 도시가 대시보드에 자동으로 섞임
`apiCities`가 도시 객체 캐시랑 대시보드 목록 역할을 같이 하고 있음을 확인하고 캐시는 `apiCities`, 대시보드는 `dashboardSearchCityIds`로 나눔

### 9. 같은 도시를 다시 검색하면 예전 날씨가 그대로 남음
같은 ID가 이미 있으면 새 응답을 하지 않게 되어있어서 기존 객체를 새 응답으로 바꿈. 그리고 같은 위치가 카탈로그 ID랑 API 좌표 ID로 각각 생길 수 있어서, ID뿐 아니라 위도랑 경도까지 비교하여 중복 선택 막음

### 10. API 날씨 문구가 기존 조건이랑 안 맞음
고정 데이터에서는 "흐림"이었는데 API에서는 "온흐림", "튼구름", "실 비" 같은 추가적인 설명 값이 옴 -> 문자열 비교보다느 `weather.id` 숫자 코드로 판정하게 바꾸고, 로직을 `utils/weatherCondition.js`로 뺌(200번대 뇌우, 300번대 이슬비, 500번대 비, 600번대 눈, 800 맑음, 801~804 구름). (문구 바껴도 기준 고정)
+ 현재 날씨는 "현재 비가 내리고 있습니다"처럼 관측한 것처럼 쓰고, 예보의 `pop`은 "강수확률"로 써서 현재 상태랑 예보를 구분

### 11. 여행 목적을 고르면 카드가 전부 사라짐
조건 결과가 0개인 게 API 실패처럼 보이는 문제 발생 -> 선택한 후보는 있는데 목적 조건만 0개면 후보 카드를 남기고, 각 카드에 체감온도, 강수, PM10, PM2.5 중에 어떤 값이 기준을 벗어났는지 실제 수치랑 같이 보여주도록 함. 대륙에 후보 자체가 없을 때만 결과 없음 안내 띄움

### 12. 도시 비교 결과 문장이 너무 김
가독성을 위해 문단 대신 추천 도시, 두 도시 총점, 항목별 점수, 짧은 이유, 주의사항으로 나눔

### 13. UI Library를 적용했는데 가독성이 별로 안 달라짐
버튼만 바꾼 것이 아니라Header, Hero, 01~04 단계 구분, 카드 정보 순서를 재배치하고 공통 CSS변수랑 반응형을 적용

### 14. 상세 페이지를 새로고침하면 도시가 사라짐
상세 View가 Pinia에 있는 도시만 찾는 문제가 있어, ID 형식에 따라 카탈로그에서 찾거나 좌표로 다시 조회하도록 복구 경로를 둠

### 15. 도시를 빠르게 연달아 누르면 이전 도시 날씨가 보임
상세 화면에서 뒤로 가기랑 다른 도시 클릭을 빠르게 반복했더니, 나중에 연 도시 화면에 아까 눌렀던 도시 값이 나오는 현상 발생. (먼저 보낸 요청의 응답이 더 늦게 도착하면서 최신 화면을 덮어쓰는 문제였음) -> 요청할 때마다 번호를 하나씩 올리고, 응답이 왔을 때 자기 번호가 아직 최신인지 확인해서 최신 요청 결과만 화면에 넣도록 바꾸고 지난 요청 응답은 버림

### 16. 관심 여행지가 새로고침하면 사라짐
관심 목록을 Pinia 메모리에만 두고 있어서 초기화되어, 브라우저 저장소에 관심 도시 **ID만** 저장하게 바꿔둠
서로 다른 시점 값을 한 화면에 섞지 않게 하기 위해 날씨 값은 저장하지 않음 (저장 시, 추후 열었을 때 이전 기온이 그대로 보이는 현상 발생) 
따라서 ID만 남기고 화면을 열 때 API로 다시 조회하게 함(대표 도시는 카탈로그, 검색으로 추가한 도시는 ID에 들어있는 좌표로 복구)

저장소 접근은 `try/catch`로 감쌈 

---

## 직접 추가한 기능
과제 요구사항 외에 여행지를 실제로 고를 수 있게 추가한 사항입니다.

**여행 목적 필터 (3단계)**
대륙 7종과 여행 목적 5종으로 도시를 나눠서 볼 수 있으며, 조건을 통과 못 한 도시도 어떤 값 때문에 걸렸는지 실제 수치로 볼 수 있게 했습니다.

**전 세계 도시 검색 (6단계)**
```text
도시명 입력 → Geocoding 후보 확인 → 좌표의 날씨, 대기질 조회
→ apiCities에 저장 → dashboardSearchCityIds에 ID 저장 → 카드로 출력
```

40개 목록에 없는 바르셀로나나 코펜하겐 같은 도시도 검색 및 관심 표시를 하여 비교할 수 있습니다.
다만 OpenWeatherMap은 "지금 쾌적한 전 세계 도시"를 다 주지 않고 도시명이나 좌표를 먼저 정해야 합니다. (대륙이랑 목적 필터는 지금 불러온 도시 안에서만 작동) 

**도시 그룹 4종**
주요 도시(40곳) / SKALA 캠퍼스(판교, 광주, 울산) / API 검색 도시 / 관심 여행지로 나눴습니다.
중간에 가보고 싶은 도시 8곳을 고정 탭으로 만들었다가 전 세계 검색이랑 역할이 겹치고, 사용자가 직접 고르는 서비스 취지에 맞지 않아서 삭제한 후, 관심 여행지만 두었습니다.

**두 도시 비교 (4-5단계)**
날씨, 체감온도, 대기질, 습도를 100점 만점 기준으로 비교하여, 총점이 같으면 억지로 한 쪽을 추천하는 것이 아니라 동점으로 표시하게 했습니다.

**시간대별 근교 추천 (6단계)**
```text

국내 출발 도시 검색 → 후보와 직선거리 계산 → 가까운 지역 예보 조회
→ 같은 시간대끼리 점수 비교 → 시간대별 추천 출력

```
처음에는 GPS 위치를 출발지로 쓰려고 했는데, 앱을 보는 곳이랑 실제 출발지가 다를 수 있어서 자동으로 현재 위치를 불러오는 것 대신 출발 도시를 직접 검색 선택할 수 있도록 바꿨습니다. (`nearbyCities.js`에 등록한 국내 12곳 중에 출발지에서 5km 이상 떨어진 가까운 4개 지역을 고르고, 출발지까지 포함해서 5개 지역 예보를 비교)

**현재 위치 카드**
Geolocation, Reverse Geocoding, 대기질, Open-Meteo(자외선, 일출, 일몰)를 묶어서 한 카드에 보여줍니다.

**관심 여행지 저장**
관심 도시 ID를 브라우저에 남겨서 새로고침해도 목록이 유지되도록 하여, 관심 여행지 리스트를 만들 수 있도록 했습니다.

---

## 직접 정한 추천 기준
아래 기준은 공식 여행 지수가 아니라 여러 도시를 같은 규칙으로 비교하려고 직접 정한 값입니다. `강수 없음`은 `weather.id`가 뇌우, 이슬비, 비, 눈 범위가 아니라는 뜻입니다. (해당 내용을 설정한 이유는, 강수 및 습도기준에 따라 현재 여름임에도 불구하고 눈이 올 것이라는 예상이 카드에서 보이게 되어 설정하게 됐습니다.) 같은 표를 `/about` 화면에서도 볼 수 있습니다.

**여행 목적 필터**

| 목적 | 체감온도 | 대기질 | 날씨 |
|---|---|---|---|
| 쾌적한 도시 | 15~30℃ | PM10 60 / PM2.5 35 이하 | 강수 없음 |
| 더위 피하기 | 25℃ 미만 | PM10 80 / PM2.5 35 이하 | 강수 없음 |
| 추위 피하기 | 25~30℃ | PM10 80 / PM2.5 35 이하 | 강수 없음 |
| 비 피하기 | 33℃ 미만 | PM10 80 / PM2.5 35 이하 | 강수 없음 |
| 대기질 좋은 곳 | 33℃ 미만 | PM10 30 / PM2.5 15 이하 | 강수 없음 |

**도시 비교 가중치 (100점 기준)**

| 비교 기준 | 날씨 | 체감온도 | 대기질 | 습도 |
|---|---:|---:|---:|---:|
| 쾌적한 도시 | 25 | 40 | 30 | 5 |
| 더위 피하기 | 20 | 55 | 20 | 5 |
| 추위 피하기 | 20 | 55 | 20 | 5 |
| 비 피하기 | 60 | 15 | 20 | 5 |
| 대기질 좋은 곳 | 10 | 15 | 70 | 5 |



**항목별 환산**
날씨는 맑음 100%, 구름 양에 따라 90~60%, 안개나 먼지류 50%, 강수 20%입니다. PM10은 30 이하 100%, 60 이하 75%, 80 이하 50%, 150 이하 20%. PM2.5는 15 이하 100%, 35 이하 60%, 75 이하 20%. 습도는 40~70% 100%, 30~80% 50%입니다.

**근교 추천 감점**
100점에서 빼는 방식으로, 강수확률은 `pop × 45`로 최대 45점, '뇌우, 이슬비, 비, 눈'은 25점, 체감 10℃보다 낮으면 1℃당 2점(최대 25), 30℃보다 높으면 1℃당 3점(최대 30), 거리는 약 15km마다 1점(최대 15) 뺍니다.  (단점은, 3시간 기준마다 추천해줘서 여행지 정하는 것에 어려움이 있을 수 있는 것입니다.)

---

## 데이터 흐름

```text

[대표 도시]
cityCatalog.js (ID·도시명·국가·대륙·검색어)
→ Current Weather + Air Pollution
→ weatherStore.liveWeatherByCityId
→ 대시보드·상세·관심·비교

[직접 검색]
도시명 입력 → Geocoding 후보 → 현재 날씨·대기질
→ tripDecisionStore.apiCities
→ (대시보드 검색이면 dashboardSearchCityIds에도 저장)

[현재 위치]
Geolocation → Current Weather + Air Pollution + Reverse Geocoding
→ Open-Meteo 자외선·일출·일몰

[공통 날씨 판정]
weather.id → utils/weatherCondition.js
→ 카드 안내 · 목적 필터 · 비교 점수 · 근교 점수

```

| 데이터 | 역할 |

|---|---|
| `weatherData.js` | 3단계 화면 전용 40개 고정 날씨 |
| `cityCatalog.js` | API가 주지 않는 도시 기본 정보(ID·이름·국가·대륙·검색어). 날씨 수치는 없음 |
| `weatherStore.liveWeatherByCityId` | 대표 도시 ID별 실제 API 응답 |
| `weatherStore.dashboardCities` | 카탈로그 정보랑 API 값을 합친 카드 목록 |
| `tripDecisionStore.apiCities` | 검색으로 만들어진 도시 객체 캐시 |
| `tripDecisionStore.dashboardSearchCityIds` | 대시보드에 보여줄 검색 도시 범위 |

처음에는 대표 도시를 60개로 늘릴까 했는데, 요청 수만 늘고 목록 밖 도시 문제는 그대로여서 40개로 뒀습니다. 이에 추가적으로 보고 싶은 도시는 검색으로 추가할 수 있게 했습니다.

---

## 파일 구조



```text

src/

├── App.vue
├── router/index.js
├── api/
│   ├── weatherApi.js          # OpenWeatherMap
│   └── travelApi.js           # Open-Meteo
├── composables/
│   └── useTemperature.js      # 온도 단위 변환 (추가)
├── data/
│   ├── cityCatalog.js         # 대표 40개 도시 기본 정보
│   ├── nearbyCities.js        # 근교 추천용 국내 12곳
│   └── weatherData.js         # 3단계용 고정 데이터
├── stores/
│   ├── configStore.js         # 온도 단위 (과제)
│   ├── tripDecisionStore.js   # 관심·비교·목적 (추가)
│   └── weatherStore.js        # API 응답·로딩·오류 (추가)
├── utils/
│   ├── weatherCondition.js    # weather.id 판정
│   └── locationMetadata.js
├── views/
│   ├── WeatherHomeView.vue
│   ├── WeatherDetailView.vue
│   ├── WeatherFavoritesView.vue   # 추가
│   ├── WeatherCompareView.vue     # 추가
│   ├── WeatherAboutView.vue
│   └── NotFoundView.vue
└── components/HandsOn/
    ├── WeatherMockup1.vue         # 1단계
    ├── WeatherComposition.vue     # 2단계
    └── WeatherComponent/          # 3단계 이후
        ├── WeatherParent.vue
        ├── BaseDashboardCard.vue
        ├── SearchBar.vue
        ├── WeatherCard.vue
        ├── TravelFilter.vue                # 추가
        ├── CurrentLocationWeather.vue      # 추가
        ├── LiveCityWeather.vue             # 추가
        ├── NearbyWeatherRecommendation.vue # 추가
        └── UnitToggler.vue

```

---

## 아쉬운 점과 추후 보완 필요로 하는 부분

### 1. 도시 그룹 탭이랑 검색 영역이 따로 작동
01에서 주요 도시, SKALA 캠퍼스, API 검색 도시, 관심 여행지 탭을 고를 수 있는데 03의 검색 영역은 어느 탭을 골라도 똑같습니다. 탭마다 필요한 검색이 다른데(대표 도시는 이미 있는 목록에서 찾는 거고, API 검색 도시는 새로 추가하는 거니까) 화면이 그걸 구분하지 않습니다. 고른 탭에 맞는 검색 카드가 위에 뜨게 하면 지금 뭘 검색하는 중인지 더 분명해질 것 같습니다.

### 2. API 검색 도시 탭이 비어 있으면 필터가 의미가 없어짐
`API 검색 도시` 탭은 직접 검색해서 추가하기 전까지 도시가 하나도 없습니다. 이 상태에서 대륙이나 여행 목적을 골라도 거를 후보 자체가 없어서 결과가 항상 0개로 나옵니다. 주요 도시나 SKALA 캠퍼스 탭은 목록이 등록돼 있어서 바로 나오는데 여기만 안 나오니까, 쓰는 사람 입장에서는 필터가 고장 난 것처럼 보일 수 있습니다.
이 탭이 비어 있을 때는 필터를 비활성화하고 "먼저 도시를 검색해서 추가해 주세요" 같은 안내를 띄우는 게 나을 것 같습니다.

### 3. 여행 목적 필터가 통과랑 실패만 나눔
지금은 조건을 만족하는지만 보고 통과한 도시를 원래 순서대로 늘어놓습니다. 그래서 `대기질 좋은 곳`을 골라도 통과한 도시들 중에 어디가 제일 좋은지는 알 수 없습니다.
비교 화면에는 이미 목적별 가중치로 점수를 매기는 계산이 있으니까, 같은 계산을 목록에도 써서 점수 높은 순으로 정렬하면 "여행지를 고른다"는 목적에 더 맞을 것 같습니다. 카드에 점수도 같이 보여주면 왜 그 순서인지 설명도 되므로 사용자 입장에서 보기 편할 것 같습니다.

### 그 밖의 한계
- 비교 도시랑 검색 도시는 Pinia 메모리에만 있어서 새로고침하면 초기화됩니다. (관심 여행지는 저장됨)
- 도시 비교 검색은 Geocoding 첫 번째 후보를 바로 써서 같은 이름 지역을 고르는 UI가 없습니다.
- 근교 추천은 국내 출발지랑 `nearbyCities.js`의 12곳만 되고, 거리도 도로 거리가 아니라 직선거리입니다.
- 대륙이랑 목적 필터는 지금 불러온 도시 그룹 안에서만 작동합니다.
- 백엔드와 추가적인 API는 이번 범위에 넣지 못했습니다. (예를 들어 "근처 가볼만한 명소" API를 넣었다면 여행지 추천과 함께 해당 여행지에서 즐길 수 있는 거리를 함께 추천할 수 있어, 좀 더 완성된 화면을 구축하고 많은 서비스 이용이 가능하게 했을 것으로 예상합니다..)

---

## 화면 문구를 볼 수 있는 파일 위치
| 바꾸려는 내용 | 파일 |
|---|---|
| 서비스 이름, 부제, Navigation | `src/App.vue` |
| 메인 소개, 단계 제목, 결과 없음 안내 | `src/views/WeatherHomeView.vue` |
| 카드의 온도·대기질·여행 목적 안내 | `WeatherCard.vue` |
| 뇌우·이슬비·비·눈 공통 문구 | `src/utils/weatherCondition.js` |
| 여행 목적별 조건 설명 | `TravelFilter.vue` |
| 온도 단위 변환 방식 | `src/composables/useTemperature.js` |
| 현재 위치 안내와 오류 | `CurrentLocationWeather.vue`, `weatherStore.js` |
| 전 세계 검색 안내 | `LiveCityWeather.vue` |
| 근교 추천 제목과 이유 | `NearbyWeatherRecommendation.vue` |
| 도시 비교 제목, 추천 이유, 주의사항 | `WeatherCompareView.vue` |
| 관심 여행지 안내 | `WeatherFavoritesView.vue` |
| 추천 기준표 | `WeatherAboutView.vue` |
| 상세·소개·404 화면 | `WeatherDetailView.vue`, `WeatherAboutView.vue`, `NotFoundView.vue` |

- 문구만 고칠 때는 `weatherCondition.js`의 숫자 범위는 건드리지 않도록 함 (해당 숫자는 OpenWeatherMap 날씨 코드 판정에 사용)
----

## 참고 자료
- 수업 자료: `Full-stack Engineering_3.Frontend-framework_Vue.js_강병호_0807`
- 과제 예시 구조: [bottletiger/skala-vue](https://github.com/bottletiger/skala-vue)
수업 자료는 Hands-on 순서랑 필수 문법을 확인하는 데 썼고, 참고 저장소에서는 Router 단계의 폴더 구조를 봤습니다.



## 참고 사항
Readme는 MARK DOWN 문법을 위해 AI의 도움을 받아 최종적으로 정리하였습니다,

