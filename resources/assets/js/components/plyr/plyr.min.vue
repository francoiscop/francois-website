<template>
  <div :style="`max-width: ${maxWidth}px;`" class="center-auto">
    
    <div :class="aspectRatioClass">
        <div :class="{'has-background-dark' : isLoading, 'has-background-danger' : errorPlayer.status}" style="overflow: hidden;" class="flex flex-center">

              <video id="player" ref="player" v-show="!isLoading" style="height: 100%" />

              <div class="absolute center-absolute flex flex-center" v-if="errorPlayer.status">
                  <div class="not-found--icon"></div>
                  <div class="u s-15 anton has-text-black">{{ errorPlayer.libel }}</div>
              </div>

              <b-loading :is-full-page="false" :active.sync="isLoading"></b-loading>

        </div>
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
.plyr__control--overlaid.none{
    display: none !important;
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

/* NOTES ::::
in node module plyr :src/scss -> base.scss -> remove plyr:position:relative !!!!;
add "flex flex-center" to DIV overflow hidden !!!!!
plyr-controls to position ABSOLUTE
*/
.plyr--video {
    /*very important!!!*/
    width: 100%;
}
.plyr--video .plyr__controls {
  background: black;
  border:0px solid purple;
  padding: 10px 5px 5px;
  position: absolute!important;
  bottom:0rem;
  left:0;
  height: 4rem;
}


.plyr__progress{
    top: -3px;
}

.has-background-danger .plyr { display: none; }

</style>

<script>

import Video from './classes/plyrVideoMinClass'

const validAspectRatio = ['1', '1.33', '1.78', '1.85', '1.90', '2.35', '2.4', '2.40', '2.50']


    export default {

        props: {

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

        computed : {

            video(){

              return store.getters['video/getVideo']

            },

            aspectRatioClass(){

                if (this.video !== null && this.video.hasOwnProperty('aspect_ratio')){

                    let a = this.video.aspect_ratio.split('.')

                    if (a.length === 2 && validAspectRatio.indexOf(`${a[0]}.${a[1]}`) > -1) return 'aspect__ratio--' + a[0] + '-' + a[1];

                }

                return 'aspect__ratio--1-78'
            },

        },

        data(){
            return{

              videoClass : null,

              isLoading : true,

              levels : null,

              editClass : null,

              errorPlayer: {
                  status : false,
                  libel : ''
              },

            }
        },

        watch : {

            video(video){

                if (video === null) return;

                this.videoClass = new Video(video, this.options)

                this.init()
            }

        },

        mounted() {

            
        },

        methods : {

          init(){

            this.videoClass.init().then((r) => {

                this.hideOverlay()

                this.isLoading = false

                this.levels = this.videoClass.levels

                this.editClass = Edit

            }).catch(e => {

                console.error('e :: ', e)

                var libel = 'video not found'

                if (e === 999) libel = 'Your browser does not support streaming. Please update your browser';

                else if (e.hasOwnProperty('libel')) libel = e.libel;

                else if (e.hasOwnProperty('networkDetails') && e.networkDetails !== null && e.networkDetails.status === 404) libel = 'Video not found';

                else if (e.type !== null && e.details !== null && e.details === 'manifestLoadTimeOut') libel = 'Error : Time Out';

                this.setError(libel)

                this.isLoading = false;

            });

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

            secToMin(time){

                 var minutes = Math.floor(time / 60)

                 var seconds = time - minutes * 60;

                 return this.str_pad_left(minutes,'0',2) + ':' + this.str_pad_left(seconds,'0',2)

            },

            str_pad_left(string, pad, left){

                return (new Array(length+1).join(pad)+string).slice(-length)
            },

            hideOverlay(){

                const playOverlay = document.querySelector('.plyr__control--overlaid')

                if (playOverlay !== null && !is.mobile) playOverlay.className += ' none';

            }

        }

    }
</script>
