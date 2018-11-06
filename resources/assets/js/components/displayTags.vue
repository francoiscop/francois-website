<template>
	<div class="flex">

		<h3 class="center-text capitalize" style="margin-right:10px;">{{ label }}</h3>

		<div v-if="tagsComputed.length === 0"
		class="notification is-thin center-text"
		style="flex-grow:1;margin-right:5px" 
		>No infos on cast</div>

		<div v-else>
			<span v-for="(tag, index) in tagsComputed" v-if="index < limitMutated"
				class="tag has-text-black" 
				:class="classProp"
				style="margin:2px;" 
			>{{ tag.name }}</span>
			<button  class="button is-small" @click="updateLimit(limitMutated)" v-if="tagsComputed.length > limit">
    			show {{limitMutated == limit ? 'more' : 'less'}}
  			</button>
		</div>

	</div>
</template>

<script>
export default{

	props:{

		tags:{
			type: Array,
			default(){
				return[]
			}
		},

		label: {
			type: String,
			default: ''
		},

		classProp: {
			type: String,
			default: ''
		},

		limit:{
			type: Number,
			default: 10
		}
	},

	data(){

		return{
			limitMutated : this.limit
		}
	},

	computed: {

		tagsComputed(){

			let tagsComputed = [];

			if (this.tags === null) return tagsComputed;

			for (let i = 0; i < this.tags.length; i++){
				if (this.tags[i].name !== '') tagsComputed.push(this.tags[i]);
			}

			return tagsComputed;

		}
	},

	methods: {

		updateLimit(limit){

			if (this.limitMutated == this.tagsComputed.length) this.limitMutated = this.limit;
			else this.limitMutated = this.tagsComputed.length
		}
	}
}
</script>