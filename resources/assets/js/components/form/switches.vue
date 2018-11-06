<template>
	<div>
	
	<div class="flex" :class="[{'flex-center-x' : isCenter}, {'flex-column': isVertical}]">
       <b-switch v-for="(s, index) in switches"
       		:class="[{'m-r-10' : !isVertical}, {'m-b-5' : isVertical}]"
       		:key="index"
            :value="s.status"
            v-model="s.status"
            :ref="s.ref"
            @input="setSwitch($event, index, s.ref)"
        >{{ s.libel }}</b-switch>
      </div>

    <error :error="errorMutable" />
  	</div>
</template>

<style>
.switch + .switch {
    margin-left: 0em;
}
</style>

<script>
import {formControlMix} from './mixins/formControlMix.js'

export default{

	mixins: [formControlMix],

	props : {
		switches: {
			type: Array,
			defaul(){
				return []
			}
		},

		label : {
            type: String,
            default: ''
        },

		isCenter: {
			type: Boolean,
			default: false
		},

		isVertical: {
			type: Boolean,
			default: false
		}
	},

	data() {

		return {

			input : null

		}
	},

	methods : {

		setSwitch(val, index, ref, field){

            this.$emit('change', {ref : ref, val : val, index : index})

            if (this.switches[index].triggerSubform) this.$emit('trigger', val);

            if (this.switches[index].disableUpload) this.$emit('disableUpload', val);

            if (!val) return;

            this.clearError()

            for (let k in this.switches){

                k = parseInt(k);

                if (k !== index) this.switches[k].status = false;
            }

            this.input = ref

        },
	}

}
</script>