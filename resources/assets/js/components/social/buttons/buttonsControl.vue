<template>
    <div>
    <div class="buttons-control flex flex-center-y" :class="{'flex-center-x' : isCenter}">
            <vs-button v-for="(item, index) in buttons" :key="item.index"
                v-if="item.display"
                :ref="item.name"
                :item="item"
                :size="size"
                :color="color"
                @click="click(index, $event)"
            />
    </div>
    <error :error="error" />
    </div>
</template>

<style>

.buttons-control{
    border:0px solid orange;
    heightx: 200px;
    width: 100%;
}

.buttons-control > div{
    heightxxx: 100%
}

</style>

<script>
import BClass from './buttonsClass'

import buttonComponent from './button.vue'

import {mixError} from '../mixins/mixError'

export default {

    mixins: [mixError],

    components: {
        vsButton : buttonComponent,
    },

    props: {
        items: {
            type: Array,
            default: []
        },

        parentId : {},
        parentClass : {},

        size: {
            type: Number,
            default: 1
        },

        isCenter:{
            type: Boolean,
            default: false
        },

        color: {
            type: String,
            default: 'has-text-info'
        },

        counts: {
            type: Object,
            default(){
                return {}
            }
        }
    },

    data(){

        return {

            bClass: null,
            buttons: [],
            errorLocal : {
                status: false,
                success: false,
                libel: ''
            }

        }
    },

    

    methods: {

        click(index, name){

            var button = this.buttons[index]

            if (button.once) button.disabled = true;

            if (button.toggle) this.toggle(button);

            if (!button.callback) return;

            var callBack = name + 'Trigger'

            if (typeof this.bClass[callBack] === 'function'){

                if (button.loading !== null) button.loading = true;
               
                this.bClass[callBack]().then(response => {

                    if (button.loading !== null) button.loading = false;

                    if (response.hasOwnProperty('counter')) button.count = response.counter;

                    if (response.hasOwnProperty('delete') && response.delete) this.$emit('deleted');
                    
                }).catch((error) => {
                    
                    if (button.loading !== null) button.loading = false;
                    
                    this.setError(error)

                });

            } else{

                console.error('no callBack function of button class for : ' + callBack);

            }

        },

        toggle(button){

            if (['comment', 'replies'].indexOf(button.name) > -1 && !button.toggle.status) button.loading = true;

            button.toggle.status = !button.toggle.status

            if (button.toggle.hasOwnProperty('icon')){

                var iconSave = button.icon
                var iconNew = button.toggle.icon

                button.toggle.icon = iconSave;
                button.icon = iconNew;
            }

            if (button.toggle.hasOwnProperty('text')){

                var textSave = button.text
                var textNew =  button.toggle.text

                button.toggle.text = textSave;
                button.text = textNew;
            }

            if (button.toggle.hasOwnProperty('tooltip')){

                var tooltipSave = button.tooltip 
                var tooltipNew =  button.toggle.tooltip

                button.toggle.tooltip = tooltipSave;
                button.tooltip = tooltipNew;
            }

            this.$emit('click', {button : button, toggle : button.toggle.status})

        },

    },

    mounted(){

        //console.warn('BUTTONS COUNTS : ', this.counts)
        //console.warn('BUTTONS ITEMS : ', this.items)

        this.bClass = new BClass(this.items, this.parentId, this.parentClass, this.counts)

        this.buttons = this.bClass.buttons

        //console.warn('BUTTONS MOUNTED: ', this.buttons)
    }
    
}
</script>