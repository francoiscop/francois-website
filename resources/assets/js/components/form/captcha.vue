<template>
    <div>
    <div style="display: flex;justify-content: space-between;">
        <div style="display: flex;align-items: center;height:38px;" :style="'width: ' + this.width + '%'">
            <label :class="{'has-text-danger' : errorMutable.status}">Captcha</label>
        </div>
        <div :style="'width: ' + (100 - this.widthComputed) + '%'">
            <div class="v-c-captcha-wrapper">
                <input type="text" name="captcha" value="" class="input" :class="{'is-danger' : errorMutable.status}" v-model="input" @keyup="clearError" />
                <div class="field has-addons">
                        <div class="control captcha" v-html="captchaMutated"></div>
                        <div class="control">
                            <div class="button" :class="{'tooltip is-tooltip-warning' : !isLoading, 'is-loading' : isLoading}" @click="refresh" data-tooltip="Refresh captcha" id="refresh-captcha"><i class="material-icons">cached</i></div>
                        </div>
                    </div>
            </div>
        </div>
    </div>
    <div v-show="errorMutable.status" style="font-size: 0.8rem;" :style="'padding-left:' + (+this.widthComputed + 1) + '%'" class="has-text-danger" v-text="errorMutable.label">
    </div>
    </div>
</template>

<script>
import {formControlMix} from './mixins/formControlMix.js';

export default {
    mixins : [formControlMix],
    props : {
        captcha : {
            type : String,
            default : null,
        }
    },
    data(){
        return{
            isLoading : false,
            captchaMutated : this.captcha,
            input : ''
        }
    },
    mounted(){
        console.log(this.captcha);
    },
    methods : {
        refresh(){
            this.isLoading = true;
            axios.get('/refresh_captcha').then((response)  =>  {
                this.isLoading = false;
                this.captchaMutated = response.data.captcha;
            }, (error)  =>  {
                this.isLoading = false;
            });
        }
    }
}
</script>