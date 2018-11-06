<template>
        <div class="feed-object">

            <div v-if="object.title !== null" class="c anton" :class="{'center-text' : object.title.center}" v-html="object.title.title">
            </div>

            <div class="center-text">
                <rating v-if="object.rating && object.rating > 0"
                    :rating="object.rating"
                    :size="1"
                    static
                />
            </div>

             <div class="flex flex-center-x" v-if="object.imageBackground !== null">
                <a :href="object.imageBackground.link" class="a--dark">
                <div :class="object.imageBackground.class">
                    <div :style="'background-size:cover;background-image: url(' + object.imageBackground.src + ')'" class="has-background-primary">
                       <div v-html="object.imageBackgroundText"></div>
                    </div>
                </div>
                </a>
             </div>

             <div v-if="object.text !== null" v-html="object.text" style="white-space: pre-line;"></div>

             <div class="flex flex-warp flex-center-x" v-if="object.images.length > 0">
                  <div v-for="(image, index) in object.images" class="m-1">
                        <a :href="image.link" v-if="image.link">
                            <img :src="image.src"/>
                        </a>
                        <img v-else :src="image.src"/>
                  </div>
             </div>

             <vs-comment-input v-show="this.isStaticInput || this.toggle.reply" class="vs-comment-input"
                :parent-class="object.parentClass"
                :parent-id="object.parentId"
                :placeholder="placeholder"
                local
                @posted="commentPosted($event)"
                ref="input"
            />

             <vs-buttons v-if="typeof object.buttons !== 'undefined' && object.buttons.length > 0"
                ref="buttons"
                :items="object.buttons"
                :parent-id="object.parentId"
                :parent-class="object.parentClass"
                :counts="object.statistic"
                @click="click($event)"
                @deleted="deleted()"
              ></vs-buttons>


              <div v-show="toggle.comment">

                  <vs-comment v-for="(comment, index) in comments"
                      :object="comment"
                      :index="index"
                      :key="comment.id"
                      :parent-class="'comment'"
                      :buttons="['like', 'dislike', 'reply', 'getReply', 'deleteButton']"
                      @delcomment="deleteReply($event)"
                 ></vs-comment>
              
                  <more
                      v-if="(object.stats && object.stats.replies > comments.length) || (object.statistics && object.statistics.comments > comments.length)"
                      ref="more"
                      is-small
                      @more="loadComments"
                  />

            </div>

             <!--
             <div>
                <div v-if="image.src" :class="(isFloatRight) ? 'feed-object-image' : 'feed-object-image-center'">
                    <a :href="image.link">
                      <img :src="image.src" :style="'height : ' + image.height + 'px'">
                    </a>
                </div>
                <div class="feed-object-body" v-if="body" v-html="body"></div>
            </div>
            -->

            <!--
            <div v-if="imagesComputed" class="flex flex-warp feed-post-image">
                    <div v-for="(image, index) in imagesComputed">
                        <a :href="image.link"><img :src="image.src" /></a>
                    </div>
            </div>

            <vs-comment-input v-show="this.isStaticInput || this.toggle.reply" class="vs-comment-input"
                :parent-class="parentClass"
                :parent-id="parentId"
                :placeholder="placeholder"
                local
                @posted="commentPosted($event)"
                ref="input"
            />

             <vs-buttons v-if="buttons !== null"
                ref="buttons"
                :items="buttons"
                :parent-id="parentId"
                :parent-class="parentClass"
                :counts="object.stats || object.statistics"
                @click="click($event)"
              ></vs-buttons>

            <div v-show="toggle.comment">

              
                  <vs-comment v-for="(comment, index) in comments"
                      :object="comment"
                      :index="index"
                      :key="comment.id"
                      :parent-class="'comment'"
                      :buttons="['like', 'dislike', 'reply', 'getReply', 'deleteButton']"
                      @delcomment="deleteReply($event)"
                 ></vs-comment>
              
                 
                  <more
                      v-if="(object.stats && object.stats.replies > comments.length) || (object.statistics && object.statistics.comments > comments.length)"
                      ref="more"
                      is-small
                      @more="loadComments"
                  />

            </div>

          -->

            
        
        </div>
</template>


<style scoped>
.feed-object{
  border: 0px solid pink;
}

.feed-object img{
  /*
  max-height: 300px;
  width: auto
  */
}
</style>

<script>
import Comments from '../../store/classes/comments'

import more from './buttons/buttonMore.vue'

import rating from './rating.vue'

export default {

        components: {

          more: more,

          rating: rating
        
        },

        props : {

            object : {
              type: Object,
              default: {}
            }
        },

        created(){

            this.parentId = this.object.parentId

            this.parentClass = this.object.parentClass

        },


        computed:{

          isStaticInput(){

            return (this.parentClass === 'comment') ? false : true

          },

          placeholder(){

              var verb = (this.parentClass === 'comment') ? 'Reply to ' : 'Comment on '

              var obj = (this.parentClass === 'user') ? 'profile' : this.parentClass

              return verb + ' this ' + obj

          }

        },

        data(){
          return {

              parentId : null,
              parentClass : null,

              comments: [],
              isCommentsLoaded: false,
              page : 1,

              toggle : {
                reply : false,
                comment : false,
              },
          }
        },
      
        methods : {

          click(obj){

              //{BUTTON, TOGGLE}

              let name = obj.button.name

              if (obj.button.name === 'replies') name = 'comment';

              this.toggle[name] = obj.toggle

              if (name === 'comment' && !this.isCommentsLoaded){

                this.loadComments().then(() => { obj.button.loading = false })

                return

              }

              obj.button.loading = false

          },

          loadComments(){

              let c = new Comments(this.parentId, this.parentClass)

              return c.fetch(this.page).then(response => {

                  this.page ++;

                  this.isCommentsLoaded = true;

                  this.comments = [...this.comments, ...response.data.comments]

                  if (typeof this.$refs.more !== 'undefined') this.$refs.more.isLoading = false

              }).catch(error => {

                  if (typeof this.$refs.more !== 'undefined') this.$refs.more.isLoading = false

              })

          },

          commentPosted(comment){

              if (this.isCommentsLoaded) this.comments.unshift(comment);

              /**** ERROR WITH COMMENT FEED : replies not defined ****/
              let button

              if (typeof this.$refs.buttons.$refs.replies !== 'undefined') button = this.$refs.buttons.$refs.replies[0];
              else if (typeof this.$refs.buttons.$refs.comment !== 'undefined') button = this.$refs.buttons.$refs.comment[0];
              else return;

              button.item.count ++

              if (!this.toggle.comment) button.click();
          },

          deleted(){

            this.$emit('deleted')
           
          }
        }
    }
</script>