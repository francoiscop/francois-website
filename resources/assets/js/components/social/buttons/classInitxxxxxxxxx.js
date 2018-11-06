class Init {

    constructor(type, id, parentClass = null){

        this.type = type;
        this.id = id;
        this.parentClass = parentClass;
        this.url = null;

        if (this.type === 'comments') this.url = '/rest/comment/' + this.parentClass + '/' + this.id;
        if (this.type === 'feeds') this.url = '/rest/feed/' + this.id;
    }


    load(page = 1){

        return new Promise((resolve,reject) => {

              axios.get(this.url + '?page=' + page).then((response) => {
                  resolve([response.data[this.type], response.data.max]);
              }, (error)  =>  {
                    reject(error);          
              });
        })

    }

}

export default Init