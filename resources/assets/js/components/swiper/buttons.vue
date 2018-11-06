<template>
   <button type="button" class="btn btn--floating btn--fixed blue" tabindex="0" role="button" :class="vClass + ' ' + color" :style="cStyle">
      <div class="btn__content">
         <i aria-hidden="true" class="icon material-icons" v-if="icon !== null" v-text="icon"></i>
      </div>
   </button>
</template>

<style>
</style>

<script>
export default{

		props : {
      icon : {
         type : String,
         default : null,
      },
      vClass : {
         type : String,
         default : null
      },
      vStyle : {
         type : Object,
         default(){
            return {
               top: 0,
               left: 0
            }
         }
      },
      color: {
         type: String,
         default : 'orange'
      }
   },
   computed: {
      cStyle(){
         return 'top:' + this.vStyle.top + 'px;left:' + this.vStyle.left + 'px';
      }
   }
}
</script>