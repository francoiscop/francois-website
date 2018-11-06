<template>
	<div class="wrapper-items-search">
    	
    	<div :style="'width:' + width + 'px'">
        	<b-autocomplete
                v-model="name"
                :data="data"
                :placeholder="placeholder"
                field="username"
                :loading="isFetching"
                @input="getAsyncData"
                @select="(option) => {selected = option}">

                <template slot-scope="props">
                    <div class="media">
                        <div class="media-left">
                            <img width="32" :src="props.option.poster">
                        </div>
                        <div class="media-content" style="text-transform:capitalize">
                            {{ props.option.title }}
                            <br>
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
        </div>
    	
    	<vs-item v-if="selected" :item="selected" class="m-t-10"></vs-item>
  
  	</div>	
</template>

<style>
.wrapper-items-search > div{

	margin: 0 auto;

}
</style>

<script>
import debounce from 'lodash.debounce'

export default{

	props : {

		type : {
          type : String,
          default : null
       	},

       	userId : {
          type : String,
          default: null
        },

        width:{
        	type: Number,
        	default: 300
        }

  	},

  	data(){
  		return{
  			data: [],
            name: '',
            selected: null,
            isFetching: false,
            placeholderxx:''
  		}
  	},

  	computed:{

  		placeholder(){

  			if (this.type === 'friend') return 'Search friends: ' + this.userId;
      		if (this.type === 'video') return 'Search film';
      		return 'Search ' + this.type;
  		},

  		url(){

  			let url = (this.type === 'member') ? '/rest/search/user' : '/rest/search/' + this.type;
      		if (this.type === 'friend') return url + '/' + this.userId; 
      		return url;
  		}

  	},

  	methods:{

  		getPoster(obj){
            if (obj.hasOwnProperty('avatar')) return obj.avatar;
            if (obj.hasOwnProperty('poster')) return obj.poster;
            if (obj.hasOwnProperty('image')) return obj.image;
    	}, 

    	getTitle(obj){
            if (obj.hasOwnProperty('username')) return obj.username;
            if (obj.hasOwnProperty('title')) return obj.title;
    	},

  		getAsyncData: debounce(function () {
                
                this.data = []
                this.isFetching = true

                axios.get(this.url + '?q=' + this.name).then((response) => {

                    var arr = response.data.result;

                    for (var i = 0, len = arr.length; i < len; i++) {
                        arr[i].poster = this.getPoster(arr[i]);
                        arr[i].title = this.getTitle(arr[i]);
                        if (arr[i].hasOwnProperty('watch')) arr[i].info = arr[i].link;
                        this.data.push(arr[i])
                    }
                    
                    this.isFetching = false
                    
                }, (error) => {

                    this.isFetching = false
                    throw error
                    
                });

        }, 500)
        
    	
  	}
}
</script>