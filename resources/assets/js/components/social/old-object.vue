<template>
        <div class="feed-object">

            <div v-if="title" class="feed-object-title" :class="{'feed-object-title-center' : isTitleCenter}" v-html="title">
            </div>

             <vs-rating v-if="object.rating && object.rating.rating > 0"
                  :rating="object.rating.rating"
                  :size="1"
                  static
             ></vs-rating>

             <div>
                <div v-if="image.src" :class="(isFloatRight) ? 'feed-object-image' : 'feed-object-image-center'">
                    <a :href="image.link">
                      <img :src="image.src" :style="'height : ' + image.height + 'px'">
                    </a>
                </div>
                <div class="feed-object-body" v-if="body" v-html="body"></div>
            </div>

            <div v-if="object.image && object.image.length > 0" class="flex flex-warp feed-post-image">
                    <div v-for="(src, index) in object.image" :src="src">
                        <img :src="src" style="heightxxxxx: 200px;">
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

<!--
            <vs-buttons v-if="buttons !== null"
                :buttons="buttons"
                :object="object"
                :type="type"
                ref="buttons"
                @toggle="toggled($event)"
                @replies="loadReplies($event)"
            ></vs-buttons>
-->

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

            
        
        </div>
</template>


<style>
.feed-object{
  border:0px solid pink;
}
.feed-object-image {
  border:0px solid blue;
  float: right;
  position: relative;
  margin-top: -75px;
}
.feed-object-image-center,
.feed-object-title-center {
  text-align: center;
}
.feed-post-image {
  justify-content:center;
}
.feed-object-body {
  border:0px solid red;
  min-heightx: 50px;
}
.feed-object-image img{
  height:150px;
}
.feed-object-title{
  text-transform: capitalize;
}
.feed-object .vs-comment-input{
  width: 100%;
}
</style>

<script>
import Comments from '../../store/classes/comments'

import more from './buttons/buttonMore.vue'

export default {

        components: {

          more:more
        },

        props : {
            object : {
              type: Object,
              default: {}
            },

            parentId : {},

            parentClass : {
              type: String,
              default: null
            },

            image : {
              type: Object,
              default(){
                return {
                  src: null,
                  height: 100,
                  rounded: false,
                  link: null
                }
              }
            }
        },

        created(){

            this.setButtons();
        },

        mounted(){
            //console.warn('OBJECT FROM OBJECT.VUE', this.object);
            //console.warn('buttons from object.vue: ', this.buttons);
            //console.error('PARENT CLASS :', this.parentClass)
            //console.error('PARENT ID :', this.parentId)
        },

        computed:{

          placeholder(){

              var verb = (this.parentClass === 'comment') ? 'Reply to ' : 'Comment on :'

              return verb + ' this ' + this.parentClass

          },








          body(){

              if (this.object.body) return this.object.body;

              if (this.object.comment) return this.object.comment;

              return null;
          },

          title(){

              if (!this.object.title) return null;

              if (this.object.type === 'video') return ' <strong class="capitalize" style="font-size:1.2em;"><a href="' + this.object.link + '">' + this.object.title + '</a></strong>';

              return '<strong class="capitalize" style="font-size:1.2em;">' + this.object.title + '</strong>';
          },

          isFloatRight(){

              if (this.object.body && this.object.body !== '') return true;

              if (this.object.comment && this.object.comment !== '') return true;

              return false;

          },

          isTitleCenter(){

              if (this.object.type === 'video') return true;

              return false;
          },

          placeholderAdj(){

              return (this.object.type === 'comment') ? 'reply to' : 'comment on';
          },

          init(){
            return{

                isInput : true,
                parentClass: this.$parent.object.type,
                parentId: this.object.id,
                placeholder: this.placeholderAdj + ' this ' + this.$parent.object.type
            }
          },



        },

        data(){
          return {
              buttons: [],
              comments: [],
              isCommentsLoaded: false,
              page : 1,


              /* from comments */
              toggle : {
                reply : false,
                comment : false,





                 //input : false,
                 //replies : false,
                 //for post:
                 //comment : false
              },
              //replies : [],
              //page : 1,
              /* end from comments */

              isStaticInput : (this.object.type === 'comment') ? false : true,
          }
        },
      
        methods : {

          setButtons(){

              switch(this.parentClass){
                  
                  case 'comment':
                  this.buttons = ['like', 'dislike', 'replies', 'reply', 'delete']
                  break;

                  case 'post':
                  this.buttons = [{like:{icon: 'favorite_border',toggle:{status: false,icon: 'favorite'}}}, 'retweet', 'comment', 'delete']
                  break;

                  case 'review':
                  this.buttons = ['like', 'dislike', 'comment', 'delete']
                  break;

                  case 'user':
                  case 'video':
                  this.buttons = [{like:{icon: 'favorite_border',toggle:{status: false,icon: 'favorite'}}}, 'comment']
                  break;
              }
          },

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

              console.warn('obj.button.name: ', obj.button.name)
              console.warn('name: ', name)
              console.warn('toggle :', obj.toggle)
              console.warn('THIS TOGGLE :', this.toggle)

          },

          loadCommentsxxxxxxxxx(){

              const url = '/rest/comment/' + this.parentClass + '/' + this.parentId

              return axios.get(url + '?page=' + this.page).then((response) => {

                  this.isCommentsLoaded = true;

                  this.comments = [...this.comments, ...response.data.comments]
              
              }, (error)  =>  {
                
                  //dispatch('error/setError', error, {root: true})  
           
              });

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

              console.warn('******** button replies toggle:', button.toggle)

              console.warn('commentPosted :', comment)
          },











            /* from Comments */

            toggled(data){
                console.warn('Object.vue RECEIVED TOGGLE -COMMENT- ::', data);
                if (this.toggle.hasOwnProperty(data.ref)) this.toggle[data.ref] = data.val;
                if (data.ref === 'comment') this.$emit('toggle', data);
            },

            loadReplies(data){
                console.warn('Object.vue LOAD REPLIES -COMMENT- ::', data);
                this.toggle.replies = true;
                this.replies = data.datas;
            },

            loadMoreReplies(){

                this.page ++;
                this.$refs.buttons.bClass.getReplyTrigger(this.page).then((response) => {
                      this.replies = [...this.replies, ...response];
                      this.$refs.more.isLoading = false;
                });

            },

            append(comment){

                var ref = (this.type === 'comment') ? 'getReply' : 'comment';

                //this.$refs.buttons.replies ++;

                this.$refs.buttons.$refs[ref][0].counterMutated ++;
                this.$refs.buttons.$refs[ref][0].displayMutated = true;

                /*
                if (!this.$refs.buttons.$refs.getReply[0].isToggle.getReply) {
                  this.$refs.buttons.$refs.getReply[0].textMutated = this.$refs.buttons.$refs.getReply[0].textToggle;
                  this.$refs.buttons.$refs.getReply[0].isToggle.getReply = true;
                  this.toggle.replies = true;
                }
                */
                if (!this.$refs.buttons.$refs[ref][0].isToggle[ref]) {
                  if (ref === 'getReply') {
                    this.$refs.buttons.$refs[ref][0].textMutated = this.$refs.buttons.$refs[ref][0].textToggle;
                  }
                  this.$refs.buttons.$refs[ref][0].isToggle[ref] = true;
                  this.toggle.replies = true;
                }

                this.replies.unshift(comment);
                this.$refs.input.reset();
            }

            /* end from comments */
           
        }
    }
</script>

<!--
<template>
        <div class="feed-object">

            <div v-if="title" class="feed-object-title" :class="{'feed-object-title-center' : isTitleCenter}" v-html="title">
            </div>

             <vs-rating v-if="object.rating && object.rating.rating > 0"
                  :rating="object.rating.rating"
                  :size="1"
                  static
             ></vs-rating>

             <div>
                <div v-if="image.src" :class="(isFloatRight) ? 'feed-object-image' : 'feed-object-image-center'">
                    <a :href="image.link">
                      <img :src="image.src" :style="'height : ' + image.height + 'px'">
                    </a>
                </div>
                <div class="feed-object-body" v-if="body" v-html="body"></div>
            </div>

            <div v-if="object.image && object.image.length > 0" class="flex flex-warp feed-post-image">
                    <div v-for="(src, index) in object.image" :src="src">
                        <img :src="src" style="heightxxxxx: 200px;">
                    </div>
            </div>

            <vs-comment-input v-show="this.isStaticInput || this.toggle.input" class="vs-comment-input"
                :parent-class="init.parentClass"
                :parent-id="init.parentId"
                :placeholder="init.placeholder"
                @posted="append($event, 'comment')"
                ref="input"
            ></vs-comment-input>

            <vs-buttons-control v-if="buttons !== null"
                :buttons="buttons"
                :object="object"
                :type="type"
                ref="buttons"
                @toggle="toggled($event)"
                @replies="loadReplies($event)"
            ></vs-buttons-control>

            <div v-show="toggle.replies">
                  <vs-comment v-for="(reply, index) in replies"
                      :object="reply"
                      :index="index"
                      :key="reply.id"
                      :parent-class="'comment'"
                      :buttons="['like', 'dislike', 'reply', 'getReply', 'deleteButton']"
                      @delcomment="deleteReply($event)"
                  ></vs-comment>
                  <vs-button-more
                      v-if="object.stats && object.stats.replies > replies.length"
                      ref="more"
                      @more="loadMoreReplies"
                  ></vs-button-more>
            </div>

            
        
        </div>
</template>


<style>
.feed-object{
  border:0px solid pink;
}
.feed-object-image {
  border:0px solid blue;
  float: right;
  position: relative;
  margin-top: -75px;
}
.feed-object-image-center,
.feed-object-title-center {
  text-align: center;
}
.feed-post-image {
  justify-content:center;
}
.feed-object-body {
  border:0px solid red;
  min-heightx: 50px;
}
.feed-object-image img{
  height:150px;
}
.feed-object-title{
  text-transform: capitalize;
}
.feed-object .vs-comment-input{
  width: 100%;
}
</style>

<script>
import {mixError} from './mixins/mixError.js';

    export default {
        mixins : [mixError],
        props : {
            object : {
              type: Object,
              default: {}
            },

            type : {
              type: String,
              default: null
            },

            image : {
              type: Object,
              default(){
                return {
                  src: null,
                  height: 100,
                  rounded: false,
                  link: null
                }
              }
            }
        },

        created(){

            if (!this.object.type){

                this.object.type = this.$parent.object.type;
                console.log('type', this.object.type);

            }

            if (this.object instanceof Array){

              console.error('ARRAY!!!');
              console.error('OBJECT', this.object);
            }
          /*
          console.log('*** OBJECT CREATED *****');
          console.log(this.type);
          */
        },

        mounted(){
            console.warn('INIT', this.init);
        },

        computed:{

          body(){

              if (this.object.body) return this.object.body;

              if (this.object.comment) return this.object.comment;

              return null;
          },

          title(){

              if (!this.object.title) return null;

              if (this.object.type === 'video') return ' <strong class="capitalize" style="font-size:1.2em;"><a href="' + this.object.link + '">' + this.object.title + '</a></strong>';

              return '<strong class="capitalize" style="font-size:1.2em;">' + this.object.title + '</strong>';
          },

          isFloatRight(){

              if (this.object.body && this.object.body !== '') return true;

              if (this.object.comment && this.object.comment !== '') return true;

              return false;

          },

          isTitleCenter(){

              if (this.object.type === 'video') return true;

              return false;
          },

          placeholderAdj(){

              return (this.object.type === 'comment') ? 'reply to' : 'comment on';
          },

          init(){
            return{

                isInput : true,
                parentClass: this.$parent.object.type,
                parentId: this.object.id,
                placeholder: this.placeholderAdj + ' this ' + this.$parent.object.type
            }
          },

          buttons(){



            const type = this.$parent.object.type;

            if (type === 'post') return [
            {
                like : {
                  icon: 'favorite_border',
                  iconToggle: 'favorite'
                }
            },
            'retweet', 'comment', 'deleteButton'
            ];

            if (type === 'comment' || this.type === 'comment') return ['like', 'dislike', 'reply', 'getReply', 'deleteButton'];

            if (type === 'review') return ['like', 'dislike', 'comment', 'deleteButton'];

            if (type === 'user' || type === 'video') return [
              {
                like : {
                  icon: 'favorite_border',
                  iconToggle: 'favorite'
                }
            },
            'comment'
            ];

            return null;
        },



        },

        data(){
          return {
              /* from comments */
              toggle : {
                 input : false,
                 replies : false,
                 //for post:
                 comment : false
              },
              replies : [],
              page : 1,
              /* end from comments */

              isStaticInput : (this.object.type === 'comment') ? false : true,
          }
        },
      
        methods : {

            /* from Comments */

            toggled(data){
                console.warn('Object.vue RECEIVED TOGGLE -COMMENT- ::', data);
                if (this.toggle.hasOwnProperty(data.ref)) this.toggle[data.ref] = data.val;
                if (data.ref === 'comment') this.$emit('toggle', data);
            },

            loadReplies(data){
                console.warn('Object.vue LOAD REPLIES -COMMENT- ::', data);
                this.toggle.replies = true;
                this.replies = data.datas;
            },

            loadMoreReplies(){

                this.page ++;
                this.$refs.buttons.bClass.getReplyTrigger(this.page).then((response) => {
                      this.replies = [...this.replies, ...response];
                      this.$refs.more.isLoading = false;
                });

            },

            append(comment){

                var ref = (this.type === 'comment') ? 'getReply' : 'comment';

                //this.$refs.buttons.replies ++;

                this.$refs.buttons.$refs[ref][0].counterMutated ++;
                this.$refs.buttons.$refs[ref][0].displayMutated = true;

                /*
                if (!this.$refs.buttons.$refs.getReply[0].isToggle.getReply) {
                  this.$refs.buttons.$refs.getReply[0].textMutated = this.$refs.buttons.$refs.getReply[0].textToggle;
                  this.$refs.buttons.$refs.getReply[0].isToggle.getReply = true;
                  this.toggle.replies = true;
                }
                */
                if (!this.$refs.buttons.$refs[ref][0].isToggle[ref]) {
                  if (ref === 'getReply') {
                    this.$refs.buttons.$refs[ref][0].textMutated = this.$refs.buttons.$refs[ref][0].textToggle;
                  }
                  this.$refs.buttons.$refs[ref][0].isToggle[ref] = true;
                  this.toggle.replies = true;
                }

                this.replies.unshift(comment);
                this.$refs.input.reset();
            }

            /* end from comments */
           
        }
    }
</script>
-->