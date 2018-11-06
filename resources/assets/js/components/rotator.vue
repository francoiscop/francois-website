<template>
	<div>
		<img :src="src" :style="'height:' + height + 'px'" ref="rotator" @mouseover="start" @mouseout="stop"/>
	</div>
</template>

<script>
export default{

	props : {
		images : {
			type: Array,
			default(){
				return []
			}
		},

		height : {
			type: Number,
			default: 200
		}
	},

	data(){
		return{
			src : this.images[0]
		}
	},

	methods : {

		start(){

			let i = 0;

			this.interval = setInterval(() => {

				this.$refs.rotator.src = this.images[i]

				i ++;

				if (i >= this.images.length) i = 0;

			}, 500)
		},

		stop(){

			clearInterval(this.interval)

			this.$refs.rotator.src = this.images[0]

		}
	}
}
</script>