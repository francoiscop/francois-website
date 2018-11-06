<template>
    <!--<div :style="(isMobile) ? 'width: 100%' : ''">-->
    <div>
    <div v-if="!isMobile" class="aspect__ratio--16-9" :class="classComputed">
        <div style="background-size:cover;" class="has-background-custom-2">
            <vs-loader v-if="!loaded" style="opacity: 0.2;" />
            <!--<img :src="srcLoaded" :class="{'animated fadeIn':loaded}" />-->
            <v-lazy-image
                :src="src"
            />
        </div>
    </div>
    <div v-else class="aspect__ratio--30 video__hero debug-green" style="min-width:300px;">
        <div style="background-size:cover;" class="has-background-primary debug-pink">
            <vs-loader v-if="!loaded" style="opacity: 0.2;" />
            <!--<img :src="srcLoaded" :class="{'animated fadeIn':loaded}" />-->
            <v-lazy-image
                :src="src"
            />
        </div>
    </div>
    </div>
</template>

<style scoped>

.video__thumb{
    width: 33%;
    min-width: 280px;
}

.video__hero{
    width: 100%;
}

</style>

<script>
import loader from './loader.vue'

    export default {

        components : {vsLoader : loader},

        props:{
            src:{
                type: String,
                default: null
            },

            index: {
                type: Number,
                default: null
            },

            isMobile: {
                type: Boolean,
                default: false
            }
        },

        data(){
            return {
                loaded : false,
                srcLoaded : null,
            }
        },

        computed: {

            classComputed(){

                if (this.isMobile) return 'aspect__ratio--30 video__hero is-hidden-tablet';

                let cl = ' m-l-5 m-r-5 video__thumb'
                
                if (this.index === 1) return cl + ' is-hidden-mobile';
                
                if (this.index === 2) return cl + ' is-hidden-touch';
                
                return cl;
            }

        },
        
        mounted(){

            if (this.src === null){

                this.loaded = true

                return
            }

            let imgage = new Image()
    
            imgage.onload = (e) => {
                
                this.srcLoaded = this.src

                this.loaded = true
            }
            
            imgage.src = this.src
        }
    }
</script>
