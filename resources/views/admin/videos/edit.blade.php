@extends('admin._layouts.master-admin')

@section('hero')
@endsection

@section('left')
@endsection

@section('content')

<div class="debug flex m-20"> 
@foreach ($video->thumbs as $thumb)
<div class="aspect__ratio--16-9 center-auto" style="width: 300px">
    <div style="background-size:cover;background-image: url('{{ $thumb }}');" class="has-background-primary border-white">
          <!--<router-link :to="{ path: 'thumb', params: { id: {{$loop->index}} }}">-->
          <router-link to="/thumb/{{ $loop->index + 1 }}">
              <div class="edit-poster absolute center-absolute tooltip is-tooltip-warning is-tooltip-right flex flex-center pointer anim-opacity" data-tooltip="EDIT THUMB">
                        <i class="material-icons s-20 has-text-light edit-icon">settings</i>
              </div>
          </router-link>
    </div>
</div>
@endforeach
</div>

<div class="aspect__ratio--30 min-w-100 has-background-primary debug">
      <div style="background-size:cover;background-image: url('{{ $video->hero }}');">
          <router-link to="/thumb/hero">
              <div class="edit-poster absolute center-absolute tooltip is-tooltip-warning is-tooltip-right flex flex-center pointer anim-opacity" data-tooltip="EDIT HERO">
                        <i class="material-icons s-20 has-text-light edit-icon">settings</i>
              </div>
          </router-link>
      </div>
</div>



<div class="video-index m-b-1 video-index--fullwidth has-background-primary debug">

      <div class="cover-image--full z-1" style="background-image: url('{{ $video->hero }}');"></div>           
</div>
					


<p class="m-b-20"><router-link to="/edit">EDIT INFOS</router-link></p>

<transition name="route-anim" enter-active-class="animated fadeInUp" leave-active-class-xx="animated flipInY">
    <router-view></router-view>
</transition>


@endsection

@section('js_footer')

<script type="text/javascript">

var _form = JSON.parse('{!! json_encode($form, JSON_HEX_APOS|JSON_HEX_QUOT) !!}')

var _upload = JSON.parse('{!! json_encode($upload, JSON_HEX_APOS|JSON_HEX_QUOT) !!}');

var user = JSON.parse('{!! Auth::guard("admin")->user() !!}');

</script>

<script type="text/javascript" src="/js/vue/form.js"></script>
<!--<script type="text/javascript" src="/js/vue/route.js"></script>-->

<script type="text/javascript">

var vm = new Vue({
  el: '#app', 
  router,
  store,
  created(){
    
    this.$router.push({path:'/edit'})
  
  }
})

</script>
@endsection