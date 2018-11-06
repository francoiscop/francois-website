import Swiper from 'swiper'

require('../../../node_modules/swiper/dist/css/swiper.css')

window.Swiper = Swiper

Vue.component('vs-slide', require('./components/swiper/slide.vue'));
Vue.component('vs-swiper', require('./components/swiper/swiper.vue'));

var vm = new Vue({
	el: '#app'
})
