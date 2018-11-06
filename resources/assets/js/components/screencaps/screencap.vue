<template>
    <div :class="classAspect" style="width: 200px;margin : 5px">
        <div style="background-size:cover;" class="has-background-custom-2">
            <b-loading :is-full-page="false" :active.sync="loading" />
            <img :src="srcLoaded" class="pointer" :class="{'animated fadeIn': !loading}" @click="click"/>
        </div>
    </div>
</template>

<style scoped>
</style>

<script>

    export default {

        props:{
            src:{
                type: String,
                default: null
            },

            classAspect: {
                type: String,
                default: null
            }
        },

        data(){
            return {
                loading : true,
                srcLoaded : null,
            }
        },
        
        mounted(){

            if (this.src === null){

                this.loading = false

                return
            }

            let imgage = new Image()
    
            imgage.onload = (e) => {
                
                this.srcLoaded = this.src

                this.loading = false
            }
            
            imgage.src = this.src
        },

        methods : {
            click(){
                this.$emit('click')
            }
        }
    }
</script>