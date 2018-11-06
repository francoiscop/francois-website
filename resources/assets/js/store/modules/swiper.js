export default {

	namespaced: true,

	state: {

		swipers: [],
		url: null,
		items: [],
		page : 1,
		isFetched : false,
		isLoading : true,
		isLoadingPlay : false,
		item: null
	},

	getters: {

		getItems : state => state.items,

		getItem : state => state.item,

		getIsFetched : state => state.isFetched,

		getLoadingPlay : state => state.isLoadingPlay,

		getLoading : state => state.isLoading

	},

	actions: {

		fetchItems({commit, state, dispatch, rootState}){

			commit('setIsFetched', true)

			return new Promise((resolve,reject) => {

				axios.get(state.url).then(response  =>  {

					commit('setLoading', false)

					commit('setItems', response.data.items)

					console.error('STATE SWIPER.JS -> response.data.items : ', response.data.items)

					console.error('STATE SWIPER.JS -> items : ', state.items)

					resolve()

				}, error => {

					commit('setLoading', false)

					reject(error)

				})
		
			})
		},
	},

	mutations: {

		setItems(state, items){

			//state.items = [...state.items, ...items]

			state.items = items

		},

		setItem(state, {key, index}){

			state.item = state.items[key][index]

		},

		setIsFetched(state, bool){

			state.isFetched = bool

		},

		setLoading(state, bool){

			state.isLoading = bool

		},

		setLoadingPlay(state, bool){

			state.isLoadingPlay = bool

		},

		setUrl(state, url){

			state.url = url

		},

	}

}