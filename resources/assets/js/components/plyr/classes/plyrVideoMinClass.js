import PlyrExtend from './plyr.polyfilled.js'
import Theater from './plyrTheaterClass.js'


const provider = 'vimeo';

const isAutoLoad = true;

const listeners = ['play', 'playing', 'pause', 'seeking', 'ended'];

const debug = false;

const validProviders = ['vimeo', 'youtube'];


const optionsDefaultPlyr = {
  
      volume : 1,
      iconUrl : window.location.origin + '/svg/plyr.svg',
      controls : ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      //settings : ['quality', 'captions', 'speed', 'loop'],
      //speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
      quality : { default: 'auto', options: [] },
      debug : false,
      tooltips: { controls: true, seek: true }
}


export default class Video {

  constructor(video, optionsPlyr = {}){

    this.vimeoDuration = null

    this.loggedEvent = null

    this.ready = false

    this.video = video

    this.optionsPlyr = {...optionsDefaultPlyr, ...optionsPlyr};

    for (let k in video){

      this[k] = video[k]

    }

    this.hasPressedPlay = false

  }

  getBestLevel(){

      var levels = this.levels.filter(level => { return level !== 'auto' })

      return {index : levels.length - 1, quality : levels[levels.length - 1]}
  }

  init(){

      return new Promise((resolve,reject) => {

          const video = document.querySelector('#player');

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

              if (this.video.hasOwnProperty('autoplay') && this.video.autoplay) this.player.play();

              resolve('test');

          });

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

  checkProvider(){

      if (validProviders.indexOf(this.video.provider) === -1){

          return { status : false, libel : 'invalid provider'}
      }

      if (!this.video.hasOwnProperty('url') || this.video.url === null || this.video.url === ''){

          return { status : false, libel : 'invalid url'}
      }

      return { status : true }
  }

  close(){

      //TO DO SEND AXIOS -> CLOSE MODAL

      setTimeout(() => {

        if (typeof this.player === 'undefined') return;

        let percentage = null

        if (this.vimeoDuration !== null){
                  
            percentage = ((parseInt(this.player.currentTime)/parseInt(this.vimeoDuration)) * 100).toFixed(2)
              
        } else if (this.player.duration > 0){

             this.vimeoDuration = this.player.duration;
        }

        const datas = {
              event : 'close',
              id : this.video.id,
              time : this.player.currentTime.toFixed(3),
              percentage : percentage
        }

        axios.post('/rest/watch/' + this.video.id, datas)

        this.player.stop()

        this.player.destroy()

      }, 0)

  }

  listen(){

      for (let k in listeners){

          this.player.on(listeners[k], (event) => {

              console.warn(event.type)

              if (event.type === 'ended'){

                  console.error('ended!!!!!')

                  this.close()

                  store.commit('video/setVideo', null)

                  store.commit('video/setModalVideo', false)

                  return

              }

              let percentage = null

              if (this.vimeoDuration !== null){
                  
                  percentage = ((parseInt(this.player.currentTime)/parseInt(this.vimeoDuration)) * 100).toFixed(2)
              
              } else if (this.player.duration > 0){

                  this.vimeoDuration = this.player.duration;
              }

              const datas = {
                  event : event.type,
                  id : this.video.id,
                  time : this.player.currentTime.toFixed(3),
                  percentage : percentage
              }

              if (this.loggedEvent !== null && typeof this.loggedEvent !== 'undfined' && this.loggedEvent.time === datas.time && this.loggedEvent.event === datas.event) return;

              this.loggedEvent = datas

              
              axios.post('/rest/watch/' + this.video.id, datas).then((response) => {

              }, (error) => {

              });
              
          });
      }
      
  }
}
