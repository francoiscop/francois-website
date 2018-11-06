@extends('_layouts.master')

@section('content')

<transition name="route-anim" enter-active-class="animated fadeInUp">
    <router-view></router-view>
</transition>

<!--<vs-plyr-modal></vs-plyr-modal>-->

@endsection

@section('js_footer')

<script type="text/javascript">

var _panels = JSON.parse('{!! json_encode($menu, JSON_HEX_APOS|JSON_HEX_QUOT) !!}');

var _videos = JSON.parse('{!! json_encode($videos, JSON_HEX_APOS|JSON_HEX_QUOT) !!}');

</script>

<script type="text/javascript">

var vm = new Vue({
  el: '#app',
  store,
  router
})

</script>
@endsection