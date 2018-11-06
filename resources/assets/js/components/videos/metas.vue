<template>
    <div class="video__metas absolute flex flex-center animate-opacity pointer z-10 m-l-5"
         :class="(isMobile) ? 'o-6' : 'video__metas--white o-0'"
        @click="click($event)"
    >
        <div v-if="!soon">
            <p class="anton u s-18" :class="{'s-15 has-text-primary' : isMobile}" v-html="title"></p>
            <!--<p v-if="video.client !== null" class="u">{{ video.client }}</p>-->
            <p class="c s-9">{{ video.director }}</p>
            <!--<p class="c s-9 is-hidden-mobile">{{ video.production }} {{ video.country }}</p>-->
            <p class="c s-9">{{ video.genre }}</p>
        </div>
        <div v-else class="animated fadeIn">
            <p class="u">video coming soon</p>
        </div>
    </div>
</template>

<style scoped>

.video__metas{
    width: calc(100% - 10px);
    height: 100%;
    top:0;left:0;
}
.video__metas--white{
    border: 1px solid hsl(0, 0%, 66%);
    background-color: white;
}
.video__metas:hover{
    opacity: 1!important;
}

.video__metas.video__metas--white:hover{
    opacity: 0.8!important;
}

</style>

<script>
    export default {
        
        props : {
            video : {
                type: Object,
                default(){
                    return {};
                }
            },
        },
  
        data(){
            return {
                soon : false
            }
        },

        computed : {

            title(){

                const title = this.ellipse(this.video.title, 25)
                
                if (this.video.client !== null) return `${this.video.client} <br/> ${title}`;

                return title
            },

            isMobile(){
                return is.mobile
            }

        },
  
        methods: {

            click(e){

                if (this.video.is_screencaps == 1){
                    
                    store.commit('video/setScreencapsVideo', this.video)

                    return
                
                }

                if (this.video.url !== null){
                    
                    store.commit('video/setVideo', this.video)

                    return
                
                }

                this.soon = true

                setTimeout(() => { this.soon = false }, 2000)

            },

            ellipse(str, max){

                let l = str.length

                if (l <= max) return str;

                const words = str.split(' ')

                for (let i = words.length - 1; i >= 0; i--){

                    let isBreak = (l - words[i].length <= max)

                    l -= words[i].length

                    words.pop()

                    if (isBreak) break;
                }

                return words.join(' ')
            
            }
        }
    }
</script>
