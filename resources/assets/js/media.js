require('../sass/form.scss')

Vue.component('error', require('./components/social/error.vue'));
Vue.component('vs-comment-input', require('./components/social/commentInput.vue'));
Vue.component('vs-comment', require('./components/social/comment.vue'));
Vue.component('vs-comments', require('./components/social/comments.vue'));
Vue.component('vs-buttons', require('./components/social/buttons/buttonsControl.vue'));
Vue.component('vs-rating', require('./components/social/rating.vue'));
Vue.component('vs-review-input', require('./components/social/reviewInput.vue'));
Vue.component('vs-reviews', require('./components/social/reviews.vue'));

Vue.component('vs-display-tags', require('./components/displayTags.vue'));

import Vuex from 'vuex'

Vue.use(Vuex)

import comments from './store/modules/comments'
import reviews from './store/modules/reviews'

const store = new Vuex.Store({

	modules: {

		comments,
		reviews
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

const vm = new Vue({
	el: '#app',
    store
})