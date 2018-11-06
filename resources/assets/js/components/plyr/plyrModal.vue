<template>
	<div id="modal-id" class="modal" :class="[modalEffect, {'modal-full-screen' : isFullScreen}, {'is-active' : active}]">
    	
    	<div class="modal-background"></div>
    	<div class="modal-content" :class="modalClass">
        
        	<vs-plyr ref="plyr" :style="(isBorder) ? 'border:1px solid orange;' : ''"/>

        	<div class="m-t-5 u center-text">{{ title }} {{ client }}</div>

    	</div>
    	<button class="modal-close is-large z-20" aria-label="close" @click="close()"></button>
	
	</div>
</template>

<style scoped>
.modal-close:before,
.modal-close:after {
	background-color: #4a4a4a!important;
}
</style>

<script>

require('plyr/src/sass/plyr.scss')

import "bulma-modal-fx/dist/css/modal-fx.css"

import "bulma-modal-fx/dist/js/modal-fx.js"

import plyrComponent from './plyr.min.vue';


export default{

	components : {'vs-plyr' : plyrComponent},

	props : {

		modalClass: {
			type: String,
			default: 'modal-is-image'
		},

		modalEffect: {
			type: String,
			default: 'modal-fx-fadeInScale'
		},

		isFullScreen: {
			type: Boolean,
			default: false
		},

		isBorder: {
			type: Boolean,
			default: false
		}

	},

	computed : {

		active(){
			return store.getters['video/getModalVideo']
		},

		video(){
			return store.getters['video/getVideo']
		},

		title(){
			if (this.video === null) return null;

			return this.video.title
		},

		client(){
			if (this.video === null || this.video.client === null || this.video.client === '') return null;

			return `| ${this.video.client}`
		}
	},

	methods : {

		close(){

			this.$refs.plyr.videoClass.close()

			store.commit('video/setVideo', null)

			store.commit('video/setModalVideo', false)
		}
	},

	updated() {

		//store.commit('swiper/setLoadingPlay', this.active)

	}
}
</script>