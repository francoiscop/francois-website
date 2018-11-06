<template>
  <div>

    <b-loading :is-full-page="true" :active.sync="pageLoading" :canCancel="true"></b-loading>

    <vs-review-input class="m-b-20 m-t-20" />

    <div class="reviews-max">
      <i class="material-icons">mode_comment</i>
      <span>{{ max }} review{{ (max > 1) ? 's' : '' }}</span>
    </div>

    <review v-for="(review, index) in reviews"
        :review="review"
        :index="index"
        :key="review.id"
        @deleted="deleted(index)"
    />

    <error :error="error" />

    <!--
    <vs-button-more
        v-if="max > datas.length"
        ref="more"
        @more="load"
    ></vs-button-more>
    -->

  </div>
</template>

<style>
.reviews-max{

  margin-bottom: 15px;
  padding:5px 0;
  border-bottom: 1px solid hsl(0, 0%, 82%);

}
</style>

<script>
require('../../../sass/form.scss')

import {mixError} from './mixins/mixError.js'

import review from './review.vue'

import reviewInput from './reviewinput.vue'

import scroll from '../../mixins/scroll.js'

export default {
      
    mixins : [mixError, scroll],

    components: {
        review:review,
        'vs-review-input': reviewInput
    },

    data() {
        return{
            pageLoading : true,
        }
    },

    computed: {

        reviews(){
            return this.$store.state.reviews.items
        },

        max(){
            return this.$store.state.reviews.max
        }
    },

    methods : {

        fetch(){

            this.pageLoading = true

            return this.$store.dispatch('reviews/fetchItems').then(() => { 
                
                this.pageLoading = false

                if (this.$store.state.reviews.page === 1){
                    
                    document.body.scrollTop = 0
                    
                    document.documentElement.scrollTop = 0
                }

            })
        
        },

        scroll(){

            //Load new page only if feeds is not empty!!:
            if (this.$store.state.reviews.items.length === 0) return;

            if (this.$store.state.reviews.items.length - this.$store.state.reviews.posted >= this.max) return;
                
            this.fetch()
        },

        deleted (index) {
        
            this.$store.dispatch('reviews/deleteItem', index)
        }
    },

    created () {
        
        this.fetch()
    }
}
</script>