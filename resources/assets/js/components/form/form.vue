<template>
    <div :style="`max-width:${maxWidth}px`" class="elevation-8 center-auto">

        <b-notification type="is-link" :active.sync="isResponseAjax" class="elevation-8" v-text="responseAjax" />

        <form :action="url" method="POST" :id="'form-' + label" v-if="display.form" @submit.prevent="submit">

            <slot />

            <div v-for="(item, field, index) in form" style="margin-bottom:5px;" :class="(field === 'subform') ? '' : 'c-input--' + field">
        
            <vv-input v-if="item.type === 'string' || item.type === 'int' || item.type === 'password'"
                :label="field"
                :value="item.value"
                :error="item.error"
                :required="item.required"
                :rules="item.rules"
                :helper="item.helper"
                :max="item.max"
                :min="item.min"
                :icon="item.icon"
                :ref="field"
                :type="item.type"
                :disabled="item.disabled"
            />

            <vv-textarea v-if="item.type === 'text'"
                :label="field"
                :value="item.value"
                :required="item.required"
                :ref="field"
            />

            <vv-switch v-if="item.type === 'bool'"
                :name="(item.label && item.label.length > 0) ? item.label : field"
                :switch-prop="field + 'Switch'"
                :value="(item.value == 1)"
                :label="field"
                :ref="field"
            />

            <vv-select-label v-if="item.type === 'enum'"
                :label="field"
                :options="item.enum"
                :value="item.value"
                :required="item.required"
                :trigger="item.triggerSubform"
                :width-style="item.widthStyle"
                :margin-style="item.marginStyle"
                :ref="field"
                @trigger="triggerSubform($event)"
            />

            <vv-tag v-if="item.type === 'tag'"
                :label="field"
                :tags="item.value"
                :required="item.required"
                :allow-new="item.allowNew"
                :key-prop="item.key"
                :is-array="item.isArray"
                :helper="(item.hasOwnProperty('helper')) ? item.helper : null"
                :placeholder="(item.hasOwnProperty('placeholder')) ? item.placeholder : null"
                :url="item.url"
                :ref="field"
            />

            <vv-gender v-if="item.type === 'gender'"
                :label="field"
                :value="item.value"
                :error="item.error"
                :required="item.required"
                :ref="field"
            />
        
            <vv-dob v-if="item.type === 'dob'"
                style="margin-top:20px;"
                :label="field"
                :data="item.datas"
                :value="item.value"
                :error="item.error"
                :required="item.required"
                :ref="field"
            />

            <vv-date-year-month v-if="item.type === 'date_year_month'"
                style="margin-top:20px;"
                :label="field"
                :data="item.datas"
                :value="item.value"
                :error="item.error"
                :required="item.required"
                :ref="field"
            />

            <vv-captcha  v-if="item.type === 'captcha'"
                :captcha="item.datas"
                :label="field"
                :error="item.error"
                :required="item.required"
                ref="captcha"
            />

            <vv-switches v-if="item.type === 'switches' && item.switches && item.switches.length > 1"
                :switches="item.switches"
                :label="field"
                :ref="field"
                is-vertical
                is-center
                @change="setSwitches($event)"
                @trigger="triggerSubform($event)"
                @disableUpload="disableUpload($event)"
            />

            <vv-checkbox v-if="item.type === 'checkbox' && item.enum && item.enum.length > 1"
                :label="field"
                :values="item.enum"
                :value="item.value"
                :is-vertical="(item.hasOwnProperty('vertical')) ? item.vertical : false"
                :ref="field"
            />

            <transition name="fade">
            <div v-if="field === 'subform'" class="subform" v-show="toggleSubform" ref="subform">
                 <div v-for="(sub, f, i) in form.subform" :key="i">
                    
                    <vv-input v-if="['string','int','password'].indexOf(sub.type) > -1"
                        :label="f"
                        :value="sub.value"
                        :error="sub.error"
                        :required="sub.required"
                        :rules="sub.rules"
                        :helper="sub.helper"
                        :max="sub.max"
                        :min="sub.min"
                        :icon="sub.icon"
                        :ref="f"
                        :type="sub.type"
                        :disabled="sub.disabled"
                        :class="[{'m-b-30' : f === 'price'}, {'m-t-20' : f === 'price'}]"
                    />

                    <vv-switches v-if="sub.type === 'switches' && sub.switches && sub.switches.length > 1"
                        :switches="sub.switches"
                        :label="f"
                        :ref="f"
                        is-vertical
                
                    />

                    <vv-switch v-if="sub.type === 'bool'"
                        :name="(sub.label && sub.label.length > 0) ? sub.label : f"
                        :switch-prop="f + 'Switch'"
                        :value="(sub.value == 1)"
                        :label="f"
                        :ref="f"
                    />

                    <vv-select-label v-if="sub.type === 'enum' && sub.enum !== null"
                        class="m-t-5"
                        :width="0"
                        :width-style="sub.widthStyle"
                        :margin-style="sub.marginStyle"
                        :label="f"
                        :options="sub.enum"
                        :value="sub.value"
                        :required="sub.required"
                        :ref="f"
                    />

                </div>
            </div>
            </transition>

            </div>

            <button v-if="label !== null" class="button is-primary is-large" :class="{'is-loading' : isLoading}" v-text="labelMutated" :disabled="errors.length > 0" >
            </button>

            <slot name="after" />

        </form> 

        <error :error="error" />

    </div>
</template>

<style>
form {
    border-left: 1px solid hsl(0, 0%, 86%);
    padding: 20px;
}
form button {
    text-transform: uppercase;
    margin-top: 40px;
}
.subformxxxxx{
    border:4px solid green;
    padding: 10px;
}
</style>

<script>
import VueScrollTo from 'vue-scrollto'

export default {
    
    props: {

        p: {
            type: Object,
            default: null
        },
        label: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        },
        isAjax: {
            type: Boolean,
            default: true
        },

        reference: {
            type: String,
            default: null
        },

        isToggleSubform: {
            type: Boolean,
            default: false
        },

        maxWidth: {
            type: Number,
            default: 500
        }
    },
    
    data() {
        return {

            isResponseAjax : false,
            responseAjax: '',
            isLoading : false,
            toggleSubform : false,
            error : {
                status: false,
                success: false,
                label: null
            },
            labelMutated : this.label         
        }
    },

    computed: {

        form(){
            return this.$store.state.form.form
        },

        subform(){
            return this.$store.state.form.subform
        },

        errors(){
            return this.$store.state.form.errors
        },

        display(){
            return this.$store.state.form.display
        }
    },

    created(){

        if (this.url !== null) this.$store.dispatch('form/setUrl', this.url)

        this.$store.dispatch('form/init')

    },

    mounted(){

        this.iconTagsFix()

    },

    methods: {

        iconTagsFix(){
          
            var c = document.querySelectorAll("i.mdi.mdi-label")

            if (typeof c === 'undefined' || c.length === 0) return;

            Array.from(c).forEach((div, i) => {

                div.className = "material-icons"
            
                div.innerHTML = 'label'
            })
        },

        triggerSubform(val){

            var upload = this.$store.state.form.upload

            if (val && upload !== null && typeof upload !== 'undefined' && upload.settings.type === 'product'){

                var products =  this.$store.state.form.c.datas.products

                for (let k in this.form.subform){

                    this.form.subform[k].enum = products[val][k]
                }

                //this.$store.commit('form/setSubform', this.form.subform)
            }

            if (this.isToggleSubform) this.toggleSubform = val;

        },

        disableUpload(val){
            
            if (val){
                
                this.labelMutated = 'submit'

                this.$store.dispatch('form/changeCallback', 'submit')

                if (typeof _user !== 'undefined'){

                    this.$store.commit('form/appendData', ['user_id', _user.id]);

                }

                if (this.$store.state.form.hasOwnProperty('upload') && this.$store.state.form.upload.hasOwnProperty('settings')){

                    this.$store.commit('form/appendData', ['media', this.$store.state.form.upload.settings.type]);

                }

                return
            }

            this.labelMutated = 'next'

            this.$store.dispatch('form/changeCallback', 'next')

            this.$store.commit('form/removeData', 'user_id')

            this.$store.commit('form/removeData', 'media')

        },

        setSwitches(obj){

        },

        setSwitch(val, index, ref, field, subform){

            if (typeof subform === 'undefined' && this.isToggleProduced && field === 'type' && ref === 'produced'){

                this.toggleProduced = val;

            }

            if (!val) return;

            let _switches = (subform) ? this.form.subform[field].switches : this.form[field].switches

            for (let k in _switches){

                k = parseInt(k);

                if (k !== index) _switches[k].status = false;
            }

            //this.selectedSwitch = this.upload.switches[index]

        },

        check(form){

            for (let k in form){

                const type = form[k].type

                if (typeof this.$refs[k] === 'undefined'){

                    console.warn('testing k ::', k, this.$refs[k])

                    continue
                }

                var child = this.$refs[k][0]

                if (typeof child === 'undefined') continue;

                if ((!form[k].hasOwnProperty('disabled') || !form[k].disabled) && form[k].required && (child.input === null || child.input.length === 0 || !child.input)) {
                    
                    child.setError('REQUIRED');

                    this.$store.dispatch('form/setError', k)
                }

                if (k === 'subform' && this.toggleSubform) this.check(form.subform);

                if (form[k].type === 'tag'){

                    let tags = []

                    //child.values.map(val => tags.push(JSON.stringify(val)));


                    child.values.map((val) => {
                        
                       // var t = (typeof val === 'string') ? val : JSON.stringify(val);

                        var t = val

                        tags.push(t)

                    });


                    this.$store.commit('form/appendData', [k, tags])

                    /*
                    child.values.map((val) => {
                                                
                        this.$store.commit('form/appendData', [k + '[]', JSON.stringify(val)])
                    });
                    */
                
                } else this.$store.commit('form/appendData', [k, child.input]);

            }



        },

        submit(){

            this.check(this.form)


            if (!this.isAjax){

                if (this.$store.state.form.errors.length > 0) return;

                document.forms['form-' + this.label].submit()

                return
            }

            this.isLoading = true

            this.$store.dispatch('form/' + this.$store.state.form.callback).then(r => {

                this.isLoading = false

                if (this.label === null) this.$emit('done');

                //this.$store.dispatch('form/hideForm')

                this.error = {status: true, success: true, label: r.data.message};

                VueScrollTo.scrollTo(document.getElementById("header"), 1000, {})
            
            }).catch(e => {

                //console.error('e :::::::: => ', e)

                this.isLoading = false

                if (this.label === null) this.$emit('done');

                var captcha = document.getElementById('refresh-captcha')

                if (!e.hasOwnProperty('response')) return;

                var status = e.response.status

                if ([404, 403, 500].indexOf(status) > -1) this.error = {status: true, success: false, label: 'Error system'};

                if ([401].indexOf(status) > -1) this.error = {status: true, success: false, label: 'You need to be logged in'};

                if (captcha !== null) captcha.click();

                console.error('RESPONSE ERROR :: ', e.response.data);

                if (!e.response.data.hasOwnProperty('errors')) return;

                for (let k in e.response.data.errors) {

                    console.warn(k)

                    console.warn(e.response.data.errors[k])

                    if (typeof this.$refs[k] !== 'undefined'){
                    
                        this.$refs[k][0].setError(e.response.data.errors[k][0]);
                    
                    } else this.error = {status: true, success: false, label: e.response.data.errors[k][0]};
                }

                console.warn('STORE: ',this.$store.state.form.errors) 
            })

        }

    },

}
</script>