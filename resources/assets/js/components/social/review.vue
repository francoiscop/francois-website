<template>
  <div class="box-comment-single">
            <article class="media">

                <figure class="media-left">
                    <p class="image is-48x48">
                        <a :href="review.user.link">
                            <div class="aspect__ratio--square minx-w-100 maxx-w-200 center-auto" style="background:transparent">
                                <div :style="'background-size:cover;background-image: url(' + review.user.avatar + ')'" class="has-background-primary is-round">
                                </div>
                            </div>
                        </a>
                    </p>
                </figure>

                <div class="media-content">
                    <div class="content">
                        <strong>
                          <a :href="review.user.link" class="capitalize">
                          {{ review.user.username }}
                          </a>
                        </strong>
                        <br>
                        <small>{{ review.object.date }}</small>

                        <vs-object :object="feedClass._object" @deleted="deleted()" />

                    </div>
                </div>
            </article>
        </div>
</template>

<script>
import objectComponent from './object.vue'

import Feed from './classes/feedClass.js'

export default {

    components : {
        vsObject: objectComponent
    },

    props : {
        
        review : {
            type: Object,
            default(){
              return {}
            }
        }
    },

    data(){
      return{
        feedClass : null
      }
    },

    created(){

        const feed = {

            id : this.review.id,

            type : 'review',

            object : this.review.object
        }

        this.feedClass = new Feed(feed)
        
    },

    methods : {

        deleted(){
          this.$emit('deleted')
        }
    }
}
</script>