<template>
	<div id="modal-id" class="modal modal__screencaps" :class="[modalEffect, {'modal-full-screen' : isFullScreen}, {'is-active' : active}]">
    	
    	<div class="modal-background"></div>
    	<div class="modal-content flex flex-column flex-center" :class="modalClass">

    		<vs-gallery :images="images" />

    		<!--
    		<div v-if="images.length > 0" class="modal__images flex flex-warp flex-center" :class="{'o-4' : image !== null}">
    			<div v-for="(image, index) in images">
    				<vs-screencap :class-aspect="classAspect" :src="image" @click="click(index)"/>
    			</div>
    		</div>

    		<div v-if="error.status" class="has-text-danger">{{ error.libel }}</div>
        
        	<div v-show="!isLoading" class="m-t-5 u center-text">{{ title }} {{ client }}</div>

        	<div v-show="image !== null" class="absolute center-absolute modal__image flex flex-center debug">
        		<div class="center-text debug-red">
        			<img :src="image" @click="image = null" class="pointer" />
        		</div>
        	</div>
           -->

    	</div>
    	
    	<button class="modal-close is-large" aria-label="close" @click="close()"></button>

    	<b-loading :is-full-page="true" :active.sync="isLoading"></b-loading>
	
	</div>
</template>

<style scoped>
.modal__images{
	max-width:80%;
}
.modal__screencaps img{
	min-width: 180px;
	width: 33%;
}
.modal__image{
	width: 100%;
	height: 100%;
}
.modal__image img{
	min-width: 400px;
	max-width: 90%;
	border: 10px solid white;
}
.modal-close:before,
.modal-close:after {
	background-color: #4a4a4a!important;
}
</style>

<script>

import screencap from './screencap.vue'

import gallery from '../gallery.vue'

import "bulma-modal-fx/dist/css/modal-fx.css"

import "bulma-modal-fx/dist/js/modal-fx.js"

export default{

	components:{
        vsScreencap : screencap,
        vsGallery : gallery
    },

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

	data() {

		return{
			isLoading : true,
			error : {
				status : false,
				libel : null
			},
			classAspect : 'aspect__ratio--16-9',
			image : null
		}

	},

	computed : {

		active(){
			return store.getters['video/getModalScreencaps']
		},

		images(){
			return store.getters['video/getScreencapsImages']
		},

		video(){
			return store.getters['video/getScreencapsVideo']
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

			this.isLoading = true

			this.error.status = false

			this.image = null

			store.commit('video/setScreencapsImages', [])

			store.commit('video/setScreencapsVideo', null)

			store.commit('video/setModalScreencaps', false)
		},

		click(index){

			if (this.images[index] !== 'undefined'){

				this.image = this.images[index]

			}
		}
	},

	watch : {

		active(bool){

			if (bool){

				store.dispatch('video/fetchScreencaps').then((r) => {

					if (r.data.aspect != 1.78){

						const a = r.data.aspect.toString().replace('.','-')

						this.classAspect = `aspect__ratio--${a}`

					}

				}).catch((e) => {

					this.isLoading = false

					this.error.status = true

					this.error.libel = e.response.data.error

				})
			}
		},

		images(images){

			if (images.length > 0) this.isLoading = false;
		}

	}
}
</script>