<template>
    <div class="flex flex-column m-t-30 m-b-30">

        <div v-for="(video, index) in videos" class="center-text m-b-20" ref="row">
            
            <div class="video__row debug-red is-hidden-mobile">
            
            <div class="flex flex-center-x relative debug">
                <vs-metas :video="video" />
                <vs-thumb v-for="(thumb, index) in video.thumbs"
                    :src="thumb"
                    :index="index"
                    :key="index"
                />
                
            </div>

            </div>

            <div class="video__row--full debug-red is-hidden-tablet">
            
            <div class="relative debug">
                <vs-metas :video="video" />                
                <vs-thumb
                    :src="video.hero"
                    is-mobile
                />
                
            </div>

            </div>
        
        </div>
        
    </div>
</template>

<style scoped>

.video__row{
    width: max-content;
    width: -moz-max-content;
    width: -webkit-max-content;
    width: -o-max-content;
    /* for IE */
    display: inline-block;
}

.video__row--full{
    width: 100%;
}

</style>

<script>

import metas from './metas.vue'

import thumb from './thumb.vue'


    export default {

        components:{
            vsMetas : metas,
            vsThumb : thumb
        },

        created(){
            store.dispatch('video/fetchVideos');
        },

        computed: {

            videos(){
                return store.getters['video/getVideos']
            },

            thumbs(){
                return store.getters['video/getThumbs']
            }
        }
    }
</script>
