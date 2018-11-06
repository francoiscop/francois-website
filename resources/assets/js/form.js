require('../sass/form.scss');

require('../../../node_modules/cropperjs/dist/cropper.min.css');

Vue.component('error', require('./components/social/error.vue'));
Vue.component('vv-switch', require('./components/form/switch.vue'));
Vue.component('vv-switches', require('./components/form/switches.vue'));
Vue.component('vv-textarea', require('./components/form/textarea.vue'));
Vue.component('vv-select-label', require('./components/form/selectLabel.vue'));
Vue.component('vv-input', require('./components/form/input.vue'));
Vue.component('vv-gender', require('./components/form/gender.vue'));
Vue.component('vv-dob', require('./components/form/dateOfBirth.vue'));
Vue.component('vv-date-year-month', require('./components/form/dateYearMonth.vue'));
Vue.component('vv-captcha', require('./components/form/captcha.vue'));
Vue.component('vv-tag', require('./components/form/tag.vue'));
Vue.component('vv-checkbox', require('./components/form/checkbox.vue'));
Vue.component('vs-form', require('./components/form/form.vue'));

Vue.component('vs-upload', require('./components/form/upload.vue'));

Vue.component('vs-upload-simple', require('./components/form/uploadSimple.vue'));

import Vuex from 'vuex'

Vue.use(Vuex)

import form from './store/modules/form'

window.store = new Vuex.Store({

	modules: {

		form
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


/*
const vm = new Vue({
	el: '#app',
    store
})
*/