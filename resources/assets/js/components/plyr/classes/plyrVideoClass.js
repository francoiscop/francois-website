import Hls from 'hls.js'
import PlyrExtend from './plyr.polyfilled.js'
import Edit from './plyrEditClass.js'
import Theater from './plyrTheaterClass.js'

/*
||
|| HACK HLS : line 10634
||
*/

//const isBestLevel = false => 'auto'
const isBestLevel = true

const provider = 'vimeo';

const isAutoLoad = true;

const listeners = ['playing', 'pause', 'seeking', 'ended'];

const debug = false;

const validProviders = ['vimeo', 'youtube'];


/*
var xhrConfig = function(xhr, url) {

    //if (url.indexOf('http://') === 0) {
      //url = url.replace('http://', 'https://');
    //}
    url = url.replace('/hls', '/mediumrare/public/hls')
    //xhr.withCredentials = true;
    xhr.open('GET', url, true);
    //xhr.setRequestHeader('Authorization', token)
}
*/

const optionsDefaultPlyr = {
  
      volume : 1,
      iconUrl : window.location.origin + '/svg/plyr.svg',
      controls : ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'download', 'captions', 'settings', 'pip', 'airplay', 'fullscreen', 'in', 'out', 'quality-info', 'theater'],
      settings : ['quality', 'captions', 'speed', 'loop'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
      quality : { default: 'auto', options: [] },
      debug : false,
      tooltips: { controls: true, seek: true }
  }


 const optionsDefaultHLS = {

      //autoStartLoad: false,
      autoStartLoad: true,
      startPosition : -1,
      capLevelToPlayerSize: false,
      //debug: true,
      debug : false,
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
    // startLevel : -1,
     //startLevel: 1,
     startLevel : (isBestLevel) ? 0 : -1,

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
      
      //xhrSetup:xhrConfig,
      
      //fetchSetup: fetchConfig,
      //abrController: customAbrController,
      //timelineController: TimelineController,

      /*
      pLoader: function (config) {
    let loader = new Hls.DefaultConfig.loader(config);

    this.abort = () => loader.abort();
    this.destroy = () => loader.destroy();
    this.load = (context, config, callbacks) => {
      let {type, url} = context;

      url = url.replace('hls', 'mediumrare/public/hls')

    //  if (type === 'manifest') {
    console.warn(url)
        console.log(`Manifest ${url} will be loaded.`);
    //  }

      loader.load(context, config, callbacks);
    };
  },
  */
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



export default class Video {

  constructor(video, optionsPlyr = {}, optionsHLS = {}){

    this.ready = false;

    this.video = video;

    this.optionsPlyr = {...optionsDefaultPlyr, ...optionsPlyr};

    this.optionsHLS = {...optionsDefaultHLS, ...optionsHLS};

    for (let k in video){

      this[k] = video[k];

    }

    this.hasPressedPlay = false

  }

  levels(){

      this.levels = [];

      for (let k in hls.levels){

          this.levels.push(hls.levels[k].height);
      }

      this.levels.push('auto');

      this.optionsPlyr.quality = {default: 'auto', options: this.levels};

  }

  getBestLevel(){

      var levels = this.levels.filter(level => { return level !== 'auto' })

      return {index : levels.length - 1, quality : levels[levels.length - 1]}
  }

  init(){

      return new Promise((resolve,reject) => {

          const video = document.querySelector('#player');

          if (!this.isHLS()){

                const check = this.checkProvider()

                if (!check.status) reject({libel : check.libel })

                this.player = new PlyrExtend('#player', this.optionsPlyr)

                this.setSource();

                this.listen();

                window.Edit = null;

                if (this.optionsPlyr.controls.indexOf('theater') > -1){

                    window.Theater = new Theater() // => THIS GENERATE BREAK ERROR ?????? !!!!!
                
                }

                this.player.on('ready', (event) => {

                  if (debug) console.warn('PLAYER READY');

                  console.warn('PLAYER READY');

                  var _this = event.detail.plyr;

                  if (this.video.hasOwnProperty('autoplay') && this.video.autoplay) _this.play();

                  resolve('test');

                });

                return

          }

          if (!isAutoLoad) this.optionsHLS.autoStartLoad = false;

          if (Hls.isSupported()){

                if (debug) console.error('HLS supported!');

                window.hls = new Hls(this.optionsHLS);

                hls.attachMedia(video);

                hls.on(Hls.Events.ERROR, function (event, data) {

                    if (data.fatal) return reject(data);

                });

                hls.on(Hls.Events.MEDIA_ATTACHED, () => {

                    hls.loadSource(this.src);

                    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {

                        if (debug) console.error('HLS MANIFEST PARSED');

                        this.levels();

                        this.player = new PlyrExtend('#player', this.optionsPlyr)

                        window.Edit = new Edit(this.video, this.player);

                        if (this.optionsPlyr.controls.indexOf('theater') > -1){

                            window.Theater = new Theater() // => THIS GENERATE BREAK ERROR ?????? !!!!!
                        }
                      

                        this.player.on('ready', event => {

                            if (debug) console.warn('PLAYER READY');

                            resolve()
                        })

                        if (isBestLevel){

                            var bestLevel = this.getBestLevel()

                            hls.loadLevel = bestLevel.index
                            
                            if (debug) console.error('plyr.vue -> BEFORE SETTING PLAYER QUALITY');

                            this.player.quality = bestLevel.quality
                            
                            if (debug) console.error('plyr.vue -> this.player', this.player)
                            if (debug) console.error('plyr.vue -> quality', this.player.quality)
                        }

                        if (!isAutoLoad){

                            this.player.on('play', event => {

                              hls.startLoad(-1)

                            });

                        }

                        this.player.on('play', event => {

                            if (this.hasPressedPlay) return;

                            this.hasPressedPlay = true

                            this.postView(this.player.currentTime)

                        });
                        
                        this.player.on('qualityrequested', event => {

                            const quality = event.detail.quality;

                            let index = this.levels.indexOf(parseInt(quality));

                            if (debug){

                                console.error('plyr.vue -> index ', index)
                                console.error('plyr.vue -> quality', typeof quality)
                                console.error('plyr.vue -> this.levels', this.levels)
                            }

                            if (index === this.levels.length - 1) index = -1;


                            if (debug){

                                console.error('plyr.vue -> index is AUTO ?', index)
                                console.warn('plyr.vue -> qualityrequested (QUALITY)::', quality)
                                console.warn('plyr.vue -> INDEX::', index)
                                console.error('************************* hls currentLevel ÷ loadlevel ÷ index :', hls.currentLevel, hls.loadLevel, index)
                            
                            }


                            //if (hls.currentLevel !== index){
                            if (hls.loadLevel !== index){

                                  hls.currentLevel = index;
                                  //hls.loadLevel = index;

                            }

                        });

                        this.player.on('qualitychange', event => {

                            if (debug) console.warn('plyr.vue -> qualitychange ::', event.detail)

                        });
                    });
                });

                if (debug){

                    hls.on(Hls.Events.LEVEL_SWITCHED, function(event, data) {
                        console.error('EVENT LEVEL_SWITCHED!!!!', data)
                    });

                    hls.on(Hls.Events.LEVEL_LOADED, function(event, data) {
                        console.error('EVENT LEVEL_LOADED!!!!', data)
                    });

                    hls.on(Hls.Events.LEVEL_SWITCHING, function(event, data) {
                        console.error('EVENT LEVEL_SWITCHING!!!!', data)
                    });

                    hls.on(Hls.Events.FRAG_CHANGED, function(event, data) {
                        console.error('EVENT FRAG_CHANGED!!!!', data)
                    });
                }

            } else {
              
              if (debug) console.error('HLS NOT SUPPORTED !!')
              
              reject(999)
            
            }
      });

  }

  postView(currentTime){

      const url = this.getUrlPostView()

      axios.post(url).then((r) => {

          if (debug) console.warn(r)
      
      }).catch((e) => {

          if (debug) console.error(e)
      })

  }

  getUrlPostView(){

      let model = 'video'

      if (_video.hasOwnProperty('extract') && _video.extract) model = 'extract';

      if (_video.hasOwnProperty('short') && _video.short) model = 'short'

      return '/rest/view/' + model + '/' + _video.id
  }

  setSource(){

      this.player.source = {
          type:       'video',
          title:      this.video.title,
          sources: [{
            src:    this.video.url,
            provider:   this.video.provider
          }]
      }
  }

  isHLS(){

      if (!this.video.hasOwnProperty('provider') || this.video.provider === null || this.video.provider === 'hls') return true;

      return false
  }

  checkProvider(){

      if (validProviders.indexOf(this.video.provider) === -1){

          return { status : false, libel : 'invalid provider'}
      }

      if (!this.video.hasOwnProperty('url') || this.video.url === null || this.video.url === ''){

          return { status : false, libel : 'invalid url'}
      }

      return { status : true }
  }

  listen(){

      this.player.on('play', event => {

        if (this.hasPressedPlay) return;

        this.hasPressedPlay = true

        this.postView(this.player.currentTime)

      });

      /*

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
      */
  }
}
