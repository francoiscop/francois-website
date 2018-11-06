<template>
      <div class="wrapper-feed m-b-10 p-5 elevation-10xxxx">

          <aggregates v-if="feed.aggregates"
              :aggregates="feed.aggregates"
              :type="feed.type"
          />

          <article class="media">
                
                <figure class="media-left" v-if="feed.user">
                    <p class="image is-48x48">
                        <a :href="feed.user.link" class="a--dark">
                            <div class="aspect__ratio--square minx-w-100 maxx-w-200 center-auto" style="background:transparent">
                                <div :style="'background-size:cover;background-image: url(' + feed.user.avatar + ')'" class="has-background-primary is-round">
                                    <div class="absolute center-absolute h--black u anton s-14" v-if="feed.user.avatar === null">{{ feed.user.gender }}</div>
                                </div>
                            </div>
                        </a>
                    </p>
                </figure>

                <!--<div class="media-content" :class="(feed.image !== null) ? 'min-height-100' : ''">-->
                <div class="media-content">

                    <div class="content">
                      <article class="media" style="padding: 0;"> 
                        <div class="media-content">

                            <div v-html="feedClass.header"></div>
                            <small v-text="feed.date" v-if="feed.user"></small>

                        </div>
                        <figure class="media-left" style="margin-top: 0;" v-if="image.src !== null">
                            <p class="image is-64x64">
                              <a :href="feed.child.link">
                               <img :src="image.src" :class="{'rounded' : image.rounded}">
                             </a>
                           </p>
                        </figure>
                      </article>                       
                    </div>

                </div>

            </article>

            <article class="media">

                 <figure class="media-left is-hidden-mobile" v-if="feed.user">
                    <p class="image is-48x48"></p>
                </figure>

                <!--<div class="media-content" :class="(feed.image !== null) ? 'min-height-100' : ''">-->
                <div class="media-content">

                    <vs-object v-if="feedClass.isValid" :object="feedClass._object" @deleted="deleted()" />

                    <!--
                    <vs-rating v-else-if="feed.feed_type === 'rating'"
                        :rating="feed.object.rating"
                        :size="1"
                        static
                    ></vs-rating>


                    <vs-comment v-else-if="feed.type === 'comment'"
                        :object="feed"
                        from-feed
                    ></vs-comment>
                    -->

                    <div v-else>

                        ELSE !!! -> to check ?

                        <!--
                        <div style="border:8px solid red;padding:10px;" v-if="content !== null" v-html="content"></div>

                        <div style="border:8px solid red;padding:10px;" v-if="feed.object && feed.object.image !== null">
                            
                            <div v-for="image in feed.object.image" style="border:2px solid orange;">
                              <img :src="image">
                            </div>
                        </div>

                        <vs-buttons v-if="buttons !== null"
                            :buttons="buttons"
                            :object="feed.object"
                            :type="feed.type"
                            ref="buttons"
                            @toggle="toggled($event)"
                            @replies="loadReplies($event)"
                        />

                        <vs-comment-input v-if="buttons !== null && buttons.indexOf('comment') > -1"
                            v-show="toggle.input"
                            :parent-class="feed.type"
                            :parent-id="feed.object.id"
                            :placeholder="'Reply to this comment'"
                            @posted="append($event)"
                            ref="input"
                        />
                        -->

                    </div>

                </div>

            </article>


                    

                

          <div v-if="feed.aggregates && feed.aggregates.comment" style="margin-top:15px;">
                <hr>
                <vs-comment v-for="(comment, index) in feed.aggregates.comment"
                    :object="comment"
                    :index="index"
                    :key="comment.id"
                    init="init"
                    @toggle="toggled($event)"
                ></vs-comment>
          </div>

      </div>
</template>

<style scoped>

.media + .media {
    border-top: 1px solid rgba(219, 219, 219, 0.5);
    margin-top: 0rem;
    padding-top: 0rem;
}

.wrapper-feed{
    border: 1px solid hsl(0, 0%, 82%);
}   
</style>

<script>
import objectComponent from './object.vue'

import aggregates from './aggregates.vue'

import Feed from './classes/feedClass.js'

export default {

    components : {

        aggregates : aggregates,
        
        vsObject: objectComponent
    },

    props : {
  
        feed : {
          type: Object,
          default: {}
        }
    },

    created(){
        
        this.feedClass = new Feed(this.feed)
    },

    data(){

        return{

            feedClass : null,

            image : {
                src : null,
                rounded : false,
                size : 80
            }
        }
    },

    methods : {

        deleted(){
          this.$emit('deleted')
        }
    }
}

</script>