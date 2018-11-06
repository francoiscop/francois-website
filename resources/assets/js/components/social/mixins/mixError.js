export const mixError = {  
  
  data(){
    
    return {
        
        error : {
          status : false,
          success : false,
          libel : ''
        }
    
    }
  },
  
  methods: {

    setError(error){

      console.error('ERROR ::: ' , error.response)

       if (!error || !error.response) return;

       let libel = false;

       if (error.response.status === 404 || error.response.status === 500) libel = 'Error System';

       if (error.response.status === 403) libel = 'You need to be logegd in';

       if (!libel && typeof error.response.data.errors === 'undefined'){

        if (typeof error.response.data.error !== 'undefined') libel = 'Error ' + error.response.data.error;

        else libel = 'Undefined Error';

       }

       if (!libel){

        let k = 0

        for (k in error.response.data.errors) break;

        libel = error.response.data.errors[k][0]
       }

       this.setLibel(libel)
    },

    setLibel(libel){

      this.error.status = true
      //state.error.success = true
      this.error.libel = libel
    },

  }
};