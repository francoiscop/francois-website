<template>
   <div>

    <slot name="tags" />
    
        <div style="display: flex;justify-content: space-between;">
            
            <div v-if="label !== ''" style="display: flex;align-items: center;height:38px;" :style="'width: ' + this.width + '%'">
                <label :class="{'has-text-danger' : errorMutable.status}" v-text="removeUnderscore(label)" style="text-transform: capitalize;">
                </label>
            </div>

            <div style="position:relative;" :style="'width: ' + (100 - this.widthComputed) + '%'">

                <b-taginput
                    type="is-warning"
                    v-model="tags"
                    :value="values"
                    :data="data"
                    :allow-new="allowNew"
                    autocomplete
                    field="name"
                    icon="label"
                    :placeholder="placeholderComputed"
                    :loading="isFetching"
                    :before-adding="beforeAdding"
                    @typing="getAsyncData"
                    @add="addTag"
                    @remove="removeTag"
                   >

                        <template slot-scope="props">
                            <!--<strong>{{props.option.id}}</strong>: {{props.option.name}}-->
                            {{props.option}}
                        </template>
                        <template slot="empty">
                            No items found
                            <span v-if="allowNew" class="m-l-5">press ENTER to create a new one</span>
                        </template>
                </b-taginput>
            
            </div>
      
      </div>
      <div v-if="errorMutable.status" style="font-size: 0.8rem;" :style="'padding-left:' + (+this.widthComputed + 1) + '%'" v-text="errorMutable.label" class="has-text-danger">
      </div>

      <div v-if="helper !== null" class="c s-8 has-text-grey" :style="'padding-left:' + (+this.widthComputed + 1) + '%'" v-text="helper">
      </div>

   </div>
</template>

<style>
.taginput .taginput-container.is-focusable{

    border-width: 0px!important;
    background: transparent!important;

}
</style>

<script>

import {formControlMix} from './mixins/formControlMix.js';

import debounce from 'lodash/debounce'


export default {
    mixins: [formControlMix],
    props: {
        tags: {
            type: Array,
            default(){
                return []
            }
        },
        allowNew: {
            type: Boolean,
            default: false
        },
        keyProp: {
            type: String,
            default: 'name'
        },
        url: {
            type: String,
            default: ''
        },
        placeholder: {},
        isArray: {
            type: Boolean,
            default: false
        },
        helper: {
            type: String,
            default: null
        }
    },

    mounted(){

        this.values = this.temp = (this.tags !== null) ? this.tags : [];

    },

    computed: {

        isArrayComputed(){
            return (typeof this.isArray === 'undefined' || this.isArray === null) ? false : this.isArray;
        },

        placeholderComputed(){
            if (this.placeholder === null) return 'Add a ' + this.removeUnderscore(this.label.replace(/s+$/g,''));
            if (!this.placeholder) return '';
            return this.removeUnderscore(this.placeholder);
        }
    },



    data() {
        return {

            values : [],
            data: [],
            temp : [],

            filteredTags: this.tags,
            isSelectOnly: false,
            isFetching: false,
            input: this.tags,
            badTags: [],
        }
    },

    watch: {
        
        tags(val){
            this.input = val;
            this.$emit('change', val);
        }
    
    },
    
    methods: {

        beforeAdding(tag){

            for (let k=0; k < this.values.length; k++ ){

                if (tag.id && tag.id == this.values[k].id){
                    //console.error('SAME ID');
                    return false;
                }

                if (!tag.id && tag == this.values[k].name){
                    //console.error('SAME NAME');
                    return false;
                }
            }

            var name = (Object.prototype.toString.call(tag) === '[object Object]' && tag.hasOwnProperty('name')) ? tag.name : tag;

            if (!/^[a-z\d\-_\s]+$/i.test(name)){
                
                this.badTags.push(name);
                
                this.setError(this.removeUnderscore(this.label) + ' not alphanumeric!');

                setTimeout(() => {
                    
                    this.clearError();
                
                }, 3000)
                
                return false;
            }

            return true;
        },

        getAsyncData: debounce(function (text) {

            if (text.length < 1 || this.url === null) return;
            
            this.isFetching = true;
            
            axios.get('/rest/' + this.url + '?q=' + text).then((response) => {
                
                this.isFetching = false;

                var response = response.data.result

                this.data = response.map(val => { return val })
            
            }, (error) => {

                this.isFetching = false
                    
                throw error
                    
            });
        
        }, 500),




        addTag(value){

            let name = ''

            if (typeof value === 'string'){

                name = value.replace(/\s+/g, '-').toLowerCase()

            //} else if (!value.hasOwnProperty('id')){
            } else {

                name = value.name.replace(/\s+/g, '-').toLowerCase()

            }

            var obj = (!this.isArrayComputed) ? {id : null, name : name} : name;

            this.values.pop();

            this.values.push(obj);

            this.clearError();

        },

        removeTag(value){

            var index = this.badTags.indexOf(value.name);
            
            if (index > -1) this.badTags.splice(index);
            
            if (this.badTags.length === 0) this.clearError();

        },
    }
}
</script>