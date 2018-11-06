import Reviews from '../classes/reviews'

let c = null;
let max = 0;

if (window.hasOwnProperty('_reviews')){

	c = new Reviews(_reviews.parentId)

	max = parseInt(_reviews.max)

}

export default {

	namespaced: true,

	state: {

		items: [],
		page : 1,
		max : max,
		posted : 0
	},

	getters: {

	},

	actions: {

		fetchItems({commit, state, dispatch, rootState}){

			if (c !== null){

				return new Promise((resolve,reject) => {

					c.fetch(state.page, state.tracker).then(response => {

						commit('setItems', response.data.reviews)
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

					commit('addItem', response.data.review)
					commit('incMax')
					commit('incPosted')

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

		setItems(state, items){

			state.items = [...state.items, ...items]

		},

		addItem(state, item){

			state.items.unshift(item)
		},

		deleteItem(state, index){

			state.items.splice(index, 1)

		},

		incMax(state){

			state.max ++

		},

		incPosted(state){

			state.posted ++

		},

		incPage(state){

			state.page ++
		}

	}

}