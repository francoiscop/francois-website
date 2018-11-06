<template>
    <div>
    <div style="display: flex;justify-content: space-between;">
        <div style="display: flex;align-items: center;height:38px;" :style="'width: ' + this.width + '%'">
            <label :class="{'has-text-danger' : errorMutable.status}">Gender</label>
        </div>
        <div :style="'width: ' + (100 - this.widthComputed - 1) + '%'">
            <div class="block" style="margin:0;height: 38px;display: flex;align-items: center;">
            <b-radio v-model="radio"
                native-value="f" :type="'is-info'">
                Female
            </b-radio>
            <b-radio v-model="radio"
                native-value="m">
                Male
            </b-radio>
            <b-radio v-model="radio"
                native-value="t">
                Transgender
            </b-radio>
            </div>
        </div>
    </div>
    <div v-show="errorMutable.status" style="font-size: 0.8rem;" :style="'padding-left:' + (+this.widthComputed + 1) + '%'" class="has-text-danger" v-text="errorMutable.label">
    </div>
    </div>
</template>

<script>
//import {formControlMix} from '../form/formControlMix.js';
import {formControlMix} from './mixins/formControlMix.js';

export default {
   mixins : [formControlMix],
    data(){
        return{
            radio : (this.value !== null && ['f','m','t'].indexOf(this.value) > -1) ? this.value : null
        }
    },
    computed: {
        input(){
            return this.radio;
        }
    },
    watch: {
        radio(val){
            if (val !== null) this.clearError();
        }
    }
}
</script>