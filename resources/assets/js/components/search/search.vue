<template>
  <div class="search flex flex-center flex-warp flex-grow">

      <v-select v-if="select.name === 'select' || (!isInput && !isTags)" v-for="(select, index) in search.select"
          :key="index"
          :options="select.values"
          :value="select.value"
          :width="select.width"
          :close="select.close"
          :ref="select.name"
          :has-border-right="hasBorderRight"
          @change="onSelect($event, select.name, index)"
          @reset="onResetSelect(select.name)"
          left
      />

      <b-autocomplete class="flex-grow"
                v-if="isInput && !isTags"
                v-model="name"
                :data="data"
                :placeholder="'search'"
                field="username"
                :loading="isFetching"
                @input="getAsyncData"
                @select="(option) => { onInputSelected(option) }"
      >

                <template slot-scope="props">
                    <div class="media">
                        <div class="media-left">
                            <!--
                              <img class="is-img-w-100" :src="props.option.poster || props.option.avatar || props.option.image[0]">-->
                            <img style="height:80px" :src="props.option._image">
                        </div>
                        <div class="media-content" style="text-transform:capitalize">
                            <div class="s-10">{{ props.option.title || props.option.username }}</div>
                            <small v-if="props.option.hasOwnProperty('gender')">
                                {{ props.option.gender }} {{ props.option.age }}y
                            </small>

                            <small v-if="props.option.hasOwnProperty('info')">
                                <a :href="props.option.info">Infos</a>
                            </small>
                        </div>
                    </div>
                </template>
      </b-autocomplete>

      <b-taginput class="flex-grow taginput--bgcolor"
                    v-if="isTags && !isInput"
                    type="is-warning"
                    v-model="tags"
                    
                    :data="data"
                    :allow-new="false"
                    autocomplete
                    field="name"
                    icon="label"
                    placeholder="tag..."
                    :loading="isFetching"
                    :before-adding="beforeAdding"
                    @typing="getAsyncData"
                   >

                        <template slot-scope="props">
                            <!--<strong>{{props.option.id}}</strong>: {{props.option.name}}-->
                            <!--{{props.option[keyProp]}}-->
                            {{props.option}}
                        </template>
                        <template slot="empty">
                            There are no items
                        </template>
      </b-taginput>

      <div class="button has-background-custom-3 is-submit" @click="submit">Search</div>
  
  </div>
</template>

<style>
.search {
    max-width: 800px;
}

.search .button.is-submit {
  border-radius:0;
  border-left:0
}

.dropdown-menu {

    z-index: 50!important;

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



input:focus {
  
  -webkit-box-shadow: none;
  box-shadow: none !important;
   outline:none;

   border-color: hsl(0, 0%, 71%) !important;
}

.autocomplete .dropdown-content {
    overflow: auto;
    max-height: 400px;
}

.taginput--bgcolor .taginput-container{
    /*background-colorxx: rgb(245, 245, 245)!important;*/
    background-color: transparent!important;
}
.button.is-submit{
    border-width: 0;
}
</style>

<script>
import debounce from 'lodash.debounce'

import selectComponent from '../form/selectSimple.vue'

const replaceUrlVideoToFilm = true

export default{

    components : {'v-select' : selectComponent},

    props : {

        search : {
          type : Object,
          default(){
            return{};
          }
        }
    },

    data(){
        return{

            isInput : false,
            isTags : false,
            isFetching : false,

            hasBorderRight : false,

            data : [],
            name : '',
            tags : [],
            keyProp: 'name',

            selected : {},

            q : ''
        }
    },

    created(){

        for (let k in this.search.select){

            var name = this.search.select[k].name

            this.selected[name] = (name === 'tags') ? this.search.select[k].values : this.search.select[k].value
        }

        if (this.search.select[0].name === 'select' && this.__(this.search.select[0].values[0]) === 'tags'){

            this.isTags = true;

            this.hasBorderRight = true;
        }

        this.tags = []

        for (let k in this.search.select){

              if (this.search.select[k].name === 'tags') this.tags = this.search.select[k].values;
        }

    },

    computed: {

        urlAjax(){

            return '/rest/search/' + this.search.type.replace(/s$/, '')
        }
    },

    watch: {

        isTags(val){

            if (val) setTimeout(() => this.iconTagsFix(), 10);

        }

    },

    methods: {

        onInputSelected(option){

            this.q = option.username || option[this.selected.select]

            this.submit()
        
        },

        onSelect(val, name, index){

            val = this.__(val)

            if ( name === 'select' && ['title', 'name'].indexOf(val) > -1 ) this.isInput = true;

            else this.isInput = false;

            if ( name === 'select' && ['tags'].indexOf(val) > -1 ){

                this.isTags = true;

                this.hasBorderRight = true;
            }

            else {

                this.isTags = false;

                this.hasBorderRight = false;
            }

            this.selected[name] = val;

        },

        onResetSelect(name){

            this.selected[name] = ''
        },

        submit(){

            //var page = url.match(/page\/\d+/)
            //console.warn(url.replace(/page\/\d+/, 'page/1'))

            var _url = window.location.origin

            if (this.isInput){

                console.warn('q ::', this.q)

                if (this.q.length < 1) return;

                _url +=  '/search/' + this.search.type + '?q=' + this.q

                window.location = _url

                return

            }

            _url += '/' + this.search.type

            var routes = ''

            var query = ''

            for (let k in this.selected){


                if (['gender', 'country', 'category'].indexOf(k) > -1 && this.selected[k] !== '') routes += '/' + this.selected[k];

                if (['order', 'tags'].indexOf(k) > -1){

                    if (k === 'order' && this.selected[k] !== '') query += '?order=' + this.__(this.selected[k]);

                    if (k === 'tags' && this.selected[k].length > 0) query += '?tags=' + this.selected[k].join(',');

                }

            }

            _url += routes + '/page/1' + query

            if (replaceUrlVideoToFilm) _url = _url.replace(/video/gi, 'film');

            window.location = _url

        },

        beforeAdding(tag){

          return true;

          console.log(tag.id)
          console.log(tag.name)


            if (this.selected.tags.indexOf(tag.name) > -1){
                
                console.error('SAME NAME !')
                
                return false
            }

            //this.selected.tags.push(tag.name)

            console.error('TAGS :::', this.tags)

            console.error(' THIS SELECTED TAGS :::', this.selected.tags)

            return true
        },

        __(str){

          return str.toLowerCase().replace('order by', '').replace('by','').trim()
                  
        },

        iconTagsFix(){
          
            var c = document.querySelectorAll("i.mdi.mdi-label")

            if (typeof c === 'undefined' || c.length === 0) return;

            c[0].className = "material-icons"
            
            c[0].innerHTML = 'label'
        },

        getImage(obj){
            
            if (obj.hasOwnProperty('avatar')) return obj.avatar;
            
            if (obj.hasOwnProperty('poster')) return obj.poster;
            
            if (obj.hasOwnProperty('image') && typeof obj.image === 'string' && this.isJson(obj.image)){
              
                var imgs = JSON.parse(obj.image)
                
                return imgs[0]
            }
            
            if (obj.hasOwnProperty('image') && typeof obj.image === 'string') return obj.image;
            
            if (obj.hasOwnProperty('image') && Object.prototype.toString.call(obj.image) === '[object Array]') return obj.image[0].src;
        }, 


        isJson(item) {
          
            item = typeof item !== "string" ? JSON.stringify(item) : item;

            try {
              item = JSON.parse(item);
            } catch (e) {
              return false;
            }

            if (typeof item === "object" && item !== null) return true;

            return false;

        },

        getAsyncData: debounce(function (text) {

                if (!this.isTags && !this.isInput) return;

                if (typeof text === 'undefined') return

                if (text.length < 1){

                    this.isFetching = false

                    return
                }
                
                this.data = []
                
                this.isFetching = true

                let search = (this.isTags) ? 'tags' : this.selected.select;

                axios.get(this.urlAjax + '?' + search + '=' + text).then((response) => {

                    var response = response.data.result

                    if (search !== 'tags'){

                          response = response.map(obj => {

                                obj._image = this.getImage(obj)

                                return obj
                          })
                    }

                    this.data = response.map(val => { return val })

                    //console.error(search)

                    //console.error('DATA :', this.data)

                    //console.error('TAGS :', this.tags)
                    
                    this.isFetching = false
                    
                }, (error) => {

                    this.isFetching = false
                    
                    throw error
                    
                });

        }, 500)

    }
}
</script>