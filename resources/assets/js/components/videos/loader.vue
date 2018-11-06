<template>
    <transition :name="animation">
        <div class="loading-overlay is-active">
            <div class="loading-icon"/>
        </div>
    </transition>
</template>

<style>
.loading-overlay{
    bottom:0;
    left:0;
    position:absolute;
    right:0;
    top:0;
    -ms-flex-align:center;
    align-items:center;
    display:none;
    -ms-flex-pack:center;
    justify-content:center;
    overflow:hidden;
    z-index:9
}
.loading-overlay.is-active{
    display:-ms-flexbox;
    display:flex
}
.loading-overlay.is-full-page{
    position:fixed
}
.loading-overlay.is-full-page .loading-icon:after{
    top:calc(50% - 2.5em);
    left:calc(50% - 2.5em);
    width:5em;
    height:5em
}
.loading-overlay .loading-background{
    bottom:0;
    left:0;
    position:absolute;
    right:0;
    top:0;
    background:#7f7f7f;
    background:hsla(0,0%,100%,.5)
}
.loading-overlay .loading-icon{
    position:relative
}
.loading-overlay .loading-icon:after{
    animation: spinAround .5s infinite linear;
    border: 2px solid #dbdbdb;
    border-radius: 290486px;
    border-right-color: transparent;
    border-top-color: transparent;
    content: "";
    display: block;
    height: 1em;
    position: relative;
    width: 1em;
    position: absolute;
    top: calc(50% - 1.5em);
    left: calc(50% - 1.5em);
    width: 3em;
    height: 3em;
    border-width: .25em
}
</style>

<script>
    export default {

        props: {

            animation: {
                type: String,
                default: 'fade'
            },

        },

    }
</script>
