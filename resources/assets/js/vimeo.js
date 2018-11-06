const Vimeo = require ("@vimeo/player/dist/player.js")

const vimeoPost = (type, event, player) => {

    if (['play', 'pause'].indexOf(type) > -1) store.commit('video/setReelLoader', false)

    player.getCurrentTime().then((seconds) => {

        const datas = {
             event : type,
             id : _reel.id,
             time : seconds.toFixed(3),
             percentage : event.percentage * 100
        }

        axios.post('/rest/watch/' + _reel.id, datas)
    
    }).catch((error) => {

        console.error(error)
    })
}



window.addEventListener("load", () => {

    let trigger = document.getElementById('demo__trigger')

    let iframe = document.getElementById('vimeo-wrapper__player')

    if (iframe === null) return;

    let wrapper = document.getElementById('vimeo-wrapper')

    let brandCenter = document.getElementById('brand-center')

    let menu = document.getElementById('menu')

    let footer = document.getElementById('footer')

    let content = document.getElementById('content')

    var player = new Vimeo(iframe)

    player.on('loaded', () => {
        console.warn('loaded')
    })
     player.on('bufferstart', () => {
        console.warn('bufferstart')
    })
      player.on('bufferend', () => {
        console.warn('bufferend')
    })
    
    player.on('play', (event) => vimeoPost('play', event, player))
     
    player.on('pause', (event) => vimeoPost('pause', event, player))
    
    player.on('ended', (event) => vimeoPost('ended', event, player))


                
    trigger.addEventListener("click", () => {

        if (trigger.classList.contains('demo--play')){

                store.commit('video/setReelLoader', false)

                trigger.textContent = 'play demo'

                footer.classList.remove('has-background-black')

                menu.classList.remove('has-background-black')

                content.classList.remove('has-background-black')

                trigger.classList.remove('demo--play');

                wrapper.classList.remove('o-10');

                brandCenter.classList.remove('o-2');

                player.pause()

        } else {

            store.commit('video/setReelLoader', true)

                trigger.textContent = 'pause demo';

                menu.className += ' has-background-black'

                footer.className += ' has-background-black'

                content.className += ' has-background-black'

                trigger.className += ' demo--play';

                wrapper.className += ' o-10';

                brandCenter.className += ' o-2';

                player.setVolume(1)

                player.play().then().catch((e) => {

                    console.error('error vimeo play ->', e)

                    store.commit('video/setReelLoader', false)
                
                })
        }          

    });
});