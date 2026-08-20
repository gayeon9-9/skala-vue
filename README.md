# skala-vue

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

```
# Vue 날씨 기반 여행 도시 추천 과제

## 1. 프로젝트 소개

Vue 수업에서 배운 문법을 활용하여 국내·해외 도시의 날씨 정보를 확인하고, 여행 목적에 맞는 도시를 찾아볼 수 있는 화면을 만들었다.

과제는 하루마다 별도의 파일로 작성했으며, 앞에서 만든 기능을 바탕으로 반응형 기능과 컴포넌트 구조를 단계적으로 학습했다.

도시별로 다음 정보를 표시한다.

- 현재 기온
- 체감온도
- 습도
- 날씨 상태
- 미세먼지
- 초미세먼지
- 날씨에 따른 여행 안내

> 사용한 날씨 정보는 Vue 기능 실습을 위해 작성한 Mockup 데이터이며, 실제 관측값과 다를 수 있다.

---

## 2. 과제 진행 내용

### Day 1 — Weather Mockup

파일:

```text
src/components/HandsOn/WeatherMockup1.vue
```

Vue의 기본 문법을 이용하여 날씨 카드 화면을 구현했다.

주요 학습 내용:

- `ref`를 이용한 반응형 데이터 관리
- `v-for`를 이용한 도시별 날씨 카드 반복 출력
- `:key`에 도시별 고유 ID 연결
- `v-if`, `v-else-if`, `v-else`를 이용한 조건부 화면 출력
- `:value`, `@input`을 이용한 한글 도시 검색어 입력
- `@click`을 이용한 카드 선택
- `@click.stop`을 이용한 이벤트 버블링 방지
- `:class`를 이용한 조건별 스타일 적용
- `<style scoped>`를 이용한 컴포넌트별 스타일 적용

국내 21개 도시와 해외 19개 도시의 Mockup 데이터를 추가했으며, 각 도시의 기온, 체감온도, 습도, 날씨 상태와 대기질 정보를 카드로 표시했다.

카드를 클릭하면 선택한 도시가 화면 아래에 표시되고, 상세보기 버튼을 누르면 해당 도시의 날씨 정보가 알림창으로 출력된다.

상세보기 버튼에는 다음과 같이 `.stop` 수식어를 적용했다.

```vue
<button @click.stop="showDetail(item)">상세보기</button>
```

따라서 상세보기 버튼을 클릭해도 부모 요소인 날씨 카드의 클릭 이벤트는 함께 실행되지 않는다.

---

### Day 2 — Weather Composition

파일:

```text
src/components/HandsOn/WeatherComposition.vue
```

1일차 날씨 화면에 Composition API 기능을 추가했다.

주요 학습 내용:

- `computed`를 이용한 검색 결과 계산
- `watch`를 이용한 선택된 도시 상태 감시
- `watchEffect`를 이용한 검색어 상태 자동 감시
- 검색 결과가 없을 때 안내 문구 출력
- 반응형 상태와 계산된 데이터의 차이 확인

사용자가 입력한 검색어가 도시 이름에 포함되어 있으면 해당 도시만 화면에 표시한다.

검색어가 없으면 전체 도시를 표시하고, 검색 결과가 없으면 조건에 맞는 도시가 없다는 안내를 표시하도록 구성했다.

```js
const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()

  if (keyword === '') {
    return weatherList.value
  }

  return weatherList.value.filter((item) => item.name.includes(keyword))
})
```

`watch`와 `watchEffect`를 이용하여 도시 선택과 검색어 변경을 감지하고, 변경 내용을 콘솔에서 확인할 수 있도록 했다.

---

### Day 3 — Weather Component

폴더:

```text
src/components/HandsOn/WeatherComponent
```

2일차까지 하나의 Vue 파일에 작성했던 화면을 기능별 컴포넌트로 분리했다.

#### 컴포넌트 구성

```text
WeatherComponent
├── WeatherParent.vue
├── BaseDashboardCard.vue
├── SearchBar.vue
├── WeatherCard.vue
└── TravelFilter.vue
```

#### WeatherParent.vue

전체 날씨 데이터와 반응형 상태를 관리하는 부모 컴포넌트다.

관리하는 주요 데이터:

- 도시 검색어
- 선택된 도시
- 선택된 도시 ID
- 선택된 대륙
- 선택된 여행 목적
- 검색 및 필터 결과

자식 컴포넌트에서 전달한 이벤트를 받아 검색어, 대륙, 여행 목적과 선택된 도시 정보를 변경한다.

#### BaseDashboardCard.vue

검색 영역, 필터 영역과 날씨 목록 영역에서 공통으로 사용할 수 있는 박스 컴포넌트다.

`slot`을 사용하여 부모가 전달한 내용을 컴포넌트 내부에 표시한다.

```vue
<section class="dashboard-card">
  <slot></slot>
</section>
```

#### SearchBar.vue

도시 이름을 검색하는 컴포넌트다.

부모로부터 검색어를 `props`로 받고, 사용자가 입력한 새로운 검색어는 `emits`를 통해 부모에게 전달한다.

```text
부모 컴포넌트
→ props로 현재 검색어 전달
→ SearchBar에서 사용자 입력
→ emits로 변경된 검색어 전달
→ 부모의 검색어 상태 변경
```

#### WeatherCard.vue

도시 하나의 날씨 정보를 표시하는 컴포넌트다.

부모로부터 도시 객체를 `props`로 받아 기온, 체감온도, 습도, 날씨와 대기질 정보를 표시한다.

카드 클릭과 상세보기 버튼 클릭은 `emits`를 이용하여 부모 컴포넌트에 전달한다.

선택한 카드는 다른 카드와 구분할 수 있도록 테두리와 배경색이 변경되고, 카드 내부에 `선택한 도시입니다`라는 문구가 표시된다.

#### TravelFilter.vue

직접 추가한 여행 조건 필터 컴포넌트다.

다음 조건을 선택할 수 있다.

대륙:

- 전체
- 아시아
- 유럽
- 북아메리카
- 오세아니아

여행 목적:

- 전체
- 쾌적한 도시
- 더위 피하기
- 추위 피하기
- 비 피하기
- 대기질 좋은 곳

대륙 필터와 여행 목적 필터는 다음 순서로 적용된다.

```text
전체 도시
→ 도시 이름 검색
→ 대륙 필터
→ 여행 목적 필터
→ 최종 도시 목록 출력
```

따라서 `오세아니아 + 쾌적한 도시`처럼 두 조건을 함께 선택하면, 먼저 오세아니아 도시를 찾은 다음 그중에서 쾌적한 조건을 만족하는 도시만 표시한다.

조건을 만족하는 도시가 없으면 빈 화면 대신 안내 문구가 출력된다.

---

## 3. Props와 Emits

컴포넌트를 분리하면서 부모와 자식 컴포넌트 사이의 데이터 전달 방법을 적용했다.

### Props

부모 컴포넌트가 자식 컴포넌트에 데이터를 전달할 때 사용한다.

```text
WeatherParent
→ 도시 데이터 전달
→ WeatherCard
```

### Emits

자식 컴포넌트에서 발생한 일을 부모 컴포넌트에 전달할 때 사용한다.

```text
WeatherCard 클릭
→ select-card 이벤트 전달
→ WeatherParent에서 선택한 도시 저장
```

즉, `props`는 부모에서 자식 방향으로 데이터를 전달하고, `emits`는 자식에서 부모 방향으로 이벤트를 전달한다.

---

## 4. 주요 기능

- 국내·해외 도시 날씨 카드 출력
- 도시 이름 검색
- 대륙별 도시 필터
- 여행 목적별 도시 필터
- 대륙과 여행 목적의 복합 필터
- 기온 및 체감온도 단계 표시
- 미세먼지 및 초미세먼지 등급 표시
- 날씨 상태에 따른 여행 안내
- 카드 클릭 시 선택한 도시 표시
- 선택한 카드 하이라이트
- 상세보기 알림창 출력
- 상세보기 버튼의 이벤트 버블링 방지
- 검색 또는 필터 결과가 없을 때 안내 문구 출력

---

## 5. 실행 방법

프로젝트 폴더로 이동한다.

```bash
cd /Users/gayeon/workspace/skala-vue/skala-vue
```

필요한 패키지를 설치한다.

```bash
npm install
```

개발 서버를 실행한다.

```bash
npm run dev
```

터미널에 출력된 주소로 접속한다.

```text
http://localhost:5173/
```

---

## 6. App.vue 설정

현재 3일차 컴포넌트 과제를 실행하도록 설정했다.

```vue
<script setup>
// import WeatherMockup1 from './components/HandsOn/WeatherMockup1.vue'
// import WeatherComposition from './components/HandsOn/WeatherComposition.vue'
import WeatherParent from './components/HandsOn/WeatherComponent/WeatherParent.vue'
</script>

<template>
  <!--
  <WeatherMockup1 />
  <WeatherComposition />
  -->

  <WeatherParent />
</template>
```

이전 과제를 확인하려면 현재 컴포넌트를 주석 처리한 후, 확인하려는 컴포넌트의 주석을 해제하면 된다.

---

## 7. 학습 내용

처음에는 하나의 Vue 파일 안에서 데이터, 화면과 스타일을 모두 관리했지만, 기능이 추가될수록 코드가 길어지고 각 부분의 역할을 구분하기 어려워졌다.

컴포넌트를 분리하면서 검색, 필터, 카드 출력과 상태 관리의 역할을 나눌 수 있었고, 부모와 자식 컴포넌트가 `props`와 `emits`를 통해 데이터를 주고받는 과정을 확인했다.

또한 검색과 필터는 서로 따로 실행되는 기능이 아니라, 앞 단계의 결과를 다음 단계에서 다시 필터링해야 여러 조건이 함께 적용된다는 점을 학습했다.