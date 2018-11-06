<template>
   <div class="file has-name is-boxed" style="margin:8px 0px;">
         <label class="file-label is-center" style="margin: auto;">
            <div class="fileupload-buttonbar">
               <input
                    class="file-input"
                    type="file"
                    :name="name"
                    :id="inputId || name"
                    :accept="accept"
                    :capture="capture"
                    @change="change"
                    :webkitdirectory="directory && features.directory"
                    :directory="directory && features.directory"
                    :multiple="multiple && features.html5"
                >
               <span class="file-cta button" vshow="files.length < maximum">
                    <span :style="(!active) ? 'opacity:1' : 'opacity:0'" class="file-icon">
                        <i class="material-icons">vertical_align_top</i>
                    </span>
                    <span :style="(!active) ? 'opacity:1' : 'opacity:0'" class="file-label">
                        {{ labelComputed }}
                    </span>
                    <span :style="(!active) ? 'opacity:1' : 'opacity:0'" class="file-max" v-if="maximum > 1">
                        maximum : {{ maximum }}
                    </span>
                    <span :style="(!active) ? 'opacity:1' : 'opacity:0'" class="file-max is-size-7" v-if="maximum > 1">
                        {{ files.length }} / {{ maximum }}
                    </span>
                    <span style="position:absolute;" :style="(active) ? 'opacity:1' : 'opacity:0'" class="button is-large is-minimal is-loading"></span>
               </span>
               <span
                    class="file-name button is-primary has-text-centered anim-opacity "
                    :style="'opacity : ' + opacity" 
                    @click.prevent="active = true"
                    v-if="!active && !uploaded && (cropper === null || !cropper || typeof cropper === 'undefined')"
                >Start Upload
               </span>
                <span
                    class="file-name button is-danger has-text-centered anim-opacity "
                    :style="'opacity : ' + opacity" 
                    @click.prevent="active = false"
                    v-else-if="!uploaded && (cropper === null || !cropper || typeof cropper === 'undefined')"
                >Stop Upload
               </span>
               <span
                    class="file-name button is-danger has-text-centered"
                    style="opacity : 0;" 
                    v-else-if="(cropper === null || !cropper || typeof cropper === 'undefined')"
                >Stop Upload
               </span>
            </div>
         </label>
    </div>
</template>

<style>
    .file-max{
        font-family: 'Yanone Kaffeesatz', sans-serif
    }
</style>

<script>
const CHUNK_DEFAULT_OPTIONS = {
  headers: {},
  action: '',
  minSize: 1048576,
  maxActive: 3,
  maxRetries: 5,

  //handler: ChunkUploadDefaultHandler
}


    export default {
        props: {

            label : {
                type: String,
                default: 'Choose a file'
            },

            inputId: {
      type: String,
    },

    name: {
      type: String,
      default: 'file',
    },

    accept: {
      type: String,
    },

    capture: {
    },

    multiple: {
      type: Boolean,
    },

    maximum: {
      type: Number,
      default() {
        return this.multiple ? 0 : 1
      }
    },

    addIndex: {
      type: [Boolean, Number],
    },

    directory: {
      type: Boolean,
    },

    postAction: {
      type: String,
    },

    putAction: {
      type: String,
    },

    customAction: {
      type: Function,
    },

    headers: {
      type: Object,
      default: Object,
    },

    data: {
      type: Object,
      default: Object,
    },

    timeout: {
      type: Number,
      default: 0,
    },


    drop: {
      default: false,
    },

    dropDirectory: {
      type: Boolean,
      default: true,
    },

    size: {
      type: Number,
      default: 0,
    },

    extensions: {
      default: Array,
    },


    value: {
      type: Array,
      default: Array,
    },

    thread: {
      type: Number,
      default: 1,
    },

    // Chunk upload enabled
    chunkEnabled: {
      type: Boolean,
      default: false
    },

    // Chunk upload properties
    chunk: {
      type: Object,
      default: () => {
        return CHUNK_DEFAULT_OPTIONS
      }
    },

    cropper:{}
            
        },
        data() {
            return {
                opacity : 0,
                files: this.value,
                features: {
                    html5: true,
                    directory: false,
                    drag: false,
                },
                active: false,
                dropActive: false,
                uploading: 0,
                destroy: false,
            }
        },

        mounted() {

            /*
            if (window.FormData && input.files) {
                if (typeof input.webkitdirectory === 'boolean' || typeof input.directory === 'boolean') {
                    this.features.directory = true
                }
                if (this.features.html5 && typeof input.ondrop !== 'undefined') {
                    this.features.drop = true
                }
            } else {
                this.features.html5 = false
            }
            */

            this.maps = {}

            /*
            this.$nextTick(function () {

                if (this.$parent) {
                    this.$parent.$forceUpdate()
                }

                this.watchDrop(this.drop)
            })
            */
        },

        beforeDestroy() {
            this.destroy = true
            this.active = false
        },
        
        computed: {

            labelComputed(){

                if (this.multiple) return this.label + '(s)'

                return this.label

            },

            uploaded() {
                let file
                for (let i = 0; i < this.files.length; i++) {
                    file = this.files[i]
                    if (file.fileObject && !file.error && !file.success) {
                        return false
                    }
                }
                return true
            },
            
        },
        watch: {

            active(active) {
                this.watchActive(active)
            },

        },
        methods: {

            change(e){
                this.addInputFile(e.target);
            },

            addInputFile(el){
                let files = []
                if (el.files) {
                    for (let i = 0; i < el.files.length; i++) {
                        let file = el.files[i];
                        files.push({
                            size: file.size,
                            name: file.webkitRelativePath || file.relativePath || file.name,
                            type: file.type,
                            file,
                            el
                        })
                    }
                } else {
                    files.push({
                        name: el.value.replace(/^.*?([^\/\\\r\n]+)$/, '$1'),
                        el,
                    })
                }

                return this.add(files)
            },

            add(_files, index = this.addIndex){
                
                let files = _files
                let isArray = files instanceof Array

                if (!isArray) {
                    files = [files]
                }

                let addFiles = []
                for (let i = 0; i < files.length; i++) {
                    let file = files[i]
                    if (this.features.html5 && file instanceof Blob) {
                        file = {
                            file,
                            size: file.size,
                            name: file.webkitRelativePath || file.relativePath || file.name || 'unknown',
                            type: file.type,
                        }
                    }
                    let fileObject = false
                    if (file.fileObject === false) {
                        // false
                    } else if (file.fileObject) {
                        fileObject = true
                    } else if (typeof Element !== 'undefined' && file.el instanceof Element) {
                        fileObject = true
                    } else if (typeof Blob !== 'undefined' && file.file instanceof Blob) {
                        fileObject = true
                    }
                    
                    if (fileObject) {
                        file = {
                            fileObject: true,
                            size: -1,
                            name: 'Filename',
                            type: '',
                            active: false,
                            error: '',
                            success: false,
                            putAction: this.putAction,
                            postAction: this.postAction,
                            timeout: this.timeout,
                            ...file,
                            response: {},

                            progress: '0.00',          // 只读
                            speed: 0,                  // 只读
                            // xhr: false,                // 只读
                            // iframe: false,             // 只读
                        }

                        file.data = {
                            ...this.data,
                            ...file.data ? file.data : {},
                        }

                        file.headers = {
                            ...this.headers,
                            ...file.headers ? file.headers : {},
                        }
                    }

                    if (!file.id) {
                        file.id = Math.random().toString(36).substr(2)
                    }

                    if (this.emitFilter(file, undefined)) {
                        continue
                    }

                    if (this.maximum > 1 && (addFiles.length + this.files.length) >= this.maximum) {
                        break
                    }

                    addFiles.push(file)

                    if (this.maximum === 1) {
                        break
                    }
                }

            
                if (!addFiles.length) {
                    return false
                }

            
                if (this.maximum === 1) {
                    this.clear()
                }


               
                let newFiles
                if (index === true || index === 0) {
                    newFiles = addFiles.concat(this.files)
                } else if (index) {
                    newFiles = addFiles.concat([])
                    newFiles.splice(index, 0, addFiles)
                } else {
                    newFiles = this.files.concat(addFiles)
                }

                this.files = newFiles

                for (let i = 0; i < addFiles.length; i++) {
                    let file = addFiles[i]
                    this.maps[file.id] = file
                }

                this.emitInput()
                for (let i = 0; i < addFiles.length; i++) {
                    
                    this.emitFile(addFiles[i], undefined)
                }

                return isArray ? addFiles : addFiles[0]
            },

            emitFilter(newFile, oldFile) {
                let isPrevent = false
                this.$emit('input-filter', newFile, oldFile, function () {
                    isPrevent = true
                    return isPrevent
                })
                return isPrevent
            },

            clear() {
                if (this.files.length) {
                    let files = this.files
                    this.files = []
                    this.maps = {}
                    this.emitInput()
                    for (let i = 0; i < files.length; i++) {
                        this.emitFile(undefined, files[i])
                    }
                }
                return true
            },

            remove(id) {
      let file = this.get(id)
      if (file) {
        if (this.emitFilter(undefined, file)) {
          return false
        }
        let files = this.files.concat([])
        let index = files.indexOf(file)
        if (index === -1) {
          return false
        }
        files.splice(index, 1)
        this.files = files

        delete this.maps[file.id]

        this.emitInput()
        this.emitFile(undefined, file)
      }
      return file
    },

            emitInput() {
                this.$emit('input', this.files)
            },

            emitFile(newFile, oldFile) {
                this.$emit('input-file', newFile, oldFile)
                if (newFile && newFile.fileObject && newFile.active && (!oldFile || !oldFile.active)) {
                    this.uploading++
                    // 激活
                    this.$nextTick(function () {
                        setTimeout(() => {
                            this.upload(newFile).then(() => {
                                // eslint-disable-next-line
                                newFile = this.get(newFile)
                                if (newFile && newFile.fileObject) {
                                    this.update(newFile, {
                                        active: false,
                                        success: !newFile.error
                                    })
                                }
                            }).catch((e) => {
                                this.update(newFile, {
                                    active: false,
                                    success: false,
                                    error: e.code || e.error || e.message || e
                                })
                            })
                        }, parseInt(Math.random() * 50 + 50, 10))
                    })
                } else if ((!newFile || !newFile.fileObject || !newFile.active) && oldFile && oldFile.fileObject && oldFile.active) {
                        // 停止
                        this.uploading--
                }

                // 自动延续激活
                if (this.active && (Boolean(newFile) !== Boolean(oldFile) || newFile.active !== oldFile.active)) {
                    this.watchActive(true)
                }
            },

            watchActive(active) {
                let file
                let index = 0
                while ((file = this.files[index])) {
                    index++
                    if (!file.fileObject) {
                        // 不是文件对象
                    } else if (active && !this.destroy) {
                        if (this.uploading >= this.thread || (this.uploading && !this.features.html5)) {
                            break
                        }
                        if (!file.active && !file.error && !file.success) {
                            this.update(file, { active: true })
                        }
                    } else {
                        if (file.active) {
                            this.update(file, { active: false })
                        }
                    }
                }
                if (this.uploading === 0) {
                    this.active = false
                }
            },

            update(id, data) {
                let file = this.get(id)
                if (file) {
                    let newFile = {
                        ...file,
                        ...data
                    }

                    if (file.fileObject && file.active && !newFile.active && !newFile.error && !newFile.success) {
                        newFile.error = 'abort'
                    }

                    if (this.emitFilter(newFile, file)) {
                        return false
                    }

                    let files = this.files.concat([])
                    let index = files.indexOf(file)
                    if (index === -1) {
                        console.error('update', file)
                        return false
                    }
                    files.splice(index, 1, newFile)
                    this.files = files

                    delete this.maps[file.id]
                    this.maps[newFile.id] = newFile

                    this.emitInput()
                    this.emitFile(newFile, file)
                    return newFile
                }
                return false
            },

            get(id) {
                if (!id) {
                    return false
                }

                if (typeof id === 'object') {
                    return this.maps[id.id] || false
                }

                return this.maps[id] || false
            },

            upload(id) {
                let file = this.get(id)
                if (!file) {
                    return Promise.reject('not_exists')
                }
                if (!file.fileObject) {
                    return Promise.reject('file_object')
                }
                if (file.error) {
                    return Promise.reject(file.error)
                }
                if (file.success) {
                    return Promise.resolve(file)
                }
                let extensions = this.extensions
                if (extensions && (extensions.length || typeof extensions.length === 'undefined')) {
                    if (typeof extensions !== 'object' || !(extensions instanceof RegExp)) {
                        if (typeof extensions === 'string') {
                            extensions = extensions.split(',').map(value => value.trim()).filter(value => value)
                        }
                        extensions = new RegExp('\\.(' + extensions.join('|').replace(/\./g, '\\.') + ')$', 'i')
                    }
                    if (file.name.search(extensions) === -1) {
/********************************************************************************************/
                        //return Promise.reject('extension')
                    }
                }

                if (this.size > 0 && file.size >= 0 && file.size > this.size) {
                    return Promise.reject('size')
                }

                if (this.customAction) {
                    return this.customAction(file, this)
                }

                if (this.features.html5) {
                    if (this.shouldUseChunkUpload(file)) {
                        return this.uploadChunk(file)
                    }

                    /*
                    if (file.putAction) {
                        return this.uploadPut(file)
                    }
                    */

                    if (file.postAction) {
                        return this.uploadHtml5(file)
                    }
                }
                if (file.postAction) {
                    return this.uploadHtml4(file)
                }
                return Promise.reject('No action configured')
            },

            shouldUseChunkUpload (file) {
                return this.chunkEnabled &&
                    !!this.chunkOptions.handler &&
                    file.size > this.chunkOptions.minSize
            },


            uploadChunk (file) {
      const HandlerClass = this.chunkOptions.handler
      file.chunk = new HandlerClass(file, this.chunkOptions)

      return file.chunk.upload()
    },

    uploadPut(file) {

        let querys = []
        let value
        for (let key in file.data) {
            value = file.data[key]
            if (value !== null && value !== undefined) {
                querys.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
            }
        }

        let queryString = querys.length ? (file.putAction.indexOf('?') === -1 ? '?' : '&') + querys.join('&') : ''
        let xhr = new XMLHttpRequest()
        xhr.open('PUT', file.putAction + queryString)
        return this.uploadXhr(xhr, file, file.file)
    },

    uploadHtml5(file) {
      let form = new window.FormData()
      let value;
      for (let key in file.data) {
        value = file.data[key];
        //if (value && typeof value === 'object' && typeof value.toString !== 'function') {
        if (value && typeof value === 'object') {
          if (value instanceof File) {
            form.append(key, value, value.name)
          } else {
            //form.append(key + '[]', JSON.stringify(value));
            for (var i = 0; i < value.length; i++) {
                form.append(key + '[]', JSON.stringify(value[i]));
            }
          }
        } else if (value !== null && value !== undefined) {
          form.append(key, value)
        }
      }
      form.append(this.name, file.file, file.file.filename || file.name)
      let xhr = new XMLHttpRequest()
      xhr.open('POST', file.postAction)
      return this.uploadXhr(xhr, file, form)
    },

    uploadXhr(xhr, _file, body) {

        let file = _file
        let speedTime = 0
        let speedLoaded = 0

        xhr.upload.onprogress = (e) => {
            file = this.get(file)
            if (!e.lengthComputable || !file || !file.fileObject || !file.active) {
                return
            }

            let speedTime2 = Math.round(Date.now() / 1000)
            if (speedTime2 === speedTime) {
                return
            }
            speedTime = speedTime2

            file = this.update(file, {
                progress: (e.loaded / e.total * 100).toFixed(2),
                speed: e.loaded - speedLoaded,
            })
            speedLoaded = e.loaded
        }

        let interval = setInterval(() => {
            file = this.get(file)
            if (file && file.fileObject && !file.success && !file.error && file.active) {
                return
            }

            if (interval) {
                clearInterval(interval)
                interval = false
            }

            try {
                xhr.abort()
                xhr.timeout = 1
            } catch (e) {
            }
        }, 100)

        return new Promise((resolve, reject) => {
            let complete
            let fn = (e) => {
                if (complete) {
                    return
                }
                complete = true
                if (interval) {
                    clearInterval(interval)
                    interval = false
                }

                file = this.get(file)

                if (!file) {
                    return reject('not_exists')
                }
                if (!file.fileObject) {
                    return reject('file_object')
                }
                if (file.error) {
                    return reject(file.error)
                }
                if (!file.active) {
                    return reject('abort')
                }

                if (file.success) {
                    return resolve(file)
                }

                let data = {}

                switch (e.type) {
                    case 'timeout':
                    case 'abort':
                    data.error = e.type
                    break
                    
                    case 'error':
                    if (!xhr.status) {
                        data.error = 'network'
                    } else if (xhr.status >= 500) {
                        data.error = 'server'
                    } else if (xhr.status >= 400) {
                        data.error = 'denied';
                    }
                    break
                    
                    default:
                    if (xhr.status >= 500) {
                        data.error = 'server'
                    } else if (xhr.status >= 400) {
                        data.error = 'denied'
                    } else {
                        data.progress = '100.00'
                    }
                }

                if (xhr.responseText) {
                    let contentType = xhr.getResponseHeader('Content-Type')
                    if (contentType && contentType.indexOf('/json') !== -1) {
//************************************************************************************************* TO FIX ??
                        data.response = JSON.parse(xhr.responseText)
                    } else {
                        data.response = xhr.responseText
                    }
                }

                file = this.update(file, data)

                if (file.error) {
                    return reject(file.error)
                }

                return resolve(file)
            }
            
            xhr.onload = fn
            xhr.onerror = fn
            xhr.onabort = fn
            xhr.ontimeout = fn

            if (file.timeout) {
                xhr.timeout = file.timeout
            }

            // headers
            for (let key in file.headers) {
                xhr.setRequestHeader(key, file.headers[key])
            }

            file = this.update(file, { xhr });            

            xhr.send(body)
        })
    },




    uploadHtml4(_file) {
      let file = _file
      let onKeydown = function (e) {
        if (e.keyCode === 27) {
          e.preventDefault()
        }
      }

      let iframe = document.createElement('iframe')
      iframe.id = 'upload-iframe-' + file.id
      iframe.name = 'upload-iframe-' + file.id
      iframe.src = 'about:blank'
      iframe.setAttribute('style', 'width:1px;height:1px;top:-999em;position:absolute; margin-top:-999em;')


      let form = document.createElement('form')

      form.action = file.postAction

      form.name = 'upload-form-' + file.id


      form.setAttribute('method', 'POST')
      form.setAttribute('target', 'upload-iframe-' + file.id)
      form.setAttribute('enctype', 'multipart/form-data')

      let value
      let input
      for (let key in file.data) {
        value = file.data[key]
        if (value && typeof value === 'object' && typeof value.toString !== 'function') {
          value = JSON.stringify(value)
        }
        if (value !== null && value !== undefined) {
          input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          form.appendChild(input)
        }
      }
      form.appendChild(file.el)

      document.body.appendChild(iframe).appendChild(form)




      let getResponseData = function () {
        let doc
        try {
          if (iframe.contentWindow) {
            doc = iframe.contentWindow.document
          }
        } catch (err) {
        }
        if (!doc) {
          try {
            doc = iframe.contentDocument ? iframe.contentDocument : iframe.document
          } catch (err) {
            doc = iframe.document
          }
        }
        if (doc && doc.body) {
          return doc.body.innerHTML
        }
        return null
      }


      return new Promise((resolve, reject) => {
        setTimeout(() => {
          file = this.update(file, { iframe })

          // 不存在
          if (!file) {
            return reject('not_exists')
          }

          // 定时检查
          let interval = setInterval(() => {
            file = this.get(file)
            if (file && file.fileObject && !file.success && !file.error && file.active) {
              return
            }

            if (interval) {
              clearInterval(interval)
              interval = false
            }

            iframe.onabort({ type: file ? 'abort' : 'not_exists' })
          }, 100)


          let complete
          let fn = (e) => {
            // 已经处理过了
            if (complete) {
              return
            }
            complete = true


            if (interval) {
              clearInterval(interval)
              interval = false
            }

            // 关闭 esc 事件
            document.body.removeEventListener('keydown', onKeydown)

            file = this.get(file)

            // 不存在直接响应
            if (!file) {
              return reject('not_exists')
            }

            // 不是文件对象
            if (!file.fileObject) {
              return reject('file_object')
            }

            // 有错误自动响应
            if (file.error) {
              return reject(file.error)
            }

            // 未激活
            if (!file.active) {
              return reject('abort')
            }

            // 已完成 直接相应
            if (file.success) {
              return resolve(file)
            }

            let response = getResponseData()
            let data = {}
            switch (e.type) {
              case 'abort':
                data.error = 'abort'
                break
              case 'error':
                if (file.error) {
                  data.error = file.error
                } else if (response === null) {
                  data.error = 'network'
                } else {
                  data.error = 'denied'
                }
                break
              default:
                if (file.error) {
                  data.error = file.error
                } else if (data === null) {
                  data.error = 'network'
                } else {
                  data.progress = '100.00'
                }
            }

            if (response !== null) {
              if (response && response.substr(0, 1) === '{' && response.substr(response.length - 1, 1) === '}') {
                try {
                  response = JSON.parse(response)
                } catch (err) {
                }
              }
              data.response = response
            }

            // 更新
            file = this.update(file, data)

            if (file.error) {
              return reject(file.error)
            }

            // 响应
            return resolve(file)
          }


          // 添加事件
          iframe.onload = fn
          iframe.onerror = fn
          iframe.onabort = fn


          // 禁止 esc 键
          document.body.addEventListener('keydown', onKeydown)

          // 提交
          form.submit()
        }, 50)
      }).then(function (res) {
        iframe.parentNode && iframe.parentNode.removeChild(iframe)
        return res
      }).catch(function (res) {
        iframe.parentNode && iframe.parentNode.removeChild(iframe)
        return res
      })
    },



            mouseover(){
                this.isClassShadow = true;
            }
            
        },
    }
</script>