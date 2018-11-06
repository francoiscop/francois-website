<template>

   <div class="c-input-wrap">

      <div class="c-input-group  c-input-group--text-field" :class="classesInput">
         
         <label v-text="labelComputed" :class="{'has-text-link' : isFocused, 'has-text-danger' : errorMutable.status}" style="text-transform:capitalize"></label>
         
         <div class="c-input-group__input">
            <i v-if="icon !== null" aria-hidden="true" class="icon material-icons c-input-group__prepend-icon" :class="{'has-text-link' : isFocused, 'has-text-danger' : errorMutable.status}" v-text="icon"></i>

            <input :name="label" tabindex="0" aria-label="Hint Text" :type="typeComputed" @click="clickInput" v-click-outside="clickOutsideInput" v-model="input" :class="{'has-text-danger' : errorMutable.status}" :style="getOpacity" autocomplete="nope" :disabled="disabled">
            
            <i v-if="iconRight !== null" aria-hidden="true" class="pointer icon material-icons c-input-group__append-icon" v-text="iconRight" style="font-size: 0.8rem;"></i>
         </div>
         <div class="c-input-group__details">
            <div class="c-input-group__messages c-input-group__error" :class="{'has-text-danger' : errorMutable.status}" v-text="helperComputed"></div>
            <div v-if="isCounter" class="c-input-group__counter c-input-group__counter--error" v-text="counterComputed" :class="{'has-text-danger' : (input.length > 0 && (isMaxLength || !isMinLength))}"></div>
         </div>
      </div>
   
   </div>

</template>

<style>
.w-150{
    width: 150px;
}
</style>

<script>
    import {formControlMix} from './mixins/formControlMix.js';

    export default {
        mixins: [formControlMix],
        props: {
            name: {
                type: String,
                default: null
            },
            value: {
                default: '',
            },
            rules: {
                type: Array,
                default () {
                    return []
                }
            },
            max: {
                type: Number,
                default: null
            },
            min: {
                type: Number,
                default: null
            },
            icon: {
                type: String,
                default: null
            },
            iconRight: {
                type: String,
                default: null
            },
            type: {
                type: String,
                default: 'text'
            },
            helper: {
                type: String,
                default: null
            },
            disabled: {
                type: Boolean,
                default: false
            },
            
        },
        data() {
            return {

                //isFocused: (this.form.select === null || this.form.select.length === 0) ? false : true,
                isFocused: (this.value === null || this.value.length === 0) ? false : true,
                focusFirst : false,
                //input: (this.form.select === null) ? '' : this.form.select,
                input: (this.value !== null) ? this.value : '',
                isErrorClass: false,
                errorMessage: '',
                errorBases: {
                    'alphanumeric': 'Not alphanumeric',
                    'email': 'invalid email',
                    'match': 'Password doesn\'t match',
                    'integer' : 'value is not a number'
                },
            }
        },

        mounted(){
            if (!this.value || this.value === null || this.value.length === 0) this.preventAutofill();
        },
        
        computed:{

            typeComputed(){

                if (this.type === 'int') return 'number';

                return this.type

            },
            
            classesInput() {
                return {
                    'c-input-group--focused': this.isFocused,
                    'c-input-group--error': this.isErrorClass,
                    'c-input-group--prepend-icon': (this.icon !== null) ? true : false,
                    'c-input-group--append-icon': (this.iconRight !== null) ? true : false,
                    'w-150': (this.type === 'int') ? true : false
                }
            },
            labelComputed(){

                return this.label.replace('_', ' ');

            },
            //nameComputed() {
              //  return (this.name !== null) ? this.name : this.label.toLowerCase();
            //},
            getOpacity() {
                var opacity = 'opacity : ';
                return (this.isFocused) ? opacity + 1 : opacity + 0;
            },
            counterComputed() {
                if (this.type === 'number') return;
                var length = (typeof this.input === 'number') ? this.input.toString().length : this.input.length; 
                if (this.max === null) return length;
                return length + '/' + this.max;
            },
            isCounter() {
                return ((typeof this.max === 'number' && this.max > 0) || (typeof this.min === 'number' && this.min > 0)) ? true : false;
            },
            isMaxLength() {
                if (this.max === null) return false;
                if (this.type === 'number'){
                    return (this.input > this.max);
                }
                return (this.input.length > this.max);
            },
            isMinLength() {
                if (this.min === null) return true;
                return (this.input.length >= this.min);
            },
            helperComputed() {
                if (this.errorMutable.status) return this.errorMutable.label;
                if (this.helper !== null && (this.input.length === 0 || this.type === 'int')) return this.helper;
                if (this.required && this.input.length === 0) return 'Required field';
                return '';
            }
        },
        watch: {

            input(val) {
                this.$emit('change', val);

                if (val === null || val === '') {
                    this.clearError();
                    return;
                }

                if (this.type === 'int' && this.max !== null){
                    //if (val.length > this.max) this.input = val.substring(0,2);
                    if (val > this.max) this.input = this.max;
                }

                if (this.type === 'int' && val < 0){
                    this.input = '';
                }

                var valid = true;
                //legnth ? 
                if (this.isCounter) {
                    if (this.isMaxLength) {
                        
                        this.setError((this.type !== 'number') ? 'maximun characters: ' + this.max : 'max: ' + this.max);
                        valid = false;
                    }
                    if (!this.isMinLength) {

                        if (this.type === 'int') return;
                        
                        this.setError('minimum characters: ' + this.min);
                        
                        valid = false;
                    }
                }

                if (this.rules.length > 0) {
                    var k;
                    for (k in this.rules) {
                        var _func = this.getFunction(this.rules[k]);
                        var func = _func.func;
                        var param = _func.param;
                        if (!this[func](param)) {
                            valid = false;
                            this.setError(this.errorBases[_func.mess]);
                        }
                    }
                }

                if (valid) {
                    this.clearError();
                }
            }

        },
        methods: {

            preventAutofill(){

                
                var i = document.getElementsByName(this.label)[0]

                i.addEventListener("focus", () => {
                    
                    setTimeout(() => {
                        
                        if (this.focusFirst) return

                        this.input = ''

                        this.focusFirst = true
                    
                    }, 10)
                })
            },

            isAlphanumeric() {
                if (this.input.length === 0) return true;
                return /^[a-z\d\-_\s]+$/i.test(this.input);
            },
            isEmail() {
                if (this.input.length === 0) return true;
                var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return regex.test(String(this.input).toLowerCase());
            },
            isMatch(param) {
                if (this.input.length === 0) return true;
                if (document.getElementsByName(param)[0] === null || typeof document.getElementsByName(param)[0] === 'undefined') return true;

                var password = document.getElementsByName(param)[0].value;
                if (password.length === 0 || password === this.input) {
                    //clear error:
                    this.$parent.$refs[param][0].clearError();
                    return true;
                }
                return false;
            },
            isInteger(){
                return this.input == parseInt(this.input);
            },
            getFunction(f) {
                var temp = f.split(':');
                var func = 'is' + temp[0].charAt(0).toUpperCase() + temp[0].slice(1);
                var param = (temp.length > 1) ? temp[1] : null;
                return {
                    func: func,
                    param: param,
                    mess: temp[0]
                };
            },
            clickInput() {
                this.isFocused = true;
            },
            clickOutsideInput() {
                if (this.input.length === 0) this.isFocused = false;
            }
        },
        directives: {
            'click-outside': {
                bind: function(el, binding, vNode) {
                    // Provided expression must evaluate to a function.
                    if (typeof binding.value !== 'function') {
                        const compName = vNode.context.name
                        let warn = `[Vue-click-outside:] provided expression '${binding.expression}' is not a function, but has to be`
                        if (compName) {
                            warn += `Found in component '${compName}'`
                        }

                        console.warn(warn)
                    }
                    // Define Handler and cache it on the element
                    const bubble = binding.modifiers.bubble
                    const handler = (e) => {
                        if (bubble || (!el.contains(e.target) && el !== e.target)) {
                            binding.value(e)
                        }
                    }
                    el.__vueClickOutside__ = handler

                    // add Event Listeners
                    document.addEventListener('click', handler)
                },

                unbind: function(el, binding) {
                    // Remove Event Listeners
                    document.removeEventListener('click', el.__vueClickOutside__)
                    el.__vueClickOutside__ = null

                }
            }
        }
    }
</script>