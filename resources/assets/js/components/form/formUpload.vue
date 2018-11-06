<template>
    <div>
        <form style="padding:20px" :id="'form-' + label" :class="{'box elevation-8' : (step[0] && elevation)}" @submit.prevent="onSubmit" enctype="multipart/form-data">
            <div v-if="step[0]">
                <slot></slot>
                <div v-for="(item, field, index) in formClass.newData" style="margin-bottom:5px;" :class="'c-input--' + field">
                    <vv-input v-if="item.type === 'string' || item.type === 'int' || item.type === 'password'"
                        :label="field"
                        :value="item.value"
                        :error="item.error"
                        :required="item.required"
                        :rules="item.rules"
                        :helper="item.helper"
                        :max="item.max"
                        :min="item.min"
                        :icon="item.icon"
                        :ref="field"
                        :type="item.type"
                        @clearError="clearError($event)"
                        @change="setValue($event, field)"
                        ></vv-input>
                    <vv-textarea v-if="item.type === 'text'"
                        :label="field"
                        :value="item.value"
                        :required="item.required"
                        :ref="field"
                        @clearError="clearError($event)"
                        @change="setValue($event, field)"
                        ></vv-textarea>
                    <vv-switch v-if="item.type === 'bool'"
                        :label="field"
                        :switch-prop="field + 'Switch'"
                        :value="(item.value == 1)"
                        :ref="field"
                        @change="setValue($event, field)"
                        ></vv-switch>
                    <vv-select-label v-if="item.type === 'enum'"
                        :label="field"
                        :options="item.enum"
                        :key-enum="item.keyEnum"
                        :value="item.value"
                        :required="item.required"
                        :ref="field"
                        @clearError="clearError($event)"
                        @change="setValue($event, field)"
                        ></vv-select-label>
                    <vv-tag v-if="item.type === 'tag'"
                        :label="field"
                        :tags="item.value"
                        :required="item.required"
                        :allow-new="item.tag.allowNew"
                        :key-prop="item.tag.key"
                        :url="item.tag.url"
                        :ref="field"
                        @clearError="clearError($event)"
                        @change="setValue($event, field)"
                        ></vv-tag>
                    <vv-gender v-if="item.type === 'gender'"
                        :label="field"
                        :value="item.value"
                        :error="item.error"
                        :required="item.required"
                        :ref="field"
                        @clearError="clearError($event)"
                        @change="setValue($event, field)"
                        ></vv-gender>
                </div>
                <div style="margin: 0 auto;" class="center-text" v-if="(step[0] && step[1]) === false">
                    <button class="button is-primary is-large" :class="{'is-loading' : isLoading}" v-text="label" :disabled="errors.length > 0" style="text-transform: uppercase;margin-top: 40px;">
                    </button>
                </div>
                <slot name="after"></slot>
            </div>
            <div v-if="step[1]">
                <vv-input-file
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
                    @input-file="inputFile"
                    @input-filter="inputFilter"
                    ></vv-input-file>
                <ul>
                    <li v-for="(file, index) in files" class="notification" :class="{'is-danger' : file.error, 'is-success' : file.success}">
                        <button class="delete" @click.prevent="remove(file)"></button>
                        <article class="media">
                            <figure class="media-left">
                                <img v-if="file.thumb" :src="file.thumb" style="height:50px;" />
                                <video v-else-if="file.src && !file.error && !file.success" :src="file.src" controls height="150" style="max-width:70%;"></video>
                                <div v-else-if="file.thumbs && file.thumbs.process" class="center-text">
                                    <div class="button is-minimal is-loading"></div>
                                    <div class="is-size-9">Processinhg thumbs....</div>
                                </div>
                                <img v-else-if="file.thumbs && file.thumbs.src" :src="file.thumbs.src" style="height:100px;" />
                                <span v-else></span>
                            </figure>
                            <div class="media-content">
                                <div class="content">
                                    <p>
                                        <strong>{{file.name}}</strong> <small style="margin-left:10px;">{{file.size | formatSize}}</small> <strong v-if="file.success"><i class="material-icons" style="margin-left:10px;position:relative;top:5px;">check</i></strong>
                                    <p v-if="file.error" v-html="file.error"></p>
                                    <p v-if="file.success && file.editURL" >
                                        <a :href="file.editURL"><i class="material-icons" style="margin-left:10px;position:relative;top:5px;">settings</i> Edit</a>
                                    </p>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <progress
                            v-if="(file.active || file.progress !== '0.00') && !file.error && !file.success"
                            class="progress is-small is-primary"
                            :class="{'is-danger': file.error}"
                            :value="file.progress" 
                            max="100"
                            >{{file.progress}}%
                        </progress>
                    </li>
                </ul>
            </div>
        </form>
        <div class="notification is-link elevation-8" v-if="ajaxResponse">
            <button class="delete"></button>
            An activation key has been sent to your email
        </div>
    </div>
</template>

<script>
import Thumbs from '../../classes/thumbsClass'

import Form from '../../classes/formClass'

import VueScrollTo from 'vue-scrollto'

export default {

    props: {

        formRoot: {
            type: Object,
            default: null
        },
        uploadRoot: {
            type: Object,
            default: null
        },
        label: {
            type: String,
            default: null
        },
        multiple: {
            type: Boolean,
            default: false
        },
        elevation: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            formClass: null,
            //errors: this.formRoot.errors,
            errors: null,

            step: [true, false],
            thumbs : false,
            uploadRootValid: ['type', 'url', 'max_file_upload', 'valid_file_upload', 'max_size_upload', 'min_size_upload'],
            valid: true,
            isLoading: false,
            ajaxResponse: false,
            

            files: [],
            //accept: 'image/png,image/gif,image/jpeg,image/webp',
            //extensions: 'gif,jpg,jpeg,png,webp',
            extensions: this.uploadRoot.valid_file_upload.toString(),
            //minSize: 1024,
            minSize: this.uploadRoot.min_size_upload,
            //size: 1024 * 1024 * 10,
            size: this.uploadRoot.max_size_upload,
            //multiple: true,
            directory: false,
            drop: true,
            dropDirectory: true,
            addIndex: false,
            thread: 3,
            name: 'file',

            //postAction: '/upload/post',
            postAction: this.uploadRoot.url,
            //putAction: '/upload/put',
            putAction: this.uploadRoot.url,

            headers: {
                'X-CSRF-TOKEN': token.content,
                //"Content-Type":"multipart/form-data" // WARNING::::::DOESNT WOrK!!!!!!!,
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: {
                user: _user
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

    created() {

        this.formClass = new Form(this.formRoot);
        this.errors = this.formClass.errors;


        for (let k in this.uploadRootValid) {
            var key = this.uploadRootValid[k];
            if (typeof this.uploadRoot[key] === 'undefined' || this.uploadRoot[key] === '') {
                console.log('ERROR init __UPLOAD : missong "' + key + '"');
            }
        }

    },

    mounted() {
        console.warn('FORMCLASS:', this.formClass);
        console.warn('UPLOADROOT:', this.uploadRoot);
        console.warn('POST ACTION :', this.postAction);
    },

    computed: {

        
        accept() {
            var accept = '';
            for (let k in this.uploadRoot.valid_file_upload) {
                accept += this.uploadRoot.type + '/' + this.uploadRoot.valid_file_upload[k];
                if (k < this.uploadRoot.valid_file_upload.length - 1) accept += ',';
            }
            return accept;
        }
        
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

        setValue(val, ref){
            //console.log('ref', ref);
            console.log('val', val);
            console.log('ref', ref);

            if (ref === 'tags'){
                if (val.length === 0){
                    this.data.tags = '';
                    return;
                }

                //this.data[ref + '[]'] = [];
                this.data[ref] = [];

                val.map((value) => {
                    var _id = (value.id === value.name && value.id !== parseInt(value.id, 10)) ? null : value.id;
                    /*
                    this.data[ref].push(JSON.stringify({
                        id: _id,
                        name: value.name
                    }));
                    */
                    this.data[ref].push({
                        id: _id,
                        name: value.name
                    });
                });
                console.warn('DATA::',this.data);
                this.clearError('tags');
                return;
            }
            
            if (ref === 'genre'){
                if (val === null || val === ''){
                    this.data.genre = '';
                    return;
                }

                this.data[ref] = JSON.stringify({
                    id: val.id,
                    name: val.name
                });
                return;
            }

            this.data[ref] = val;
        },

        remove(file) {
            this.$refs.upload.remove(file);
        },

        // add, update, remove File Event
        /**
         * Has changed
         * @param  Object|undefined   newFile   Read only
         * @param  Object|undefined   oldFile   Read only
         * @return undefined
         */
        inputFile(newFile, oldFile) {

            //console.log('newFile', newFile);
            //console.log('oldFile', oldFile);

            if (newFile && oldFile) {
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
                if (!newFile.active && oldFile.active) {
                    // Get response data
                    //console.log('response', newFile.response)
                    if (newFile.xhr) {
                        //  Get the response status code
                        //console.log('status', newFile.xhr.status)
                    }

                    if (newFile.error && oldFile.error) {
                        // error AFTER AJAX
                        this.step[0] = true;
                        var errorAjax = '';
                        if (newFile.response.error){
                            for(let k in newFile.response.errors){
                                if (this.$refs[k]){
                                    this.$refs[k][0].setError(newFile.response.errors[k][0]);
                                }

                                errorAjax += newFile.response.errors[k][0] + '<br>';
                            }
                        } else {
                            errorAjax = '<i class="material-icons" style="position:relative;top:7px;">close</i> Error system';
                        }

                        this.$refs.upload.update(oldFile, {error: errorAjax});
                    }
                }
                
                if (newFile.progress !== oldFile.progress) {
                    // progress
                }
                if (newFile.error && !oldFile.error) {
                    // error
                }
                if (newFile.success && !oldFile.success) {
                    // success
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
                }
            }

            if (!newFile && oldFile) {
                // remove
                if (oldFile.success && oldFile.response.id) {
                    // $.ajax({
                    //   type: 'DELETE',
                    //   url: '/upload/delete?id=' + oldFile.response.id,
                    // })
                }
            }

            // Automatically activate upload
            if (Boolean(newFile) !== Boolean(oldFile) || oldFile.error !== newFile.error) {
                if (this.uploadAuto && !this.$refs.upload.active) {
                    this.$refs.upload.active = true
                }
            }

            this.$refs.upload.opacity = 1;
        },
        /**
         * Pretreatment
         * @param  Object|undefined   newFile   Read and write
         * @param  Object|undefined   oldFile   Read only
         * @param  Function           prevent   Prevent changing
         * @return undefined
         */
        inputFilter: function(newFile, oldFile, prevent) {

            if (newFile && !oldFile) {
                // Before adding a file

                // Filter system files or hide files
                if (/(\/|^)(Thumbs\.db|desktop\.ini|\..+)$/.test(newFile.name)) {
                    return prevent()
                }

                // Filter php html js file
                if (/\.(php5?|html?|jsx?)$/i.test(newFile.name)) {
                    return prevent()
                }

                // Filter non-image file
                //if (!/\.(jpeg|jpe|jpg|gif|png|webp)$/i.test(newFile.name)) {
                //console.log('WRONG IMAGE');
                //return prevent()
                //}
            }

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
        },

        clearError(label) {
            console.error('EMIT CLEAR ERROR :: ' + label);
            console.warn('ERRORS BEFORE :', this.errors);
            var index = this.errors.indexOf(label);
            if (index > -1) this.errors.splice(index, 1);
            console.log('INDEX', index);
            console.warn('ERRORS AFTER :', this.errors);
        },

        onSubmit() {

            for (let k in this.$children) {

                var child = this.$children[k];
                var ref = child.$vnode.data.ref;

                if (ref !== 'upload') {
                    var type = this.formClass.newData[ref].type;

                    if (child.required && (child.input === null || child.input.length === 0)) {
                        child.setError('REQUIRED');
                        if (this.errors.indexOf(ref) === -1) this.errors.push(ref);
                    }

                    if (child.hasOwnProperty('errorMutable') && child.errorMutable.is && this.errors.indexOf(ref) === -1) {
                        this.errors.push(ref);
                    }

                    /*
                    if (this.formClass.newData[ref].type === 'tag'){

                        child.values.map((val) => {
                                                    
                            formData.append(ref + '[]', JSON.stringify(val));
                        });
                
                    } else {
                    
                        formData.append(ref, child.input);
                
                    }
                    */

                }

            }

            /*
            console.log(this.errors);
            for (var pair of formData.entries()) {
                console.log(pair[0]+ ', ' + pair[1]); 
                console.log(typeof pair[1]);
            }
            */

            if (this.errors.length > 0) {
                return;
            }

            this.step = [false, true];
        },
    }
}
</script>