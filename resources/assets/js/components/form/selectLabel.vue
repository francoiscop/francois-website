<template>
   <div v-if="options !== null" :style="(marginStyle !== null) ? 'margin:' + marginStyle : ''">
      <div style="display: flex;justify-content: space-between;">
         <div style="display: flex;align-items: center;height:38px;" :style="'width: ' + this.width + '%'">
            <label :class="{'has-text-danger' : errorMutable.status}" v-text="(width > 0) ? removeUnderscore(label) : ''" style="text-transform: capitalize;"></label>
         </div>
         <div :style="'width: ' + (100 - this.widthComputed) + '%'">
            <vv-select :label="keyEnum" :options="options" :placeholder="removeUnderscore(placeholder)" :value="value" @input="change($event)" :error-class="errorMutable.status" :style="(widthStyle !== null) ? 'width:' + widthStyle : ''">
            </vv-select>
         </div>
      </div>
      <div v-if="errorMutable.status" style="font-size: 0.8rem;" :style="'padding-left:' + (+this.widthComputed + 1) + '%'" v-text="errorMutable.label" class="has-text-danger"></div>
   </div>
</template>

<script>
import selectComponent from '../form/select.vue'
import {formControlMix} from './mixins/formControlMix.js';

export default {
    components : {'vv-select' : selectComponent},
    mixins : [formControlMix],
    props : {
        label : {
            type: String,
            default: null
        },
        placeholderProp : {
            type: String,
            default: null
        },
        keyEnum :{
            type: String,
            default: 'null'
        },
        width : {
            type: Number,
            default: 18
        },
        options: {
            /*
            type: Array,
            default(){
                return []
            }
            */
        },
        value : {
            type: String,
            default: ''
        },
        trigger : {
            type: Boolean,
            default: false
        },
        widthStyle : {
            type: String,
            default: null
        },
        marginStyle : {
            type: String,
            default: null
        }
    },

    data(){
        return{
            input: ''
        }
    },

    computed : {
        placeholder(){
            if (!this.label && this.placeholderProp !== 'null') return this.placeholderProp;
            return this.label.charAt(0).toUpperCase() + this.label.slice(1);
        },
        widthComputed(){
            return (this.label === '') ? 0 : this.width;
        }
    },

    methods : {
        change(val){
            this.input = val;
            this.$emit('change', val);
            if (this.trigger) this.$emit('trigger', val)
        },
    },
}
</script>