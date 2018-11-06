<template>
    <div class="comment-input field has-addons m-t-10">
        <div class="control">

            <textarea class="textarea" :placeholder="placeholderComputed + ':' + parentIdComputed" rows="1" v-model="content" v-on:keyup="plugin" v-bind:style="textareaHeight">
            </textarea>
            <p style="white-space: pre-line;position: absolute;top:-10000px;" ref="hiddenHeight">{{ content }}</p>

            <error :error="error" />

        </div>
        <div class="control">
            <a class="button is-primary tooltip is-tooltip-warning" data-tooltip="post comment" @click="postComment" :disabled="isEmpty" :class="{'is-loading' : isPostLoading}">
            <i class="material-icons">send</i>
            </a>
        </div>
    </div>
</template>

<style scoped>
.comment-input .control:first-child{
   width: 100%;
}
.comment-input textarea{

    resize: none!important;
    overflow: hidden;
    border:1px solid #E6ECF0;
    border:1px solid #ced4da;
    border-radius: 0;
    min-height: 2.8em!important;
    padding: 0.60em 0.6em;
    font-family: inherit!important;
    box-shadow: 0 0 0 0em rgba(50, 115, 220, 0);

}
.comment-input .button{
    height: 100%
}
</style>

<script>
import {mixError} from './mixins/mixError'

import errorComponent from './error.vue'

import Comments from '../../store/classes/comments'

//import {mapActions} from 'vuex'

export default{

    mixins : [mixError],

    components : {
        error: errorComponent
    },

    props: {

        parentId : {
            type : [Number, String],
            default : null
        },

        parentClass : {
            type : String,
            default : null
        },

        local: {
            type: Boolean,
            default: false
        },

        placeholder : {
            type : String,
            default : ''
        }, 
  },

  data() {
      return {

        content : '',
        textareaHeight : {},  
        isPostLoading : false,
      
      }
  },

  methods : {

        /*
        ...mapActions({
            postComment : 'comments/post'
        }),
        */

        postComment(){

            this.isPostLoading = true;

            let c = new Comments(this.parentIdComputed, this.parentClassComputed)

            c.post({comment: this.content}).then(response => {

                this.isPostLoading = false;
                
                this.reset();

                if (!this.local) this.$store.dispatch('comments/appendItem', response.data.comment);

                else this.$emit('posted', response.data.comment);

            }).catch(error => {

                this.isPostLoading = false;
                
                this.setError(error);

            })
        },

        plugin(){
          this.error.status = false;
          this.error.libel = '';

          var h = this.$refs.hiddenHeight.clientHeight;
          Vue.set(this.textareaHeight, 'height', h + 'px!important');
        },

        reset(){
            this.content = ''
            Vue.set(this.textareaHeight, 'height', 0 + 'px!important')
        },

        _(str){
            
            if (str === 'video') return 'film';

            if (str === 'user') return 'profile';

            return str
        }
  },

  computed: {

        parentIdComputed(){

            if (!this.local && this.parentId === null) return _comments.parentId;

            return this.parentId
        
        },

        parentClassComputed(){

            if (!this.local && this.parentClass === null) return _comments.parentClass;

            return this.parentClass
        
        },

        placeholderComputed(){

            if (!this.local && this.placeholder === '') return 'comment on this ' + this._(this.parentClassComputed);

            return this.placeholder
        
        },

        url(){
          if (this.parentClassComputed === null)  return '/rest/post/' + this.parentIdComputed;
          return '/rest/comment/'+ this.parentClassComputed + '/' + this.parentIdComputed;
        },

        isEmpty : function(){
            return this.content.length === 0;
        },

        min : function() {
            return this.content.length >= 5;
        }
      
  },
}
</script>