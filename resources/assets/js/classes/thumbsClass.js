class Thumbs {

    constructor(uid){
      this.uid = uid;
      this.process = true;
      this.src = false;
      this.counter = 0;
      this.maxRequest = 50;
      this.updRate = 1000;

      console.log('ID THUMBS', this.id);
    
    }

    start(){
      return new Promise((resolve,reject) => {

        this.intval = setInterval(() => {
            axios.get('/rest/thumbs/' + this.uid).then((response) => {

              console.log(response);
              var r = response.data;

                this.counter ++;
                if (r.max >= this.max || r.status == 2 || this.counter > this.maxRequest || (r.max == 0 && this.counter > 5)){
                    if (r.max >= this.max || r.status == 2){
                        this.src = r.url;
                        console.log(this.src);
                        console.log(1);
                        resolve(this.src);
                    } else {
                        console.log(0);
                        reject();
                    }

                    clearInterval(this.intval);
                    this.process = false;
                }

            })
            .catch((error) => {
              console.log('error');
            });
        }, this.updRate);

      });
      
    }

    processing(){

    }
}

export default Thumbs;