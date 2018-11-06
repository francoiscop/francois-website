<template>
   <div>
      <div style="display: flex;justify-content: space-between;">
         <div v-if="label !== ''" style="display: flex;align-items: center;height:38px;" :style="'width: ' + this.width + '%'">
            <label :class="{'has-text-danger' : errorMutable.status}" v-text="labelComputed" style="text-transform: capitalize;"></label>
         </div>
         <div style="position:relative;" :style="'width: ' + (100 - this.widthComputed) + '%'">
            <div class="hidden-textarea" ref="hiddenHeight">{{ input }}</div>
            <textarea class="custom-textarea" v-model="input" :style="'height:' + height + 'px'" :placeholder="placeholder" @keyup="setHeight">{{ value }}</textarea>
         </div>
      </div>
      <div v-if="errorMutable.status" style="font-size: 0.8rem;" :style="'padding-left:' + (+this.widthComputed + 1) + '%'" v-text="errorMutable.label" class="has-text-danger">
      </div>
   </div>
</template>

<script>
import {formControlMix} from './mixins/formControlMix.js';

export default {
    mixins : [formControlMix],
    props: {
        value : {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        }
    },

    data(){
        return{
            input: this.value,
            height : null,
        }
    },

    mounted(){
        setTimeout(()=>{
            this.height = this.$refs.hiddenHeight.clientHeight;
        }, 200);
    },
    
    watch: {

        input(val) {
            
            this.$emit('change', val);
            this.clearError();
        }
    },
    
    methods: {

        setHeight(){
            this.height = this.$refs.hiddenHeight.clientHeight;
        }

    }
}
</script>