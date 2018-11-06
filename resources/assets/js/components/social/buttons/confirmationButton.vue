// Made with love by Rohan Likhite

<template>
  <div
    class="button"
    :class="[ css, stepsComplete? 'confirmation__button--complete' : '', color, (isLoading && stepsComplete)? 'is-loading' : '' ]"
    :disabled='stepsComplete'
    v-on:click='incrementStep()'
    v-html="currentMessage"
    >
  </div>
</template>

<script>
  export default {
    name: 'vue-confirmation-button',
    props: {
      color: {
        type: String,
        default: 'is-success'
      },
      isLoading:{
        type: Boolean,
        default: false
      },
      messages: Array,
      css: {
        type: String,
        default: 'confirmation__button'
      },
    },
    data() {
      return {
        defaultSteps: [
          'Click to confirm',
          'Are you sure?',
          '✔',
        ],
        currentStep: 0,
      }
    },
    computed: {
      messageList() {
        return this.messages ? this.messages : this.defaultSteps
      },
      currentMessage() {
        return this.messageList[this.currentStep]
      },
      lastMessageIndex() {
        return this.messageList.length - 1
      },
      stepsComplete() {
        return this.currentStep === this.lastMessageIndex
      }
    },
    methods: {
      incrementStep() {
        this.currentStep++
        if (this.stepsComplete) {
          this.$emit('confirmation-success')
        }
        else {
          this.$emit('confirmation-incremented')
        }
      },
      reset() {
        this.currentStep = 0
        this.$emit('confirmation-reset')
      },
    },
  }
</script>

<style>
  .confirmation__button {
    display: block;
    backgroundx: #5B64B4;
    font-size: 0.8em;
    font-weightxxx: 700;
    color: #ffffff;
    border-radiusx: 50px;
    heightx: 50px;
    min-width: 130px;
    paddingx: 0em 1em;
    outline: 0;
    cursor: pointer;
    text-transform: capitalize;
    border: 1px solid rgba(255,255,255,0.2);
    box-shadowxxxx: 0px 6px 54px rgba(71,78,152,0.5);
    -webkit-transition: background 0.3s ease-in,
                        min-width 0.1s linear,
                        box-shadow 0.2s ease-in;
    transition: background 0.3s ease-in,
                min-width 0.1s linear,
                box-shadow 0.2s ease-in;
  }
  .confirmation__button:not(.confirmation__button--complete):hover {
    box-shadowxxx: 0px 15px 54px rgba(71,78,152,0.7);
    box-shadowxx:0 3px 5px -1px rgba(0,0,0,.2),0 5px 8px 0 rgba(0,0,0,.14),0 1px 14px 0 rgba(0,0,0,.12);
    box-shadow:0 8px 10px -5px rgba(0,0,0,.2),0 16px 24px 2px rgba(0,0,0,.14),0 6px 30px 5px rgba(0,0,0,.12)
  }
  .confirmation__button.confirmation__button--complete {
    cursor: not-allowed;
    background: #79BA7A;
    border-radius: 100px;
    min-widthx: 50px;
    paddingx: 0em;
    font-size: 1em;
    box-shadow: 0px 6px 54px rgba(104,160,106,0.5);
    animation: icon-pop 0.3s linear 1;

    min-width: 0;
    height: 40px;
    width: 40px;
    border-radius: 50%;
    paddingxxx: 0;

    display: flex;
    justify-content: center;
    align-items: center;


  }
  @keyframes icon-pop {
      0%   {font-size: 0.1em;}
      50%  {font-size: 1.8em;}
  }
</style>
