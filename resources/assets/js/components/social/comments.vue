<template>
  <div>

    <div class="comments-max">
      <i class="material-icons">mode_comment</i>
      <span v-if="!isLoading">{{ max }} comment{{ (max > 1) ? 's' : '' }}</span>
      <div v-else class="button is-loading is-minimal"></div>
    </div>

    <b-loading :is-full-page="false" :active.sync="isLoading"/>

    <error :error="error" />

    <vs-comment v-for="(object, index) in comments"
      :object="object"
      :index="index"
      :key="object.id"
      @deleted="deleted(index)"
      @toggle="toggled($event)"
    />

    <more
        v-if="max > comments.length"
        ref="more"
        @more="fetchComments"
    />

  </div>
</template>

<style>
.comments-max{

  margin-bottom: 15px;
  padding:5px 0;
  border-bottom: 1px solid hsl(0, 0%, 82%);

}
</style>

<script>

import error from './error.vue'
import more from './buttons/buttonMore.vue'
import {mixError} from './mixins/mixError'

//import {mapState, mapGetters, mapActions} from 'vuex'

export default {

  mixins: [mixError],

  components: {
    error: error,
    more: more
  },

  data(){

      return{

        isLoading : true
      
      } 
  },

  computed: {

    max(){

      return this.$store.state.comments.max

    },

    comments(){

      return this.$store.state.comments.items
    
    }


/*
    ...mapState('comments',{

      comments: 'items',
    }),
*/

  },

  methods : {

/*
    ...mapActions({
          fetchComments : 'comments/fetchItems'
    })
*/
        fetchComments(){

            return this.$store.dispatch('comments/fetchItems').then(() => {

              if (typeof this.$refs.more !== 'undefined') this.$refs.more.isLoading = false
              
            })
        
        },

        deleted (index) {
        
            this.$store.dispatch('comments/deleteItem', index)
        }

  },

  created () {

      this.fetchComments().then(() => {

          this.isLoading = false;
      
      });
      
  }
}
</script>