<template>
        <div class="box-comment-single" style="borderxxx:6px solid green;marginxxxx:22px 1px;">
            <article class="media">
                <figure class="media-left">
                    <p class="image is-48x48">
                        <a :href="comment.link">
                        <img :src="comment.avatar" class="rounded" />
                        </a>
                    </p>
                </figure>
                <div class="media-content">
                    <div class="content">
                        <strong>
                          <a :href="comment.link" class="capitalize" style="font-size: 1.1rem;">
                          {{ comment.username }}
                          </a>
                        </strong>
                        <br>
                        <small>{{ object.date }}</small>

                      <br>
                      {{ comment.comment.comment }}

                    <vs-buttons-control
                        :buttons="['like', 'dislike', 'reply', 'getReply', 'deleteButton']"
                        :object="object"
                        type="comments"
                        ref="buttons"
                        @toggle="toggled($event)"
                        @replies="loadReplies($event)"
                    ></vs-buttons-control>
                        
                    </div>

                    <div v-show="toggle.replies" style="border:6px solid blue;">
                        <vs-comment v-for="(reply, index) in replies"
                          :object="reply"
                          :index="index"
                          :key="reply.id"
                          :parent-class="'comment'"
                          :buttons="buttons"
                          @delcomment="deleteReply($event)"
                        ></vs-comment>
                        <vs-button-more
                            v-if="object.stats.numReplies > replies.length"
                            ref="more"
                            @more="loadMoreReplies"
                        ></vs-button-more>
                    </div>

                </div>
            </article>

            <vs-comment-input
                v-show="toggle.input"
                :parent-class="'comment'"
                :parent-id="object.id"
                :placeholder="'Reply to this comment'"
                @posted="append($event)"
                ref="input"
            ></vs-comment-input>
        </div>
</template>

<script>
import {mixError} from './mixins/mixError.js';

    export default {
        mixins : [mixError],
        props : {
            comment : {
              type: Object,
              default: {}
            }
        },
        data(){
          return {
              toggle : {
                 input : false,
                 replies : false,
                 comment : false
              },
              replies : [],
              page : 1
          }
        },
      
        methods : {
            toggled(data){
              console.log('RECEIVED TOGGLE -COMMENT- ::', data);
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
            }
        }
    }
</script>