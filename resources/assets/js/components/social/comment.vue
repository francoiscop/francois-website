<template>
        <div class="box-comment-single">
            <article class="media">

                <figure class="media-left">
                    <p class="image is-48x48">
                        <a :href="object.user.link" class="a--dark">
                            <div class="aspect__ratio--square minx-w-100 maxx-w-200 center-auto" style="background:transparent">
                                <div :style="'background-size:cover;background-image: url(' + object.user.avatar + ')'" class="has-background-primary is-round">
                                  <div class="absolute center-absolute h--black u anton s-14" v-if="object.user.avatar === null">{{ object.user.gender }}</div>
                                </div>
                            </div>
                        </a>
                    </p>
                </figure>

                <div class="media-content">
                    <div class="content">
                        <strong>
                          <a :href="object.user.link" class="c">
                          {{ object.user.username }}
                          </a>
                        </strong>
                        <br>
                        <small>{{ object.object.date }}</small>

                        <vs-object :object="feedClass._object" @deleted="deleted()" />

                    </div>
                </div>
            </article>
        </div>
</template>


<style scoped>
.box-comment-single {
  font-sizexxxxx:0.9em;
}
.content{
  border-left: 1px solid rgb(209, 209, 209);
  padding-left: 5px;
}
</style>

<script>
import objectComponent from './object.vue'

import Feed from './classes/feedClass.js'

    export default {

        components: {
          vsObject: objectComponent
        },
        
        props : {
            object : {}
        },

        data(){
          return {
              feedClass : null,
              //toggleInput : false,
              //toggleReplies : false,
              toggle : {
                 input : false,
                 replies : false,
                 //for post:
                 comment : false
              },
              replies : [],
              page : 1
          }
        },

        created(){

            const feed = {

                id : this.object.id,

                type : 'comment',

                object : this.object.object
            }

            this.feedClass = new Feed(feed)
        
        },
      
        methods : {
            toggled(data){

                //console.log('RECEIVED TOGGLE -COMMENT- ::', data);
                
                if (this.toggle.hasOwnProperty(data.ref)) this.toggle[data.ref] = data.val;
                
                if (data.ref === 'comment') this.$emit('toggle', data);
            },

            loadReplies(data){
                
                this.toggle.replies = true;
                
                this.replies = data;
            },

            loadMoreReplies(){

                this.page ++;
                
                this.$refs.buttons.bClass.getReplyTrigger(this.page).then((response) => {
                      
                      this.replies = [...this.replies, ...response];
                      
                      this.$refs.more.isLoading = false;
                });

            },

            append(comment){
                
                this.$refs.buttons.replies ++;
                
                if (!this.$refs.buttons.$refs.getReply[0].isToggle.getReply) {
                  
                  this.$refs.buttons.$refs.getReply[0].textMutated = this.$refs.buttons.$refs.getReply[0].textToggle;
                  
                  this.$refs.buttons.$refs.getReply[0].isToggle.getReply = true;
                  
                  this.toggle.replies = true;
                }
                
                this.replies.unshift(comment);
                
                this.$refs.input.reset();
            },

            deleted(){
              
              this.$emit('deleted')
            
            }
        }
    }
</script>