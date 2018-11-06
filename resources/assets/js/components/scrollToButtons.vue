<template>
	<div>
		<transition name="fade">
			<div v-if="isTop" class="scroll-button s-20 pointer top flex flex-center" @click="scroll('previous')">
				<i class="material-icons s-20">keyboard_arrow_up</i>
			</div>
		</transition>

		<transition name="fade">
			<div v-if="isBottom" class="scroll-button pointer bottom flex flex-center" @click="scroll('next')">
				<i class="material-icons s-20">keyboard_arrow_down</i>
			</div>
		</transition>
	</div>
</template>

<style>
.scroll-button{

	border: 0px solid hsl(0, 0%, 56%);
	position:fixed;
	z-index:10;
	right:30px;
	height: 50px;
	width: 50px;
	border-radius: 50%;
	background-colorxxx: rgba(240, 56, 97, 0.2);
	color:white;
	color: rgb(0,209,178);
}
.scroll-button:hover{
	border-color: hsl(0, 0%, 36%);
	background-color: rgba(0,209,178,0.2);
}
.top{
	bottom: 102px;
}
.bottom{
	bottom: 50px
}
</style>

<script>
export default{

	props:{

		isTop: {
			type: Boolean,
			default: true
		},

		isBottom: {
			type: Boolean,
			default: true
		}

	},


	methods: {

		scroll(direction){

			this.$emit('scroll', direction)
		},

		init(){

			const controller = new this.$scrollmagic.Controller()
		}
	}

}
</script>