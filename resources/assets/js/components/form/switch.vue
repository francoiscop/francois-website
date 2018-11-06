<template>
    <div>
     <b-switch :value="value" @input="input = $event" :size="size">
        <span :class="{'has-text-danger' : errorMutable.status}">{{ nameComputed }}</span>
     </b-switch>
     <div v-if="errorMutable.status" style="font-size: 0.8rem;" v-text="errorMutable.label" class="has-text-danger">
         
     </div>
    </div>
</template>

<script>
import {formControlMix} from './mixins/formControlMix.js';

export default {

    mixins: [formControlMix],

    props: {

        value : {
            type: Boolean,
            default: false
        },

        label : {
            type: String,
            default: ''
        },

        name : {
            type: String,
            default: ''
        },

        size : {
            type: String,
            default: ''
        },

        trigger : {
            type: Boolean,
            default: false
        },
    },

    data(){
        return{
            //input : this.vmodel,
            input : this.value,
        }
    },

    
    watch: {
        input(val){
            //this.input = val;
            this.$emit('change', val)
            this.clearError()
            if (this.trigger) this.$emit('trigger', val)
        },

    },
    
    computed: {
        nameComputed(){
            return this.name.replace('_', ' ');
        }  
    },

}
</script>