import Comments from '../classes/comments'

let c = null;

if (window.hasOwnProperty('_comments')) c = new Comments(_comments.parentId, _comments.parentClass);

export default {

	namespaced: true,

	state: {

		items: [],
		page : 1,
		max : 0,
	},

	getters: {

	},

	actions: {

		fetchItems({commit, state, dispatch, rootState}){

			if (c !== null){

				c.fetch(state.page).then(response => {

					commit('setItems', response.data.comments)
					commit('setMax', response.data.max)
					commit('incPage')

				}).catch(error => {

					console.warn('ERROR ::', error)

				})
			}
		},

		appendItem({commit, state, dispatch, rootState}, item){

			commit('addItem', item)
			commit('incMax')
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

			//state.items.unshift(item)

			state.items = [item, ...state.items];

		},

		deleteItem(state, index){

			state.items.splice(index, 1)

		},

		setMax(state, max){

			state.max = max

		},

		incMax(state){

			state.max ++

		},

		incPage(state){

			state.page ++
		}

	}

}