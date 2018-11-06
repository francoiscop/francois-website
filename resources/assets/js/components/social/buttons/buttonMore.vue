<template>
  <div class="button" :class="[{'is-loading' : isLoading}, {'is-small' : isSmall}]" @click="click">Show more</div>
</template>

<script>

    export default {
        
        props:{

          isSmall:{
            type: Boolean,
            default: false
          }

        },

        data(){
          return {
              isLoading : false
          }
        },

        methods : {
            click(data){
                this.isLoading = true;
                this.$emit('more');
            }
        }
    }
</script>