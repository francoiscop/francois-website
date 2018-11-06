<template>
      <div class="box elevation-10">

          <vs-aggregates v-if="object.aggregates"
              :aggregates="object.aggregates"
              :type="object.type"
          ></vs-aggregates>


            <article class="media">
                <figure class="media-left" v-if="object.user">
                    <p class="image is-48x48">
                        <a :href="'\\profile\\' + object.user.username">
                        <img :src="object.user.avatar" class="rounded" />
                        </a>
                    </p>
                </figure>
                
                <div class="media-content" :class="(object.image !== null) ? 'min-height-100' : ''">
                    
                    <div class="content">
                      <article class="media" style="padding: 0;"> 
                        <div class="media-content">

                            <div v-html="header"></div>
                            <small v-text="object.date" v-if="object.user"></small>

                        </div>
                        <figure class="media-left" style="margin-top: 0;" v-if="image.src !== null">
                            <p class="image is-64x64">
                              <a :href="object.child.link">
                               <img :src="image.src" :class="{'rounded' : image.rounded}">
                             </a>
                           </p>
                        </figure>
                      </article>                       
                    </div>

                    <vs-object v-if="['post', 'comment', 'review', 'user', 'video', 'upload'].indexOf(object.type) > -1"
                          :object="object.object"
                          :type="object.type"
                          :image="imageObject"
                    ></vs-object>




<!--
                    <vs-rating v-if="object.feed_type === 'rating'"
                        :rating="object.object.rating"
                        :size="1"
                        static
                    ></vs-rating>


                    <vs-comment v-else-if="object.type === 'comment'"
                        :object="object"
                        from-feed
                    ></vs-comment>

                    <vs-post v-else-if="object.type === 'post'"
                        :object="object"
                        from-feed
                    ></vs-post>
-->

                    <div v-else>

                    <div style="border:8px solid red;padding:10px;" v-if="content !== null" v-html="content"></div>

                    <div style="border:8px solid red;padding:10px;" v-if="object.object && object.object.image !== null">
                      <div v-for="image in object.object.image" style="border:2px solid orange;">
                        <img :src="image">
                      </div>
                    </div>

                     <vs-buttons-control v-if="buttons !== null"
                        :buttons="buttons"
                        :object="object.object"
                        :type="object.type"
                        ref="buttons"
                        @toggle="toggled($event)"
                        @replies="loadReplies($event)"
                    ></vs-buttons-control>

                    <vs-comment-input v-if="buttons !== null && buttons.indexOf('comment') > -1"
                        v-show="toggle.input"
                        :parent-class="object.type"
                        :parent-id="object.object.id"
                        :placeholder="'Reply to this comment'"
                        @posted="append($event)"
                        ref="input"
                    ></vs-comment-input>

                    </div><!-- v-else -->

                </div>

                <!--
                <div style="border:4px solid orange;" v-if="imageRight.src">
                    <img :src="imageRight.src" :style="'height:' + imageRight.height + 'px'">
                </div>
                -->
                
            </article>

            <div v-if="object.aggregates && object.aggregates.comment" style="margin-top:15px;">
                <hr>
                <vs-comment v-for="(comment, index) in object.aggregates.comment"
                    :object="comment"
                    :index="index"
                    :key="comment.id"
                    init="init"
                    @toggle="toggled($event)"
                ></vs-comment>
            </div>

      </div>
</template>

<script>

export default {

    props : {

        init : {
          type : Object,
            default(){
            return {}
          }
        },
  
        object : {
          type: Object,
          default: {}
        }
    },

    created(){

      /*
      console.log('created');
      console.log(this.object.aggregates.comments);
      console.log(this.object.aggregates.comments[Object.keys(this.object.aggregates.comments)[0]].user.username);
      */
    },

    data(){

        return{

            image : {
                src : null,
                rounded : false,
                size : 80
            },

            imageObject : {
                src : null,
                rounded : false,
                height : 200,
                link : null
            },

            toggle : {
              others : false,
              input : false
            }
        }
    },

    computed : {

        buttons(){

            if (this.object.name === 'post') return [
            {
                like : {
                  icon: 'favorite_border',
                  iconToggle: 'favorite'
                }
            },
            'retweet', 'comment', 'deleteButton'
            ];

            if (this.object.type === 'comment') return ['like', 'dislike', 'reply', 'getReply', 'deleteButton'];

            return null;
        },

        header() {

            var header = '';

            //if (object !== null && object.type === 'user') return header;
            
            //header += this.helperUsername(this.object, false);

            if (this.object.user){

                header += '<strong class="capitalize"><a href="' + this.object.user.link + '">' + this.object.user.username + '</a></strong>';
            
                header += ' ' + this.object.action + this.getOn();

            }

            if (this.object.type === 'user'){

                this.imageObject.src = this.object.object.avatar;

                this.imageObject.link = this.object.object.link;

            }

            if (this.object.type === 'video'){

                this.imageObject.src = this.object.object.poster;

                this.imageObject.link = this.object.object.link;

            }

            if (['review'].indexOf(this.object.type) > -1){

                if (this.object.child){

                  this.imageObject.src = this.object.child.poster;

                  this.imageObject.link = this.object.child.link;

                  header += ' <strong class="capitalize"><a href="' + this.object.child.link + '">' + this.object.child.title + '</a></strong>';
                }

                //if (this.object.object.type === 'upload') header += ' a new video:';

                return header;


            }

            /*
            if (this.object.object && ['review', 'upload', 'video'].indexOf(this.object.type) > -1){

                //this.image.src = this.object.child.poster;
                if (this.object.child) this.imageRight.src = this.object.child.poster;

                if (this.object.object.type === 'review') header += ' of';

                if (this.object.object.type === 'upload') header += ' a new video:';

                if (this.object.child) header += ' <strong class="capitalize"><a href="' + this.object.child.link + '">' + this.object.child.title + '</a></strong>';

                return header;
            }
            */

            if (this.object.name === 'profile'){

                  /*
                  this.image.src = this.object.child.avatar;
                  this.image.rounded = true;

                  header += ' <strong class="capitalize"><a href="' + this.object.child.link + '">' + this.object.child.username + '</a></strong> \'s profile';

                  return header;
                  */
            }


            return header;




            header += ' ' + this.object.actionFormatted + ' ' + this.object.on + ' ';

            if (!this.object.isMedia && this.object.isChild){
                var obj = (this.object.action === 'friend') ? '' : this.object.childType;
                header += this.helperUsername(this.object, true) + obj;
                return header;
            }

            if (this.object.isMedia){
                header += this.helperMedia(this.object.child);
                return header;
            }

            return header;
        },

        content(){

              if (this.object.object === null) return null;
              
              var text = null;

              if (this.object.object.body) text = this.object.object.body;

              if (this.object.object.comment) text = '<i class="material-icons">format_quote</i> ' + this.object.object.comment;

              return text;
        }
    },

    methods : {

        getOn(){
              let text = '';

              if (this.object.action === 'commented') text = ' on ';

              return text;
        },

        helperUsername(o, child){

              /*
              var u = (!child) ? o.username : o.child.username;
              var s = (!child || this.object.action === 'friend') ? '' : '\'s ';
              if (child && o.userId === o.child.userId){
                  return (o.gender === 'm') ? 'his ' : 'her ';
              }
              */

              var u = 'llll';
              var s = 'xxx';

              return '<strong class="capitalize"><a href="/profile/' + u + '">' + u + '</a></strong>' + s;
        },

        /* FOR COMMENT POST */
        toggled(data){
            console.log(data);
            this.toggle.input = data.val;
        }
    }
}

</script>

<!--
<template>
        <div class="box elevation-10">
            <article class="media">
                <figure class="media-left">
                    <p class="image is-48x48">
                        <a :href="'\\profile\\' + object.username">
                        <img :src="object.avatar" class="rounded" />
                        </a>
                    </p>
                </figure>
                <div class="media-content" :class="(object.image !== null) ? 'min-height-100' : ''">
                    
                    <div class="content">
                      <article class="media" style="padding: 0;"> 
                        <div class="media-content">

                            <div v-html="header"></div>
                            <small v-text="object.date"></small>

                        </div>
                        <figure class="media-left" style="margin-top: 0;" v-if="object.image !== null">
                            <p class="image is-64x64">
                              <a :href="link">
                               <img :src="object.image.src" :class="object.image.class">
                             </a>
                           </p>
                        </figure>
                      </article>                       
                    </div>

                    <div v-if="object.type !== 'post' && object.content.title !== null"
                      :class="(object.image !== null) ? 'margin-top-20' : ''"
                    >
                      <strong style="text-transform: uppercase;">{{ object.content.title }}</strong>
                    </div>

                    <vs-rating v-if="object.stats.rating !== null"
                        :rating="object.stats.rating"
                        :size="1"
                        static
                    ></vs-rating>

                    <div v-if="object.type !== 'post' && object.content.text !== null"
                      v-html="object.content.text"
                      :class="(object.image !== null) ? 'margin-top-20' : ''"
                    ></div>

                </div>
            </article>
            
            <div>

              <!--child Comments!-->
              <!--
              <vs-comment v-if="object.childType === 'comment'" class="notification"
                  :object="object.child"
                  index="index"
                  :init="init"
                  :buttons="['like','dislike','reply','getReply']"
                  
                    @delcomment="deleteComment($event)"
              ></vs-comment>
              -->

              <!--child Post!-->
              <!--
              <vs-feed v-if="object.childType === 'post'"
                  :object="object.child"
              ></vs-feed>
              -->

              <!--Post-->
              <!--
              <vs-post v-if="object.type === 'post'"
                    :object="object"
                    :key="object.id"
                    :init="init"
                    @delcomment="deleteComment($event)"
                    @toggle="toggled($event)"
              ></vs-post>
              <!--END Post-->

              <!--
            </div>

        </div>
</template>
-->


<!--
<script>
import {mixError} from './mixins/mixError.js';

    export default {
        mixins : [mixError],
        props : {

            //from mixPROPS:
            init : {
              type : Object,
              default(){
                return {}
              }
            },
            //



            object : {
              type: Object,
              default: {}
            }
        },
        data(){
          return {
              //for post only:
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

        //**new feed
        computed : {

            header(){
                var header = '';
                header += this.helperUsername(this.object, false);
                header += ' ' + this.object.actionFormatted + ' ' + this.object.on + ' ';

                if (!this.object.isMedia && this.object.isChild){
                    var obj = (this.object.action === 'friend') ? '' : this.object.childType;
                    header += this.helperUsername(this.object, true) + obj;
                    return header;
                }

                if (this.object.isMedia){
                    header += this.helperMedia(this.object.child);
                    return header;
                }

                return header;
            },

            link(){
                if (this.object.childType === 'video') return '/films/' + this.object.child.slug;
                if (this.object.childType === 'user') return '/profile/' + this.object.child.username;
            },
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

          //newfeed
          helperUsername(o, child){

              var u = (!child) ? o.username : o.child.username;
              var s = (!child || this.object.action === 'friend') ? '' : '\'s ';
              if (child && o.userId === o.child.userId){
                  return (o.gender === 'm') ? 'his ' : 'her ';
              }

              return '<strong class="capitalize"><a href="/profile/' + u + '">' + u + '</a></strong>' + s;
          },

          helperMedia(m){

              var link = '';
              if (m.type === 'video') link = '/films/' + m.slug;
              return '<strong class="capitalize"><a href="' + link + '">' + m.title + '</a></strong>';

          },
        }

    }
</script>
-->