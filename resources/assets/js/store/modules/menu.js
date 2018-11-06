export default {

	namespaced: true,

	state: {

		menu : []
	},

	getters: {

		getMenu: state => state.menu,

	},

	actions: {

		setMenuFromePanels({commit, state}, panels){

			//const path = window.location.pathname.split('/')
			const path = window.location.pathname

			let menu = panels.map(panel => {

				let router = null

				if (panel.link === null) router = `/${panel.name}`;

				if (panel.link === path) router = (panel.name === 'reel') ? '/reel' : '/';
				
				return {
					name : panel.name,
					link : panel.link,
					router : router
				}
			
			})
			
			commit('setMenu', menu)

		},

		scroll({commit, state, dispatch}, direction){

			if (typeof direction !== 'number' && ['next', 'previous'].indexOf(direction) === -1) return;

			if (typeof direction === 'number' && typeof state.panels[direction] === 'undefined') return;

			if (direction === 'next') commit('incIndex');

			if (direction === 'previous') commit('decIndex');

			if (typeof direction === 'number') commit('setIndex', direction);

			commit('setManualScroll', false)			

			commit('setNavY', state.panels[state.index].Y)

			const callback = () => {
				
				setTimeout(() => {

					console.log('FINSIHED!!!!!!')

					commit('setManualScroll', true)

				}, 500)
			}

			const $div = document.getElementById('panel-0')
    		
    		VueScrollTo.scrollTo($div, {
        			
        			nav : state.navY,
        			onDone : callback
        	
        	})
    	}

	},

	mutations: {

		setMenu(state, menu){

			state.menu = menu

		},

		/*
		setToRouter(state, key){

			state.menu[1].link = null

			state.menu[1].router = '/'

		},
		*/

		setManualScroll(state, bool){

			state.manualScroll = bool

		},

		incIndex(state){

			const l = state.panels.length

			state.index ++

           	state.index = Math.min(l - 1, state.index)
		},

		decIndex(state){

			const l = state.panels.length

			state.index --

           	state.index = Math.max(0, state.index)
		},

		setIndex(state, index){

           	state.index = index
		},

		setNavY(state, navY){

           	state.navY = navY
		},

		setModal(state, bool){

           	state.modal = bool
		},

	}

}