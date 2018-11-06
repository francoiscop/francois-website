export default{

	methods : {

		getImage(obj){
            
            if (obj.hasOwnProperty('avatar')) return obj.avatar;
            
            if (obj.hasOwnProperty('poster')) return obj.poster;
            
            if (obj.hasOwnProperty('image') && typeof obj.image === 'string' && this.isJson(obj.image)){
              
                var imgs = JSON.parse(obj.image)
                
                return imgs[0]
            }
            
            if (obj.hasOwnProperty('image') && typeof obj.image === 'string') return obj.image;
            
            if (obj.hasOwnProperty('image') && Object.prototype.toString.call(obj.image) === '[object Array]') return obj.image[0].src;
        }, 


        isJson(item) {
          
            item = typeof item !== "string" ? JSON.stringify(item) : item;

            try {
              item = JSON.parse(item);
            } catch (e) {
              return false;
            }

            if (typeof item === "object" && item !== null) return true;

            return false;

        },
	}
}