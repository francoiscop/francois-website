<template>
	<div class="wrapper-request p-10 m-t-15 m-b-25" v-if="requests.length > 0">
		<h1 class="anton">Friends requests</h1>
		<div class="flex flex-warp">
			<v-request v-for="(request, index) in requests" :request="request" :key="index" />
		</div>
	</div>	
</template>

<style>
.wrapper-request{
	border:0px solid hsl(0, 0%, 86%);
}
.wrapper-request > div > div {
	border: 1px solid hsl(0, 0%, 86%);
	width: 150px;
	padding: 10px;
}
.wrapper-request > div > div a{
	text-transform: capitalize;
}
</style>

<script>
import request from './request.vue'

export default{

	components: {

		'v-request' : request
	},

	props: {

		requests: {
			type: [Object, Array],
			default(){
				return{}
			}
		}
	},

	mounted(){

		console.warn('REQUESTS ::', this.requests)
	},
}
</script>