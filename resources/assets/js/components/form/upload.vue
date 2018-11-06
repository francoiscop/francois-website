<template>
   <transition name="fade">
      <div v-if="display.upload">
         <form id="form-upload" @submit.prevent="onSubmit" enctype="multipart/form-data">
            <vv-switches v-if="switches && switches.length > 1"
               :switches="switches"
               ref="switches"
               is-vertical
               is-center
               @change="setSwitches($event)"
               />

            <slot />

            <vs-input-file
               ref="upload"
               v-model="files"
               :post-action="postAction"
               :put-action="putAction"
               :extensions="extensions"
               :accept="accept"
               :multiple="multiple"
               :directory="directory"
               :size="size || 0"
               :thread="thread < 1 ? 1 : (thread > 5 ? 5 : thread)"
               :headers="headers"
               :data="data"
               :drop="drop"
               :drop-directory="dropDirectory"
               :add-index="addIndex"
               :maximum="maximum"
               :cropper="upload.cropper"
               @input-file="inputFile"
               @input-filter="inputFilter"
               />

               <error :error="error" />

               <div class="m-b-10 flex flex-center" v-if="isEdit">    
                  <div>
                      <a :href="editLink"><i class="material-icons" style="position:relative;top:3px;">settings</i></a>
                  </div>
                  <div>
                      <a :href="editLink">Edit your {{ media }}</a>
                  </div>
              </div>

              <div class="flex flex-warp flex-center-x">
                  
                  <blob-media v-for="(file, index) in files"
                      :key="index"
                      :cropper="upload.cropper"
                      :file="file"
                      :isVideo="(['video', 'extract', 'short'].indexOf(media) > -1) ? true : false"
                      @remove="remove($event)"
                  />
              
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
   </transition>
</template>

<style type="text/css">
.fade-enter-active, .fade-leave-active {
  transition: opacity 2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}


.box-avatar-buttons{
  border:0px solid red;
  display: flex;
  justify-content: center;
}
.box-avatar-buttons > div{
  margin: 10px;
}
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
/* Limit image width to avoid overflow the container */
.box-img img {
  max-width: 100%; /* This rule is very important, please do not ignore this! */
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

.wrapper-media.notification{
  padding: 1.25rem 5px 1.25rem 5px;
}

.wrapper-media .media-left{
    border:4px solid red;
}
.wrapper-media .media-left > video{
    height: 150px;
}
.wrapper-media .media-left > img{
    height: 100px !important;
}
.wrapper-media .media-content{
    border:4px solid green;
}
</style>

<script>
//import Thumbs from '../../classes/thumbsClass'
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

    props: {

        reference: {
            type: String,
            default: ''
        },

        label: {
            type: String,
            default: null
        },
    },

    data() {
        return {

            files: [],
            error: {
                status: false,
                success: false,
                label: ''
            },
            
            isEdit : false,
            editLink : null,

            edit: false,
            cropper: null,
            isCropperLoading: true,
            selectedSwitch: null,
            directory: false,
            drop: true,
            dropDirectory: true,
            addIndex: false,
            thread: 3,
            name: 'file',
            headers: {
                'X-CSRF-TOKEN': token.content,
                //"Content-Type":"multipart/form-data" // WARNING::::::DOESNT WOrK!!!!!!!,
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: {
                user_id: _user.id,
                //id: _user.uid + Date.now() + Math.random()
                id: _user.uid + new Date().valueOf() + Math.floor((Math.random() * 100000) + 1),
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

    mounted() {
        
        this.setSelectedSwitch()

        this.$store.watch(
            (state) => {
                return this.$store.getters['form/getDisplay']
            },
            (val) => {
                
                if (val.upload){
                    this.data = {...this.data, ...this.$store.state.form.datas, ...{media: this.media}}
                    console.warn('DATA :::', this.data)
                }
            
            },{deep:true}
        )
    },

    computed: {

        upload(){
            return this.$store.state.form.upload
        },

        switches(){
            return this.$store.state.form.upload.switches
        },

        display(){
            //return this.$store.state.form.display
            return this.$store.getters['form/getDisplay']
        },

        media(){
            return this.$store.state.form.upload.settings.type
        },

        
        accept(){

            return ''
            
            let accept = '';

            for (let k in this.upload.settings.valid_file_upload) {
                
                accept += this.upload.settings.type + '/' + this.upload.settings.valid_file_upload[k];
                
                if (k < this.upload.settings.valid_file_upload.length - 1) accept += ',';
            }

            return accept;
        },

        multiple(){

            if (['video','extract'].indexOf(this.upload.settings.type) > -1 || this.upload.cropper) return false;

            return true;

        },
        extensions(){
            return this.upload.settings.valid_file_upload.toString()
        },
        minSize(){
            return this.upload.settings.min_size_upload
        },        
        size(){
            return this.upload.settings.max_size_upload
        },
        postAction(){
            return this.upload.settings.url
        },
        putAction(){
            return this.upload.settings.url
        },
        maximum(){
            return this.upload.settings.max_file_upload
        }, 
        
    },

    filters: {
        formatSize(a, b = 2) {
            if (0 == a) return "0 Bytes";
            var c = 1024,
                d = b || 2,
                e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
                f = Math.floor(Math.log(a) / Math.log(c));
            return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
        }
    },

    methods: {

        setSwitches(obj){

            if (obj.val) {

              this.selectedSwitch = this.upload.switches[obj.index]

              this.data.switch = this.selectedSwitch.ref
            }
        },

        setSelectedSwitch(){

            if (!this.upload.hasOwnProperty('switches') || this.upload.switches === null) return;

            for (let k in this.switches){

                if (this.switches[k].status){

                    this.selectedSwitch = this.upload.switches[k];

                    break;

                }
            }

            this.data.switch = this.selectedSwitch.ref

        },

        remove(file) {
            
            if (this.files.length < 2) this.isEdit = false;

            this.$refs.upload.remove(file)
        },












        inputFile(newFile, oldFile){

            /*
            | Cropper:
            */
            if (newFile && !oldFile && this.upload.cropper) {

                console.warn('INIT CROPPER', this.files)

                this.$nextTick(() => this.edit = true)

                return
                
                //this.$nextTick(function () { this.edit = true })
            }


            if (newFile && oldFile) {

                /*
                // update
                if (newFile.active && !oldFile.active) {
                    // beforeSend
                    // min size
                    if (newFile.size >= 0 && this.minSize > 0 && newFile.size < this.minSize) {
                        this.$refs.upload.update(newFile, {
                            error: 'size'
                        })
                    }
                }
                */


                /*
                | RESPONSE AFTER UPLAOD :
                */
                if (!newFile.active && oldFile.active) {

                    /*
                    | ERROR :
                    */
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

                /*
                | PROGRESS :
                */    
                if (newFile.progress !== oldFile.progress) {
                    // progress
                }
                
                /*
                | SUCCESS (AFTER UPLOAD) :
                */
                if (newFile.success && !oldFile.success) {

                    if (this.upload.hasOwnProperty('edit') && this.upload.edit && this.upload.edit.length > 0){

                        if (typeof newFile.response.slug !== 'undefined'){

                            this.editLink = this.upload.edit + newFile.response.slug

                            this.isEdit = true
                        }
                    }

                    this.$refs.upload.update(oldFile.id, { loading: false })

                    return

                    /*
                    // THUMBS ::
                    if (this.uploadRoot.type === 'video'){
                        var file = this.$refs.upload.get(oldFile.id);
                        var id = newFile.response.files[0].vid;
                        var uid = newFile.response.files[0].id;
                        var slug = newFile.response.files[0].slug;
                        file.thumbs = new Thumbs(uid);
                        file.thumbs.start().then((response) => {
                            this.$refs.upload.update(file, {thumbs : { process : false, src : response}, editURL : this.uploadRoot.edit + id});
                        }).catch((e) => {
                            this.$refs.upload.update(file, {thumbs : { process : false}, editURL : this.uploadRoot.edit + slug});
                        });
                    }
                    */
                }
            }

            /*
            if (!newFile && oldFile) {
                // remove
                if (oldFile.success && oldFile.response.id) {
                    // $.ajax({
                    //   type: 'DELETE',
                    //   url: '/upload/delete?id=' + oldFile.response.id,
                    // })
                }
            }
            */

            /*
            // Automatically activate upload
            if (Boolean(newFile) !== Boolean(oldFile) || oldFile.error !== newFile.error) {
                if (this.uploadAuto && !this.$refs.upload.active) {
                    this.$refs.upload.active = true
                }
            }
            */

            this.$refs.upload.opacity = 1;
        },
        
        
        inputFilter: function(newFile, oldFile, prevent) {


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
                var extensions = new RegExp('\\.(' + this.upload.settings.valid_file_upload.join('|').replace(/\./g, '\\.') + ')$', 'i')

                if (newFile.name.search(extensions) === -1) {
                    this.setError('Invalid extension : only ' + this.upload.settings.valid_file_upload.join(' '))
                    return prevent()
                }
            }


            // BLOB THUMBS !!!!
            /*
            if (newFile && (!oldFile || newFile.file !== oldFile.file)) {

                // Create a blob field
                newFile.blob = ''
                let URL = window.URL || window.webkitURL
                if (URL && URL.createObjectURL) {
                    newFile.blob = URL.createObjectURL(newFile.file)
                }

                // Video
                if (newFile.blob && newFile.type.substr(0, 6) === 'video/') {

                    newFile.src = newFile.blob;

                    setTimeout(() => {
                        var video = document.getElementsByTagName('video')[0];

                        video.load();
                        video.onloadeddata = function() {
                            //video.play();
                        }

                    }, 1000);
                }

                // Thumbnails
                if (newFile.blob && newFile.type.substr(0, 6) === 'image/') {
                    newFile.thumb = newFile.blob
                }
            }
            */
            
            if (newFile && (!oldFile || newFile.file !== oldFile.file)) {

                if (['video', 'extract', 'short'].indexOf(this.media) > -1){


                  this.isEdit = false


                }
                
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

            let oldFile = this.files[this.files.length - 1]

            this.edit = false

            this.$refs.upload.update(oldFile.id, {
                active: true,
                data : this.data,
                loading: true,
                cropper: this.cropper.getCroppedCanvas().toDataURL(oldFile.type)
            })
        },

        
    },

    watch: {

        edit(value) {

            if (value) {
                
                //this.$nextTick(function () {

                    setTimeout(() => {
                    
                    if (!this.$refs.cropper) return;

                    var _this = this;

                    var aspect = (this.selectedSwitch !== null) ? this.selectedSwitch.aspect : 1
                
                    let cropper = new Cropper(this.$refs.cropper, {
                        aspectRatio: aspect,
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

                    console.warn('CROPPER REF SRC ::', this.$refs.cropper.src)

                }, 1)
               // })
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