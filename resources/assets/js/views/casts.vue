<template>
	<div class="casts">
		<div v-if="casts.length > 0" class="p-20">
        		<div v-for="(cast, index) in casts" class="flex flex-center-y m-b-5">
        			<div>
        				<a :href="cast.link">
        					<img :src="cast.image" class="is-round is-img-100" />
        				</a>
        			</div>
        			<div class="m-l-10">
        				<a :href="cast.link">{{cast.name}}</a>
        			</div>
        		</div>
		</div>

		<div v-else class="flex flex-center m-30">
			<div class="button is-static helvetica s-9">... no cast available ...</div>
		</div>
	</div>
</template>


<style>
.casts img{
	border:1px solid hsl(0, 0%, 86%);
}
	
</style>

<script>
export default{

	created(){

		this.casts = [];

		if (typeof _video !== 'undefined'){

			if (_video.hasOwnProperty('casts') && _video.casts.length > 0){

				this.casts = _video.casts.map((cast) => {

					return {name : cast.name, link : cast.link, image: cast.image }

				})
			}


		}
	}

}
</script>