<template>
	<div>
		<div v-if="description !== ''" class="description p-20 m-20">
			{{ description }}
		</div>
		<div v-else class="flex flex-center m-30">
			<div class="button is-static helvetica s-9">... no description available ...</div>
		</div>

		<div v-if="tags.length > 0">
			<b-taglist>
        		<b-tag type="is-warningxx" size="is-medium" v-for="(tag, index) in tags" :key="index">
        			<a :href="tag.link">{{tag.name}}</a>
        		</b-tag>
    		</b-taglist>
		</div>
	</div>
</template>


<style>
.description{
	border:1px solid hsl(0, 0%, 86%);
}
	
</style>

<script>
export default{

	created(){

		this.description = '';

		this.tags = [];

		if (typeof _video !== 'undefined'){

			if (_video.hasOwnProperty('description') && _video.description !== ''){

				this.description = _video.description
			}

			if (_video.hasOwnProperty('tags') && _video.tags.length > 0){

				this.tags = _video.tags.map((tag) => {

					return {name : tag.name, link : tag.link }

				})
			}


		}
	}

}
</script>