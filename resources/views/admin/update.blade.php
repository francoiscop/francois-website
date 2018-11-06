@extends('admin._layouts.master-admin')

@section('css')




<style>
#r-form{
  max-width: 600px;
  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 20px;
  border:1px solid rgba(200,200,200,0.4);
}
</style>
@endsection

@section('hero')
@include ('films.components.hero')
@endsection
  
@section('left')
@include ('films.components.cover')
@endsection

@section('content')

<div id="r-form">
    <vv-form 
      :label="'update'"
      :url="'/admin/rest/update/{{ $video->id }}'"
      is-ajax 
      :form-root="__form">
    </vv-form>
</div>

<hr>

<a href="/admin/imdb/{{ $video->slug }}"><button class="button">GET INFOS FROM IMDB</button></a>

<hr>

<div>
  <vs-images-upload
      :images="__images"
      url="/admin/rest/film/image/{{ $video->id }}"
      :names="[{name : 'poster', ratio : 0.67}, {name : 'cover', ratio : 1.78}, {name : 'hero', ratio : 3}]">
  </vs-images-upload>
</div>

@endsection

@section('js_footer')
<script type="text/javascript">

var __images = JSON.parse('{!! json_encode($images, JSON_HEX_APOS|JSON_HEX_QUOT) !!}');
var __form = JSON.parse('{!! json_encode($edit, JSON_HEX_APOS|JSON_HEX_QUOT) !!}');

</script>

<script type="text/javascript" src="/js/vue/formupload.js"></script>
@endsection