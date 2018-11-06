<template>
<div class="nav-user flex flex-column" :class="(toggleUser) ? 'is-width-120' : 'is-width-50'">
   
   <div>
      <span class="nav-user-narrow pointer" @click="toggleUserNav">
      <i class="material-icons" style="width:5px;" v-text="(!toggleUser) ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"></i>
      <i class="material-icons" v-text="(!toggleUser) ? 'keyboard_arrow_right' : 'keyboard_arrow_left'">keyboard_arrow_right</i>
      </span>
   </div>

   <div style="flex-basis:15%;"></div>
   
   <div class="flex-grow flex flex-column flex-between" v-if="displayUserNav">
      
      <div v-for="(item, index) in menuComputed" class="nav-user-item m-b-10">
         <a :href="item.url" :class="{'tooltip is-tooltip-warning is-tooltip-right' : !toggleUser}" :data-tooltip="item.name.toUpperCase()" class="flex flex-center">
         	<i class="material-icons" style="border:0px solid red">{{ icons[item.name] }}</i>
         	<div class="c m-l-5" v-if="toggleUser" style="border:0px solid blue">{{ item.name }}</div>
         </a>
      </div>

   </div>

   <div style="flex-basis:20%;"></div>

</div>
</template>

<style>

.is-width-120{
  width:120px;
  -webkit-transition: width 0.1s ease-in-out;
    -moz-transition: width 0.1s ease-in-out;
    -o-transition: width 0.1s ease-in-out;
    transition: width 0.1s ease-in-out;
}
.is-width-50{
  width:50px;
}

.nav-user{
  position: fixed;
  justify-contentxx: space-between;
  background-color: rgba(30,50,60,0.8);
  color:white;
  top:3.25rem;
  left:0px;
  height: calc(100vh - 3.25rem);
  z-index: 1;
}

.nav-user a{
  color: whitesmoke;
}
.nav-user a:hover{
  color: hsl(204, 86%, 53%);
}

/*
.nav-user > div:first-child, .nav-user > div:last-child{
  text-align: right;
}

.nav-user .nav-user-item{
  padding: 12px 0px;
  text-align:center;
  border-bottom: 1px solid #444;
}
.nav-user .nav-user-item span{
  line-height: 36px;
}

.nav-user .nav-user-item .material-icons{
  position: relative;
  top:5px;
}

.nav-user-close,
.nav-user-narrow{
  cursor: pointer;
}
*/
</style>

<script>
import search from '../search/searchHeader.vue'

export default{

	props: {

		menu: {
			type: [Array, Object],
			default(){
				return {}
			}
		}
	},

	data(){
		return{

			toggleUser : false,
			displayUserNav : true,

			icons : {
          		profile : 'person',
          		friends : 'accessibility',
          		videos : 'videocam',
              extracts : 'videocam',
          		albums : 'camera',
          		settings : 'settings',
          		message : 'message',
          		email : 'email',
              album : 'photo_camera',
              album1: 'camera',
              product : 'shopping_cart',
              upload : 'cloud_upload',
              create : 'cloud_upload',
              edit : 'build',
              permissions : 'perm_identity'
      }
		}
	},


	computed: {

		menuComputed(){

			var menu = []

			for (let k in this.menu){

				if (typeof this.menu[k] === 'string') menu.push({ name : this.menu[k], url : '/' + this.menu[k]});

				else if (typeof this.menu[k] === 'object'){

					for (let j in this.menu[k]) menu.push({ name : j, url : '/' + this.menu[k][j] })
				}
			}

			return menu
		},

	},

	methods: {

		toggleUserNav(){
            
            this.toggleUser = !this.toggleUser;

            this.$parent.toggleUserNav(this.toggleUser)
        
        }
	}
	
}
</script>