import Feeds from '../classes/feeds'

let c = null;

if (window.hasOwnProperty('_feeds')) c = new Feeds(_feeds.parentId);

export default {

	namespaced: true,

	state: {

		items: [],
		page : 1,
		tracker : null,
		feed : null,
		isEnd : false
	},

	getters: {

	},

	actions: {

		fetchItems({commit, state, dispatch, rootState}){

			if (c !== null){

				commit('setClass', c)

				return new Promise((resolve,reject) => {

					c.fetch(state.page, state.tracker).then(response => {

						if (response.data.feeds.length === 0) commit('setEnd', true);

						commit('setItems', response.data.feeds)
						commit('setTracker', response.data.tracker)
						commit('incPage')
						resolve()

					}).catch(error => {

						reject(error)

					})
				})

			}
		},

		postItem({commit, state, dispatch, rootState}, data){

			return new Promise((resolve,reject) => {

				c.post(data).then(response => {

					commit('addItem', response.data.post)

					resolve(response)

				}).catch(error => {

					reject(error)
				})

			})
		
		},

		deleteItem({commit, state, dispatch, rootState}, index){

			commit('deleteItem', index)
			
		}

	},

	mutations: {

		setClass(state, c){

			state.feed = c

		},

		setEnd(state, value){

			state.isEnd = value

		},

		setItems(state, items){

			state.items = [...state.items, ...items]

		},

		addItem(state, item){

			state.items.unshift(item)
		},

		deleteItem(state, index){

			state.items.splice(index, 1)

		},

		setTracker(state, t){

			state.tracker = t

		},

		incPage(state){

			state.page ++
		}

	}

}