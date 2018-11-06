class Feeds {

	constructor(id){

		this.url = '/rest/feed/' + id

		this.urlPost = '/rest/post/' + id

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

export default Feeds