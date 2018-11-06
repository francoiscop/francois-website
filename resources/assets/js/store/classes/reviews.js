class Reviews {

	constructor(id){

		this.url = '/rest/review/' + id

	}

	fetch(page){

		return new Promise((resolve, reject) => {

			axios.get(this.url + '?page=' + page).then(response  =>  resolve(response), error => reject(error))
		
		})
	}

	post(data){

		return new Promise((resolve, reject) => {
          
          	axios.post(this.url, data).then(response  =>  resolve(response), error => reject(error))
                  
        })
    }

	delete(){
		
	}

}

export default Reviews