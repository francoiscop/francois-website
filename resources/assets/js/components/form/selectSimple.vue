<template>
  <div class="relative"  v-click-outside="onClickOutside" v-if="show">
    
    <div class="button simple-select c flex" :class="{'attached' : left && !hasBorderRight, 'attached-right' : right}" :style="'width:' + width + 'px'">
      
      <div class="flex-grow" @click="toggle">
        {{ valueMutated }}
        <span class="i-arrow-down" :class="{'open' : open}">
            <i class="material-icons" style="position: relative;top: 4px">keyboard_arrow_down</i>
        </span>
      </div>

        <div v-if="close" class="close-select" @click="reset">
             <i class="material-icons s-8" style="position: relative;top: 4px">clear</i>
        </div>
    </div>
    <div class="simple-select-dropdown" :class="{'none' : !open, 'block' : open}" :style="'width:' + width + 'px'">
        <ul>
            <li v-for="(option) in optionsMutated" @click="select(option)" class="c p-10">{{ option }}</li>
        </ul>
    </div>

  </div>
  
</template>

<style>
.i-arrow-down{
  transform: rotate(0deg);
  transition: transform 0.1s linear;
}

.i-arrow-down.open{
  transform: rotate(180deg);
  transition: transform 0.1s linear;
}



.simple-select .close-select:hover {

    color: #F03861;
    
}

.tutorial {
  width: 80%;
  margin: 5% auto 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
  max-width: 800px;
}
.tutorial .slider {
  width: 100%;
  height: 300px;
  background-color: #F03861;
}
.tutorial .information {
  width: 100%;
  padding: 20px 50px;
  margin-bottom: 30px;
  font-family: "Open Sans", sans-serif;
}
.tutorial .information h1 {
  color: #333;
  font-size: 1.5rem;
  padding: 0px 10px;
  border-left: 3px solid #F03861;
}
.tutorial .information h3 {
  color: #e0e0e0;
  font-size: 1rem;
  font-weight: 300;
  padding: 0px 10px;
  border-left: 3px solid #F03861;
}
.tutorial .information p {
  padding: 10px 0px;
}
.tutorial ul {
  font-size: 0;
  list-style-type: none;
}
.tutorial ul li {
  font-family: "Open Sans", sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: #333;
  display: inline-block;
  padding: 15px;
  position: relative;
}
/*.tutorial ul li ul {*/
.simple-selectx ul {
  display: nonexxxxxxx;
}
.simple-selectx:hover {
  cursor: pointer;
  background-color: #f2f2f2;
}
.simple-selectx ul {
  display: block;
  margin-top: 15px;
  width: 200px;
  left: 0;
  top:0;
  position: absolute;
}
.simple-selectx:hover ul li {
  display: block;
  background-color: #e7e7e7;
}
.simple-selectx:hover ul li span {
  float: right;
  color: #f9f9f9;
  background-color: #F03861;
  padding: 2px 5px;
  text-align: center;
  font-size: .8rem;
  border-radius: 3px;
}
.simple-selectx:hover ul li:hover {
  background-color: #e0e0e0;
}
.simple-selectx:hover ul li:hover span {
  background-color: #ee204e;
}







.simple-select{
    border-radius: 0;
    position: relative;
    z-index: 2;
    font-family: 'Yanone Kaffeesatz', sans-serif;
}
.simple-select.attached{
    border-right: 0;
}
.simple-select.attached-right{
    border-left: 0;
}
.simple-select-dropdown{
    border: 1px solid #dbdbdb;
    border-top-width: 0;
    color: #363636;
    padding: 5px;
    position: relative;
    margin-topxxxxxx: -50px;
    opacity: 1;
    z-index: 300;

    position: absolute;
    background-color: white;
    heightx: 'auto';

    font-family: 'Yanone Kaffeesatz', sans-serif;
    
}
.simple-select-dropdown.open{
    margin-top: 0px;
    opacity: 1;
    -webkit-transition: opacity 1s ease-in;
    -moz-transition: opacity 1s ease-in;
    transition: opacity 1s ease-in;
}

.simple-select-dropdown li{
   cursor: pointer;
}
.simple-select-dropdown li:hover{
   background-color: hsl(171, 100%, 41%);
   background-color: #f2f2f2;
}
.sub-menu { 
  visibility: hidden; /* hides sub-menu */
  opacity: 0;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  transform: translateY(-2em);
  z-index: -1;
  transition: all 0.3s ease-in-out 0s, visibility 0s linear 0.3s, z-index 0s linear 0.01s;
}

.sub-menu-parent:focus .sub-menu,
.sub-menu-parent:focus-within .sub-menu,
.sub-menu-parent:hover .sub-menu {
  visibility: visible; /* shows sub-menu */
  opacity: 1;
  z-index: 1;
  transform: translateY(0%);
  transition-delay: 0s, 0s, 0.3s; /* this removes the transition delay so the menu will be visible while the other styles transition */
}


</style>

<script>
export default {

    props: {

        options: {
            type: Array,
            default(){
                return []
            }
        },

        value: {
            type: String,
            default: ''
        },

        left: {
            type: Boolean,
            default: false
        },

        right: {
            type: Boolean,
            default: false
        },

        width: {
            type: Number,
            default: 100
        },

        close: {
            type: Boolean,
            default: false
        },

        show: {
            type: Boolean,
            default: true
        },

        hasBorderRight: {
            type: Boolean,
            default: false
        }
    },

    data(){
        return {
            //valueMutated : (this.value !== '' && this.options.indexOf(this.value) > -1) ? this.value : this.options[0],
            //optionsMutated : (this.value !== '' && this.options.indexOf(this.value) > -1) ? this.options.splice(this.options.indexOf(this.value),1) : this.options.slice(1),
            //valueMutated : '',
            //optionsMutated: [],
            open : false,

            valueMutated: '',

            optionsMutated: []
        }
    },

    created(){

        if (this.value !== '' && this.options.indexOf(this.value) > -1){

            this.optionsMutated = this.options.filter(val => {

                return (val !== this.value && val !== 'by gender') ? true : false

            })

            this.valueMutated = this.value
        
        } else {
            
            this.reset()
        
        }

        console.warn('optionsMutated :::: ', this.optionsMutated)

    },

    methods:{

        remove(array, element) {
            
            const index = array.indexOf(element);
    
            if (index !== -1) array.splice(index, 1);
        },

        select(option){

            this.valueMutated = option
            
            this.optionsMutated = this.options.filter(val => { 

                if (val !== option && val.toLowerCase() !== 'by gender') return val;

            })
            
            this.$emit('change', option)
            
            this.toggle()
        },

        toggle(){

            this.open = !this.open;
        },

        onClickOutside(event){

            if (!this.open) return;

            this.open = false
        },

        reset(){

            this.optionsMutated = this.options.slice(1)
            
            this.valueMutated = this.options[0]

            this.open = false

            this.$emit('reset')

        }
    }

}
</script>