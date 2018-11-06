import Form from '../classes/form'

let f = {};

if (window.hasOwnProperty('_form')) f = _form;

export default {

	namespaced: true,

	state: {

		c: null,
		form: {},
		errors: [],
		callback: '',
		display: {
			form : true,
			upload : false
		},
		upload : null,
		url : null,
		datas : {}
	},

	getters: {

		getDisplay: state => state.display

	},

	actions: {

		init({commit, state, dispatch, rootState}){

			let c = new Form(f)

			commit('setForm', c)

		},

		setError({commit, state}, e){

			if (state.errors.indexOf(e) > -1) return;

			commit('addError', e)

		},

		clearError({commit, state}, e){

			const index = state.errors.indexOf(e);
            
            if (index === -1) return;

			commit('removeError', index)

		},


		submit({commit, state, dispatch, rootState}, data){

			if (state.errors.length > 0) return;

			let formData = new FormData();

			for (let key in state.datas){

				if (typeof state.datas[key] === 'object'){
					
					for (let j in state.datas[key]) formData.append(key + '[]', state.datas[key][j]);
				}
			
				else formData.append(key, state.datas[key]);

			}

			if (state.url === null && state.c.url !== null) commit('setUrl',  state.c.url);

			//console.warn('datas ::', state.datas)
			//console.error(state.url)
			//console.error('TAGS ::', state.datas.tags)

			return new Promise((resolve,reject) => {

				axios.post(state.url, formData).then(response => {


					if (!response.hasOwnProperty('data') || response.data === null){

						commit('setDisplay', {value :false, type : 'form'})

					}

					else if (!response.data.hasOwnProperty('hide') || response.data.hide){

						commit('setDisplay', {value :false, type : 'form'})

					}
					
					resolve(response)

				}, error => reject(error))

			})
		
		},

		hideForm({commit, dispatch}){

			commit('setDisplay', {value :false, type : 'form'})

		},

		next({commit, state}){

			//for (var pair of state.datas.entries()) {
              //  console.log(pair[0]+ ', ' + pair[1]); 
            //}
            //console.warn('state error => ', state.errors)

            if (state.errors.length > 0) return;

			commit('setDisplay', {value :false, type : 'form'})
			commit('setDisplay', {value :true, type : 'upload'})

		},

		setUrl({commit}, url){

			commit('setUrl', url)
		},

		changeCallback({commit}, callback){

			commit('changeCallback', callback)
		}

	},

	mutations: {

		setForm(state, c){

			state.c = c
			state.form = c.form
			state.callback = c.callback
			state.upload = c.upload

			if (c.form === null) state.display.form = false

			if (c.upload !== null) state.display.upload = c.upload.display

		},

		changeCallback(state, callback){

			state.callback = callback

		},

		addError(state, e){

			state.errors.push(e)

		},

		removeError(state, index){

			state.errors.splice(index, 1);

		},

		setDisplay(state, obj){

			state.display[obj.type] = obj.value
		
		},

		appendData(state, arr){

			state.datas[arr[0]] = arr[1]
		
		},

		removeData(state, key){

			/*
			var index = state.datas.indexOf(key)

			if (index > -1) state.datas.splice(index, 1);
			*/
			delete state.datas[key]
		
		},

		setUrl(state, url){

			state.url = url
		}

	}

}