import VueScrollTo from 'vue-scrollto'

export default {

	namespaced: true,

	state: {

		controller : null,

		panels : null,
		
		manualScroll : true,
		
		index : 0,
		
		navY : 0,

		modal : false
	},

	getters: {

		getIndex: state => state.index,

		getManualScroll: state => state.manualScroll,

		getNavY: state => state.navY,

		getModal : state => state.modal

	},

	actions: {

		setPanels({commit, state}, panels){

			commit('setPanels', panels)

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

		setController(state, controller){

			state.controller = controller

		},

		setPanels(state, panels){

			state.panels = panels

		},

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