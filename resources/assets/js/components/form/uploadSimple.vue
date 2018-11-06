<template>
	<div>

    <slot />

		<div v-if="nameUpload !== null" class="anton s-10 c center-text is-fullwidth notification is-danger has-text-black">Upload a picture for your {{nameUpload}}</div>


		<form id="form-upload" @submit.prevent="onSubmit" enctype="multipart/form-data">

		<vs-input-file
               ref="upload"
               v-model="files"
               :post-action="postAction"
               :put-action="putAction"
               :extensions="extensions"
               :accept="accept"
               :multiple="false"
               :directory="directory"
               :size="size || 0"
               :thread="thread < 1 ? 1 : (thread > 5 ? 5 : thread)"
               :headers="headers"
               :data="data"
               :drop="drop"
               :drop-directory="dropDirectory"
               :add-index="addIndex"
               :maximum="1"
               :cropper="true"
               @input-file="inputFile"
               @input-filter="inputFilter"
        />

        <error :error="error" />

        <div class="flex flex-warp flex-center-x">
                  
                  <blob-media v-for="(file, index) in files"
                      :key="index"
                      :cropper="true"
                      :file="file"
                      :isVideo="false"
                      :aspect="ratio"
                      @remove="remove($event)"
                  />
              
        </div>

        <div v-if="isImages" class="flex flex-warp m-t-20">
        	<div v-for="(image, index) in images" class="p-1 pointer">
        		<img :src="image" style="width: 100%" @click="clickImage(image, $event)"/>
        	</div>
        </div>

        <div class="modal" :class="{'is-active' : files.length && edit}" v-if="files.length">
               <div class="modal-background"></div>
               <div class="modal-box">
                  <div class="modal-box-header"></div>
                  <div class="modal-box-content">
                     <b-loading :is-full-page="true" :active.sync="isCropperLoading" />
                     <div class="box-img" :style="(!isCropperLoading) ? 'opacity:1' : 'opacity:0'">
                        <img ref="cropper" :src="files[files.length - 1].thumb">
                     </div>
                     <div class="box-preview"></div>
                  </div>
                  <div class="modal-box-footer center-text" style="margin-top:5px;">
                     <span class="button is-medium is-primary save" @click.prevent="cropperSave">SAVE</span>
                     <span class="button is-medium cancel" @click.prevent="cropperCancel">CANCEL</span>
                  </div>
               </div>
               <button class="modal-close is-large" aria-label="close" @click.prevent="cropperCancel"></button>
        </div>

        </form>

	</div>
</template>

<style type="text/css">
.modal-my-content{
  border:10px solid green;
  z-index: 20;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: calc(100% - 15%);
  max-height: 100vh;
}
.box-img{
  border:0px solid red;
  max-height: 70vh;
  max-width: calc(100% - 15%);
  padding: 0px;
}

.box-img img {
  max-width: 100%; 
}
.box-preview{
  overflow: hidden;
  height: 200px;
  width: 200px;
  position: absolute;
  top:4px;
  left:4px;
  border:4px solid orange;
}
.modal-close{
  z-index:200;
}
.modal-box{
  border:0px solid orange;
  display: flex;
  flex-direction: column;
  z-index: 20;
  padding: 5px;
}
</style>

<script>
import inputFile from './inputFile.vue'

import VueScrollTo from 'vue-scrollto'

import Cropper from 'cropperjs'

import {mixError} from '../social/mixins/mixError'

import blobMedia from './blobMedia.vue'

export default {

    mixins: [mixError],

    components:{
        vsInputFile : inputFile,
        blobMedia : blobMedia
    },

	props : {

		nameUpload: {
			type: String,
			default: 'poster'
		},

   thumbId : {
    type: [Number, String]
   }

	},

	data(){
		return{

			aspects:{
				poster: 1.78,
        thumb: 1.78,
				avatar: 1,
				cover: 3
			},

			files: [],
            error: {
                status: false,
                success: false,
                label: ''
            },
            edit: false,
            cropper: null,
            isCropperLoading: true,
            directory: false,
            drop: true,
            dropDirectory: true,
            addIndex: false,
            thread: 3,
            name: 'file',
            headers: {
                'X-CSRF-TOKEN': token.content,
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: {
            	  media: this.nameUpload,
                user_id: user.id,
                type: _upload.settings.type,
                thumbId: null
                //id: _user.uid + new Date().valueOf() + Math.floor((Math.random() * 100000) + 1),
            },
            autoCompress: 1024 * 1024,
            uploadAuto: false,
            isOption: false,
            addData: {
                show: false,
                name: '',
                type: '',
                content: '',
            },
            editFile: {
                show: false,
                name: '',
            }

		}
	},

	computed : {

		  accept(){
            
            let accept = '';

            for (let k in _upload.settings.valid_file_upload) {
                
                accept +=  'image/' + _upload.settings.valid_file_upload[k];
                
                if (k < _upload.settings.valid_file_upload.length - 1) accept += ',';
            }

            return accept;
        },

        extensions(){
            return _upload.settings.valid_file_upload.toString()
        },
        minSize(){
            return _upload.settings.min_size_upload
        },        
        size(){
            return _upload.settings.max_size_upload
        },
        postAction(){
            return _upload.settings.url
        },
        putAction(){
            return _upload.settings.url
        },

        isImages(){

        	if (!_upload.hasOwnProperty('images') || _upload.images.length < 1) return false;

        	return true
        },

        images(){

        	if (!_upload.hasOwnProperty('images') || _upload.images.length < 1) return [];

        	return _upload.images

        },
        ratio(){
        	return (this.thumbId === 'hero') ? this.aspects.cover : this.aspects[this.nameUpload];
        }
        
    },

    methods : {

    	remove(file) {
            
            if (this.files.length < 2) this.isEdit = false;

            this.$refs.upload.remove(file)
        
        },

    	inputFile(newFile, oldFile){

          this.data.thumbId = this.thumbId

                        
            if (newFile && !oldFile) {

                console.warn('INIT CROPPER', this.files)

                this.$nextTick(() => this.edit = true)

                return
            }


            if (newFile && oldFile) {

                


                
                // RESPONSE AFTER UPLAOD :
                
                if (!newFile.active && oldFile.active) {

                    
                    //ERROR :
                    
                    if (newFile.error && oldFile.error) {

                        let _error = 'Error system'

                        console.error('newFile.response :::::::: => ', newFile.response)

                        if (newFile.xhr.status === 422){

                            _error = 'Error: '

                            for (let k in newFile.response.errors) _error += '<br />' +  newFile.response.errors[k][0];
                        }
                        
                        else if (newFile.xhr.status === 401) _error = 'ERROR: You need to be logged in';
                       
                        else if (newFile.response.error) _error = 'ERROR: ' + newFile.response.error;

                        this.$refs.upload.update(oldFile, {error: _error, loading : false});
                    }
                }

                
                // PROGRESS :
                    
                if (newFile.progress !== oldFile.progress) {
                    // progress
                }
                
                
                // SUCCESS (AFTER UPLOAD) :
                
                if (newFile.success && !oldFile.success) {

                    this.$refs.upload.update(oldFile.id, { loading: false })

                    return

                }
            }

          

            this.$refs.upload.opacity = 1;
        },
        
        
        inputFilter: function(newFile, oldFile, prevent) {


        	console.error(newFile)

        	//this.setError('test')
            //return prevent()


            if (newFile && !oldFile) {

                // Before adding a file

                this.clearError()

                //console.warn('newFile:', newFile)
                // Filter size
                if (newFile.size > this.size) {
                    this.setError('File too big : maximum allowed ' + this.$options.filters.formatSize(this.size))
                    return prevent()
                }

                if (newFile.size < this.minSizs) {
                    this.setError('File too small : minimun ' + this.$options.filters.formatSize(this.minSize))
                    return prevent()
                }

                // Filter system files or hide files
                if (/(\/|^)(Thumbs\.db|desktop\.ini|\..+)$/.test(newFile.name)) {
                    return prevent()
                }

                // Filter php html js file
                if (/\.(php5?|html?|jsx?)$/i.test(newFile.name)) {
                    return prevent()
                }

                //Filter non-image file
                var extensions = new RegExp('\\.(' + _upload.settings.valid_file_upload.join('|').replace(/\./g, '\\.') + ')$', 'i')

                if (newFile.name.search(extensions) === -1) {
                    this.setError('Invalid extension : only ' + _upload.settings.valid_file_upload.join(' '))
                    return prevent()
                }
            }
            
            if (newFile && (!oldFile || newFile.file !== oldFile.file)) {
                
                newFile.thumb = ''
                let URL = window.URL || window.webkitURL
                if (URL && URL.createObjectURL) {
                    newFile.thumb = URL.createObjectURL(newFile.file)

                    newFile.cropper = newFile.thumb
                }
            }
            
        },

        setError(label){
            this.error.status = true
            this.error.label = label
        },

        clearError(label) {
            this.error.status = false
            this.error.label = ''

            if (typeof libel === 'undefined') return;

            console.error('EMIT CLEAR ERROR :: ' + label);
            console.warn('ERRORS BEFORE :', this.errors);
            var index = this.errors.indexOf(label);
            if (index > -1) this.errors.splice(index, 1);
            console.log('INDEX', index);
            console.warn('ERRORS AFTER :', this.errors);
        },

        cropperCancel(){
            
            this.cropper.destroy()

            this.cropper = false

            this.remove(this.files[this.files.length - 1])

            this.edit = false

            this.isCropperLoading = true
        },

        cropperSave() {

            this.data.thumbId = this.thumbId

            let oldFile = this.files[this.files.length - 1]

            this.edit = false

            this.$refs.upload.update(oldFile.id, {
                active: true,
                data : this.data,
                loading: true,
                cropper: this.cropper.getCroppedCanvas().toDataURL(oldFile.type)
            })
        },

        clickImage(img, event){

			var src = event.target.getAttribute('src');

			console.warn('src ::', src)

        	this.getImageFormUrl(src, (blob) => {

          		//this.init(blob);
          		console.warn(blob)

          		let files = []

          		files.push({
                     
                     size: blob.size,
                     name: src,
                     type: blob.type,
                     file: blob,
                     el : null
                 })

          		console.warn(files)

          		this.$refs.upload.add(files)



        	});
		},

		getImageFormUrl : function(url, callback) {

			var img = new Image();

			img.setAttribute('crossOrigin', 'anonymous');

			img.onload = function (a) {

				var canvas = document.createElement("canvas");
          
          		canvas.width = this.width;
          
          		canvas.height = this.height;
          
          		var ctx = canvas.getContext("2d");
          
          		ctx.drawImage(this, 0, 0);

          		var dataURI = canvas.toDataURL("image/jpg");
    
          		// convert base64/URLEncoded data component to raw binary data held in a string
          		var byteString;
          
          		if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
          		else byteString = unescape(dataURI.split(',')[1]);

          		// separate out the mime component
          		var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

          		// write the bytes of the string to a typed array
          		var ia = new Uint8Array(byteString.length);
          
          		for (var i = 0; i < byteString.length; i++) {
              		
              		ia[i] = byteString.charCodeAt(i);
          		}

          		return callback(new Blob([ia], { type: mimeString }));
      		}
  
      		img.src = url;
  		},

    },

    watch: {

        edit(value) {

            if (value) {
                
                setTimeout(() => {
                    
                    if (!this.$refs.cropper) return;

                    var _this = this;
                
                    let cropper = new Cropper(this.$refs.cropper, {
                        aspectRatio: this.ratio,
                        viewMode: 1,
                        preview: '.box-preview',
                        background: false,
                        crop: function(e) {

                            _this.data.cropped_value = parseInt(e.detail.width) + "," + parseInt(e.detail.height) + "," + parseInt(e.detail.x) + "," + parseInt(e.detail.y) + "," + parseInt(e.detail.rotate);

                        },
                        ready: function(){
                            _this.isCropperLoading = false
                        }
                    })

                    this.cropper = cropper

                }, 1)
               
            } else {
                if (this.cropper) {
                    this.cropper.destroy()
                    this.cropper = false
                }
            }
        }
    },
}
</script>