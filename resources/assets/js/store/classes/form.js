class Form {

	constructor(datas){

		this.datas = datas

		this.form = {}

		this.upload = null

		this.callback = 'submit'

		this.formatDefault()

		this.formatForm()

		this.setUpload()

		this.setCallback()

		this.setUrl()

	}

	formatForm(){

		if (!this.datas.hasOwnProperty('form')){

			this.form = null
			
			return
		}

		for (let k in this.datas.form){

			this.form[k] = {...this.default[k], ...this.datas.form[k]}

      	}
	}

	setUpload(){

		if (!this.datas.hasOwnProperty('upload')) return;

		this.upload = this.datas.upload

		if (!this.datas.upload.hasOwnProperty('display')) this.upload.display = true;
	}

	setCallback(){

		if (!this.datas.hasOwnProperty('callback')) return;

		this.callback = this.datas.callback
	}

	setUrl(){

		if (!this.datas.hasOwnProperty('url')) this.url = null;

		this.url = this.datas.url

	}

	formatDefault(){

		this.default = {}

		var d = this.getDefault()

		for (let k in d.default){

			this.default[k] = {...d.template, ...d.default[k]}
		}
	}

	getDefault(){

		return {

			template : {
				value : '',
              	type : null,
              	enum : false,
              	keyEnum : null,
              	required : false,
              	icon : null,
              	helper: null,
              	errorxxxxxxxxxxxxxxxxxx: {
                  	status : false,
                  	libel : null
              	},
              	rules : [],
              	max : null,
              	min : null
			},

			default : {
				title : {
                	//rules: ['alphanumeric']
            	},
            	username : {
                	rules: ['alphanumeric'],
                	icon: 'person',
                	max: 20,
                	min: 5
            	},
            	password : {
                	rules: ['match:password_confirmation'],
                	min: 5
            	},
            	password_confirmation : {
                	rules: ['match:password'],
                	min: 5
            	},
            	email : {
                	rules: ['email'],
                	icon: 'email'
            	},
            	dob : {
                	rules: ['dob'],
            	},
            	year : {
                	rules: ['integer'],
                	max : 4,
                	min : 4
            	},
            	tags : {
					key: 'name',
          			allowNew: false,
          			url : ''
				}
			},
		}

	}

	fetch(page, tracker){

		tracker = (tracker !== null) ? JSON.stringify(tracker) : ''

		return new Promise((resolve, reject) => {

			axios.get(this.url + '?page=' + page +'&t=' + tracker).then(response  =>  resolve(response), error => reject(error))
		
		})
	}

	post(data){

		return new Promise((resolve, reject) => {
          
          	axios.post(this.urlPost, data).then(response  =>  resolve(response), error => reject(error))
                  
        })
    }

	delete(){
		
	}

}

export default Form