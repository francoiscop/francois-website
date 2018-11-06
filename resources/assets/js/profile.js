require('./components/editor/editor.css')

Vue.component('error', require('./components/social/error.vue'));
Vue.component('vs-comment-input', require('./components/social/commentInput.vue'));
Vue.component('vs-comment', require('./components/social/comment.vue'));
Vue.component('vs-comments', require('./components/social/comments.vue'));
Vue.component('vs-editor', require('./components/editor/editor.vue'));
Vue.component('vs-feed', require('./components/social/feed.vue'));
Vue.component('vs-feeds', require('./components/social/feeds.vue'));
Vue.component('vs-reviews', require('./components/social/reviews.vue'));
Vue.component('vs-buttons', require('./components/social/buttons/buttonsControl.vue'));

import Vuex from 'vuex'

Vue.use(Vuex)

import feeds from './store/modules/feeds'
import comments from './store/modules/comments'
import reviews from './store/modules/reviews'

window.store = new Vuex.Store({

	modules: {

		comments,
		feeds,
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