<template>
    <div class="vs-icon-play pointer center-auto flex flex-center"
      :class="[colorClass]"
      :style="dimension"
      @click="click()"
    >
        <i class="material-icons" :class="sizeClass">play_arrow</i>

        <b-loading
          :is-full-page="false"
          :active.sync="isLoading"
          style="border-radius: 50%;"
        />
    
    </div>
</template>

<style lang="scss" scoped>
.vs-icon-play{
  border-radius: 50%;
  opacity: 0.6;
}
.vs-icon-play:hover{
  opacity: 1;
  background-color: rgba(3,218,198, 0.2);
}
/*
.vs-icon-play{
	right: 2%;
	border-radius: 50%;
	background-color: rgba(3,218,198, 0);
	opacity: 0.6;
}
.vs-icon-play i{
	font-size:8rem;
}
.vs-icon-play.is--medium i{
	font-size:5rem;
}
.vs-icon-play:hover{
	color: #00d1b2;
	opacity: 1;
	background-color: rgba(3,218,198, 0.2);
}
.vs-icon-play.is--dark:hover{
	color: white;
	opacity: 1;
	background-color: rgba(30,30,30, 0.2);
}
*/
</style>

<script>
  
  export default {
    	props : {

        colorClass: {
          type: String,
          default: 'has-text-primary'
        },

        sizeClass: {
          type: String,
          default: 's-60'
        }
    	},

      data(){

        return{
          isLoadingxxxxxxxxxxx: false
        }

      },

      computed: {

          isLoading(){

            return store.getters['swiper/getLoadingPlay']

          },

        	dimension(){

              let width = this.sizeClass.replace('s-','')

              width = parseInt(width) + 55
              
              return `width:${width}px;height:${width}px`
          }
      },

      methods: {

          click(){
              
              if (this.isLoading) return

              this.$nextTick(() => store.commit('swiper/setLoadingPlay', true))

              this.$emit('is-click')
          }
      }
    }


    /*
$main-bg-color: rgb(3,218,198);

.v-icon-play{
  background: rgba(3,218,198,0);
  border:1px solid rgba(20,30,40,0.3);
  border-radius:50%;
  width:90px;
  height:90px;
  padding:0px;
  right:20%;

  -webkit-transition: all 0.5s;
   -moz-transition: all 0.5s;
     -o-transition: all 0.5s;
        transition: all 0.5s;

}

.v-icon-play:hover{
background: rgba(3,218,198,1);
  width:90px;
  height:90px;
  border-width : 1px;
  padding:10px;
}

.v-icon-play:hover i{

	font-sizexxx: 3.2rem!important;

}

.v-icon-play i{
-webkit-transition: all 0.5s;
 -moz-transition: all 0.5s;
   -o-transition: all 0.5s;
      transition: all 0.5s;
}
*/

    /*
$main-bg-color: rgb(3,218,198);

.v-icon-play{
  background: rgba(3,218,198,0);
  border:1px solid rgba(20,30,40,0.3);
  border-radius:50%;
  width:90px;
  height:90px;
  padding:0px;
  right:20%;

  -webkit-transition: all 0.5s;
   -moz-transition: all 0.5s;
     -o-transition: all 0.5s;
        transition: all 0.5s;

}

.v-icon-play:hover{
background: rgba(3,218,198,1);
  width:90px;
  height:90px;
  border-width : 1px;
  padding:10px;
}

.v-icon-play:hover i{

	font-sizexxx: 3.2rem!important;

}

.v-icon-play i{
-webkit-transition: all 0.5s;
 -moz-transition: all 0.5s;
   -o-transition: all 0.5s;
      transition: all 0.5s;
}
*/
</script>
