export default{

	data(){
		return{

			bottom: false,
			pageScroll : 1
		}
	},

	methods:{
		
		bottomVisible() {
      		
      		const scrollY = window.scrollY
      		const visible = document.documentElement.clientHeight
      		const pageHeight = document.documentElement.scrollHeight
      		const bottomOfPage = visible + scrollY >= pageHeight
      		return bottomOfPage || pageHeight < visible
    	}
	},

	created(){

		window.addEventListener('scroll', () => {

			this.bottom = this.bottomVisible()
		})

	},

	watch: {

		bottom(bottom) {
      		if (bottom) {
      			
      			this.pageScroll ++;

      			this.scroll();

      		}
    	}

	}
}