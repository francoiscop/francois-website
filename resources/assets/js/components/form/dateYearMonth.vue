<template>
   <div>
      <div style="display: flex;justify-content: space-between;">
         <div style="display: flex;align-items: center;height:38px;"  :style="'width: ' + this.width + '%'">
            <label :class="{'has-text-danger' : errorMutable.status}">Date</label>
         </div>
            <vv-select
                :options="dob.years"
                placeholder="Year"
                :width="Math.round((100 - this.widthComputed)/2)"
                ref="year"
                @input="change($event, 'year')"
                :value="year"
                :error-class="errorMutable.status"
            ></vv-select>
            <vv-select
                :options="dob.months"
                placeholder="Month"
                :width="Math.round((100 - this.widthComputed)/2)-1"
                ref="month"
                @input="change($event, 'month')"
                :value="month"
                :error-class="errorMutable.status"
            ></vv-select>
      </div>
      <div v-if="errorMutable.status" style="font-size: 0.8rem;" :style="'padding-left:' + (+this.widthComputed + 1) + '%'" v-text="errorMutable.label" class="has-text-danger">
          
      </div>
   </div>
</template>

<script>
import selectComponent from '../form/select.vue';

import {formControlMix} from './mixins/formControlMix.js';

export default {
    components : {'vv-select' : selectComponent},
    mixins: [formControlMix],
    props: {
        data : {
            type: Object,
            default(){
                return{}
            }
        }
    },

    data() {
        return {
            dob: {
                years: this.data.year,
                months:this.data.month,
            },
            selected: {
                year: (typeof this.year === 'undefined') ? null : this.year,
                month: (typeof this.month === 'undefined') ? null : this.month,
            }
        }
    },

    computed: {
        
        input() {
            
            if (this.selected.year === null) return null;

            if (this.selected.month === null) return this.selected.year;
            
            return this.selected.year + '-' + this.selected.month;
        },
        
        year() {
            if (this.value === null || this.value.length === 0) return null;
            var s = this.value.split('-');
            if (this.dob.years.indexOf(s[0]) === -1) return null;
            return s[0];
        },
        
        month() {
            if (this.value === null || this.value.length === 0) return null;
            var s = this.value.split('-');
            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var label = monthNames[s[1] - 1];
            var value = (s[1].charAt(0) == 0) ? s[1].slice(1) : s[1];
            var month = {
                label: label,
                value: value
            };
            return month;
        }
    },

    methods: {
        setErrorChild() {
            this.$refs.year.errorMutable = this.errorMutable;
        },
        
        change(val, type) {
            
            this.clearError();
            
            this.setErrorChild();

            if (val === null) return;

            
            this.selected[type] = (type === 'month') ? val.value : parseInt(val);
            
            var k, toCheck = true;
            
            for (k in this.selected) {
                
                if (this.selected[k] === null) toCheck = false;
            
            }

            /*
            if (toCheck && !this.checkDate()) {
                this.setError('AGE < 18 years !');
                console.warn(this.errorMutable)
                this.setErrorChild();
            }
            */
        },

        checkDate() {
            var dob = this.selected.year + '-' + this.selected.month + '-' + this.selected.day;
            var date = new Date(dob);
            var ageDifMs = Date.now() - date.getTime();
            var ageDate = new Date(ageDifMs);
            var valid = Math.abs(ageDate.getUTCFullYear() - 1970) < 18 ? false : true;

            return valid;
        }
    }
}
</script>