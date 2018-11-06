import Hls from 'hls.js'


/*
||
|| HACK HLS : line 10634
||
*/


const provider = 'vimeo';

let optionsDefault = {
      volume : 1,
      //iconUrl : window.location.origin + '/js/vendors/_plyr.3.2.4/plyr.svg',
      controls : ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'download', 'captions', 'settings', 'pip', 'airplay', 'fullscreen', 'in', 'out'],
      settings : ['quality', 'captions', 'speed', 'loop'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
      quality : { default: 'default', options: ['240p', 'default'] },
      //debug : true,
  };

 const optionsDefaultPlyr = {
 	  volume : 1,
      //iconUrl : window.location.origin + '/js/vendors/_plyr.3.2.4/plyr.svg',
      //controls : controls,
      controls : ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'download', 'captions', 'settings', 'pip', 'airplay', 'fullscreen', 'in', 'out'],
      settings : ['quality', 'captions', 'speed', 'loop'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
      //quality : { default: 'default', options: ['240p', 'default'] },
      debug : true,
  }

 const optionsDefaultHLS = {

      autoStartLoad: false,
      //autoStartLoad: true,
      startPosition : -1,
      capLevelToPlayerSize: false,
      debug: true,
      //debug : false,
      defaultAudioCodec: undefined,
      initialLiveManifestSize: 1,
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
      maxBufferSize: 60*1000*1000,
      maxBufferHole: 0.5,
      lowBufferWatchdogPeriod: 0.5,
      highBufferWatchdogPeriod: 3,
      nudgeOffset: 0.1,
      nudgeMaxRetry : 3,
      maxFragLookUpTolerance: 0.2,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 10,
      enableWorker: true,
      enableSoftwareAES: true,
      manifestLoadingTimeOut: 10000,
      manifestLoadingMaxRetry: 1,
      manifestLoadingRetryDelay: 500,
      manifestLoadingMaxRetryTimeout : 64000,
      //startLevel: -1,
     startLevel : -1,
     
     //maxAutoLevel : 3,

      levelLoadingTimeOut: 10000,
      levelLoadingMaxRetry: 4,
      levelLoadingRetryDelay: 500,
      levelLoadingMaxRetryTimeout: 64000,
      fragLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 6,
      fragLoadingRetryDelay: 500,
      fragLoadingMaxRetryTimeout: 64000,
      startFragPrefetch: false,
      appendErrorMaxRetry: 3,
      //loader: customLoader,
      //fLoader: customFragmentLoader,
      //pLoader: customPlaylistLoader,
      //xhrSetup: XMLHttpRequestSetupCallback,
      //fetchSetup: FetchSetupCallback,
      //abrController: customAbrController,
      //timelineController: TimelineController,
      enableWebVTT: true,
      enableCEA708Captions: true,
      stretchShortVideoTrack: false,
      maxAudioFramesDrift : 1,
      forceKeyFrameOnDiscontinuity: true,
      abrEwmaFastLive: 5.0,
      abrEwmaSlowLive: 9.0,
      abrEwmaFastVoD: 4.0,
      abrEwmaSlowVoD: 15.0,
      abrEwmaDefaultEstimate: 500000,
      abrBandWidthFactor: 0.95,
      abrBandWidthUpFactor: 0.7,
      minAutoBitrate: 0
  };

 const listeners = ['playing', 'play', 'pause', 'seeking', 'ended'];

export default class Video {

	constructor(video, optionsPlyr = {}, optionsHLS = {}){

		this.ready = false;

		this.video = video;

		this.optionsPlyr = {...optionsDefaultPlyr, ...optionsPlyr};

		this.optionsHLS = {...optionsDefaultHLS, ...optionsHLS};

		//console.warn('OPTIONS', this.options);

		for (let k in video){

			this[k] = video[k];

		}
	}

	init(){

		return new Promise((resolve,reject) => {

			this.initHLS().then(response => {

				console.warn('OPTIONS PLYR :', this.optionsPlyr);
				
        this.player = new PlyrExtend('#player', this.optionsPlyr)

				this.player.on('ready', (event) => {

          //emit hls levels to player::
          //this.player.setOptionsQuality = response;

          this.player.quality = 'auto';

          console.warn('START LEVEL : ', window.hls.startLevel);
          console.warn('CURRENT LEVEL : ', window.hls.currentLevel);
          console.warn('NEXT LEVEL : ', window.hls.nextLevel);

          console.warn('NEXT AUTO LEVEL : ', window.hls.nextAutoLevel);

		 			this.ready = true;

		 			var _this = event.detail.plyr;

		 			if (this.hasOwnProperty('autoplay') && this.autoplay) _this.play();
		 		
		 			//console.log('ON PLAYER READY : ');
		 			//console.warn('_THIS',_this.options);
		 			//console.warn('PLAYER',this.player);

		 			resolve();

		 		});


        this.player.on('play', (event) => {

          console.warn('PLAY')

          console.warn('START LEVEL : ', window.hls.startLevel);
          console.warn('CURRENT LEVEL : ', window.hls.currentLevel);
          console.warn('NEXT LEVEL : ', window.hls.nextLevel);
          console.warn('NEXT AUTO LEVEL : ', window.hls.nextAutoLevel);

        });

			}).catch(e => {
			
				//throw e;
				reject(e);
		
			})
		})

	}

	initHLS(){

		return new Promise((resolve,reject) => {

			if (Hls.isSupported()){

				console.error('HLS supported!');
              
              	var video = document.getElementById('player');

              	//console.warn('VIDEO', video);
              
              	this.hls = new Hls(this.optionsHLS);

              	window.hls = this.hls;
              
              	this.hls.attachMedia(video);

                hls.on(Hls.Events.ERROR, function (event, data) {

                    return reject(data.details);

                    /*
                    console.warn('ERROR EVENT', event);
                    console.warn('ERROR DATA', data);

                    var errorType = data.type;

                    var errorDetails = data.details;

                    var errorFatal = data.fatal;

                    switch(data.details) {

                        case hls.ErrorDetails.FRAG_LOAD_ERROR:
                        // ....
                        break;

                        default:
                        break;
                    }
                    */
                });
              
              	this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                                    
                  	this.hls.loadSource(this.src);
                  
                  	console.error('HLS LOAD SOURCE : ' + this.src);
                  
                  	this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                      
                      	console.warn('HLS MANIFEST PARSED');

                      	//this.player.play();

                      	//get hls levels::
                      	let k, levels = [];
                      
                      	for(k in this.hls.levels){
                        	levels.push(this.hls.levels[k].height);
                      	}

                        levels.push('auto');

                      	this.optionsPlyr.quality = {default: 'auto', options: levels};
                      	//quality : { default: 'default', options: ['240p', 'default'] },

                      	//window.hls.nextLevel = 2;
                     
                      	console.warn('LEVELS::', levels);
                        console.warn('START LEVEL : ', window.hls.startLevel);
                        console.warn('CURRENT LEVEL : ', window.hls.currentLevel);
                        console.warn('NEXT LEVEL : ', window.hls.nextLevel);
                        console.warn('NEXT AUTO LEVEL : ', window.hls.nextAutoLevel);

                      	resolve(levels);                  

                      	//emit hls levels to player::
                      	//this.player.setOptionsQuality = levels;
                      
                  	});
              	});

			} else {
				reject('HLS NOT SUPPORTED !!')
			}
		});

	}


	initxxx(){

		return new Promise((resolve,reject) => {

			this.player = new PlyrExtend('#player', this.optionsPlyr)

			this.player.sayHello();

			if (this.hasOwnProperty('provider') && this.provider === 'hls'){

				this.initHLS();

				return;
			}

			this.listen();

		 	this.setSource();

		 	this.player.on('ready', (event) => {

		 		this.ready = true;

		 		var _this = event.detail.plyr;

		 		if (this.hasOwnProperty('autoplay') && this.autoplay) _this.play();
		 		
		 		//console.log('ON PLAYER READY : ');
		 		//console.warn('_THIS',_this.options);
		 		//console.warn('PLAYER',this.player);

		 		resolve();

		 	});    
        });
	}

	initHLSxxx(){

		if (Hls.isSupported()){

              console.error('HLS supported!');
              
              var video = document.getElementById('player');

              //console.warn('VIDEO', video);
              
              this.hls = new Hls(this.optionsHLS);

              window.hls = this.hls;
              
              this.hls.attachMedia(video);
              
              //console.warn('HLS',this.hls);

              this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                  
                  console.warn('HLS MEDIA_ATTACHED');
                  //console.warn(this.src);
                  
                  this.hls.loadSource(this.src);
                  
                  console.error('HLS LOAD SOURCE : ' + this.src);
                  
                  this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                      
                      console.warn('HLS MANIFEST PARSED');

                      //this.player.play();

                      //get hls levels::
                      var k, levels = [];
                      
                      for(let k in this.hls.levels){
                        levels.push(this.hls.levels[k].height);
                      }
                     
                      console.warn('LEVELS::', levels);                      

                      //emit hls levels to player::
                      this.player.setOptionsQuality = levels;
                      
                      setTimeout(() => {
                          //vm.isReady = true;
                      }, 3000);
                      
                  });
              });

        } else console.error('HLS not supported!');
	}

	setSource(){

		this.player.source = {
			type:       'video',
			title:      this.title,
			sources: [{
				src:    this.src,
				provider:   this.getProvider()
			}]
		}
	}

	listen(){

		for (let k in listeners){

			this.player.on(listeners[k], (event) => {

				var datas = {
					event : event.type,
					title : this.video.title,
					time : this.player.currentTime.toFixed(3)
				};

				axios.post('/rest/watch/' + this.video.id, datas).then((response) => {

				}, (error) => {

				});
			});
		}
	}

	getProvider(){

		if (!this.video.hasOwnProperty('provider')) return this.provider
	}
}