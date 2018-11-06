<template>
    <div style="max-width:75%;border:1px solid green;margin:0 auto;padding: 20px;">
        <div>

                <div v-for="(item, index) in switchRoot" style="margin-bottom:5px;" :class="'c-input--' + item.name">
                    
                    <vv-switch
                        :label="item.name"
                        :vmodel="item.status"
                        :ref="item.name"
                        @change="setSwitch($event, index, item.name)"
                    ></vv-switch>
                    
                </div>

                <vv-input-file
                    ref="upload"
                    v-model="files"
                    :label="'choose an image for your ' + selected.name"
                    :post-action="postAction"
                    :put-action="putAction"
                    extensions="gif,jpg,jpeg,png,gif"
                    accept="image/png,image/gif,image/jpeg,image/gif"
                    :multiple="false"
                    :size="size"
                    :headers="headers"
                    :data="data"
                    :drop="!edit"
                    :add-index="addIndex"
                    @input-file="inputFile"
                    @input-filter="inputFilter"
                ></vv-input-file>

                <b-notification type="is-danger" v-if="loadErrorFile.is">
                    {{ loadErrorFile.label }}
                </b-notification> 

                <!--
                <div class="center-text" v-show="!edit">
                    <label for="avatar">
                        <img :src="files.length ? files[0].url : 'https://www.gravatar.com/avatar/default?s=200&r=pg&d=mm'"  class="rounded" />
                    </label>
                </div>
                -->
                <div class="center-text" v-show="!edit">
                    <figure class="image is-1by1" style="margin: 0 auto;" v-if="selected.name === 'avatar'">
                        <img :src="(response && isUploaded) ? response : 'https://bulma.io/images/placeholders/480x480.png'" class="rounded">
                    </figure>
                    <figure class="image is-3by1" style="margin: 0 auto;" v-if="selected.name === 'cover'">
                        <img :src="(response && isUploaded) ? response : 'https://bulma.io/images/placeholders/720x240.png'">
                    </figure>
                </div>      
            
        </div>


<div class="modal" :class="{'is-active' : files.length && edit}" v-if="files.length">
   <div class="modal-background"></div>
   <div class="modal-box">
      <div class="modal-box-header">
      </div>
      <div class="modal-box-content">
         <div class="box-img">
            <img ref="editImage" :src="files[0].url">
         </div>
         <div class="box-preview"></div>
      </div>
      <div class="modal-box-footer center-text" style="margin-top:5px;">
         <span class="button is-medium is-primary save" @click.prevent="editSave">SAVE</span>
         <span class="button is-medium cancel" @click.prevent="$refs.upload.clear">CANCEL</span>
      </div>
   </div>
   <button class="modal-close is-large" aria-label="close"></button>
</div>

        
    </div>
</template>

<style type="text/css">
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
</style>

<script>
import Thumbs from '../../classes/thumbsClass'

export default {

    props: {

        switchRoot: {
            type: Array,
            default: []
        },
        uploadRoot: {
            type: Object,
            default: null
        },
        label: {
            type: String,
            default: null
        },
    },

    data() {
        return {

            selected : {},
            loadErrorFile : {
                is: false,
                label : null
            },
            response : null,
            isUploaded : false,

            uploadRootValid: ['type', 'url', 'max_file_upload', 'valid_file_upload', 'max_size_upload', 'min_size_upload'],
            valid: true,
            isLoading: false,
            ajaxResponse: false,
            files: [],
            minSize: this.uploadRoot.min_size_upload,
            size: this.uploadRoot.max_size_upload,
            addIndex: false,
            name: 'file',
            postAction: this.uploadRoot.url,
            putAction: this.uploadRoot.url,
            headers: {
                'X-CSRF-TOKEN': token.content,
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: {
                user: _user
            },
            edit: false,
            cropper: false,
        }
    },

    created() {
        for (let k in this.switchRoot) {
            if (this.switchRoot[k].status) this.selected = this.switchRoot[k];
        }

        for (let k in this.uploadRootValid) {
            var key = this.uploadRootValid[k];
            if (typeof this.uploadRoot[key] === 'undefined' || this.uploadRoot[key] === '') {
                console.log('ERROR init __UPLOAD : missong "' + key + '"');
            }
        }
    },

    watch: {
        edit(value) {
            if (value) {
                this.$nextTick(function () {
                    if (!this.$refs.editImage) {
                        return
                    }

                    var _this = this;
                
                    let cropper = new Cropper(this.$refs.editImage, {
                        aspectRatio: this.selected.aspect,
                        viewMode: 1,
                        preview: '.box-preview',
                        background: false,
                        crop: function(e) {

                            _this.data.cropped_value = parseInt(e.detail.width) + "," + parseInt(e.detail.height) + "," + parseInt(e.detail.x) + "," + parseInt(e.detail.y) + "," + parseInt(e.detail.rotate);

                        }
                    })
                    this.cropper = cropper
                })
            } else {
                if (this.cropper) {
                    this.cropper.destroy()
                    this.cropper = false
                }
            }
        }
    },

    mounted() {
        console.log('POST ACTION :');
        console.log(this.postAction);
    },

    methods: {

        editSave() {
            this.data.name = this.selected.name;
            let oldFile = this.files[0]
            this.edit = false;

            this.$refs.upload.update(oldFile.id, {
                active: true,
                data : this.data
            })

            /*
            
            let binStr = atob(this.cropper.getCroppedCanvas().toDataURL(oldFile.type).split(',')[1])
            let arr = new Uint8Array(binStr.length)
            for (let i = 0; i < binStr.length; i++) {
                arr[i] = binStr.charCodeAt(i)
            }
            let file = new File([arr], oldFile.name, { type: oldFile.type })
            this.$refs.upload.update(oldFile.id, {
                file,
                type: file.type,
                size: file.size,
                active: true,
                data : this.data
            })

            */
        },

        formatSize(a, b = 2) {
            if (0 == a) return "0 Bytes";
            var c = 1024,
                d = b || 2,
                e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
                f = Math.floor(Math.log(a) / Math.log(c));
            return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
        },

        setSwitch(val, ind, ref){

            var _ind = (ind === 0) ? 1 : 0;
            var _ref = this.switchRoot[_ind].name;
            this.$refs[_ref][0].vmodelMutated = !val;
            if (!val) return;
            this.$nextTick(function () {
                this.isUploaded = false;
            });
            this.selected = this.switchRoot[ind];
        },

        remove(file) {
            this.$refs.upload.remove(file);
        },

       
        inputFile(newFile, oldFile) {

            if (newFile && !oldFile) {
                this.$nextTick(function () {
                    this.edit = true
                })
            }
      
            if (!newFile && oldFile) {
                this.edit = false;
            }

            if (newFile && oldFile && newFile.success && !oldFile.success){
                this.isUploaded = true;
                this.response = newFile.response.src + '?' + new Date().getTime();
            }
        },
        
        inputFilter: function(newFile, oldFile, prevent) {

            this.loadErrorFile.is = false;
            this.loadErrorFile.label = null;

            if (newFile && !oldFile) {
                // Filter system files or hide files:
                if (/(\/|^)(Thumbs\.db|desktop\.ini|\..+)$/.test(newFile.name)) {
                    return prevent()
                }

                // Filter php html js file:
                if (/\.(php5?|html?|jsx?)$/i.test(newFile.name)) {
                    return prevent()
                }

                //Filter Extension:
                if (!/\.(jpeg|jpe|jpg|gif|png|gif)$/i.test(newFile.name)) {
                    this.loadErrorFile.is = true;
                    this.loadErrorFile.label = 'Wrong Extension!';
                    return prevent()
                }
                //Filter Size:
                if (newFile.size > this.size){
                    this.loadErrorFile.is = true;
                    this.loadErrorFile.label = 'File size exceed maximum allowed : ' + this.formatSize(this.size) + ' Max';
                    return prevent()
                }
                if (newFile.size < this.minSize){
                    this.loadErrorFile.is = true;
                    this.loadErrorFile.label = 'File size too small';
                    return prevent()
                }
            }

            if (newFile && (!oldFile || newFile.file !== oldFile.file)) {
                newFile.url = ''
                let URL = window.URL || window.webkitURL
                if (URL && URL.createObjectURL) {
                    newFile.url = URL.createObjectURL(newFile.file)
                }
            }
        }
    }
}
</script>