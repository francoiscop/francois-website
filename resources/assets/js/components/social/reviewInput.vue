<template>
    <div class="review-post m-l-10 m-r-10 p-l-30">
        <vv-input
            label="Title"
            :required="true"
            :rules="['alphanumeric']"
            :max="100"
            :min="10"
            ref="title"
            @clearError="clearError($event)"
        ></vv-input>

        <vs-rating
          parent-class="video"
          :id="id"
          :rating="0"
          :size="1.2"
          @rated="rated($event)"
          ref="rating"
        ></vs-rating>
        <div class="has-text-danger is-size-9" v-if="isErrorRating">You need to rate this film</div>

        <vv-textarea
            :required="true"
            ref="review"
            @clearError="clearError($event)"
        ></vv-textarea>

        <button class="button has-background-custom-3 u m-t-10"
            :class="{'is-loading' : isLoading}"
            v-text="'Post a review'"
            :disabled="errors.length > 0"
            @click="post"
        ></button>

        <error :error="error" />

    </div>
</template>


<style>
.review-post{
    border-left: 0px solid hsl(0, 0%, 91%);
}

.review-post textarea, .review-post .hidden-texarea{
    min-height: 10em!important;
}
</style>


<script>
import input from '../form/input.vue'

import textarea from '../form/textarea.vue'

import {mixError} from './mixins/mixError.js'

import ratingComponent from './rating.vue'

export default{

    mixins : [mixError],

    components : {
        'vv-input' : input,
        'vv-textarea' : textarea,
        'vs-rating' : ratingComponent
    },

    props : {
        id : {
            type: Number,
            default: null
        },
    },

    data(){
        return{
            errors:[],
            isLoading : false,
            rating: null,
            isErrorRating: false,
        }
    },

    methods:{

        clearError(label){
            if (label === '') label = 'review';
            var index = this.errors.indexOf(label.toLowerCase());
            if (index > -1) this.errors.splice(index, 1);
        },

        rated(r){
            this.rating = r;
            this.isErrorRating = false;
            this.clearError('rating');
        },

        reset(){
            this.rating = null;
            for (let k in this.$children) {

                var child = this.$children[k];
                var ref = child.$vnode.data.ref;

                if (ref === 'rating') child.ratingMuated = 0;
                else child.input = '';
            }
        },
        post(){
            
            var formData = new FormData();

            const toSend = ['rating', 'title', 'review']
            
            for (let k in this.$children) {

                var child = this.$children[k];
                var ref = child.$vnode.data.ref;

                if (ref === 'rating' && child.ratingMutated === 0 && this.errors.indexOf('rating') === -1){
                    
                    this.errors.push('rating');
                    this.isErrorRating = true;
                }
                
                if (ref !== 'rating' && child.input === ''){
                    
                    child.setError('REQUIRED');
                    if (this.errors.indexOf(ref) === -1) this.errors.push(ref);
                }

                if (child.hasOwnProperty('errorMutable') && child.errorMutable.is && this.errors.indexOf(ref) === -1){
                    
                    this.errors.push(ref);
                }

                var append = (ref === 'rating') ? 'ratingMutated' : 'input';
                
                if (toSend.indexOf(ref) > -1) formData.append(ref, child[append]);

            }

            if (this.errors.length > 0) return;

            this.isLoading = true;

            this.$store.dispatch('reviews/postItem', formData).then(r => {

                this.isLoading = false

                this.reset()

            }).catch(e => {

                this.isLoading = false

                this.setError(e)

            })






            return
                
            axios.post('/rest/review/' + this.id, formData).then((response) => {

                    this.isLoading = false;
                    this.$emit('posted', response.data.review);
                    this.reset();
                
            }, (error) => {
                    
                    this.isLoading = false;

                    console.log(error.response);

                    this.reset();

                    if (error.response.status === 403 || error.response.status === 404 || error.response.status === 500 || error.response.status === 405){
                        this.setError(error);
                        return;
                    }

                    var errors = error.response.data.errors;
                                        
                    for (var k in errors) {
                        this.$refs[k].setError(errors[k][0]);
                    }
            });
        }
    }

}
</script>

<!--
<template>
	<div class="review-post">
		<vv-input
            label="Title"
            :required="true"
            :rules="['alphanumeric']"
            :max="100"
            :min="10"
            ref="title"
            @clearError="clearError($event)"
        ></vv-input>

        <vs-rating
          parent-class="video"
          :id="id"
          :rating="0"
          :size="1.2"
          @vote="rated($event)"
          ref="rating"
        ></vs-rating>
        <div class="has-text-danger is-size-9" v-if="isErrorRating">You need to rate this film</div>

        <vv-textarea
            :required="true"
            ref="review"
            @clearError="clearError($event)"
        ></vv-textarea>

        <button class="button is-medium" style="text-transform: uppercase;margin-top: 10px;"
        	:class="{'is-loading' : isLoading}"
        	v-text="'Post a review'"
        	:disabled="errors.length > 0"
        	@click="post"
        ></button>

        <error :error="error" />

	</div>
</template>


<style>
.review-post textarea, .review-post .hidden-texarea{
	min-height: 10em!important;
}
</style>


<script>
import input from '../form/input.vue';
import textarea from '../form/textarea.vue';
import {mixError} from './mixins/mixError.js';
export default{

	mixins : [mixError],

	components : {
        'vv-input' : input,
        'vv-textarea' : textarea
    },

    props : {
    	id : {
    		type: Number,
    		default: null
    	},
    },

    data(){
    	return{
    		errors:[],
    		isLoading : false,
    		rating: null,
    		isErrorRating: false,
    	}
    },

    methods:{

    	clearError(label){
    		if (label === '') label = 'review';
            var index = this.errors.indexOf(label.toLowerCase());
            if (index > -1) this.errors.splice(index, 1);
        },
    	rated(r){
    		this.rating = r;
    		this.isErrorRating = false;
    		this.clearError('rating');
    	},
    	reset(){
    		this.rating = null;
    		for (let k in this.$children) {

                var child = this.$children[k];
                var ref = child.$vnode.data.ref;

                if (ref === 'rating') child.ratingMuated = 0;
                else child.input = '';
            }
    	},
    	post(){
    		
    		var formData = new FormData();

            const toSend = ['rating', 'title', 'review']
    		
    		for (let k in this.$children) {

                var child = this.$children[k];
                var ref = child.$vnode.data.ref;

                if (ref === 'rating' && child.ratingMutated === 0 && this.errors.indexOf('rating') === -1){
                	this.errors.push('rating');
                	this.isErrorRating = true;
                }
                if (ref !== 'rating' && child.input === ''){
                	child.setError('REQUIRED');
                	if (this.errors.indexOf(ref) === -1) this.errors.push(ref);
                }

                if (child.hasOwnProperty('errorMutable') && child.errorMutable.is && this.errors.indexOf(ref) === -1){
                    this.errors.push(ref);
                }

                var append = (ref === 'rating') ? 'ratingMutated' : 'input';
                
                if (toSend.indexOf(ref) > -1) formData.append(ref, child[append]);

            }

            this.isLoading = true;
                
            axios.post('/rest/review/' + this.id, formData).then((response) => {

                    this.isLoading = false;
                    this.$emit('posted', response.data.review);
                  	this.reset();
                
            }, (error) => {
                    
                    this.isLoading = false;

                    console.log(error.response);

                    this.reset();

                    if (error.response.status === 403 || error.response.status === 404 || error.response.status === 500 || error.response.status === 405){
                    	this.setError(error);
                    	return;
                    }

                    var errors = error.response.data.errors;
                                        
                    for (var k in errors) {
                        this.$refs[k].setError(errors[k][0]);
                    }
            });
    	}
    }

}
</script>
-->