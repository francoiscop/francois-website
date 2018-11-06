export default {

	namespaced: true,

	state: {

		videos : null,
		video : null,
		modalVideo : false,
		thumbs : null,
		screencapsVideo : null,
		screencapsImages : [],
		modalScreencaps : false,
		reelLoader : false
	},

	getters: {

		getVideos: state => state.videos,

		getThumbs: state => state.thumbs,

		getVideo: state => state.video,

		getModalVideo: state => state.modalVideo,

		getScreencapsVideo: state => state.screencapsVideo,

		getScreencapsImages: state => state.screencapsImages,

		getModalScreencaps: state => state.modalScreencaps,

		getReelLoader: state => state.reelLoader

	},

	actions: {

		fetchVideos({commit, state}){

			let thumbs = _videos.reduce(({count, sum}, video) => {

				return (video.thumbs.length > 0) ? 
				
				{count: count + 1, sum: sum + video.thumbs.length}
				
				: {count, sum};

			}, { count: 0, sum: 0 })

			commit('setThumbs', thumbs.sum / thumbs.count)

			commit('setVideos', _videos)
		},

		fetchScreencaps({commit, state}){

			if (state.screencapsVideo === null) return;

			return new Promise((resolve,reject) => {

				axios.get('/rest/screencaps/' + state.screencapsVideo.id).then((response)  =>  {

					commit('setScreencapsImages', response.data.images)

					resolve(response)

                }, (error)  =>  {

                	reject(error)
                });
			})
		}
	},

	mutations: {

		setVideos(state, videos){

			state.videos = videos

		},

		setVideo(state, video){

			state.video = video

			state.modalVideo = true

		},

		setModalVideo(state, bool){

			state.modalVideo = bool

		},

		setScreencapsVideo(state, screencaps){

			state.screencapsVideo = screencaps

			state.modalScreencaps = true

		},

		setScreencapsImages(state, images){

			state.screencapsImages = images

		},

		setModalScreencaps(state, bool){

			state.modalScreencaps = bool

		},

		setThumbs(state, thumbs){

			state.thumbs = thumbs

		},

		setReelLoader(state, bool){

			state.reelLoader = bool

		}
	}

}