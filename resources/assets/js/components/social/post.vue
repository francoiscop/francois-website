<template>
   <div>
      <!-- TESTING 
      <div class="notification is-warning" style="padding:4px">FEED ID : {{ object.id }}</div>
      <div class="notification is-warning" style="padding:4px">FEED TYPE : {{ object.type }}</div>
      <div class="notification is-info" style="padding:4px">POST ID: {{ object.objectId }}</div>
      <div class="notification is-success" style="padding:4px">FEED JSON : {{ object }}</div>
      END TESTING -->
      <div v-html="object.object.body"></div>
      <div v-if="object.object.image.length > 0" class="post-image">
         <div class="flex flex-warp" style="justify-content:center;">
            <div v-for="(src, index) in object.object.image" :src="src">
               <img :src="src" style="height: 200px;">
            </div>
         </div>
      </div>
      <vs-buttons-control v-if="object.type === 'post'"
         :buttons="[{like : {icon:'favorite_border',iconToggle: 'favorite'}}, 'retweet', 'comment', 'deleteButton']"
         :object="object.object"
         type="comments"
         ref="buttons"
         @toggle="toggle($event)"
         @replies="loadReplies($event)"
      ></vs-buttons-control>

      <vs-comments v-if="isLoadComment" v-show="toggle.comment"
         :init="{type: 'comments', parentId: object.object.id, parentClass: 'post', isInput: true, placeholder: 'comment on this post'}"
         :show-header="false"
         :on-load="toggle.comment"
         ref="comments"
         is-parent
         @update="updateMax($event)"
         @toggle="toggled($event)"
      ></vs-comments>

   </div>
</template>

<style>
.post-image img{
  height: 200px;
  margin:1px;
}
</style>

<script>
//import {mixError} from './mixins/mixError.js';

    export default {
        //mixins : [mixError],
        props : {

            //from mixPROPS:
            /*
            init : {
              type : Object,
              default(){
                return {}
              }
            },
            */
            //



            object : {
              type: Object,
              default: {}
            }
        },
        data(){
          return {
              toggle : {
                comment : false
              },
              isLoadComment : false,
              isCommentLoaded : false
          }
        },

        watch : {

            isCommentLoaded(val){
              console.log('COMMENT LOADED !!!', val);
              //For POST show comment ::::
              //->need to disable loading state of button
              this.$refs.buttons.$refs.comment[0].isLoading = false;
            }
        },
        
        methods : {

          //from Post
          toggled(data){
            console.log('RECEIVED TOGGLE ---- FEED.VUE ---  ::', data);
              if (data.isLoad) this.isLoadComment = true;
              this.toggle.comment = data.val;
          },
          //from Post
          updateMax(max){
              console.log('UPDATE MAX', max);
              this.$refs.buttons.$refs.comment[0].counterMutated = max;
          },
        }

    }
</script>