<template>
  <div class="wrapper-feeds">

    <error :error="error" />

    <b-loading :is-full-page="true" :active.sync="isLoading"></b-loading>

    <vs-feed v-for="(feed, index) in feeds" v-if="feed.object !== null"
        :feed="feed"
        :index="index"
        :key="feed.id"
        @deleted="deleted(index)"
    />

  </div>
</template>

<style>
.wrapper-feeds{
   max-width: 750px;
}
</style>

<script>
import error from './error.vue'
import {mixError} from './mixins/mixError'
import scroll from '../../mixins/scroll.js'

export default {

  mixins: [mixError, scroll],

  components: {
    error: error,
  },

  data(){

      return{

        isLoading : true
      
      } 
  },

  computed: {

    feeds(){

      return this.$store.state.feeds.items
    
    }

  },

  methods : {

        fetch(){

            this.isLoading = true

            return this.$store.dispatch('feeds/fetchItems').then(() => {

                this.isLoading = false

                if (this.$store.state.feeds.page === 2){
                    setTimeout(() => {
                        document.body.scrollTop = 0
                        document.documentElement.scrollTop = 0
                    }, 10)
                }

            })
        
        },

        deleted (index) {
        
            this.$store.dispatch('feeds/deleteItem', index)
        },

        scroll(){

            //Load new page only if feeds is not empty!!:
            if (this.$store.state.feeds.items.length === 0 || this.$store.state.feeds.isEnd) return;
                
            setTimeout(() => {
                this.fetch()
            }, 10)
        }

  },

  created () {

      this.fetch()
      
  },

}
</script>