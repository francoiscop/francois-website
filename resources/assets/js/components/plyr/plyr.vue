<template>
  <div :style="`max-width: ${maxWidth}px;`" class="center-auto">
    
    <div :class="aspectRatioClass">
        <div :class="{'has-background-dark' : isLoading, 'has-background-danger' : errorPlayer.status}" style="overflow: hidden;">

              <video id="player" ref="player" v-show="!isLoading" style="height: 100%"></video>

              <div class="absolute center-absolute flex flex-center" v-if="errorPlayer.status">
                  <div class="not-found--icon"></div>
                  <div class="c s-20 anton has-text-dark">{{ errorPlayer.libel }}</div>
              </div>

              <b-loading :is-full-page="false" :active.sync="isLoading"></b-loading>

        </div>
    </div>


    <div class="m-20 flex flex-center" v-if="editable && !errorPlayer.status &&!isLoading">
          <b-switch v-model="isEditingMode" class="tooltip is-tooltip-info is-tooltip-bottom" :data-tooltip="(user.loggedin) ? 'Save your own extract' : 'You need to be logged in'" :disabled="!user.loggedin">
                  <span class="u m-r-5">Edit Mode</span>
                  <span :class="(!isEditingMode) ? 'has-text-danger' : 'has-text-success'">{{ (isEditingMode) ? 'ON' : ' OFF' }}</span>
          </b-switch>
      </div>

      <div class="center-text" v-if="isEditingMode">
              <div class="anton u s-10">Save your own Extract</div>
              <p>
                  Select IN point
                  <img src="/svg/in.svg" style="height:20px;border:1px solid yellow;position:relative;top:5px;" />
                  <span v-if="inPoint !== null" class="has-text-primary"> {{ inPoint }}</span>
              </p>
              <p>
                  Select OUT point
                  <img src="/svg/out.svg" style="height:20px;border:1px solid red;position:relative;top:5px;"/>
                  <span v-if="outPoint !== null" class="has-text-danger"> {{ outPoint }}</span>
              </p>

              <error :error="errorEdit" style="max-width:200px;" class="center-auto" />

              <div class="button is-primary" :disabled="inPoint === null || outPoint === null || errorEdit.status" @click.prevent="save()">Save</div>

      </div>


    <div v-if="editable" id="modal-card" class="modal modal-fx-3dSlit" :class="{'is-active' : isModalActive}">
        <div class="modal-background"></div>
        <div class="modal-content is-huge" style="max-width: 500px">
            <div class="card">
                <div class="card-image">
                    <figure class="image is-128x128 center-auto">
                        <img src="/css/_icons/extract.png">
                    </figure>
                </div>
                <div class="card-content">
                    <div class="content">

                        <error :error="errorEdit" />

                        <div>
                          <vs-form :url="urlExtract" ref="upload" @done="isSubmitLoading = false"/>
                        </div>

                    </div>
                </div>
            </div>
            <footer class="modal-card-foot">
                <button class="modal-button-close button is-primary" :class="{'is-loading' : isSubmitLoading}" @click="submit()">
                  Save extract
                </button>
                <button class="modal-button-close button" @click="isModalActive = false">Cancel</button>
            </footer>
        </div>
        <button class="modal-close is-large" aria-label="close" @click="isModalActive = false"></button>
    </div>

  </div>
</template>

<style>
.not-found--icon{

  height:50px;
  width:50px;
  display:inline-block;
  background-size: 50px 50px;
  margin-right:5px;
  background-image: url('/css/_icons/404.png');

}

.edit{
   display: inline-block;
   height: 28px;width: 28px;
   border-radius: 50%;
   color:whitesmoke;
}
.edit--off{
  background: red;
}
.edit--on{
  background: green;
}


/*
PLAY OVERLAID
*/
.plyr__control--overlaid {
    backgroundxx: rgba(26,175,255,.8);
    background-color: transparent;
    border: 0;
    box-shadow: 0 1px 1px rgba(0,0,0,.15);
    color: #fff;
    display: nonex;
    left: 50%;
    padding: 35px;
    position: absolute;
    top: 50%;
    transform: translate(-50%,-50%);
    z-index: 5;
    border:1px solid hsl(0, 0%, 28%);
}

.plyr__control--overlaid svg {
    left: 5px;
    width: 64px;height:64px;
}

/*
Spacer
*/
.plyr__spacer{
  border:0px solid red;
  flex: 1;
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
    position: relative;
}

/*
Quality info
*/
.plyr__quality_info{
  color: rgba(26, 175, 255, 1);
  font-weight: bold;
  text-transform: capitalize;
}

/*
Progress
*/
.plyr__progress{
    border:0px solid blue;
    position: absolute;
    top: 30px;
    left:-10px;
    width:100%;
}
.plyr__progress--buffer, .plyr__progress--played {
      border:0px solid orange;
      border-radius:0;
}
.plyr__progress--buffer,
.plyr__progress--played{
      height: 6px;
}

.plyr--full-ui input[type=range]{
  height: 0px;
}


/*
Font
*/
.plyr__time{
      font-family: Oxygen Mono;
      font-size:0.6rem!important;
      border:0px solid yellow;
      line-height: 36px!important;
}
.plyr__tooltip{
      font-family: Oxygen Mono;
      font-size:0.6rem!important;
}

.plyr__progress--buffer::-webkit-progress-value,
   .plyr__progress--played::-webkit-progress-value,
   .plyr__volume--display::-webkit-progress-value{
    border-radius:0px;
}

.plyr__controls button{
    border-radius:0px;
}

.plyr__progress--buffer,.plyr__progress--played,.plyr__volume--display{
    border-radius:0px;
}






/*
THUMB Of SLIDER RANGE ::
*/
/* Special styling for WebKit/Blink */
.plyr__progress input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 5px;
  width: 1px;
  margin-top: 0px;
  background-color: transparent;
  /*
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
  margin-top: -14px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
  /*box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; /* Add cool effects to your sliders! */
}

/* All the same stuff for Firefox */
.plyr__progress input[type=range]::-moz-range-thumb {
  /*
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
  */
}

/* All the same stuff for IE */
.plyr__progress input[type=range]::-ms-thumb {
  /*
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
  */
}


/*
TRACK OF SLIDER RANGE ::
*/
.plyr__progress input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  cursor: pointer;
  border-radius: 0;
}

.plyr__progress input[type=range]:focus::-webkit-slider-runnable-track {
  backgroundxxxxxxx: #367ebd;
}

input[type=range]::-moz-range-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #3071a9;
  border-radius: 1.3px;
  border: 0.2px solid #010101;
}

input[type=range]::-ms-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  border-width: 16px 0;
  color: transparent;
}
input[type=range]::-ms-fill-lower {
  background: #2a6495;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
input[type=range]:focus::-ms-fill-lower {
  background: #3071a9;
}
input[type=range]::-ms-fill-upper {
  background: #3071a9;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
input[type=range]:focus::-ms-fill-upper {
  background: #367ebd;
}


/*
|| EDIT
*/
.plyr__edit{
  width:2px;
  height:6px;
  position: absolute;
  z-index: 20;
  background-color:white;
  top: -3px;

  border-radius: 50%;
  width: 10px;
  height: 10px;
  top:-5px;
}

#in-point{
  background-color: hsl(171, 100%, 41%);
}

button:disabled,
button[disabled]{
  opacity: 0.5;
  cursor: not-allowed;
}

button:disabled:hover,
button[disabled]:hover{
  background-color: transparent!important;
}





/*NEW*/
.plyr--video .plyr__controls {
  background: black;
  border:0px solid red;
  padding: 10px 5px 5px;
}
.plyr__progress{
    top: -3px;
}
</style>

<script>

import Video from './classes/plyrVideoClass'

import "bulma-modal-fx/dist/css/modal-fx.css"

import "bulma-modal-fx/dist/js/modal-fx.js"

const validAspectRatio = ['1', '1.33', '1.78', '1.85', '2.35', '2.4', '2.40']


    export default {

        props: {
            video: {
                type: Object,
                default: {}
            },

            options: {
                type: Object,
                default(){
                  return{}
                }
            },

            displayTitle : {
                type: Boolean,
                default: false
            },

            maxWidth : {
                type : Number,
                default: 900
            },

            editable : {
                type: Boolean,
                default: false
            },

            isCentered : {
                type: Boolean,
                default: false
            }
        },

        created(){

            this.videoClass = new Video(this.video, this.options)

        },

        computed : {

            aspectRatioClass(){

                if (this.video.hasOwnProperty('aspect')){

                    let a = this.video.aspect.split('.')

                    if (a.length === 2 && validAspectRatio.indexOf(`${a[0]}.${a[1]}`) > -1) return 'aspect__ratio--' + a[0] + '-' + a[1];

                }

                return 'aspect__ratio--1-78'
            },

            urlExtract(){

                if (!this.editable) return null;

                if (typeof _form === 'undefined' || !_form.hasOwnProperty('url') || _form.url === '') return null;

                return _form.url
            }

        },

        data(){
            return{

              user : user,

              videoClass : null,

              isLoading : true,

              isSubmitLoading : false,

              isModalActive : false,

              levels : null,

              editClass : null,

              isEditingMode : false,

              inPoint : null,

              outPoint : null,

              errorPlayer: {
                  status : false,
                  libel : ''
              },

              errorEdit: {
                  status : false,
                  libel : ''
              },

            }
        },

        watch : {

            isEditingMode(val){
                
                if (this.editClass === null) return;
                
                this.editClass.disable(!val);

            },

            'editClass.time.in' : function(newVal, oldVal){

                if (newVal !== null) newVal = Math.round(newVal)

                this.inPoint = newVal

                this.checkDuration()
            },

            'editClass.time.out' : function(newVal, oldVal){

                if (newVal !== null) newVal = Math.round(newVal)

                this.outPoint = newVal

                this.checkDuration()
            }

        },

        mounted() {

            this.videoClass.init().then((r) => {

                console.warn('plyr.vue -> r:', r)

                this.isLoading = false

                this.levels = this.videoClass.levels

                this.editClass = Edit

                /*
                if (this.isPaddingTop() && this.video.padding != '56.25'){

                    var plyr = document.getElementsByClassName('plyr')

                    const width = plyr[0].clientWidth;

                    let bottom = 10;

                    if (width > 500) bottom = 40;
                    if (width > 700) bottom = 50;

                    var controls = document.getElementsByClassName('plyr__controls');

                    controls[0].style['bottom'] =  bottom + 'px';

                }
                */

            }).catch(e => {

                //console.error('e :: ', e)

                var libel = 'error !'

                if (e === 999) libel = 'Your browser does not support streaming. Please update your browser';

                else if (e.hasOwnProperty('libel')) libel = e.libel;

                else if (e.hasOwnProperty('networkDetails') && e.networkDetails !== null && e.networkDetails.status === 404) libel = 'Video not found';

                else if (e.type !== null && e.details !== null && e.details === 'manifestLoadTimeOut') libel = 'Error : Time Out';

                this.setError(libel)

                this.isLoading = false;

            });
        },

        methods : {

            isPaddingTop(){
                
                return (this.video.hasOwnProperty('padding') && this.video.padding > 0)
            
            },

            checkDuration(){

                this.clearError('edit')

                if (this.inPoint === null || this.outPoint === null) return;

                const durationSettings = (typeof _form !== undefined && _form.hasOwnProperty('settings') && _form.settings.hasOwnProperty('extract')) ? _form.settings.extract : null;

                if (durationSettings === null){

                    console.error('NO DURATION SETTINGS')

                    return
                
                }

                const max_duration = (durationSettings.hasOwnProperty('max_duration') && durationSettings.max_duration !== '') ? durationSettings.max_duration : null;

                const min_duration = (durationSettings.hasOwnProperty('min_duration') && durationSettings.min_duration !== '') ? durationSettings.min_duration : null;

                if (min_duration === null || max_duration === null){

                    console.error('NO MIN / MAX DURATION')

                    return
                
                }

                var duration = this.outPoint - this.inPoint

                if (duration > max_duration){ 

                    var libel = 'Duration too long : ' + this.secToMin(duration)

                    this.setError(libel, 'edit')

                    return

                }

                if (duration < min_duration){ 

                    var libel = 'Duration too short : ' + this.secToMin(duration)

                    this.setError(libel, 'edit')

                    return

                }

                this.$store.commit('form/appendData', ['in', this.inPoint])

                this.$store.commit('form/appendData', ['out', this.outPoint])
            },

            setError(libel, type){

                if (typeof type === 'undefined') type = 'player';

                var e = 'error' + type.charAt(0).toUpperCase() + type.slice(1)

                this[e].status = true

                this[e].libel = libel

            },

            clearError(type){

                if (typeof type === 'undefined') type = 'player';

                var e = 'error' + type.charAt(0).toUpperCase() + type.slice(1)

                this[e].status = false

                this[e].libel = ''

            },

            level(){
              console.log(window.hls);
              hls.startLoad(10)
              console.warn('levels',hls.levels)
              console.warn('currentLevel', hls.currentLevel)
              console.warn('nextLevel', hls.nextLevel)
              console.warn('loadLevel', hls.loadLevel)
              console.warn('nextLoadLevel', hls.nextLoadLevel)
              console.warn('startLevel', hls.startLevel)
              console.warn('hls.autoLevelEnabled', hls.autoLevelEnabled)
            },

            input(value){
              console.error('VALUE OF SWITCH', value);
            },

            secToMin(time){

                 var minutes = Math.floor(time / 60)

                 var seconds = time - minutes * 60;

                 return this.str_pad_left(minutes,'0',2) + ':' + this.str_pad_left(seconds,'0',2)

            },

            str_pad_left(string, pad, left){

                return (new Array(length+1).join(pad)+string).slice(-length)
            },

            save(){

                if (this.inPoint === null ||this.outPoint === null || this.errorEdit.status) return;

                this.isModalActive = true;
            },

            submit(){

                this.$refs.upload.submit();

                this.isSubmitLoading = true
            }
        },

    }
</script>
