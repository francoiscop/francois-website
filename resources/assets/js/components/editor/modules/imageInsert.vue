<template>
    <div class="flex flex-center justify-center button is-minimal" style="height:100%"
        :class="[{'has-text-link' : isOver}, {'is-loading' : isLoading}]"
        @click="triggerFileUpload"
        @mouseover="isOver = true" 
        @mouseleave="isOver = false"
    >
        <i class="material-icons" style="font-size:26px;">photo_camera</i>
        <input multiple type="file" name="files[]" class="hide absolute" ref="photoUpload" @change="handlePhotoUpload">
    
    </div>
</template>

<script>
import bus from '../bus.js';

export default {
    title: "imageInsert",
    icon: null,
    description: "Insert Image",
    hasSelection : false,

    props: ["options"],

    data(){
        return {
            imageHeight : 128,
            postFormData: new FormData(),
            isLoading : false,
            isOver : true,
            photos : [],
            //images : [],
        }
    },

    computed: {
        uploadURL () {
            //return this.options.image.uploadURL;
        },
    },

    mounted(){

        this.listen();

    },

    methods: {

         triggerFileUpload: function(){

          this.$refs.photoUpload.click();
          this.isLoading = true;
        },
      
        handlePhotoUpload: function(e){
        
          //var self = this;
          var files = e.target.files;
  
          for (let i = 0; i < files.length; i++){
              
              let reader = new FileReader();
              
              reader.onloadend = (e) => {
                  
                  //this.photos.push(e.target.result);
                  //this.images.push(files[i]);
              
              }

              reader.onload = (theFile) => {
                  
                  var image = new Image();
                  
                  image.src = theFile.target.result;
                  
                  image.onload = () => {

                      bus.images.push(files[i]);
                      //this.$emit('addImage', files[i]);

                      var len = bus.images.length;
                      
                      this.isLoading = false;
                      
                       //self.$emit("exec", "insertHTML",'image', `<div class="content__image-wrapper"><img src=${reader.result}><div class="absolute center-absolute clear"><i class="material-icons">clear</i></div></div>`);

                       //self.$emit("exec", "insertHTMLimage",'image', `<div class="content__image-wrapper" contenteditable="false">TESTjjjj</div><span style="displayx:none">:</span>`);

                       this.$emit("exec", "insertHTML",'image', `<a class="content__image-wrapper" contenteditable="false" id="content__image-${len}"><img-inserted><img src=${reader.result}><i class="material-icons absolute center-absolute clear">clear</i></a></img-inserted><p style="color:black;opacity:1">:</p>`);


                       //console.error('IMAGES !!!!!', this.$parent.images)
                       //console.error('IMAGES LENGTH', this.$parent.images.length)
                       //console.error('PHOTOS !!!!!', this.photos)
                  };
              };

              reader.readAsDataURL(files[i]);
          }
        },

        listen(){

            document.addEventListener('click', (e) => {

                if(e.target && e.target.className.includes('clear')){

                    this.delete(e)
                }

            })
        },


        delete(e){

            //alert('delete !!!!');
            var elem = e.target.parentNode;

            if (elem.parentNode === null) return;

            var index = parseInt(elem.id.replace('content__image-','')) - 1;

            elem.parentNode.removeChild(elem);

            if (index > -1) {

                bus.images.splice(index, 1);

            }

        },


        fileUploaded (file, r) {
            if (r)
                this.$emit("exec", "insertHTML", `<img src=${r}>`);
        },

        fileAdded (file) {
            // if no upload url is defined, insert image with base64 src
            if (file && this.uploadURL !== "None")
                return;

            const reader = new FileReader();

            reader.addEventListener("load", () => {
               this.$emit("exec", "insertHTML", `<img src=${reader.result}>`);
            }, false);

            reader.readAsDataURL(file);
        }
    },
}
</script>

