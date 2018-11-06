<template>
    <div>
   <div style="display: flex;justify-content: space-between;">

        <div v-if="label !== ''" :style="'width: ' + this.width + '%'">
                <label :class="{'has-text-danger' : errorMutable.status}" v-text="labelComputed" style="text-transform: capitalize;">
                </label>
        </div>

        <div class="flex flex-warp" :class="{'flex-column' : isVertical}" :style="'width: ' + (100 - this.widthComputed) + '%'">

            <b-checkbox v-for="(checkbox, index) in values" :key="index"
                class="m-b-5"
                :class="{'m-l-0' : isVertical}"
                v-model="input"
                :native-value="checkbox"
                type="is-info"
            >
                {{checkbox}}
            </b-checkbox>

        </div>

   </div>

   <div v-if="errorMutable.status" style="font-size: 0.8rem;" :style="'padding-left:' + (+this.widthComputed + 1) + '%'" v-text="errorMutable.label" class="has-text-danger">
   </div>

   </div>
</template>

<script>

import {formControlMix} from './mixins/formControlMix.js';

//import debounce from 'lodash/debounce'


export default {
    mixins: [formControlMix],
    props: {
        values: {
            type: Array,
            default(){
                return []
            }
        },

        value: {
            type: Array,
            default(){
                return []
            }
        },

        isVertical: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {

            input: (typeof this.value === 'undefined' || this.value === null) ? [] : this.value

        }
    },

    watch: {

        input(val){

            if (val.length > 0) this.clearError();

            //console.warn('checkbox input : ', val)
            
            //this.$emit('change', val)
        }
        
    },
    
    methods: {

        
    }
}
</script>