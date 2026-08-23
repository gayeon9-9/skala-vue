<!--
<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import SampleOne from './components/practices/basic/SampleOne.vue'
import SampleTwo from './components/practices/basic/SampleTwo.vue'
import SampleThree from './components/practices/basic/SampleThree.vue'
import SampleFour from './components/practices/basic/SampleFour.vue'
import VueText from './components/practices/basic/VueText.vue'
import VueBind1 from './components/practices/basic/VueBind1.vue'
import VueBind2 from './components/practices/basic/VueBind2.vue'
import VueBind3 from './components/practices/basic/VueBind3.vue'
import VueIfElse from './components/practices/basic/VueIfElse.vue'
import VuesShow from './components/practices/basic/VueShow.vue'
import VueFor from './components/practices/basic/VueFor.vue'
import VueOnEventHandler from './components/practices/basic/VueOnEventHandler.vue'
import EventObject from './components/practices/basic/EventObject.vue'
import EventModifier from './components/practices/basic/EventModifier.vue'
import VueModel from './components/practices/basic/VueModel.vue'
import FormElementsHandling from './components/practices/basic/FormElementsHandling.vue'
import Ref from './components/practices/basic/Ref.vue'
import Reactive from './components/practices/basic/Reactive.vue'
import Computed from './components/practices/basic/Computed.vue'
import Watch from './components/practices/basic/Watch.vue'
import MultiSourceWatch from './components/practices/basic/MultiSourceWatch.vue'
import DeepWatch from './components/practices/basic/DeepWatch.vue'
import ReactiveWatch from './components/practices/basic/ReactiveWatch.vue'
import WatchEffect from './components/practices/basic/WatchEffect.vue'
import ComponentLifecycleHook from './components/practices/basic/ComponentLifecycleHook.vue'
import PropsEmitsParent from './components/practices/basic/PropsEmitsParent.vue'
import PropsEmitsChild from './components/practices/basic/PropsEmitsChild.vue'
import SlotDefaultParent from './components/practices/basic/SlotDefaultParent.vue'
import SlotDefaultChild from './components/practices/basic/SlotDefaultChild.vue'
import SlotNamedParent from './components/practices/basic/SlotNamedParent.vue'
import SlotNamedChild from './components/practices/basic/SlotNamedChild.vue'
import SlotScopedParent from './components/practices/basic/SlotScopedParent.vue'
import SlotScopedChild from './components/practices/basic/SlotScopedChild.vue'

</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
      <SampleOne />
      <SampleTwo />
      <SampleThree />
      <SampleFour />
      <VueText />
      <VueBind1 />
      <VueBind2 />
      <VueBind3 />
      <VueIfElse />
      <VuesShow />
      <VueFor />
      <VueOnEventHandler />
      <EventObject />
      <EventModifier />
      <VueModel />
      <FormElementsHandling />  
      <Ref />
      <Reactive />
      <Computed />
      <Watch />
      <MultiSourceWatch />
      <DeepWatch />
      <ReactiveWatch />
      <WatchEffect />
      <ComponentLifecycleHook />
      <PropsEmitsParent />
      <PropsEmitsChild />
      <SlotDefaultParent />
      <SlotDefaultChild />
      <SlotNamedParent />
      <SlotNamedChild />
      <SlotScopedParent />
      <SlotScopedChild />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style> -->

<script setup>
// import WeatherMockup1 from './components/HandsOn/WeatherMockup1.vue' // 8/19 (과제1 - Weather Mockup)
// import WeatherComposition from './components/HandsOn/WeatherComposition.vue' // 8/20 (과제2 - Weather Composition)
// import WeatherParent from './components/HandsOn/WeatherComponent/WeatherParent.vue'
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from './components/HandsOn/WeatherComponent/UnitToggler.vue'

// 로고를 누르면 메인 주소로 다시 접속하여 화면 상태도 함께 초기화한다.
const homeUrl = import.meta.env.BASE_URL
</script>

<template>
  <!-- <WeatherMockup1 />
  <WeatherComposition /> 
  <WeatherParent />-->
  <div class="app-wrapper">
    <header class="app-header">
      <a :href="homeUrl" class="brand-area" aria-label="날씨 대시보드로 이동하고 새로고침">
        <span class="brand-icon">🌍</span>
        <div>
          <h1>어디로 갈까?</h1>
          <p>날씨를 보고 고르는 오늘의 여행지</p>
        </div>
      </a>

      <div class="header-controls">
        <nav class="navigation">
          <RouterLink to="/">날씨 대시보드</RouterLink>
          <RouterLink to="/favorites">관심 여행지</RouterLink>
          <RouterLink to="/compare">도시 비교</RouterLink>
          <RouterLink to="/about">서비스 소개</RouterLink>
        </nav>

        <UnitToggler />
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100vh;
}
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 15px max(24px, calc((100vw - 1180px) / 2));
  color: var(--brand-950);
  background: rgba(250, 253, 255, 0.88);
  border-bottom: 1px solid rgba(111, 151, 189, 0.2);
  box-shadow: 0 10px 34px rgba(37, 79, 120, 0.08);
  backdrop-filter: blur(20px) saturate(145%);
}
.app-header::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(39, 133, 211, 0.35), transparent);
  content: '';
}
.brand-area {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: max-content;
  color: inherit;
  text-align: left;
  text-decoration: none;
}
.brand-area:hover .brand-icon {
  transform: rotate(-8deg) scale(1.04);
}
.brand-icon {
  display: grid;
  width: 50px;
  height: 50px;
  place-items: center;
  font-size: 29px;
  background: linear-gradient(145deg, #dff3ff, #e4fff7);
  border: 1px solid rgba(63, 152, 211, 0.18);
  border-radius: 17px;
  box-shadow:
    0 9px 22px rgba(43, 123, 181, 0.14),
    inset 0 1px rgba(255, 255, 255, 0.85);
  transition: transform 0.2s ease;
}
.app-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 850;
  letter-spacing: -0.7px;
}
.app-header p {
  margin: 1px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}
.header-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 14px;
}
.navigation {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 5px;
  background: rgba(229, 238, 247, 0.7);
  border: 1px solid rgba(135, 160, 187, 0.14);
  border-radius: 14px;
}
.navigation a {
  padding: 9px 14px;
  color: #4b5f75;
  text-decoration: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.navigation a:hover {
  color: var(--brand-700);
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}
.navigation a.router-link-exact-active {
  color: white;
  background: linear-gradient(135deg, var(--brand-700), var(--brand-500));
  box-shadow: 0 7px 18px rgba(35, 120, 192, 0.25);
}
.main-content {
  padding: 38px 24px 72px;
}
@media (max-width: 960px) {
  .app-header {
    position: static;
    align-items: flex-start;
    flex-direction: column;
    padding: 16px 20px;
  }
  .header-controls {
    width: 100%;
    justify-content: space-between;
  }
}
@media (max-width: 680px) {
  .brand-area p {
    display: none;
  }
  .header-controls {
    align-items: stretch;
    flex-direction: column;
  }
  .navigation {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr;
  }
  .navigation a {
    text-align: center;
  }
  .main-content {
    padding: 24px 14px 52px;
  }
}
</style>
