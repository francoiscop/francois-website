<template>
    <div class="form__input flex flex-center justify-center" style="height:100%;">
                <swatches
                    v-model="color"
                    colors="text-advanced"
                    colorsx="material-basic"
                    popover-to="right"
                    shapes="circles"
                    show-borderx
                    swatch-size="24"
                    :swatch-style="{width: '22px', height: '22px'}"
                    :trigger-style="{width: '18px', height: '18px'}"
                    :wrapper-style="cssColorPicker"
                    :spacing-size="0"
                    :row-lengthx="10"
                    @input="input($event)"
                ></swatches>
    </div>
</template>

<script>
import bus from '../bus.js';

import Swatches from 'vue-swatches'

export default {
    
    title: "color",
    icon: null,
    description: "Color",
    hasSelection : false,

    components: {
        Swatches
    },

    data(){
        return {
            color: '#F64272',

            cssColorPicker : {
                backgroundColor: 'white',
                border: '1px solid orange',
                padding: 5,
                position: 'absolute',
                left: '-86px',
                top: '28px',
                width: '230px',
                zIndex: 100
            }
        }
    },
    methods: {
        
        input(value){
            this.$emit("exec", "foreColor", 'color', value);
        },

        open(){
            alert('open')
        },
    },
};
</script>

