<template>
  <transition name="fade">
  <div class="box-item center-text" v-if="isDisplay">
    <div>
        <a :href="link">
          <img :src="poster" :style="'height:' + height +'px'" />
        </a>
    </div>
    <div style="text-transform:capitalize;">
        <p><a :href="link">{{ title }}</a></p>
        <p v-if="item.hasOwnProperty('gender')"><small>{{ item.gender }} <span class="extra-muted"></span> {{ item.age }}y</small></p>
        <p v-if="item.hasOwnProperty('country')"><small>{{ item.country }}</small></p>
        <p v-if="item.hasOwnProperty('info')"><small><a :href="item.info">Infos</a></small></p>
    </div>

    <vs-friend-requests-controller v-if="isRequest"
        :friend-id="item.pivot.friend_id"
        @update="update($event)"
    ></vs-friend-requests-controller>
  
  </div>
  </transition>
</template>

<style>
.box-item{
  border: 1px solid rgba(219, 219, 219, 0.5);
  margin: 2px;
  widthxxxxxxx: 270px;
}






.box-itemx{
  flex-grow: 0;
  min-width: 160px;
  max-width: 170px;
  border: 1px solid rgba(219, 219, 219, 0.5); 
  padding: 10px;
  margin: 6px;

      background-color: white;
    border-radius: 5px;
    -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.4), 0 0 0 1px rgba(10, 10, 10, 0.1);
    color: #4a4a4a;
    display: block;
    height:auto!important;
}

.box-user-infos{
  font-size: 0.9rem;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

<script>
import {mixError} from '../social/mixins/mixError.js';

export default {

    mixins : [mixError],
    props:{
      item : {
        type : Object,
          default(){
            return {}
          }
        },

        isRequest : {
          type: Boolean,
          default: false
        },

        height: {
          type: Number,
          default: 160
        }
    },

    data(){

        return {
            isDisplay: true,
        }
    },

    computed: {

        poster(){
            if (this.item.hasOwnProperty('avatar')) return this.item.avatar;
            if (this.item.hasOwnProperty('poster')) return this.item.poster;
            if (this.item.hasOwnProperty('image')) return this.item.image;
        },

        title(){
            if (this.item.hasOwnProperty('username')) return this.item.username;
            if (this.item.hasOwnProperty('title')) return this.item.title;
        },

        link(){
            if (this.item.hasOwnProperty('watch')) return this.item.watch;
            if (this.item.hasOwnProperty('link')) return this.item.link;
        }
    },

    methods: {

        update(action){

            if (user && user.friendRequests && user.friendRequests > 0){

                user.friendRequests --;
            }

            if (action === 'decline') {

                setTimeout(() => {

                  this.isDisplay = false;

                }, 1000);
            }
        }
    }
}
</script>