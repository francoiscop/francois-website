<template>
    <div class="swiper-container" :class="swiperContainerClass">
        
        <div v-if="label !== null"
            class="absolute swiper-label c z-2"
            :class="label.class"
            :style="label.style"
        >
            {{ label.label }}
        </div>
        
        <slot name="before-wrapper"></slot>
        
        <div class="swiper-wrapper">

            <vs-slide
              v-for="(slide, index) in slides"
              :key="index"
              :slide="slide"
              @link="trigger(index)"
            />

            <slot></slot>
        
        </div>
        
        <!--
        <div v-if="defaultPagination" class="swiper-pagination" :class="paginationClass"></div>
        <div v-if="defaultScrollbars" class="swiper-scrollbar"></div>
      -->
        
        <div :class="nextEl" v-html="nextElIcon" v-if="isNavigation" v-show="index < length - 1"></div>
        <div :class="prevEl" v-html="prevElIcon" v-if="isNavigation" v-show="index > 0"></div>
        <slot name="after-wrapper"></slot>
    </div>
</template>

<style scoped>

.swiper-container {
    width: 100%;
    height: 100%;
    border: 0px solid blue;
    z-index: 1!important;
}
.swiper-container-v{
    min-height: 100vh;
}
.swiper-label {
    top:4rem;
    left:20px;
    opacity: 0.6;
}
/*
.swiper-container-v {
    background: white;
}
.swiper-button-vertical-next,
.swiper-button-vertical-prev{
  border-radius:50px;
  height: 80px;
  width:80px;
  position: absolute;
  z-index:10;
  bottom:0px;
  right:0px;
  cursor: pointer;
}
.swiper-button-vertical-next:hover,
.swiper-button-vertical-prev:hover{
  background-color: rgba(0,0,0,0.2);
  border: 1px solid rgba(0,0,0,0.5);
}
.swiper-button-vertical-prev {
  bottom : 80px;
}
.swiper-button-vertical-next i,
.swiper-button-vertical-prev i{
  font-size:4em;
  color: black;
}

.swiper-button-next{
}

.swiper-label {
  font-family: Anton;
  text-transform: uppercase;
}


.swiper-label-over {
  position: absolute;
  z-index: 10;
  opacity: 0.6;
  text-transform: uppercase;
}
*/
</style>

<script>

const DEBUG = false

export default{

    props : {

        vertical: {
          type: Boolean,
          default: false
        },

        fetch: {
          type: String,
          default: null
        },

        keyFetch: {
          type: String,
          default: null
        },

        height: {
          type: [Number, String],
          default: null
        },

        widthSlides: {
          type: [Number, String],
          default: null
        },

        space: {
          type: Number,
          default: 0
        },

        label : {
          type: Object,
          default(){
            return null
          }
        },

        loop : {
          type : Boolean,
          default: false
        },

        start: {
          type: [Number, Boolean],
          default: false
        }
   },

   data(){
      return {

        index : 0,
        length : 0,

      }
   },

   created() {

        if (this.fetch !== null){

            if (store.getters['swiper/getIsFetched']) return;

            store.commit('swiper/setUrl', this.fetch)

            store.dispatch('swiper/fetchItems')

        }
   },

   computed: {

      direction(){

          if (this.vertical) return 'vertical';

          return 'horizontal'

      },

      slides(){

          if (this.keyFetch !== null){

               const items = store.getters['swiper/getItems']

               return items[this.keyFetch]
          }

          return []
      },

      
      options(){

          const paginationEl = (this.vertical) ? '.swiper-pagination-v' : '.swiper-pagination-h';

          
          let options = {
              direction: this.direction,
              spaceBetween: this.space,
              navigation: {
                nextEl: '.' + this.nextEl,
                prevEl: '.' + this.prevEl,
              },
              pagination: {
                //el: paginationEl,
                //clickable: true,
              },

              autoHeight: true,

              fadeEffect: {
                  crossFade: true
              },

              flipEffect: {
                  rotate: 30,
                  slideShadows: false,
              },

              //loop : this.loop,
              //loopedSlides : 10,
              
              //slidesPerView: 'auto'

              on : {
                init : () => {
                    
                    this.debug('options', 'swiper init !', null, 'error')
                },

                slideChange : () => {

                    this.debug('options', 'slide change', null, 'error')
                },

                slideNextTransitionStart : () => {

                    this.debug('options', 'slide next start', null, 'error')
                }
              }
          }

          //if (this.start) options.init = false;

          if (this.widthSlides === 'auto') options.slidesPerView = 'auto';
          
          if (!isNaN(this.widthSlides) && this.widthSlides > 0) options.width = this.widthSlides;


          //if (this.height !== null && this.height > 0) options.height = this.height;

          //if (this.width !== null && this.width > 0) options.width = this.width;

          //options.width = 'auto'

          return options; 
      },
      

      swiperContainerClass(){
          
          return (this.vertical) ? 'swiper-container-v' : 'swiper-container-h';
      
      },

      nextEl(){

          return (this.vertical) ? 'swiper-button-vertical-next' : 'swiper-button-next';

      },

      prevEl(){

          return (this.vertical) ? 'swiper-button-vertical-prev' : 'swiper-button-prev';

      },

      nextElIcon(){

          return (this.vertical) ? '<i class="material-icons">keyboard_arrow_down</i>' : '';

      },

      prevElIcon(){

          return (this.vertical) ? '<i class="material-icons">keyboard_arrow_up</i>' : '';

      },

      isNavigation(){

          if (this.vertical && this.height !== null) return false;

          return true;

      },
  },

  watch: {

      slides(slides){

          if (slides.length === 0) return;

          this.debug('WATCH', 'slides', slides, 'error')

          setTimeout(() => this.recreateSwiper(), 0)
      }

  },

  mounted(){
      
      if (this.fetch === null) this.recreateSwiper();

      this.debug('mounted', 'slides', this.slides, 'error')

      this.debug('mounted', 'direction', this.direction, 'error')
  },

  updated() {
      //this.swiper.update()
    },

  beforeDestroy() {
      
      if (this.swiper) this.swiper.destroy()
   
  },

  methods : {

      debug(cycle, libel, debug, c = 'warn', func = null){

          if (!DEBUG) return;

          console[c](`SWIPER.VUE ${cycle} -> func : ${func} -> ${libel} : `, debug)

      },

      recreateSwiper() {
        
          if (this.swiper) this.swiper.destroy()

          this.swiper = new Swiper(this.$el, this.options);

          this.debug('METHODS', 'recreating swiper !!', this.swiper, 'error', 'recreateSwiper')

          this.swiper.on('slideChange', () => {

              this.index = this.swiper.activeIndex;
          
          });


          if (this.start){

              this.debug('METHODS', 'start !!', null, 'warn', 'recreateSwiper')

              //this.swiper.on('init', () => { this.swiper.slideTo(this.start, 1000) })

              //this.swiper.init()

              this.swiper.slideTo(this.start, 0)
          }

          this.length = this.swiper.slides.length;

          this.debug('METHODS', 'this.length', this.length, 'error', 'recreateSwiper')

          this.$emit('update:swiper', this.swiper)
      },

      trigger(index){

          this.debug('METHODS', 'index', index, 'error', 'trigger')

          this.debug('METHODS', 'slide', this.slides[index], 'warn', 'trigger')

          store.commit('swiper/setItem', {key : this.keyFetch, index : index})

          store.commit('home/setModal', true)

      }
  }
}
</script>
