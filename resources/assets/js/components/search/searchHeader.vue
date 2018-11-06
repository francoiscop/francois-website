<template>
  <div class="navbar-item" style="flex-grow: 1;">

    <div class="flex flex-grow">

      <v-select :options="search" @change="change($event)" left />

      <b-autocomplete
                style="width:100%"
                v-model="name"
                :data="data"
                :placeholder="'Search'"
                :field="field"
                icon="magnify"
                :loading="isFetching"
                @input="getAsyncData"
                @select="(option) => { selected = option }">

                <template slot-scope="props">
                  <div>
                    <div class="flex" v-if="typeof props.option === 'object'">
                        <div class="flex flex-center m-r-10">
                            
                            <img style="height:100px" :src="props.option._image">
                            
                        </div>
                        <div class="c">
                            <div class="s-10">{{ props.option.title || props.option.username }}</div>
                            <small v-if="props.option.hasOwnProperty('gender')">
                                {{ props.option.gender }} {{ props.option.age }}y
                            </small>

                            <small v-if="props.option.hasOwnProperty('info')">
                                <a :href="props.option.info">Infos</a>
                            </small>
                        </div>
                    </div>

                    <div v-else>{{ props.option }}</div>
                  </div>
                </template>
        </b-autocomplete>

        <div class="submit flex flex-center has-background-light pointer"><i class="material-icons">search</i></div>

        <div class="m-l-5 flex flex-center pointer close" @click="$parent.toggleSearch = false">
              
              <i class="material-icons">{{ icons.close }}</i>
        
        </div>

      </div>

  </div>
</template>

<style>

.close:hover{
    transition: 0.9s;
    transform: rotate(180deg);
    color: #F03861;
}

.submit{
    width:50px;
    border:1px solid hsl(0, 0%, 81%);
    border-left-width: 0;
}

.submit:hover{
    border-color: hsl(0, 0%, 71%);
}

input:focus {
  
  -webkit-box-shadow: none;
  box-shadow: none !important;
   outline:none;

   border-color: hsl(0, 0%, 71%) !important;
}

.dropdown-content {
    background-color: #fff;
    border-radius: 0px;
    -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    padding-bottom: .5rem;
    padding-top: .5rem;
    border:1px solid hsl(0, 0%, 71%);
}





@-webkit-keyframes rotating /* Safari and Chrome */ {
  from {
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes rotating {
  from {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
.rotating {
  -webkit-animation: rotating 2s linear infinite;
  -moz-animation: rotating 2s linear infinite;
  -ms-animation: rotating 2s linear infinite;
  -o-animation: rotating 2s linear infinite;
  animation: rotating 2s linear infinite;
}



      .s {
         border:2px solid green;
         background-color: white;
display: flex;
opacity: 1;
positionx: absolute;
topx: 0;
transformx: translateY(-100%);
transition: opacity 0.5s;
width: 100%;

line-height: 50px;


       }

       .s::before {
    content: '';
    display: block;
    width: 50px;
    height: 50px;
    background-image: url(https://cdn.bustle.com/bustle/production/public/search-268eb1.svg);
    background-position: center;
    background-repeat: no-repeat;
    background-size: 20px;
    opacity: 0.4;
}

.T{
   -webkit-appearance: none;
background: transparent;
border: none;
color: #222;
flex: 1;
font-familyxxxxx: 'Roboto',sans-serif;
font-size: 1.15rem;
height: 50px;
letter-spacing: 0.05rem;

border-bottom:4px solid red;
}

.R {
    cursor: pointer;
    height: 50px;
    width: 50px;
    text-align: center;
    line-height: 44px;
}

.R::after {
    content: '\D7';
    font-size: 2.5rem;
    font-weight: 300;
    color: #9b9b9b;
}
  
</style>

<script>
import debounce from 'lodash.debounce'

import selectComponent from '../form/selectSimple.vue'

import mixSearch from './mixins/mixSearch'

export default{

  mixins : [mixSearch],

  components : {'v-select' : selectComponent},

  props : {

      search : {
        type: Array,
        default(){
          return []
        }
      }

  },

  mounted(){

    this.iconFix()

  },

  data(){
      return{

        icons : {
          members : 'person',
          models : 'face',
          actors : 'face',
          video1s : 'movie',
          video2s : 'videocam',
          videos : 'theaters',
          films : 'theaters',
          directors: 'record_voice_over',
          close : 'clear',
          albums : 'photo_camera',
          album1s : 'camera',
          products : 'shopping_cart'
        },

        isFetching: false,
        
        type: this.search[0],

        selected: null,

        field: 'title',









        select : {
            tags: false,
            enum: false,
            input: false,
        },

        enumSelectedMutated: null,

        orderBySelectedMutated: null,





        isTags : (this.search[0] === 'by Tags') ? true : false,
        //isButtonDisabled : true,
        //isButtonMutated : (this.search[0] === 'by Tags') ? true : false,
        data: [],
        name: '',
        
        

        filteredTags: this.tags,
            isSelectOnly: false,
            input: this.tags,
            values: [],

            keyProp: 'name',

        url: '/rest/search/' + this.type
      }
    },

  methods: {

    change(val){

        console.warn(val)

        this.type = val

        this.field = this.getField(val)

        this.iconChange(val)
    },

    iconFix(){
          
          var c = document.querySelectorAll("i.mdi.mdi-magnify")

          if (typeof c === 'undefined' || c.length === 0) return;

          c[0].className = "material-icons"
          
          c[0].innerHTML = this.icons[this.search[0]]

          c[0].id = 'icon'
      },

      iconChange(val){

          var c = document.getElementById('icon')

          if (typeof c === 'undefined') return;

          c.innerHTML = this.icons[val]

      },

      getUrlAjax(){

          return '/rest/search/' + this.type.replace(/s$/, '')
      },

      getSearchKeyAjax(){

          if (['members', 'models', 'actors'].indexOf(this.type) > -1) return 'name';

          return 's'
      },

      getField(){

          if (['members', 'models', 'actors'].indexOf(this.type) > -1) return 'username';

          return 'title'
      },

      onSelectOption(option){

          console.warn('OPTION::')
          console.warn(option)

          console.warn(option.title)

          return option.title
      },

      getAsyncData: debounce(function () {
                
                this.data = []
                
                this.isFetching = true

                axios.get(this.getUrlAjax() + '?' + this.getSearchKeyAjax() + '=' + this.name).then((response) => {

                    this.isFetching = false

                    var response = response.data.result

                    response.forEach((item) => {

                        if (typeof item === 'object') item._image = this.getImage(item);

                        this.data.push(item)
                    
                    })

                    console.error('DATA :', this.data)                    
                    
                }, (error) => {

                    this.isFetching = false
                    
                    throw error
                    
                });

      }, 500)


  }

}
</script>


<!--
-->