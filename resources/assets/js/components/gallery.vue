<template>
	<div v-if="images.length > 0">

    	<vs-swiper :direction="'horizontal'" width="auto" :space="2" class="m-t-50 p-0">

        	<vs-slide v-for="(thumb, index) in thumbs" :key="index" :thumb="thumb" @change="changeSlide($event, index)" />

    	</vs-swiper>

    	<vs-swiper :direction="'horizontal'" ref="full" class="m-t-50 p-0" :start="indexSelected">

        	<vs-slide v-for="(thumb, index) in fulls" :key="index" :thumb="thumb" />

    	</vs-swiper>

	</div>
</template>

<script>

import swiper from './swiper/swiperSimple.vue'

import slide from './swiper/slide.vue'

export default{

	components:{
        vsSwiper : swiper,
        vsSlide : slide
    },

	props:{
		images:{
			type: [Object, Array]
		},

		selected:{

		}
	},

	mounted(){
		console.warn('images::', this.images)
		console.warn('thumbs::', this.thumbs)
		console.warn('fulls::', this.fulls)
		console.warn('selected::', this.selected)
		console.error(this.indexSelected)	
	},

	created(){

		console.warn(this.images)

		let i = 0, indexSelected = 0, thumbs = [], fulls = [];
		
		for (let k in this.images){

			thumbs.push({src : this.images[k].low, id : this.images[k].id})

			fulls.push({src : this.images[k].full, id : this.images[k].id})

			if (this.images[k].id == this.selected) indexSelected = i;
			
			i++
				
		}

		this.indexSelected = indexSelected
		this.thumbs = thumbs
		this.fulls = fulls

	},

	data(){

		return{
			//selectedMutated : this.images[this.selected].full
		}

	},

	methods: {

			changeSlide(id, index){
				console.warn('EMITED :' , id)
				console.warn(this.$refs.full.swiper)
				console.warn(this.fulls)
				console.error(index)
				this.$refs.full.swiper.slideTo(index, 1, false)
			}
	}
}
</script>