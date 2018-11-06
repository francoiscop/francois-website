import Vue from 'vue'

import Vuex from 'vuex'

import VueRouter from 'vue-router'

import axios from 'axios'

import Buefy from 'buefy'

import { VLazyImagePlugin } from "v-lazy-image"


let token = document.head.querySelector('meta[name="csrf-token"]');

axios.defaults.headers.common = {
    'X-CSRF-TOKEN': token.content,
    'X-Requested-With': 'XMLHttpRequest'
};

window.axios = axios;
window.Vue = Vue;
window.token = token;

Vue.use(VueRouter)

Vue.use(Buefy)

Vue.use(Vuex)

Vue.use(VLazyImagePlugin)


Vue.component('vh-menu', require('./components/menu/menu.vue'));
Vue.component('vh-menu-user', require('./components/menu/menuUser.vue'));
Vue.component('vs-play', require('./components/icons/play.vue'));
Vue.component('vs-videos', require('./components/videos/videos.vue'));
//Vue.component('vs-plyr-modal', require('./components/plyr/plyrModal.vue'));
Vue.component('vs-screencaps-modal', require('./components/screencaps/screencapsModal.vue'));


import menu from './store/modules/menu'

import video from './store/modules/video'

window.store = new Vuex.Store({

    modules: {
      menu,
      video,
      //swiper
    }
})

const thumbComponent = {
  template: `
    <vs-upload-simple name-upload="thumb" :thumb-id="thumbId">
      <div class="notification is-warning center-text">THUMB INDEX : {{ thumbId }}</div>
    </vs-upload-simple>`,
  props: ['thumbId']
}

const formComponent = { template: '<vs-form label="update" ></vs-form>' }
const videosComponent = { template: '<vs-videos></vs-videos>' }
import contactComponent from "./views/contact.vue"
import aboutComponent from "./views/about.vue"

let routes = [
  { 
    path: '/thumb/:thumbId',
    component: thumbComponent,
    props: true
  },
  { path: '/', component: videosComponent },
  { path: '/contact', component: contactComponent },
  { path: '/about', component: aboutComponent },
  { path: '/edit', component: formComponent },
]



window.router = new VueRouter({
  routes // short for `routes: routes`
})



Vue.directive('click-outside', {
  bind: function (el, binding, vnode) {
    el.clickOutsideEvent = function (event) {
      // here I check that click was outside the el and his childrens
      if (!(el == event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        vnode.context[binding.expression](event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unbind: function (el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  },
});