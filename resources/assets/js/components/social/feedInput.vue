<template>
    <div class="relative">

      <editor :init="{plugins: 'wordcount'}"></editor>

        <div>
          TEST
          <vue-editor v-model="test"></vue-editor>
        </div>




        <p class="hidden-height" ref="hiddenHeight">{{ content }}</p>
        <div class="post-input" ref="wrapper">
            <textarea class="textarea textarea-invisible" placeholder="What is on your mind ?" v-model="content" @keyup="plugin" v-bind:style="textareaHeight">
            </textarea>
            <div class="flex flex-warp" v-if="photoHasBeenUploaded" style="margin: 0px 4px;">
                <figure class="relative flex items-center justify-center" v-for="(photo, index) in photos">
                    <div style="position: relative;top:3px;margin: 0px 2px;">
                        <img v-bind:src="photo" :style="setImageHeight">
                    </div>
                    <div class="absolute" style="opacity: 0.8;top:4px;left:4px;" @click="removePhoto(index)">
                        <i class="material-icons mi-circle mi-15 mi-bg-smoke mi-top-0 pointer opactity-8">close</i>
                    </div>
                </figure>
            </div>

            <input multiple type="file" name="files[]" class="hide absolute" ref="photoUpload" @change="handlePhotoUpload">
        
        </div>
        <div class="flex space-between" style="margin: 2px 0px;">        
            <div class="button is-minimal has-text-info flex justify-center" v-bind:class="[{'has-text-warning' : isOver}, {'is-loading' : isLoadingCamera}]" @click="triggerFileUpload" @mouseover="isOver = true"  @mouseleave="isOver = false">
            <i class="material-icons" style="top:0px;font-size: 2rem;">photo_camera</i>
        </div>
        <div @click="sendPost" class="button" :disabled="content.length < 5" :class="[{'is-loading' : isLoading}]">
            Publish post
        </div>
    </div>

    <vs-error :error="error"></vs-error>

    </div>
</template>

<style>
.post-input {
    border:1px solid #209cee;
}
.post-input  textarea.textarea-invisible,
p.hidden-height{
    border-color: transparent;
    border-width: 0;
    overflow: hidden;
    resize: none;
    font-family: Oxygen Mono!important;
    font-size: 0.8rem!important;
     letter-spacing: 0px;
     min-height: 10em!important;
    white-space: pre-line;
}

p.hidden-height{
    position: absolute;
    visibility: hidden;
    top: -10000px;
}

.post-input input.hide{
    position: absolute;
    visibility: hidden;
    top: -10000px;
}


.box-custom-textareaxxxxxxxxxx textarea{
   resize: none!important;
   overflow: hidden;
   border:1px solid #E6ECF0;
   border:1px solid #ced4da;
   border-radius: 0;
   min-height: 2.8em!important;
   padding: 0.60em 0.6em;
   font-family: inherit!important;
   font-family: Oxygen Mono!important;
   font-size: 0.8rem!important;
   letter-spacing: 0px;
   box-shadow: 0 0 0 0em rgba(50, 115, 220, 0);
}

.box-custom-textarea textarea:focus{
  box-shadow: 0 0 0 0em rgba(50, 115, 220, 0)!important;
}
</style>

<script>
import { VueEditor } from 'vue2-editor'

import Editor from '@tinymce/tinymce-vue'

//import { ImageDrop } from 'quill-image-drop-module'
//import ImageResize from 'quill-image-resize-module'

import {mixError} from './mixins/mixError.js';
import {mixPost} from './mixins/mixPost.js';

export default {

  components: {
      VueEditor,
      'editor': Editor
   },

  mixins: [mixError, mixPost],
  data: function () {
      return {
        test: '<small>Some initial content</small>' ,

/*
        customModulesForEditor: [
          { alias: 'imageDrop', module: ImageDrop },
          { alias: 'imageResize', module: ImageResize }
        ],

        editorSettings: {
          modules: {
           // imageDrop: true,
            // imageResize: {}
          }
        }, 
*/

          imageHeight : 128,
          postFormData: new FormData(),
          isLoadingCamera : false,
          myclass : 'has-text-info',
          isOver : false,
          heightTextarea : {},
          imageBox : {},
          photos : [],
          images : [],
          _h : false,
      };
    },

    methods: {
      
        sendPost : function (){

          var formData = new FormData();

          formData.append('content', this.content);
          for (var key in this.images){
            formData.append('images[]', this.images[key]);
          }

          this.post('post', formData);
        },

        setContentHeight : function(add){

            if (this._h) return;
            var ht = this.$refs.wrapper.clientHeight;
            var total = (typeof add === 'undefined' || add === 1) ? ht + this.imageHeight : ht - this.imageHeight;
            Vue.set(this.heightTextarea, 'padding-bottom', total + 'px');
            Vue.set(this.imageBox, 'top', ht + 'px');
            this._h = true;
        },

        triggerFileUpload: function(){

          this.$refs.photoUpload.click();
          this.isLoadingCamera = true;
        },
      
        handlePhotoUpload: function(e){
        
          var self = this;
          var files = e.target.files;
  
          for (let i = 0; i < files.length; i++){
              
              let reader = new FileReader();
              
              reader.onloadend = function(evt){
                  self.photos.push(evt.target.result);
                  self.images.push(files[i]);
              }

              reader.onload = (function(theFile){
                  var image = new Image();
                  image.src = theFile.target.result;
                  image.onload = function() {
                      self.isLoadingCamera = false;
                      self.setContentHeight();
                  };
              });

              reader.readAsDataURL(files[i]);
          }
        },

        photoHasBeenUploaded: function(){
          
          return this.photos.length > 0;
        },

        removePhoto: function(index){
          
          this.photos.splice(index, 1);
          this.images.splice(index, 1);

          this.$refs.photoUpload.value = '';

          if (!this.photoHasBeenUploaded()){
            this._h = false;
            this.setContentHeight(0);
          }
        },

        removeAllPhoto(){
            for (let index in this.photos){
                this.removePhoto(index);
            }

            this.photos = [];
            this.images = [];
        }
  },
  
  computed: {
      setImageHeight: function(){
        return 'height: ' + this.imageHeight + 'px';
      },
      tweetIsEmpty: function() {
        return this.tweet.length === 0;
      },
      tweetIsOutOfRange: function() {
        return this.charactersRemaining == MAX_TWEET_LENGTH || this.charactersRemaining < 0;
      },
      charactersRemaining: function() {
        return MAX_TWEET_LENGTH - this.tweet.length;
      },
      underTwentyMark: function() {
        return this.charactersRemaining <= 20 && this.charactersRemaining > 10;
      },
      underTenMark: function() {
        return this.charactersRemaining <= 10;
      }
    },

}
</script>