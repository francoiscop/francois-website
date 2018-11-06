export const formControlMix = {
    props : {
        label: {
            type: String,
            default: ''
        },
        value: {
            default: null
        },   
        required : {
            type : Boolean,
            default : false
        },       
        error: {
            type: Object,
            default(){
                return {
                    status: false,
                    label: ''
                }
            }
        },
        width : {
            type: Number,
            default: 18
        },
    },
    

    data(){
        return{
            errorMutable : this.error
        }
    },

    computed: {
        labelComputed(){
            return this.label.replace(/[_-]/g, " ")
        },
        widthComputed(){
            return (this.label === '') ? 0 : this.width;
        }
    },

    filters: {

        removeUnderscore(value) {
            return value.replace(/[_-]/g, " ")
        }
    },
    
    methods: {

        removeUnderscore(value) {
            return value.replace(/[_-]/g, " ")
        },
        
        setError(e){
            
            this.errorMutable.status = true;
            
            this.errorMutable.label = e;            

            this.$store.dispatch('form/setError', this.label)

            this.$emit('setError', e)
        },

        clearError(e){
            
            //clear error only if has error:
            if (!this.errorMutable.status) return;

            this.errorMutable.status = false;
            
            this.errorMutable.label = '';

            this.$store.dispatch('form/clearError', this.label)

            this.$emit('clearError', this.label)
        
        }
    },
};