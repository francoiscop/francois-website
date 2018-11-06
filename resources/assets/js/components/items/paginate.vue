<template>
	<div class="pagination" :class="rootClasses" style="border:1px solid red;">
        <a
            role="button"
            href="#"
            class="pagination-previous"
            :disabled="!hasPrev"
            @click.prevent="prev" >
             <i class="material-icons">keyboard_arrow_left</i>
        </a>
        <a
            role="button"
            href="#"
            class="pagination-next"
            :disabled="!hasNext"
            @click.prevent="next" >
            <i class="material-icons">keyboard_arrow_right</i>
        </a>
    </div>
</template>

<style>
</style>

<script>
export default{
	props: {

		page: {
			type : Number,
			default : 1
		},

		last: {
			type : Boolean,
			default : false
		},

		size: String,
        simple: Boolean,
        rounded: {
        	type : Boolean,
        	default : true
        },
        order: String

	},

	computed : {

		rootClasses() {
                return [
                    this.order,
                    this.size,
                    {
                        'is-simple': this.simple,
                        'is-rounded': this.rounded
                    }
                ]
         },

         hasPrev() {
             return this.page > 1
         },

         hasNext() {
              return !this.last
         },

	},

	methods : {

		next(){

			this.paginate(this.page + 1)

		},

		prev(){

			this.paginate(this.page - 1)

		},

		paginate(p){

			var url = this.getBaseUrl().slice(0, -1) + p;
			var s = (window.location.search === '') ? '' : window.location.search 

            console.warn('PAGE: ' + p);
            console.warn(url + s);
            console.warn(window.location.search)
            
            window.location = url + s
        },
     
        getBaseUrl(){
            return window.location.origin + window.location.pathname;
        }
	
	}
}
</script>