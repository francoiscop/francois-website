<template>
  <div id="scrollmagic">

      <v-scroll-buttons :is-top="isTop" :is-bottom="isBottom" @scroll="scroll($event)" ref="navigation"/>

      <div class="pinContainer" ref="pin">
          
          <section
              v-for="(p, index) in panels"
              class="panel relative"
              :class="`panel-${index}`"
              :style="{backgroundColor: p.bg_color}"
              :id="`panel-${index}`"
          > 

          <div v-if="p.bg_image !== null" :style="`height:100%;width:100%;background-image: url('` + p.bg_image + `');background-size:cover`">
              <div class="bebas">{{ p.title }}</div>
              <div class="u m-l-10 s-20" v-if="p.link !== null" style="margin-top:-50px;"><a :href="p.link.url">{{ p.link.title }}</a></div>
          </div>

          <div v-else>
              <div class="bebas">{{ p.title }}</div>
          </div>

        </section>
    
    </div>

  </div>
</template>


<style>
 body {
    margin: 0;
  }
  .pinContainer {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }
  .panel {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left:0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
  }
</style>

<script>
import VueScrollTo from 'vue-scrollto'

import scrollButtonsComponent from '../components/scrollToButtons.vue'

import debounce from 'lodash.debounce'


export default{

  components : {'v-scroll-buttons' : scrollButtonsComponent},

	mounted () {

      this.$nextTick(this.init)
  },
  
  data () {
    return {

      scene : null,
      
      index : -1,

      userScroll : true,

      pageY : 0,

      footerY : 0,

      duration : 100, // percentage

      fix : 0,

      isTop : false,

      isBottom : true,

      panels : _panels,

      wH : null,

      /*
      panels:[
        {
          title: 'news',
          bgColor: '#00d1b2',
        },
        {
          title : 'begotten',
          bgColor : '#F03861',
          bgImage : '/storage/__pics/2.jpg'
        },
        {
          title: 'dreyer',
          bgColor: '#ef5350',
          bgImage : '/storage/__pics/5.jpg'
        },
        {
          title: 'panel 3',
          bgColor: '#ec407a',
          bgImage : '/storage/__pics/4.jpg'
        },
        
        {
          title: 'experimental cinema',
          bgColor: '#66bb6a',
          bgImage : '/storage/__pics/6.png'
        },
        {
          title: 'rare !',
          bgColor: '#00d1b2',
        }
        
      ]
      */
    }
  },


  methods: {

    init(){

        this.setScene()

        this.setScrollYPositionPanel()

        this.listeners()

    },

    setScene(){

        const Length = this.panels.length
 
        // Create a new Timeline (equivalent to new TimelineMax())
        const timeline = new this.$gsap.TimelineMax()

        for (var i = 0; i < Length; i++) {
        
          let animFrom, animOutLetters;
          
          switch (i) { // Set animFrom value, depending on the index i of the item
            case 0:
            break; // First panel is already visible on page load, so no animation
            
            case 1:
              animFrom = {x: '-100%'} // Second panel comes from the left
            break;
            
            case 2:
              animFrom = {x: '100%'} // Third one comes from the right
            break;
            
            case 3:
              animFrom = {y: '-100%'} // Finally, the last one comes from the top
            break;
            
            case 4:
              animFrom = {y: '100%'} // Third one comes from the right
            break;
            
            case 5:
              animFrom = {x: '-100%'} // Third one comes from the right
            break;
          }
        
          if (i !== 0) {
              // For each panel except the one whom index is 0, create the tween and add it to the tl timeline
              timeline.fromTo(`section.panel-${i}`, 1.5, animFrom, {x: '0%', y: '0%', ease: Linear.easeNone})
          }
        }

        // create scene and set its params
        const scene = new this.$scrollmagic.Scene({
            triggerElement: '.pinContainer',
            triggerHook: 'onLeave',
            duration: `${Length * this.duration}%`,
            //loglevel : 3
        })
        .setPin('.pinContainer')
        .addIndicators()
        .setTween(timeline)

        // Add scene to ScrollMagic controller by emiting an 'addScene' event on vm.$ksvuescr (which is our global event bus)
        this.$ksvuescr.$emit('addScene', 'pinContainerScene', scene)

        //save scene
        this.scene = scene
    },
    
    getWindowHeight(){

        var w = window,
            d = document,
            e = d.documentElement,
            b = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || b.clientWidth,
            y = w.innerHeight || e.clientHeight || b.clientHeight;

        return y
    },

    getOffset( el ) {
    
        let _x = 0
        let _y = 0
        
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        
        return { top: _y, left: _x };
    },

    setScrollYPositionPanel(){

        var l = this.panels.length

        this.wH = this.getWindowHeight()

        var duration =  this.wH * l * (this.duration / 100)

        var num = l - 1

        const startPosition = this.getOffset( this.scene.triggerElement() ).top

        this.panels.forEach((panel, i) => {

            panel.Y = startPosition + ((duration * i) / num)

        })

        this.footerY = document.getElementById('footer').offsetHeight

    },

    showButtonsScroll(){

        if (this.index == -1){

          this.isTop = false;

        } else if (this.index == (this.panels.length - 1)){

          this.isBottom = false;

        } else {

          this.isTop = this.isBottom = true

        }

    },

    scroll(direction){

        this.userScroll = false

        //console.warn('START from button direction !!!!!' , direction)

        const $div = document.getElementById('panel-0')

        const l = this.panels.length

        let nav


        if (direction === 'next'){

            this.index ++

            this.index = Math.min(l, this.index)
        }

        if (direction === 'previous'){

            if (this.nav !== null) this.index --;

            this.index = Math.max(-1, this.index)

        }


        this.nav = this.index

        //console.error('Scrolling to :: -> index : ', this.index)

        if (this.index === -1){

          nav = 0;

          this.isTop = false;

        } else if (this.index === l){

          nav = this.panels[l - 1].Y + this.footerY;

          this.isBottom = false;

        } else {

          nav = this.panels[this.index].Y

          this.isTop = this.isBottom = true

        }

        VueScrollTo.scrollTo($div, { nav : nav, onDone : this.onDone })

    },

    onDone(){

        //console.error('DONE !!!')

        setTimeout(() => this.userScroll = true, 500);
    },

    listeners(){

        window.onbeforeunload = () => {
            
            console.log('onbeforeunload')
            
            window.scrollTo(0,0)
        
        }

        window.addEventListener('resize', debounce((e) => {

            var wH = this.getWindowHeight()

            if (wH === this.wH) return;

            window.scrollTo(0,0)

            this.setScrollYPositionPanel()

        
        }, 100, true));

        window.addEventListener('scroll', debounce((e) => {

            if (!this.userScroll) return;

            this.nav = null

            for (let k in this.panels){

                if (window.scrollY <= this.panels[k].Y){

                    this.index = k - 1;
              
                    break;
                }
            }

          //console.error('user scroll: ', this.userScroll)

          //console.error('INDEX debounce: ' , this.index)

          this.showButtonsScroll()

      }, 100))

    }
 
  },


  destroyed () {

      // Destroy ScrollMagic when our component is removed from DOM
      this.$ksvuescr.$emit('destroy')
  
  },


}


/*
// Calcualte duration and scroll distance for scrollTop
                var scrollMeTo = [];
                var totalHeight = [];
                $(".panel").each(function(i) {
                  // Calculate total height of all divs
                  // if (i == 0) {totalHeight.push($(".panel" + (i+1)).height())} else {totalHeight.push(($(".panel" + (i+1)).height())+totalHeight[i-1])};
                  if (i == 0) {totalHeight = ($(".panel" + (i+1)).height())} else {totalHeight =  (($(".panel" + (i+1)).height())+totalHeight)};
                });

                var sceneDuration = scene.duration();

                $(".panel").each(function(i) {
                  // Calculate scroll distance for each section from the top
                  // if (i == 0) {scrollMeTo.push(0)} else {scrollMeTo.push(Math.ceil(($(".panel" + (i)).height())+scrollMeTo[i-1]))};
                  if (i == 0) {scrollMeTo.push(0)}
                    else if ( i == numPanels-1 ) {scrollMeTo.push(Math.ceil((($(".panel" + (i)).height())*( sceneDuration / (totalHeight)))+scrollMeTo[i-1]))}
                    else {scrollMeTo.push(Math.ceil((($(".panel" + (i)).height())*( sceneDuration / (totalHeight)))+scrollMeTo[i-1]))};
      });
                console.log(sceneDuration);
                console.log(scrollMeTo[0])
                console.log(scrollMeTo[1])
                console.log(scrollMeTo[2])
                console.log(scrollMeTo[3])






                // how many panels
      var numPanels = $('.panel').length;

      // initialize vars
      var i = 0;
      var orderedPanels = [];
      var blackoutZ = [];
      var secTitles = [];
      var secId = [];

      // for every html element with the class panel, do these things
      $(".panel").each(function(i) {
        //add panel# to each  panel
        $(this).addClass("panel" + (i + 1));
        // generate CSS for z-index of each panel, negative numbers descending
        orderedPanels.push(".panel" + (i + 1) + " {z-index: -" + ((i + 1) * 2) + ";} ");
        // generate z-index in array for blackout class
        //blackoutZ.push("-"+(((i + 1) * 2)+1));
        // Get the titles of each element with .panel
        secTitles.push($(".panel" + (i+1)).attr('title'));
        // Get the id of each element with .panel
        secId.push($(".panel" + (i+1)).attr('id'));
      });

      // Get all high# for nav from divs with .highlights
      var navHighlight = $('.highlight').map(function(i, e) {
          return $(e).attr('id');
      }).get();

      // Get all high# for nav from divs with .highlights
      var navHref = $('.highlight').map(function(i, e) {
          return $(e).attr('href');
      }).get();

      // Add CSS for z-index of each panel to the head
      $("<style id='panelZOrder' type='text/css'>" + (orderedPanels.join("")) + "</style>").appendTo("head");

      // Set delay between panels
      var delayPanels = 1.25;






      $(function () { // wait for document ready

        var obj1Height = $('.additionalContent').height();
        var winHeight = $('.panel').height();
        var offset1 = (obj1Height - winHeight) * -1;

        console.log('winHeight: ' + winHeight);
        console.log('offset: ' + offset1);

        // define movement of panels
        var wipeAnimation = new TimelineMax()
          //intro
          .fromTo("section.panel.panel1", 1, {
            y: "0%"
          }, {
            y: "-100%",
            ease: Linear.easeNone
          },"panel1")
          .to("#high1",0,{css:{className:"+=active"}},"panel1")
          .to("#high2",0,{css:{className:"-=active"}},"panel1")

          // values
          .fromTo("section.panel.panel2", 1, {
            y: "0%"
          }, {
            y: "-100%",
            ease: Linear.easeNone
          },"panel2")
          .to("#high1",0,{css:{className:"-=active"}},"panel2")
          .to("#high2",0,{css:{className:"+=active"}},"panel2")
          .to("#high3",0,{css:{className:"-=active"}},"panel2")
          .to('section.panel .additionalContent', 1, {y: offset1, ease: Linear.easeNone}, 'panel3')
          // process
          .fromTo("section.panel.panel3", 1, {
            y: "0%"
          }, {
            y: "-100%",
            ease: Linear.easeNone
          },"panel3")
          .to("#high2",0,{css:{className:"-=active"}},"panel3")
          .to("#high3",0,{css:{className:"+=active"}},"panel3")
          .to("#high4",0,{css:{className:"-=active"}},"panel3")
          

          // services
          .fromTo("section.panel.panel4", 1, {
            y: "0%"
          }, {
            y: "-100%",
            ease: Linear.easeNone
          },"panel4")
          .to("#high3",0,{css:{className:"-=active"}},"panel4")
          .to("#high4",0,{css:{className:"+=active"}},"panel4")
          .to("#high5",0,{css:{className:"-=active"}},"panel4")

          // footer - connect
            .fromTo("footer.panel.panel5", 1, {
              y: "0%",
              top: "0%"
            }, {
              y: "-100%",
              top: "100%",
              ease: Linear.easeNone
            },"panel5")
          .to("#high4",0,{css:{className:"-=active"}},"panel5")
          .to("#high5",0,{css:{className:"+=active"}},"panel5")
          ;


        // init controller — controllerSlides
        var controllerSlides = new ScrollMagic.Controller({container: "#superwrapper"});

        // create scene to pin and link animation
        var scene = new ScrollMagic.Scene({
          triggerElement: "#pinContainer",
          triggerHook: "onLeave",
          duration: "400%"
        })
        .setPin("#pinContainer")
        .setTween(wipeAnimation)
        .addIndicators() // add indicators (requires plugin)
        .addTo(controllerSlides);



                // Calcualte duration and scroll distance for scrollTop
                var scrollMeTo = [];
                var totalHeight = [];
                $(".panel").each(function(i) {
                  // Calculate total height of all divs
                  // if (i == 0) {totalHeight.push($(".panel" + (i+1)).height())} else {totalHeight.push(($(".panel" + (i+1)).height())+totalHeight[i-1])};
                  if (i == 0) {totalHeight = ($(".panel" + (i+1)).height())} else {totalHeight =  (($(".panel" + (i+1)).height())+totalHeight)};
                });

                var sceneDuration = scene.duration();

                $(".panel").each(function(i) {
                  // Calculate scroll distance for each section from the top
                  // if (i == 0) {scrollMeTo.push(0)} else {scrollMeTo.push(Math.ceil(($(".panel" + (i)).height())+scrollMeTo[i-1]))};
                  if (i == 0) {scrollMeTo.push(0)}
                    else if ( i == numPanels-1 ) {scrollMeTo.push(Math.ceil((($(".panel" + (i)).height())*( sceneDuration / (totalHeight)))+scrollMeTo[i-1]))}
                    else {scrollMeTo.push(Math.ceil((($(".panel" + (i)).height())*( sceneDuration / (totalHeight)))+scrollMeTo[i-1]))};
      });
                console.log(sceneDuration);
                console.log(scrollMeTo[0])
                console.log(scrollMeTo[1])
                console.log(scrollMeTo[2])
                console.log(scrollMeTo[3])


        // Advance Mobile support for ScrollMagic
          // detect if mobile browser. regex -> http://detectmobilebrowsers.com
          var isMobile = (function(a){return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

          // // only use iScroll if mobile
          if (isMobile) {

            // scroll to top to prevent "scroll cropping" and make iscroll happy
            $("html, body, #superwrapper").animate(0, "slow");

            // configure iScroll
            var myScroll = new IScroll('#superwrapper',
                  {
                    // don't scroll horizontal
                    scrollX: false,
                    // but do scroll vertical
                    scrollY: true,
                    // show scrollbars
                    scrollbars: true,
                    // deactivating -webkit-transform because pin wouldn't work because of a webkit bug: https://code.google.com/p/chromium/issues/detail?id=20574
                    // if you dont use pinning, keep "useTransform" set to true, as it is far better in terms of performance.
                    useTransform: false,
                    // deativate css-transition to force requestAnimationFrame (implicit with probeType 3)
                    useTransition: false,
                    // set to highest probing level to get scroll events even during momentum and bounce
                    // requires inclusion of iscroll-probe.js
                    probeType: 3,
                    // pass through clicks inside scroll container
                    click: true
                  }
              );

            // overwrite scroll position calculation to use child's offset instead of container's scrollTop();
            // controller.scrollPos(function () {
            controllerSlides.scrollPos(function () {
              return -myScroll.y;
            });

            // thanks to iScroll 5 we now have a real onScroll event (with some performance drawbacks)
            myScroll.on("scroll", function () {
              // controller.update();
              controllerSlides.update();
            });

            // // add indicators to scrollcontent so they will be moved with it (requires plugin)
            // scene.addIndicators({parent: ".scrollContent"});
            // } else {
            // scene.addIndicators();
          }


          // Smooth scroll with wipes and iScroll
          // Smooth scroll with wipes — on page load
          if (window.location.hash) {  // #
            var targetSection = window.location.hash.substring(1);
            var secIndex = jQuery.inArray(targetSection, secId);
            var scrollThisThing = scrollMeTo[secIndex];
            if (isMobile) {
              scrollThisThing = -Math.abs(scrollThisThing);
              myScroll.scrollTo(0, scrollThisThing, 600, IScroll.utils.ease.circular);
            } else {
              $("html, body, #superwrapper").animate({ scrollTop: scrollThisThing }, "slow");
            };
          };

          // Smooth scroll with wipes — on Click
          $(document).on("click", "a[href^='#']", function (e) {
            var targetSection = $(this).attr('href').substring(1);
            var secIndex = jQuery.inArray(targetSection, secId);
            var scrollThisThing = scrollMeTo[secIndex];

            if (isMobile) {
              scrollThisThing = -Math.abs(scrollThisThing);
              myScroll.scrollTo(0, scrollThisThing, 600, IScroll.utils.ease.circular);
            } else {
              $("html, body, #superwrapper").animate({ scrollTop: scrollThisThing }, "slow");
            };
          });

      });
*/
</script>