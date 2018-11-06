<template>
    <div class="btn-wrapper flex flex-center-y m-r-5"
        :class="'v-button-' + item.name"
        v-if="item.display"
        :style="'font-size:' + size + 'rem'"
    >

        <div class="btn-count"
            v-if="item.isCounter && item.count >  0 && item.name !== 'getReply'"
            :style="'font-size:' + (size - 0.2) + 'rem'"
            v-text="item.count"
        ></div>

        <a v-if="item.icon !== null && ['replies', 'comment'].indexOf(item.name) === -1"
            class="btn-icon button flex flex-center-y is-tooltip-warning"
            :class="[{ 'is-loading' : item.loading}, {'tooltip': item.tooltip.length > 0}, colorComputed]"
            :data-tooltip="item.tooltip"
            :disabled="item.disabled"
            @click="click(item.name)"
        >
            <i class="material-icons" :style="'font-size:' + size + 'rem;'">{{ item.icon }}</i>
        </a>

        <a v-else-if="item.count > 0"
            class="btn-icon button flex flex-center-y is-tooltip-warning"
            :class="[{ 'is-loading' : item.loading}, {'tooltip': item.tooltip.length > 0}, colorComputed]"
            :data-tooltip="item.tooltip"
            :disabled="item.disabled"
            @click="click(item.name)"
        >
            <i class="material-icons" :style="'font-size:' + size + 'rem;'">{{ item.icon }}</i>
        </a>
    
    </div>
</template>

<style>
.btn-icon.button{
    border-width: 0;
    padding: 0;
    color: inherit;
    background-color: transparent;
}
</style>

<script>
export default{
    props : ['item', 'size', 'color'],

    data(){
        return{
        }
    },

    computed: {

        colorComputed(){
            return (this.item.hasOwnProperty('color')) ? this.item.color : this.color;
        }
    },

    methods : {

        click(name){

            if (this.item.disabled) return;

            this.$emit('click', name);
        },

    },

}
</script>