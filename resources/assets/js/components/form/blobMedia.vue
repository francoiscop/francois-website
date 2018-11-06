<template>
	<div class="blob-media relative">

	<div v-if="(!isCropper && !file.success) || file.error"
			 class="absolute blob-media-delete tooltip is-tooltip-danger"
			 :class="{'none' : !file.error, 'flex flex-center' : !isVideo, 'is-round' : isVideo, 'delete--fullwidth' : !isVideo}"
			 :data-tooltip="(file.error && !isVideo) ? file.error.replace(/<br \/>/g, ' ') : 'Delete'"
			 @click="remove"
		>
				<i class="material-icons has-text-danger" style="font-size:4rem">clear</i>
	</div>

	<div v-if="(file.active || file.success) && !file.error"
			class="flex flex-center absolute loader-circular z-20"  
			:style="(file.active && progress >= 100) ? 'opacity:0.6;background-color:transparent' : 'opacity:1;'"
		>
		<vue-circle
			ref="progress"
        	:progress="progress"
        	:size="100"
        	:reverse="false"
        	line-cap="round"
        	:fill="{ color: 'hsl(171, 100%, 41%)' }"
        	empty-fill="rgba(0, 0, 0, .1)"
        	:animation-start-value="0.0"
        	:start-angle="0"
        	insert-mode="append"
        	:thickness="5"
        	:show-percent="true"
        >
        	<p v-if="file.success">
        		<i class="material-icons has-text-success" style="font-size:2rem">done_outline</i>
        	</p>
    	</vue-circle>
    </div>

    <b-loading :is-full-page="false" :active.sync="file.active && progress >= 100"></b-loading>





    <div v-if="isVideo" class="aspect__ratio--16-9 has-background-black" style="min-width: 400px;">
      		<video :src="file.cropper" controls />      
    </div>

    <div v-else-if="!isZip" style="height:200px;" class="center-text">
			<img  :src="file.cropper" :style="(file.error) ? 'opacity:0.6' : 'opacity:1'" style="height: 100%;" />
	</div>

    <div class="" v-if="isVideo">
         <div v-if="!file.error && !file.success" class="video-infos">
				<strong>{{file.name}}</strong> <small style="margin-left:10px;">{{file.size | formatSize}}</small>
			</div>
			<div v-else-if="file.error" v-html="file.error" class="notification is-danger"></div>
			<div v-else-if="file.success" v-html="successLink"></div>
			<div>
				 <progress
                     v-if="(file.active || file.progress !== '0.00') && !file.error && !file.success"
                     class="progress is-small is-primary"
                     :class="{'is-danger': file.error}"
                     :value="file.progress" 
                     max="100"
                     >{{file.progress}}%
                  </progress>
			</div>
    </div>
      
  </div>
	<!--
	<div class="blob-media-x flex flex-center relative debug-red" :class="classComputed">

		<div v-if="(!isCropper && !file.success) || file.error"
			 class="flex flex-centerxxxx absolute delete-blob-x tooltip is-tooltip-danger is-round"
			 :class="{'none' : !file.error}"
			 :data-tooltip="(file.error && !isVideo) ? file.error.replace(/<br \/>/g, ' ') : 'Delete'"
			 @click="remove"
		>
				<i class="material-icons has-text-danger" style="font-size:4rem">clear</i>
		</div>

		<div v-if="(file.active || file.success) && !file.error"
			class="flex flex-center absolute loader-circular"  
			:style="(file.active && progress >= 100) ? 'opacity:0.5' : 'opacity:1;background-color:transparent'"
		>
		<vue-circle
			ref="progress"
        	:progress="progress"
        	:size="100"
        	:reverse="false"
        	line-cap="round"
        	:fill="{ color: 'hsl(171, 100%, 41%)' }"
        	empty-fill="rgba(0, 0, 0, .1)"
        	:animation-start-value="0.0"
        	:start-angle="0"
        	insert-mode="append"
        	:thickness="5"
        	:show-percent="true"
        >
        	<p v-if="file.success">
        		<i class="material-icons has-text-success" style="font-size:2rem">done_outline</i>
        	</p>
    	</vue-circle>
    	</div>

    	<b-loading :is-full-page="false" :active.sync="file.active && progress >= 100"></b-loading>

		<div v-if="isZip" class="center-text">
			<p class="has-text-white anton">{{ file.file.name }}</p>
			<p><i class="material-icons" style="font-size:3em;">archive</i></p>
			<p>{{ file.size | formatSize }}</p>
		</div>

		<div v-else-if="!isVideo" style="min-width:100px;height:100%;" class="center-text">
			<img  :src="file.cropper" :style="(file.error) ? 'opacity:0.6' : 'opacity:1'" />
		</div>

		<div v-else-if="isVideo" style="height:100%;" class="center-text debug-green">
			
			<video :src="file.cropper" controls />

			<div v-if="!file.error && !file.success" class="video-infos debug">
				<strong>{{file.name}}</strong> <small style="margin-left:10px;">{{file.size | formatSize}}</small>
			</div>
			<div v-else-if="file.error" v-html="file.error" class="notification is-danger"></div>
			<div v-else-if="file.success" v-html="successLink"></div>
			<div>
				 <progress
                     v-if="(file.active || file.progress !== '0.00') && !file.error && !file.success"
                     class="progress is-small is-primary"
                     :class="{'is-danger': file.error}"
                     :value="file.progress" 
                     max="100"
                     >{{file.progress}}%
                  </progress>
			</div>
		
		</div>
	
	</div>
	-->
</template>


<style>
.blob-media-delete{
	top: 5px;
	right: 5px;
	z-index:10;
	cursor:pointer;
	background-colorxxx: rgba(50,50,50,0.5);
}
.blob-media-delete.delete--fullwidth{
	height:100%;
	width:100%;
}
.blob-media:hover .blob-media-delete.none{
	display: block;
}
.blob-media .loader-circular{
	background-color:rgba(200,200,200,0.8);
	width:100%;
	height:100%;
}
/*
.blob-media-x.h-150{
	height: 150px;
}
.blob-media-x.h-250{
	height: 250px;
}
.blob-media-x.w-150{
	width:150px;
}

.blob-media-x .delete-blob-x{
	heightxx:100%;
	widthxx:100%;
	top: 5px;
	right: 5px;
	z-index:10;
	cursor:pointer;
	background-color: rgba(50,50,50,0.5);
}
.blob-media-x .delete-blob-x.none{
	display: none;
}
.blob-media-x:hover .delete-blob-x.none{
	display: flex;
}

.blob-media-x .loader-circular{
	background-color:rgba(200,200,200,0.8);
	width:100%;
	height:100%;
}

.blob-media-x img, .blob-media-x video {
	height: 100%;
}

.blob-media-x .video-infos{
	background-color: whitesmoke;
    padding: 1.25rem 2.5rem 1.25rem 1.5rem;
    border:1px solid hsl(0, 0%, 86%);
}






.tooltip{
	font-family: Anton!important;
}


.blob-media{
	border: 10px solid red;
	display: flex;
	flex-direction: column;
	positionxxxx: relative;
	
}
.blob-media img,
.blob-media video{
	height: 100px;
}
.blob-media-infos{
	border: 0px solid green;
}

.blob-image{
	height: 150px;
	position: relative;
	border:0px solid purple;
}
.blob-image img,
.blob-image video{
	height: 100%;
}
.blob-image video{
	margin: 0 auto;
}
.blob-image .is-zip{
	display: block;
	width: 150px;
	height: 150px;
	border: 1px solid purple;
}
.w-150{
	width: 150px;
}

.blob-image:hover .delete-blob{
	display: block;
}
.delete-blob{
	display: none;
}
*/
</style>

<script>
import VueCircle from 'vue2-circle-progress'

export default{

	components: {
      VueCircle
    },
	
	props:{
		
		file:{
			type: Object,
			default(){
				return{}
			}
		},

		cropper:{},

		isVideo: {
			type: Boolean,
			default: false
		}
	},

	watch : {

		progress(val){

			this.$refs.progress.updateProgress(parseInt(val));
		
		}
	},

	computed: {

		classComputed(){

			return {
				'has-background-info' : this.isZip,
				'w-150' : this.isZip,
				'h-150' : !this.Video,
				'h-250' : this.isVideo
			}

		},

		progress(){
			return parseInt(this.file.progress);
		},

		isCropper(){
			return (this.cropper || (typeof this.cropper === 'string' && this.cropper.length > 0)) ? true : false
		},

		successLink(){
			return null
		},

		isZip(){

			if (this.isVideo || this.cropper) return false;

			var name = this.file.file.name

			var type = this.file.file.type // 'application/zip'

			var fileExtension = name.substring(name.lastIndexOf(".") + 1)

			return (fileExtension.toLowerCase() === 'zip') ? true : false;
		}

	},

	methods: {

		remove(){
			this.$emit('remove', this.file)
		}
	},

	filters: {
        formatSize(a, b = 2) {
            if (0 == a) return "0 Bytes";
            var c = 1024,
                d = b || 2,
                e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
                f = Math.floor(Math.log(a) / Math.log(c));
            return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
        }
    },
}
</script>