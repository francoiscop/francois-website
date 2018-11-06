<template>
<div>


                    <div  v-for="(item, index) in switches" v-if="switches.length > 1">
                    <b-switch 
                    	:value="item.status"
                    	v-model="item.status"
                        :ref="item.label"
                        @input="setSwitch($event, index, item.label)"
                    >{{ item.label }} {{ item.status }}</b-switch>
                	</div>
                           
	
	<div style="display: flex;flex-wrap: wrap;">
		<div v-for="(image, index) in images">
         	<div style="margin:2px;">
         		<img :src="image.src" style="height:100px;cursor: pointer" class="pointer" @click="clickImage(image, $event)" />
         		<p style="font-size: 0.8rem;">{{ image.dim }}</p>
         	</div>
         </div>
	</div>

	<div class="modal" :class="{'is-active' : isModalActive}">
  		
  		<div class="modal-background"></div>
  		<div class="modal-box">
    		<div class="modal-box-header"></div>

    		<div class="modal-box-content">
      			<div class="box-img">
          			<img src="" id="image-cropper">
      			</div>
      			<div class="box-preview"></div>
    		</div>

    		<div class="modal-box-footer center-text" style="margin-top:5px;">
      			<span class="button is-medium is-primary" :class="{'is-loading' : isCropLoading}" @click="send">SAVE</span>
      			<span class="button is-medium" @click="reset">CANCEL</span>
    		</div>

  	 	</div>
  
  	 	<button class="modal-close is-large" aria-label="close" @click="reset"></button>
	</div>

</div>
</template>

<style>
.box-preview{
  /*
    border:1px solid hsl(0, 0%, 22%);
  margin: 0 5px;
    height: 300px;
    width: 300px;
    min-widthx: 200px;
    min-heightx: 200px;
    max-width: 400px;
    max-height: 400px;
    overflow: hidden;
  position: relative;
  leftxxx:-200px;
  */
  overflow: hidden;
  max-widthx: 300px;
  max-heightx: 300px;
  height: 300px;
  width: 300px;
  position: absolute;
  top:4px;
  left:4px;
  border:1px solid rgba(200,200,200,0.3);
}

.modal{
	border:0px solid red;
}

.modal-box{
  border:0px solid orange;
  width: 90%;
  background-colorxxxxxxx: white;
  display: flex;
  flex-direction: column;
  z-index: 20;
  padding: 5px;
}
.modal-box-content{
  border:0px solid blue;
  display: flex;
  justify-content: center;
  align-itemsx: center;
  positionx: relative;
}

/* Limit image width to avoid overflow the container */
.box-img img {
  max-width: 100%; /* This rule is very important, please do not ignore this! */
  border:1px solid rgba(200,200,200,0.3);
}
</style>

<script>
import Cropper from 'cropperjs/dist/cropper.esm';
//import Cropper from 'cropperjs/dist/cropper';

export default{

	props:{
		images:{
			/*
      type: Object,
			default(){
				return {}
			}
      */
		},

		url : {
			type: String,
			default: null
		},

		names : {
			type: Array,
			default(){
				return []
			}
		}
	},

	data() {

		return {
			isModalActive : false,
			blob : null,
			options : {
				    aspectRatio: 1.78,
      			viewMode: 1,
      			modal: false,
      			background: false,
     	 		  preview: '.box-preview',
      			rotatable: true,
      			autoCropArea : 1,
      			crop: (e) => {

                 	this.cropped_value = parseInt(e.detail.width) + "," + parseInt(e.detail.height) + "," + parseInt(e.detail.x) + "," + parseInt(e.detail.y) + "," + parseInt(e.detail.rotate);

                }
			},
			cropper : null,
			cropped_value : null,
			switches  : [],
			test : true,
			isCropLoading : false
		}

	},

	created(){
		this.createSwitches();
	},

	methods: {

		createSwitches(){

			if (this.names.length < 2) return;

			for (let k in this.names){

          var label = (Object.prototype.toString.call(this.names[k]) === '[object Object]') ? this.names[k].name : this.names[k];
          var ratio = (Object.prototype.toString.call(this.names[k]) === '[object Object]') ? this.names[k].ratio : null;

				  this.switches.push({label : label, status : (k == 0) ? true : false, ratio : ratio});
			}

		},

    setSwitch(val, index, label){

        if (!val) return;

        for (let k in this.switches){

            k = parseInt(k);

            if (val && k !== index){
          
              Vue.set(this.switches, k , {label : this.switches[k].label, status : false, ratio : this.switches[k].ratio});

            }
        }
    },

		setSwitchxxxxxxxxxxxxxxxxxx(val, index, label){

			if (!val) return;

			console.warn('val : ', val, 'index: ', index, 'label :', label);
			console.warn('index: ', index, typeof index);


			//Vue.set(this.switches, 0 , {label : label, status : true});

			for (let k in this.switches){

				k = parseInt(k);

				console.warn('k: ', k, typeof k);

				if (val){
					
					if (k !== index) Vue.set(this.switches, k , {label : this.switches[k].label, status : false});
				}
			}

			console.error(this.switches);

			//if (!val) Vue.set(this.switches, 0 , {status : true});
		},

		clickImage(img, event){

			if (!this.isSwitchSelected()) return;
			
			var src = event.target.getAttribute('src');

        	this.getImageFormUrl(src, (blob) => {

          		this.init(blob);

        	});
		},

		init(blob){

			this.blob = blob;

      this.setSelectedRatio();

			var _this = this;

			//_this.cssPreview();

			var _URL = window.URL || window.webkitURL;

			var img = new Image();

			img.src = _URL.createObjectURL(blob);

			img.onload = function(){

				var reader = new FileReader();

				reader.readAsDataURL(blob);

				reader.onloadend = function(){

					const image = document.getElementById('image-cropper');
					
					image.src = this.result;

					_this.cropper = new Cropper(image, _this.options);

            		_this.isModalActive = true;
            	}
            }
    	},

    	reset(){

    		this.isModalActive = false;

    		this.isCropLoading = false;

    		this.cropper.destroy();
    	},

    	send(){

    		const selectedName = this.getSelectedSwitch();

    		var formData = new FormData();

    		formData.append('cropped_value', this.cropped_value);

    		formData.append('name', selectedName);

    		formData.append('file', this.blob);

    		this.isCropLoading = true;

    		axios.post(this.url, formData).then((response)  =>  {

    				this.setNextSwitch();

                    this.reset();

            }, (error)  =>  {

            		this.isCropLoading = false;
            		this.isModalActive = false;
            });

    	},

    	getSelectedSwitch(){

    		if (this.switches.length === 0) return this.names[0];

    		var selected = null;

    		for (let k in this.switches){
    			if (this.switches[k].status){
    				selected = this.switches[k].label;
    				break;
    			}
    		}

    		return selected;
    	},

      setSelectedRatio(){

        if (this.switches.length === 0){

          if (Object.prototype.toString.call(this.names[0]) === '[object Object]' && this.names[0].hasOwnProperty('ratio')){

              this.options.aspectRatio = this.names[0].ratio;
          }

          return;

        }

        for (let k in this.switches){
          
          if (this.switches[k].status){

              if (Object.prototype.toString.call(this.names[0]) === '[object Object]' && this.names[0].hasOwnProperty('ratio')){

                  this.options.aspectRatio = this.switches[k].ratio;
                  return;
              }

              return;
          }
        }

        return;
      },

    	isSwitchSelected(){

    		return (this.getSelectedSwitch() !== null)

    	},

    	setNextSwitch(){

    		if (this.switches.length === 0) return;

    		var key = null;
    		var nextKey = 0;

    		for (let k in this.switches){
    			if (this.switches[k].status){
    				this.switches[k].status = false;
    				key = k;
    				break;
    			}
    		}

    		if (key !== null && key < this.switches.length - 1) nextKey = parseInt(key) + 1;

    		console.warn(key);
    		console.warn(nextKey);
    		console.warn(this.switches[nextKey]);

    		Vue.set(this.switches, nextKey, {label : this.switches[nextKey].label, status : true, ratio : this.switches[nextKey].ratio});

    	},



		getImageFormUrl : function(url, callback) {
      var img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = function (a) {
          var canvas = document.createElement("canvas");
          canvas.width = this.width;
          canvas.height = this.height;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(this, 0, 0);

          var dataURI = canvas.toDataURL("image/jpg");
    
          // convert base64/URLEncoded data component to raw binary data held in a string
          var byteString;
          if (dataURI.split(',')[0].indexOf('base64') >= 0)
             byteString = atob(dataURI.split(',')[1]);
          else
             byteString = unescape(dataURI.split(',')[1]);

          // separate out the mime component
          var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

          // write the bytes of the string to a typed array
          var ia = new Uint8Array(byteString.length);
          for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
          }

          return callback(new Blob([ia], { type: mimeString }));
      }
  
      img.src = url;
  },
	}

}
</script>