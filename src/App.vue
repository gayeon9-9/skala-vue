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
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <!-- <WeatherMockup1 />
  <WeatherComposition /> 
  <WeatherParent />-->
  <div class="app-wrapper">
    <header class="app-header">
      <h1>🌍 어디로 갈까?</h1>

      <nav class="navigation">
        <RouterLink to="/">날씨 대시보드</RouterLink>
        <RouterLink to="/favorites">관심 여행지</RouterLink>
        <RouterLink to="/about">서비스 소개</RouterLink>
      </nav>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-wrapper { min-height: 100vh; }
.app-header { padding: 20px; text-align: center; border-bottom: 1px solid #ddd; }
.app-header h1 { margin: 0 0 15px; }
.navigation { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; }
.navigation a { padding: 8px 12px; color: #333; text-decoration: none; border-radius: 4px; }
.navigation a:hover { background-color: #eef5ff; }
.navigation a.router-link-exact-active { color: white; background-color: #1976d2; }
.main-content { padding: 20px; }
</style>
