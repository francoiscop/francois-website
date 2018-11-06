export const mixPost = {

  props: {
      
      parentId : {},

      parentClass : {
          type : String,
          default : null
      },

      /*
      placeholder : {
          type : String,
          default : ''
      },
      */   
  },

  data(){
    return {
        isPostLoading: false
    }
  },

  methods: {

      post(data){

          return axios.post(this.url, data).then((response)  =>  {
                  
                  this.isPostLoading = false;
                  //this.$emit('posted', response.data);
                  this.reset();

                  console.warn('PARENT COMMENTS', this.$parent)

                  return response.data
          
          }, (error)  =>  {
                  
                  this.isPostLoading = false;
                  this.setError(error);
                  //this.reset();

                  return error            
          
          });
      }
  },



/*
  data() {
      return {
        content : '',
        textareaHeight : {},  
        isLoading : false,
      };
  },


  methods : {

        post(type = 'comment', data = null){

            if (this.isEmpty) return;
            this.isLoading = true;

            if (data === null) data = {comment : this.content};

            axios.post(this.url, data).then((response)  =>  {
                  this.isLoading = false;
                  this.$emit('posted', response.data[type]);
                  this.reset(type);
             }, (error)  =>  {
                  this.isLoading = false;
                  this.setError(error);
                  this.reset(type);              
            });
        },

        plugin(){
          this.error.status = false;
          this.error.text = null;

          var h = this.$refs.hiddenHeight.clientHeight;
          Vue.set(this.textareaHeight, 'height', h + 'px!important');
        },

        reset(type = null){
            this.content = '';
            if (type === 'post') this.removeAllPhoto();
        },
  },

  computed: {

        url(){
          if (this.parentClass === null)  return '/rest/post/' + this.parentId;
          return '/rest/comment/'+ this.parentClass + '/' + this.parentId;
        },

        isEmpty : function(){
            return this.content.length === 0;
        },

        min : function() {
            return this.content.length >= 5;
        }
      
  },
  */

};