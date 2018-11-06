<template>
	<div class="flex flex-warp">
		<div class="elevation-8xx p-5 relative" v-for="(picture, index) in picturesMutated">
		
			<a :href="picture.link"><img :src="picture.thumb" /></a>
	
		</div>
	</div>
</template>

<style>
</style>

<script>
import scroll from '../../mixins/scroll.js'

export default {

	mixins: [scroll],

	props : {
		pictures : {
			type : [Object, Array],
			default(){
				return {}
			}
		}
	},

	data(){
		return{
			picturesMutated : this.pictures,
			page : 1
		}
	},

	methods : {

		scroll(){
                
            setTimeout(() => {
                this.fetch()
            }, 10)
        },

        fetch(){

        	this.page ++;

        	var tags = (location.search === '') ? '?' : location.search;

        	axios.get('/rest/pictures/' + tags + 'page=' + this.page + '&i=' + __i).then(response => {
        		
        		console.warn(response.data.pictures)

        		this.picturesMutated =[...this.picturesMutated, ...response.data.pictures]
        	
        	}).catch(e => {
        		
        		console.error(e)
        	
        	})
        }
	}
	
}
</script>