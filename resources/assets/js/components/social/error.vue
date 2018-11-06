<template>
  <transition name="fade">
      <b-notification class="b-notification-error m-t-5" :class="(error.success) ? 'is-info' : 'is-warning'" :active.sync="error.status">
          {{error.libel || error.label}}
      </b-notification>
  </transition>
</template>

<style>
.b-notification-error{

  padding:2px 5px 5px 20px;text-align: left;

}
.b-notification-error .media{

  padding-top: 0;

}
</style>

<script>

    export default {

        props :{

          error : {
            type: Object,
            default(){
              return{}
            }
          }
        
        },
}
</script>