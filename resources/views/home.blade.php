@extends('_layouts.master')

@section('js_header')
@endsection

@section('css')
<style type="text/css">

</style>
@endsection

@section('content')

<div class="z-999 flex flex-center anim-opacity" style="position: fixed;height: 100vh;width: 100%;display: none;" id="loading-page">
  <div class="anton s-20  o-5 absolute center-absolute center-text has-text-dark">
    <!--
      <div>FRANCOIS COPPEY</div>
      <div>DIRECTOR OF PHOTOGRAPHY</div>
    -->
  </div>
</div>

<transition name="route-anim" enter-active-class="animated fadeInUp">
    <router-view></router-view>
</transition>

<div style="height: 100%;width:100%;" class="flex flex-column flex-center debug">

    <div id="brand-center" class="anton s-20 has-text-custom-5 center-text z-2">
          <div>FRANCOIS COPPEY</div>
          <div>DIRECTOR OF PHOTOGRAPHY</div>
    </div>
                
    <div id="demo__trigger" class="demo--pause pointer z-20 has-text-custom-red">
          play demo
    </div>

    <div id="vimeo-wrapper" class="vimeo-wrapper o-0 anim-opacity z-1">
      
          <iframe id="vimeo-wrapper__player" src="https://player.vimeo.com/video/{{ $reel->url }}?api=1&background=1&autoplay=0&loop=1&byline=0&title=0"
           frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen>
          </iframe>
        
    </div>

</div>

<vs-videos></vs-videos>

<b-loading :is-full-page="true" :active.sync="reelLoader"></b-loading>

@endsection

@section('js_footer')
<script type="text/javascript">

var _panels = JSON.parse('{!! $menu->toJson() !!}');

var _reel = JSON.parse('{!! json_encode($reel, JSON_HEX_APOS|JSON_HEX_QUOT) !!}');

var _videos = JSON.parse('{!! json_encode($selection, JSON_HEX_APOS|JSON_HEX_QUOT) !!}');

</script>

<script type="text/javascript" src="/js/vimeo.js"></script>

<script type="text/javascript">

var vm = new Vue({
  el: '#app',
  store,
  router,
  created(){
    router.push({path:'/reel'})
  },

  computed: {
    reelLoader(){
      return store.getters['video/getReelLoader']
    }
  }
})

</script>
@endsection