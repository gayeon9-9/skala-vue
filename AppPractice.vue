<!-- <script setup>
// import { RouterLink, RouterView } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'
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
