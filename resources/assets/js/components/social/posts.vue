<template>
  <div>
    
    <div style="margin-bottom: 15px;padding:5px 0;border-bottom: 1px solid hsl(0, 0%, 82%);"  v-if="showHeader">
      <i class="material-icons">mode_comment</i>
      <span>{{ max }} Posts</span>
    </div>

    <b-loading :is-full-page="false" :active.sync="pageLoading" :canCancel="true"></b-loading>

    <vs-post v-for="(object, index) in datas"
      :object="object"
      :index="index"
      :key="object.id"
      :init="init"
      :buttons="buttons"
      @delcomment="deleteComment($event)"
      @toggle="toggled($event)"
    ></vs-post>

    <vs-button-more
        v-if="datas && max > datas.length"
        ref="more"
        @more="load"
    ></vs-button-more>

  </div>
</template>

<script>
import {mixError} from './mixins/mixError.js';
import {mixCommentFeedPostReview} from './mixins/mixCommentFeedPostReview.js';

    export default {
      mixins : [mixError, mixCommentFeedPostReview],
      props : {
        showHeader : {
          type: Boolean,
          default: true
        },
      },

      methods : {

          //ONLY FOR POST COMMENT TRIGGER:
          toggled(data){
              if (this.isParent) this.$emit('toggle', data);
          }
      }
    }
</script>