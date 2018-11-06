<template>
    <div>
    <div style="display: flex;justify-content: space-between;">
        <div style="display: flex;align-items: center;height:38px;" :style="'width: ' + this.width + '%'">
            <label :class="{'has-text-danger' : errors.radio.status}" style="text-transform:uppercase;">{{ labelComputed }}</label>
        </div>
        <div :style="'width: ' + (100 - this.widthComputed - 1) + '%'">
            <div class="block" style="margin:0;height: 38px;display: flex;align-items: center;">
            <b-radio
                v-model="datas.radio"
                class="tooltip is-tooltip-warning"
                :data-tooltip="type + ' found on the web (to share)'"
                native-value="web"
                :type="'is-info'">
                From the WEB
            </b-radio>
            <b-radio
                v-model="datas.radio"
                class="tooltip is-tooltip-warning"
                :data-tooltip="type + ' produced by, directed by, or featuring you (to share or to sell)'"
                native-value="personal">
                Made by YOU
            </b-radio>
            </div>
        </div>
    </div>
    <div
        v-show="errors.radio.is"
        style="font-size: 0.8rem;"
        :style="'padding-left:' + (+this.widthComputed + 1) + '%'"
        class="has-text-danger"
        v-text="errors.radio.label">
    </div>

    <div v-if="datas.radio==='personal'" class="notification">
        <vv-input
            label="Price ?"
            :rules="['integer']"
            :max="99"
            icon=""
            ref="price"
            type="number"
            helper="In TOKENS (maximum : 99 tokens)"
            :disabled="!isVerified"
            :class="{'tooltip is-tooltip-warning' : !isVerified}"
            data-tooltip="You need to be a verified member to sell your product"
            @clearError="clearError($event)"
            @setError="setError('price', $event)"
            @change="setValue($event, 'price')"
        ></vv-input>

        <div style="margin-top:40px;">
        <vv-switch
            label="Are you the model ?"
            :vmodel="datas.model"
            ref="model"
            @change="setValue($event, 'model')"
        ></vv-switch>
        <vv-switch
            label="Are you the producer/director ?"
            :vmodel="datas.producer"
            ref="producer"
            @change="setValue($event, 'producer')"
        ></vv-switch>
        <p v-if="errors.model.is" class="has-text-danger is-error">{{ errors.model.label }}</p>
        </div>

        <div style="display:flex;flex-direction:column;margin-top:40px;">
            <b-checkbox v-model="datas.checkbox.age">
                <span style="margin-left:5px" :class="{'has-text-danger' : errors.age.is}">
                    I certify that the model depicted is 18 years of age or older &#42;
                </span>
            </b-checkbox>
            <p v-if="errors.age.is" class="has-text-danger is-error">{{ errors.age.label }}</p>
            <b-checkbox v-model="datas.checkbox.copyrights">
                <span style="margin-left:5px" :class="{'has-text-danger' : errors.copyrights.is}">
                    I certify that I own the copyrights &#42;
                </span>
            </b-checkbox>
            <p v-if="errors.copyrights.is" class="has-text-danger is-error">{{ errors.copyrights.label }}</p>
            <b-checkbox v-model="datas.checkbox.terms">
                <span style="margin-left:5px" :class="{'has-text-danger' : errors.terms.is}">
                    I have read and agreed with our term and conditions &#42;
                </span>
            </b-checkbox>
            <p v-if="errors.terms.is" class="has-text-danger is-error">{{ errors.terms.label }}</p>
        </div>
    </div>
    
    </div>
</template>

<script>
export default {
   props:{
        label: {
            type: String,
            default: ''
        },
        type : {
            type: String,
            default: ''
        },
        isVerified : {
            type: Boolean,
            default : true
        }
   },
    data(){
        return{
            datas : {

                radio : false,
                checkbox : {
                    age:false,
                    copyrights:false,
                    terms:false
                },
                model : false,
                producer : false,
                price : 0,

            },
            
            width: 18,
            
            errors :{
                radio : {
                    is: false,
                    label : null
                },
                age : {
                    is: false,
                    label : null
                },
                copyrights : {
                    is: false,
                    label : null
                },
                terms : {
                    is: false,
                    label : null
                },
                model : {
                    is: false,
                    label : null
                },
                price : {
                    is: false,
                    label : null
                }
            }
        }
    },

    computed: {
        labelComputed(){
            return this.label.replace('_', ' ');
        },
        widthComputed(){
            return (this.label === '') ? 0 : this.width;
        },
    },
    watch: {
        'datas.radio'(val){
            if (val !== null) this.clearError('radio');
            if (val === 'web'){
                for (let k in this.datas.checkbox){
                    this.datas.checkbox[k] = false;
                }
            }
            this.$emit('change', {val : val, ref: 'radio'});
        },
        'datas.checkbox.age'(val){
            this.clearError('age');
            this.$emit('change', {val : val, ref: 'age'});
        },
        'datas.checkbox.copyrights'(val){
            this.clearError('copyrights');
            this.$emit('change', {val : val, ref: 'copyrights'});
        },
        'datas.checkbox.terms'(val){
            this.clearError('terms');
            this.$emit('change', {val : val, ref: 'terms'});
        }
    },
    methods: {
        setValue(val, ref){
            this[ref] = val;
            this.clearError(ref);
            this.$emit('change', {val : val, ref: ref});
        },
        setError(ref, label){
            if (typeof this.errors[ref] === 'undefined') return;
            this.errors[ref].is = true,
            this.errors[ref].label = label;
        },
        clearError(ref){
            if (ref === 'producer') ref = 'model';
            if (typeof this.errors[ref] === 'undefined') return;
            this.errors[ref].is = false,
            this.errors[ref].label = null;
            this.$emit('clearError', ref);
        }
    }
}
</script>