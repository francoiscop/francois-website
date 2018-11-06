require('../../../node_modules/swiper/dist/css/swiper.css')

import KsVueScrollmagic from 'ks-vue-scrollmagic/src/'

import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators'

import {TweenMax, Power2, TimelineLite} from "gsap";

import Draggable from "gsap/Draggable";

import ScrollToPlugin from "gsap/ScrollToPlugin";

import Swiper from 'swiper'





Vue.use(KsVueScrollmagic)

window.Swiper = Swiper;

Vue.component('vs-home', require('./components/home.vue'));
Vue.component('vs-slide', require('./components/swiper/slide.vue'));
Vue.component('vs-swiper', require('./components/swiper/swiper.vue'));
Vue.component('vs-plyr-modal', require('./components/plyr/plyrModal.vue'));



import swiper from './store/modules/swiper'


window.store = new Vuex.Store({

  modules: {
    home,
    swiper
  },

  state: {

  },

  getters: {

  },

  actions: {

  },

  mutations: {

  }
})