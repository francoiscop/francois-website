const header = {

	data(){

		return {
        	user: user,
        	paddingMutated : this.paddingMutated,
        }
     	
     },

     created(){
        
        this.setIsScroll();
        
        this.toggleUser = false;
     },

     computed: {

        paddingComputed(){

            if (!this.user || !this.user.logged_in) return 0;

            return 50;
        }
     },

     methods : {

        

        toggleUserNav(val){

            this.setPadding(val);
        },

        setPadding(val){

            var cl =  'p-l-50';
            var newcl = 'p-l-120';

            var el = document.getElementsByClassName(cl);

            for (let i = 0; i < el.length; i++) {

                if (val) this.addClass(el[i], newcl);
                else this.removeClass(el[i], newcl);
            }
        },

        setIsScroll(){

            var el = document.getElementsByClassName('is-scroll-watch');

            for (let i = 0; i < el.length; i++) {

                if (isScroll) this.addClass(el[i], 'is-scroll');
                else this.addClass(el[i], 'is-not-scroll');
            }
        },

        hasClass(ele,cls) {

            return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
        },

        removeClass(ele,cls) {
            
            if (this.hasClass(ele,cls)) {
                var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
                ele.className=ele.className.replace(reg,' ');
            }
        },

        addClass(ele,cls){
            ele.className += ' ' + cls;
        }

     
     }
}

export default header;