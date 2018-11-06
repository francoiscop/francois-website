<template>
	<nav class="navbar is-fixed-top nav-header" v-click-outside="onClickOutside"> 

   <transition name="fade">
   <div class="container">
      
      <div class="navbar-brand">
         <a class="navbar-item a--c-5 anim-opacity" href="/">
         	<span class="anton">{{ brand }}</span>
         </a>

         <div class="navbar-burger burger" data-target="nav-header-target" :class="{'is-active' : toggleBurger}"  @click="toggleMobileBurger">
            <span></span>
            <span></span>
            <span></span>
         </div>
      </div>
      
      <div id="nav-header-target" class="navbar-menu animated fadeInRight" :class="{'is-active' : toggleBurger}">

         <div class="navbar-start center-auto">

         	<a v-for="(item, index) in menu"
         		v-if="item.router === null"
         		:href="item.link"
         		class="navbar-item u a--dark"
         	>
         		{{ item.name }}
         	</a>

         	<router-link v-else :to="item.router" class="navbar-item u a--dark" @click.native="click()">
         		{{ item.name }}
      		</router-link>
   
         </div>
      
      </div>
   </div>
	</transition>

</nav>

</template>

<style>
.fade-enter-active, .fade-leave-activexxx {
  transition: opacity 1s ease-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

#nav-header-target.is-active{
	border: 0px solid green;
	border-left: 1px solid rgba(238,238,238,1);
	height: calc(100vh - 1rem);
	padding-left: 5%;
	padding-right: 10%;
	right: 0!important;
	margin: 0!important;
	position: fixed;
}

.navbar-item--selected{
	border-bottom:2px solid rgba(3,218,198, 0.7);
}
</style>

<script>

export default{

	props: {

		brand: {
			type: String,
			default: ''
		}
	},

	data(){
		return{
			toggleBurger : false
		}
	},

	created(){
		store.dispatch('menu/setMenuFromePanels', _panels)
	},

	computed: {

		menu(){
			return store.getters['menu/getMenu']
		}
	},

	methods: {

		isObject(o){

			return Object.prototype.toString.call(o) === "[object Object]"

		},

		isArray(o){

			return Object.prototype.toString.call(o) === "[object Array]"

		},

		toggleMobileBurger(){
            
            this.toggleBurger = !this.toggleBurger;
        
        },

        onClickOutside(event){

			if (this.toggleBurger) this.toggleBurger = false;
		},

		click(){
			setTimeout(() => {this.onClickOutside()}, 0)
		}
	}
	
}
</script>