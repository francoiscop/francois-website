<template>

  <span @mouseleave="mouseOutBox">
    <span class="material-icons"
      v-for="index in 5"
      :style="fontsize"
      :class="{'pointer' : !hasRated, 'has-text-grey' : hasRated}"
      @click="post(index)"
      @mouseover="mouseOver(index)"
      @mouseout="mouseOut(index)"
    >{{ icons[index] }}</span>

    <error :error="error" />
  </span>
  
</template>

<script>
import {mixError} from './mixins/mixError.js';

export default {

    mixins : [mixError],
    props:{

        isAjax: {
          type: Boolean,
          default: false
        },

        id:{
          type: Number,
          default: 0,
        },
        
        parentClass:{
          type: String,
          default: null,
        },
    
        rating:{
          default: 0
        },
    
        size:{
          type: Number,
          default: 1
        },
    
        static : {
          type: Boolean,
          default: false
        }
    },
  
  data(){
    return{
      //iconsC : [],
      icons: [],
      ratingMutated : this.rating,
      hasRated : this.static,
      fontsize : 'font-size:' + this.size + 'rem'
    }
  },
  
  mounted(){
    this.init();
  },

  methods: {

    init(){

        for (let i = 1; i <= 5; i++){

            if (this.ratingMutated - i >= 0) this.$set(this.icons, i, 'star');
            else if (this.ratingMutated - i > -1) this.$set(this.icons, i, 'star_half');
            else this.$set(this.icons, i, 'star_border');

        }
    },

    mouseOver(index){
      
      if (this.hasRated) return;

      for (let i = 1; i <= index; i++){
          
          this.$set(this.icons, i, 'star');
      
      }      
    },

    mouseOut(index){
      
      if (this.hasRated) return;

      for (let i = index; i <= 5; i++){
        
        this.$set(this.icons, i, 'star_border');
      
      }
    },

    mouseOutBox(){
      
      if (this.hasRated) return;
      
      this.init();
    
    },

    post(index){

        this.$emit('rated', index)

        if (!this.isAjax){
            
            this.ratingMutated = index;
  
            return;
        }

        console.error('RATING :', index);
        console.error('parentClass', this.parentClass);
        console.error('ID', this.id);

        axios.post('/rest/rating/' + this.parentClass + '/' + this.id, {rating : index}).then((response)  =>  {
              
              this.ratingMutated = response.data.rating;
              this.init();
              //this.getIcons();
              this.hasRated = true;
        
        }, (error)  =>  {
              
              this.setError(error);
              this.hasRated = true;
        
        })
    },


/*
    init(){

      for (let i = 1; i <= 5; i++){

        if (this.ratingMuated - i >= 0){
          
          this.iconsC[i] = 'star';
          this.icons[i] = 'star';
        }
        else if (this.ratingMutated - i > -1){
          
          this.iconsC[i] = 'star_half';
          this.icons[i] = 'star_half';
        }
        else {
          
          this.iconsC[i] = 'star_border';
          this.icons[i] = 'star_border';
        }

      }

    },

    getIcon(index, override){

      if (typeof override === 'undefined'){
        if (this.ratingMutated - index >= 0) return 'star';
        if (this.ratingMutated - index > -1) return 'star_half';
        return 'star_border';
      }


    },

    mouseOver(index){
      if (this.hasRated) return;
      
      for(let i = 1; i <= index; i++){
        this.$set(this.icons, i, 'star');
      }
    },

    mouseOut(index){
      if (this.hasRated) return;
      
      for(let i = 1; i <= index; i++){
        this.$set(this.icons, i, this.iconsC[i]);
      }
    
    },

    mouseOutBox(){
      if (this.hasRated) return;
      
      console.warn('LEAVE!!!!');
    
    },

    post(index){

      if (!this.isAjax){
            this.ratingMutated = index;
            for(let i = 1; i <= index; i++){
              this.$set(this.iconsC, i, 'star');
              this.$set(this.icons, i, 'star');
            }
            for(let i = index + 1; i <= 5; i++){
              this.$set(this.iconsC, i, 'star_border');
              this.$set(this.icons, i, 'star_border');
            }
            this.$emit('vote', index);
            return;
      }

      return;
      
      if (this.ratingHidden){
            this.ratingMutaed = index;
            //this.iconsC = ['star_border','star_border','star_border','star_border','star_border', 'star_border'];
            for(let i = 1; i <= index; i++){
              this.$set(this.iconsC, i, 'star');
              this.$set(this.icons, i, 'star');
            }
            for(let i = index + 1; i <= 5; i++){
              this.$set(this.iconsC, i, 'star_border');
              this.$set(this.icons, i, 'star_border');
            }
            this.$emit('vote', index);
            return;
      }
      
      if (this.hasRated) return;
      
      axios.post('/rest/rating/' + this.parentClass + '/' + this.id, {rating : index})
      .then((response)  =>  {
              this.rating = response.data.rating;
              this.getIcons();
              this.hasRated = true;
      }, (error)  =>  {
              this.setError(error);
              this.hasRated = true;
      })

    }
    */
  }


}
</script>