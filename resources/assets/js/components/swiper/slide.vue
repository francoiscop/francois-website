<template>
  <div class="swiper-slide flex flex-center"
    :class="slideClass"
    :style="`background-size: cover;background-image: url(${bgImage})`"
  >

    <div class="swiper-slide__metas center-text relative o-6">
      
      <vs-play ref="play" @is-click="click()" class="absolute center-absolute play anim-opacity z-10" style="opacity: 0"/>

      <p class="bebas has-text-light o-8 meta anim-opacity">{{ slide.title }}</p>
      <p class="meta anim-opacity">{{ slide.director }}</p>
      <p class="meta anim-opacity">{{ slide.country }}</p>
    
    </div>
    
  </div>
</template>


<style scoped>

.swiper-slide {
  border:0px solid orange;
  padding:0;
  width:100%;
  height:100%;
}
.swiper-slide--auto {
  width:auto;
}
.swiper-slide__metas {
  font-family:Abril Fatface;
}
.swiper-slide__metas:hover .meta{
  opacity: 0.2
}
.swiper-slide__metas:hover .play{
  opacity: 1!important;
}
</style>

<script>
export default{

    props : {

      slide : {
        type: Object,
        default(){
          return {}
        }
      },

      bgClass : {
        type: String,
        default: 'has-background-dark'
      }

    },

   computed: {

      slideClass(){
          return this.bgClass
      },

      bgImage(){
          return this.slide.poster || null
      }

   },

   methods:{

      click(){
        this.$emit('link')
      }
   }
   
}
</script>