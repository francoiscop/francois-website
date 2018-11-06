<template>
	<div class="center-text flex flex-column m-r-2">
		<a :href="request.link">{{request.username}}</a>
		<transition name="transition">
			<a href="" v-show="(!isAccept && !isDecline) || isLoading"><img :src="request.avatar" /></a>
		</transition>
		<div class="flex flex-center-x m-t-5" v-if="!isDecline && !error.status">
			<v-button
				:messages="messages.accept"
				@confirmation-success="accept()"
				:is-loading="isLoading"
			/>
		</div>
		<div class="flex flex-center-x m-t-5" v-if="!isAccept && !error.status">
			<v-button
				:messages="messages.decline"
				@confirmation-success="decline()"
				:is-loading="isLoading"
				color="is-danger"
			/>
		</div>
		<error :error="error" />
	</div>
</template>

<style>
.transition-enter,
.transition-leave-to {
  opacity: 0;
  transform: rotateY(50deg);
}

.transition-enter-active,
.transition-leave-active {
  transition: 0.3s ease-out;
}
</style>

<script>
import button from '../social/buttons/confirmationButton.vue'

import {mixError} from '../social/mixins/mixError'


export default{

	components: {

		'v-button' : button
	},

	mixins: [mixError],

	props: {

		request: {
			type: Object,
			default(){
				return{}
			}
		}
	},

	data(){
		return{

			messages: {
				accept : ['Accept invitation','Are you sure?','✔'],
				decline: ['Decline','Are you sure?','<i class="material-icons">clear</i>']
			},

			isLoading: true,

			isAccept: false,
			isDecline: false
		}
	},

	methods : {

		accept(){
			
			this.isAccept = true;
			
			this.fetch('accept').then(r => {

				this.isLoading = false;
			
			}).catch(e => {

				console.warn(e);

				this.setError(e)

				this.isLoading = false;
			})

		},

		decline(){
			
			this.isDecline = true

			this.fetch('decline').then(r => {

				this.isLoading = false;
			
			}).catch(e => {

				this.isLoading = false;
			})
		},

		fetch(action){
			return new Promise((resolve,reject) => {         
            
            	axios.post('/rest/friend/' + action + '/'+ this.request.id).then((response)  =>  {
                
                	resolve(response.data.message);
            
            	}, (error)  =>  {
                
                	reject(error)
            
            	})       
        	}); 
		}
	}
}
</script>