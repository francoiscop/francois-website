<template>
	<div>
		
		<div class="description">
			{{ description }}
		</div>

		<div class="tags p-5" v-if="tags.length > 0">
			<span class="tag is-warning is-medium" style="text-transform:capitalize" v-for="tag in tags">{{ tag }}</span>
		</div>

		<ul>
			<li v-for="(info, key) in infos">
				
				<div class="tags p-5" v-if="typeof info === 'object'">
					<span class="m-r-5 key" style="text-transform:capitalize">{{ key | _ }}</span>
					<span class="tag is-small is-info" v-for="tag in info">{{ tag }}</span>
				</div>

				<div v-else-if="info !== ''" class="p-5">
					<span class="m-r-5 key" style="text-transform:capitalize">{{ key | _ }}</span>
					<small class="has-text-info">{{ info }}</small>
				</div>
			
			</li>
		</ul>
	</div>
</template>


<style>
.tags .tag{
	margin-bottom: 0.25rem;
	margin-top: 0.25rem;
}
.key{
	font-size: 0.9rem;
	border-bottom: 3px solid hsl(0, 0%, 86%)
}
.description{
	padding: 20px;
	margin: 10px;
	border: 1px solid hsl(0, 0%, 76%)
}
</style>

<script>
export default{

	created(){

		this.infos = {};

		this.tags = [];

		if (typeof _infos !== 'undefined' && _infos !== null){

			this.infos = _infos

			this.tags = _infos.tags



		}
		//this.description = _infos.description
		//_infos.description = ''
		

		for (let k in this.infos){
				//console.log(k + ': ' + typeof this.infos[k])
				//this.infos[k].tags = false
				//if (typeof this.infos[k] === 'object') this.infos[k].tags = true;
			}
	},

	computed : {

		description(){
			return this.infos.description
		},

		infosComputed(){

			for (let k in this.infos){
				console.log(typeof this.infos[k])
			}
		}
	},

	mounted(){
		console.warn('INFOS MOUNTED:', this.infos)
	},

	filters: {

		_(s){
			return s.replace(/_/g, " ")
		}
	}

}
</script>